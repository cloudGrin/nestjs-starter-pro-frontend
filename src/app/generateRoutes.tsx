/**
 * 动态路由生成器
 *
 * 核心功能：根据后端菜单数据动态生成前端路由配置
 *
 * 工作流程：
 * 1. 从后端获取用户菜单树（已过滤权限）
 * 2. 递归遍历菜单树
 * 3. 根据菜单类型生成对应的路由配置
 * 4. 返回 React Router 的 RouteObject 数组
 */

import { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { Spin } from 'antd';
import { getComponent } from './componentRegistry';
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';
import type { MenuTreeNode } from '@/features/rbac/menu/types/menu.types';

/**
 * 页面加载中组件
 */
// eslint-disable-next-line react-refresh/only-export-components
const PageLoading = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <Spin size="large" />
    <div className="text-gray-500">加载中...</div>
  </div>
);

/**
 * 动态路由生成函数
 *
 * @param menus 菜单树数据（从后端获取）
 * @returns RouteObject[] React Router 路由配置数组
 *
 * @example
 * const routes = generateRoutes(userMenus);
 * const router = createBrowserRouter([
 *   { path: '/', children: routes }
 * ]);
 */
export function generateRoutes(menus: MenuTreeNode[]): RouteObject[] {
  const routes: RouteObject[] = [];

  for (const menu of menus) {
    // 跳过不可见或未启用的菜单
    if (!menu.isVisible || !menu.isActive) {
      continue;
    }

    // 处理目录类型（有子菜单，不对应实际页面）
    // 注意：目录类型仅用于侧边栏分组，不创建嵌套路由
    // 子菜单的路由会被平铺到当前层级
    if (menu.type === 'directory') {
      // 递归生成子路由
      const childRoutes = menu.children ? generateRoutes(menu.children) : [];

      // 平铺子路由（不创建嵌套）
      // 原因：子菜单的 path 是绝对路径（如 "/users"），不能嵌套在父路径下
      routes.push(...childRoutes);
      continue;
    }

    // 处理菜单类型（对应实际页面）
    if (menu.type === 'menu') {
      // 1. 获取组件
      if (!menu.component) {
        console.warn(`[动态路由] 菜单 "${menu.name}" 缺少 component 字段，跳过`, menu);
        continue;
      }

      const Component = getComponent(menu.component);
      if (!Component) {
        console.error(
          `[动态路由] 组件 "${menu.component}" 未找到，跳过菜单 "${menu.name}"`,
          menu
        );
        continue;
      }

      // 2. 提取权限配置（displayCondition 是 JSON 字符串）
      let permissions: string[] | undefined;
      if (menu.displayCondition) {
        try {
          const condition = JSON.parse(menu.displayCondition);
          permissions = condition?.requireAnyPermission;
        } catch (error) {
          console.warn(
            `[动态路由] 菜单 "${menu.name}" 的 displayCondition 解析失败`,
            error
          );
        }
      }

      // 3. 生成路由配置
      const route: RouteObject = {
        path: menu.path || undefined,
        element: permissions && permissions.length > 0 ? (
          // 需要权限验证
          <ProtectedRoute permissions={permissions}>
            <Suspense fallback={<PageLoading />}>
              <Component />
            </Suspense>
          </ProtectedRoute>
        ) : (
          // 不需要权限验证（如 Dashboard）
          <Suspense fallback={<PageLoading />}>
            <Component />
          </Suspense>
        ),
        // 传递 meta 数据（用于面包屑、标签页等）
        handle: {
          meta: menu.meta,
          menuId: menu.id,
          menuName: menu.name,
        },
      };

      routes.push(route);

      // 4. 递归处理子菜单（平铺到当前层级，不嵌套）
      // 原因：后端菜单path都是绝对路径（如 /users），不能嵌套在父路由下
      // React Router要求：嵌套路由的子路由必须是相对路径或以父路径开头
      if (menu.children && menu.children.length > 0) {
        routes.push(...generateRoutes(menu.children));
      }
    }
  }

  return routes;
}

/**
 * 生成带默认首页重定向的路由
 *
 * @param menus 菜单树数据
 * @param defaultPath 默认首页路径（默认 '/dashboard'）
 * @returns RouteObject[] 包含首页重定向的路由配置
 *
 * @example
 * const routes = generateRoutesWithDefault(userMenus);
 */
export function generateRoutesWithDefault(
  menus: MenuTreeNode[],
  defaultPath: string = '/dashboard'
): RouteObject[] {
  const routes = generateRoutes(menus);

  // 添加首页重定向
  routes.unshift({
    index: true,
    element: <Navigate to={defaultPath} replace />,
  });

  return routes;
}

/**
 * 从菜单树中查找指定路径的菜单
 *
 * @param menus 菜单树
 * @param path 路径
 * @returns 找到的菜单 | null
 */
export function findMenuByPath(
  menus: MenuTreeNode[],
  path: string
): MenuTreeNode | null {
  for (const menu of menus) {
    if (menu.path === path) {
      return menu;
    }
    if (menu.children) {
      const found = findMenuByPath(menu.children, path);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 获取菜单的面包屑路径
 *
 * @param menus 菜单树
 * @param targetPath 目标路径
 * @returns 面包屑数组（从根到当前菜单）
 *
 * @example
 * const breadcrumbs = getBreadcrumbs(userMenus, '/users');
 * // 返回: ['首页', '系统管理', '用户管理']
 */
export function getBreadcrumbs(
  menus: MenuTreeNode[],
  targetPath: string
): Array<{ name: string; path?: string }> {
  const breadcrumbs: Array<{ name: string; path?: string }> = [];

  function traverse(nodes: MenuTreeNode[], parents: MenuTreeNode[] = []): boolean {
    for (const node of nodes) {
      if (node.path === targetPath) {
        // 找到目标菜单，构建面包屑
        parents.forEach((parent) => {
          breadcrumbs.push({ name: parent.name, path: parent.path });
        });
        breadcrumbs.push({ name: node.name, path: node.path });
        return true;
      }

      if (node.children) {
        if (traverse(node.children, [...parents, node])) {
          return true;
        }
      }
    }
    return false;
  }

  traverse(menus);
  return breadcrumbs;
}
