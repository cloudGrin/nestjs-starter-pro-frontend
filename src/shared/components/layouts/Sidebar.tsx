import { useEffect, useMemo, useState } from 'react';
import { Layout, Menu, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { useUserMenus } from '@/features/rbac/menu/hooks/useMenus';
import type { MenuTreeNode } from '@/features/rbac/menu/types/menu.types';
import type { MenuProps } from 'antd';
import { useThemeStore } from '@/shared/stores';
import { getMenuIcon } from '@/shared/components/icons/menuIcons';
import { cn } from '@/shared/utils/cn';

const { Sider } = Layout;
const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 80;

interface SidebarProps {
  collapsed: boolean;
}

/**
 * 侧边栏组件
 */
export function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode: themeMode } = useThemeStore();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // 获取用户菜单
  const { data: userMenus, isLoading: menusLoading } = useUserMenus();

  const renderMenuItems = useMemo(() => {
    const render = (menus: MenuTreeNode[]): MenuProps['items'] => {
      return menus
        .filter((menu) => menu.isVisible && menu.isActive)
        .map((menu) => {
          // 动态获取图标组件
          const IconComponent = getMenuIcon(menu.icon);

          if (menu.type === 'directory') {
            // 目录类型（有子菜单）
            return {
              key: menu.id.toString(),
              icon: IconComponent ? <IconComponent /> : null,
              label: menu.name,
              children: menu.children ? render(menu.children) : [],
            };
          } else if (menu.type === 'menu') {
            if (!menu.path || menu.isExternal) {
              return null;
            }
            const path = menu.path;

            // 菜单类型（对应具体页面）
            return {
              key: path,
              icon: IconComponent ? <IconComponent /> : null,
              label: menu.name,
              onClick: () => {
                navigate(path);
              },
            };
          }
          return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    };
    return render;
  }, [navigate]);

  const findSelectedKey = useMemo(() => {
    const find = (menus: MenuTreeNode[], path: string): string | null => {
      for (const menu of menus) {
        if (menu.path === path) return menu.path;
        if (menu.children) {
          const found = find(menu.children, path);
          if (found) return found;
        }
      }
      return null;
    };
    return find;
  }, []);

  const findOpenKeys = useMemo(() => {
    const find = (menus: MenuTreeNode[], targetPath: string): string[] => {
      const openKeys: string[] = [];

      const traverse = (nodes: MenuTreeNode[], parentKeys: string[] = []): boolean => {
        for (const node of nodes) {
          const currentKeys = [...parentKeys, node.id.toString()];

          if (node.path === targetPath) {
            openKeys.push(...parentKeys);
            return true;
          }

          if (node.children) {
            if (traverse(node.children, currentKeys)) {
              return true;
            }
          }
        }
        return false;
      };

      traverse(menus);
      return openKeys;
    };
    return find;
  }, []);

  const menuItems = useMemo(() => {
    return userMenus ? renderMenuItems(userMenus) : [];
  }, [userMenus, renderMenuItems]);

  const selectedKey = useMemo(() => {
    return userMenus ? findSelectedKey(userMenus, location.pathname) : null;
  }, [userMenus, location.pathname, findSelectedKey]);

  const routeOpenKeys = useMemo(() => {
    return userMenus ? findOpenKeys(userMenus, location.pathname) : [];
  }, [userMenus, location.pathname, findOpenKeys]);

  useEffect(() => {
    setOpenKeys(routeOpenKeys);
  }, [routeOpenKeys]);

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={SIDEBAR_WIDTH}
      collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
      theme={themeMode === 'dark' ? 'dark' : 'light'}
      className="sidebar-bg flex-none transition-theme"
    >
      <div
        className={cn(
          'sidebar-logo-bg relative flex items-center overflow-hidden border-b px-4 transition-theme',
          collapsed ? 'justify-center' : 'justify-start'
        )}
        style={{
          height: 'var(--app-header-height)',
          minHeight: 'var(--app-header-height)',
          borderColor: themeMode === 'dark' ? '#334155' : '#e2e8f0',
        }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] text-base font-bold text-white shadow-sm">
            <HomeOutlined />
          </span>
          {!collapsed && (
            <div className="min-w-0 truncate text-lg font-bold leading-none text-brand-gradient">
              Home Admin
            </div>
          )}
        </div>
      </div>
      {menusLoading ? (
        <div className="flex justify-center items-center p-8">
          <Spin />
        </div>
      ) : (
        <div className="w-full flex-1 overflow-y-auto py-3">
          <Menu
            theme={themeMode === 'dark' ? 'dark' : 'light'}
            mode="inline"
            selectedKeys={selectedKey ? [selectedKey] : []}
            {...(!collapsed && { openKeys })}
            onOpenChange={(keys) => {
              if (!collapsed) {
                setOpenKeys(keys);
              }
            }}
            items={menuItems}
            className="sidebar-menu w-full border-r-0 bg-transparent"
          />
        </div>
      )}
    </Sider>
  );
}
