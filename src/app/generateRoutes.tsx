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
import { getComponent } from './componentRegistry';
import { NoAvailableMenuPage, PageLoading } from './routeFallbacks';
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';
import type { MenuTreeNode } from '@/features/rbac/menu/types/menu.types';

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
          <ProtectedRoute permissions={permissions as [string, ...string[]]}>
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
 * @param defaultPath 默认首页路径（未传时使用首个可访问菜单）
 * @returns RouteObject[] 包含首页重定向的路由配置
 *
 * @example
 * const routes = generateRoutesWithDefault(userMenus);
 */
export function generateRoutesWithDefault(
  menus: MenuTreeNode[],
  defaultPath?: string
): RouteObject[] {
  const routes = generateRoutes(menus);
  const fallbackPath = defaultPath || findFirstMenuPath(menus);

  routes.unshift({
    index: true,
    element: fallbackPath ? <Navigate to={fallbackPath} replace /> : <NoAvailableMenuPage />,
  });

  return routes;
}

function findFirstMenuPath(menus: MenuTreeNode[]): string | null {
  for (const menu of menus) {
    if (!menu.isVisible || !menu.isActive) {
      continue;
    }

    if (menu.type === 'menu' && menu.path && menu.component && getComponent(menu.component)) {
      return menu.path;
    }

    if (menu.children) {
      const childPath = findFirstMenuPath(menu.children);
      if (childPath) {
        return childPath;
      }
    }
  }

  return null;
}
