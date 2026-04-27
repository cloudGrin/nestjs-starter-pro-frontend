import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { MenuType, type MenuTreeNode } from '@/features/rbac/menu/types/menu.types';

const menuPropsSpy = vi.hoisted(() => vi.fn());

vi.mock('antd', () => ({
  Layout: {
    Sider: ({
      children,
      className,
      collapsed,
    }: {
      children: ReactNode;
      className?: string;
      collapsed?: boolean;
    }) => (
      <aside className={className} data-collapsed={String(collapsed)} data-testid="sidebar-sider">
        {children}
      </aside>
    ),
  },
  Menu: (props: Record<string, unknown>) => {
    menuPropsSpy(props);
    return <nav data-testid="sidebar-menu" />;
  },
  Spin: () => <div data-testid="sidebar-loading" />,
}));

const userMenus: MenuTreeNode[] = [
  {
    id: 1,
    name: '系统管理',
    path: '/system',
    type: MenuType.DIRECTORY,
    icon: 'SettingOutlined',
    sort: 1,
    isActive: true,
    isVisible: true,
    isExternal: false,
    isCache: false,
    createdAt: '',
    updatedAt: '',
    children: [
      {
        id: 2,
        name: '用户管理',
        path: '/system/users',
        type: MenuType.MENU,
        icon: 'UserOutlined',
        component: 'system/users',
        parentId: 1,
        sort: 1,
        isActive: true,
        isVisible: true,
        isExternal: false,
        isCache: false,
        createdAt: '',
        updatedAt: '',
      },
    ],
  },
];

vi.mock('@/features/rbac/menu/hooks/useMenus', () => ({
  useUserMenus: () => ({ data: userMenus, isLoading: false }),
}));

vi.mock('@/shared/stores', () => ({
  useThemeStore: () => ({ mode: 'light' }),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    menuPropsSpy.mockClear();
  });

  it('leaves submenu opening uncontrolled while collapsed so child menus can appear in a popup', () => {
    render(
      <MemoryRouter initialEntries={['/system/users']}>
        <Sidebar collapsed />
      </MemoryRouter>
    );

    expect(menuPropsSpy).toHaveBeenCalled();
    expect(menuPropsSpy.mock.lastCall?.[0]).toMatchObject({
      selectedKeys: ['/system/users'],
    });
    expect(menuPropsSpy.mock.lastCall?.[0]).not.toHaveProperty('openKeys');
  });

  it('does not draw a right border on the sider shell', () => {
    render(
      <MemoryRouter initialEntries={['/system/users']}>
        <Sidebar collapsed={false} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('sidebar-sider')).not.toHaveClass('border-r');
  });

  it('styles selected parent submenu icons in light and dark themes', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/assets/styles/index.css'), 'utf8');

    expect(css).toContain('.ant-menu-light .ant-menu-submenu-selected');
    expect(css).toContain('.ant-menu-dark .ant-menu-submenu-selected');
    expect(css).toContain('.ant-menu-submenu-title .anticon');
  });

  it('hides collapsed trigger labels so submenu popups do not overlap ghost text', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/assets/styles/index.css'), 'utf8');

    expect(css).toContain('.sidebar-menu.ant-menu-inline-collapsed .ant-menu-title-content');
    expect(css).toContain('.sidebar-menu.ant-menu-inline-collapsed .ant-menu-submenu-arrow');
  });

  it('uses opaque submenu popup backgrounds so page content cannot bleed through', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/assets/styles/index.css'), 'utf8');

    expect(css).toContain('.ant-menu-light.ant-menu-submenu-popup .ant-menu-sub');
    expect(css).toContain('.ant-menu-dark.ant-menu-submenu-popup .ant-menu-sub');
  });
});
