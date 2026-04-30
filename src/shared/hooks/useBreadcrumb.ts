import { createElement, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserMenus } from '@/features/rbac/menu/hooks/useMenus';
import type { MenuTreeNode } from '@/features/rbac/menu/types/menu.types';
import type { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';

const BREADCRUMB_LINK_CLASS = 'app-breadcrumb-linkable';
const BREADCRUMB_CURRENT_CLASS = 'app-breadcrumb-current';
const BREADCRUMB_MUTED_CLASS = 'app-breadcrumb-muted';

/**
 * 根据路径在菜单树中查找匹配的菜单项及其父级路径
 */
function findMenuPath(
  menus: MenuTreeNode[],
  targetPath: string,
  parentPath: MenuTreeNode[] = []
): MenuTreeNode[] | null {
  for (const menu of menus) {
    const currentPath = [...parentPath, menu];

    // 精确匹配
    if (menu.path === targetPath) {
      return currentPath;
    }

    // 如果是目录且有子菜单，递归查找
    if (menu.children && menu.children.length > 0) {
      const found = findMenuPath(menu.children, targetPath, currentPath);
      if (found) return found;
    }
  }

  return null;
}

function getBreadcrumbPath(menu: MenuTreeNode): string | null {
  if (menu.type === 'menu' && menu.path && !menu.isExternal) {
    return menu.path;
  }

  return null;
}

function createBreadcrumbTitle(label: string, path: string | null, isCurrentPage: boolean) {
  if (isCurrentPage) {
    return createElement(
      'a',
      { href: path ?? '#', 'aria-current': 'page', className: BREADCRUMB_CURRENT_CLASS },
      label
    );
  }

  if (path) {
    return createElement(Link, { to: path, className: BREADCRUMB_LINK_CLASS }, label);
  }

  return createElement('span', { className: BREADCRUMB_MUTED_CLASS }, label);
}

/**
 * 自动根据当前路径生成面包屑
 * 从菜单树中查找匹配的菜单项及其所有父级
 */
export function useBreadcrumb(): BreadcrumbItemType[] {
  const location = useLocation();
  const { data: userMenus } = useUserMenus();

  return useMemo(() => {
    // 始终包含首页（使用 Ant Design 的图标字符串）
    const items: BreadcrumbItemType[] = [
      {
        title: createBreadcrumbTitle('首页', '/', location.pathname === '/'),
      },
    ];

    // 如果没有菜单数据，只返回首页
    if (!userMenus || !Array.isArray(userMenus) || userMenus.length === 0) {
      return items;
    }

    // 查找当前路径对应的菜单路径
    const menuPath = findMenuPath(userMenus as MenuTreeNode[], location.pathname);

    // 如果找到了匹配的菜单路径，添加到面包屑中
    if (menuPath && menuPath.length > 0) {
      menuPath.forEach((menu) => {
        const isCurrentPage = menu.path === location.pathname;
        const path = getBreadcrumbPath(menu);

        items.push({
          title: createBreadcrumbTitle(
            menu.name,
            isCurrentPage ? location.pathname : path,
            isCurrentPage
          ),
        });
      });
    }

    return items;
  }, [location.pathname, userMenus]);
}
