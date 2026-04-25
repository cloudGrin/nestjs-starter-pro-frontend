import { useMemo } from 'react';
import { Layout, Menu, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { useUserMenus } from '@/features/rbac/menu/hooks/useMenus';
import type { MenuTreeNode } from '@/features/rbac/menu/types/menu.types';
import type { MenuProps } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/shared/stores';
import { getMenuIcon } from '@/shared/components/icons/menuIcons';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

/**
 * 侧边栏组件（企业级设计 - 动态菜单 + 流畅动画）
 */
export function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode: themeMode } = useThemeStore();

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

  const defaultOpenKeys = useMemo(() => {
    return userMenus ? findOpenKeys(userMenus, location.pathname) : [];
  }, [userMenus, location.pathname, findOpenKeys]);

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme={themeMode === 'dark' ? 'dark' : 'light'}
      className="sidebar-bg border-r transition-theme"
    >
      {/* Logo区域 - 添加动画 */}
      <motion.div
        className="h-16 flex items-center justify-center text-xl font-bold border-b overflow-hidden relative sidebar-logo-bg transition-theme"
        style={{
          borderColor: themeMode === 'dark' ? 'rgba(102, 126, 234, 0.2)' : '#e2e8f0',
        }}
        initial={false}
        animate={{
          paddingLeft: collapsed ? '0px' : '16px',
          paddingRight: collapsed ? '0px' : '16px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.span
              key="collapsed-logo"
              initial={{ scale: 0.8, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="text-3xl"
            >
              <HomeOutlined />
            </motion.span>
          ) : (
            <motion.span
              key="expanded-logo"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-brand-gradient"
            >
              Home Admin
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      {menusLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center p-8"
        >
          <Spin />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Menu
            theme={themeMode === 'dark' ? 'dark' : 'light'}
            mode="inline"
            selectedKeys={selectedKey ? [selectedKey] : []}
            defaultOpenKeys={defaultOpenKeys}
            items={menuItems}
            className="sidebar-menu border-r-0 bg-transparent"
          />
        </motion.div>
      )}
    </Sider>
  );
}
