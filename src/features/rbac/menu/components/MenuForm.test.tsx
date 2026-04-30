import { App } from 'antd';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MenuForm } from './MenuForm';
import { renderWithProviders } from '@/test/test-utils';
import { MenuType, type MenuTreeNode } from '../types/menu.types';

const treeSelectState = vi.hoisted(() => ({
  props: [] as Array<{ treeData?: Array<{ value: number; title: string; children?: unknown[] }> }>,
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');

  return {
    ...actual,
    TreeSelect: (props: { treeData?: Array<{ value: number; title: string; children?: unknown[] }> }) => {
      treeSelectState.props.push(props);
      return <div data-testid="parent-menu-select" />;
    },
  };
});

const menuTree: MenuTreeNode[] = [
  {
    id: 1,
    name: '系统管理',
    path: '/system',
    type: MenuType.DIRECTORY,
    parentId: null,
    sort: 0,
    isActive: true,
    isVisible: true,
    isExternal: false,
    isCache: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    children: [
      {
        id: 2,
        name: '设置目录',
        path: '/system/settings',
        type: MenuType.DIRECTORY,
        parentId: 1,
        sort: 0,
        isActive: true,
        isVisible: true,
        isExternal: false,
        isCache: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        children: [],
      },
      {
        id: 3,
        name: '用户管理',
        path: '/system/users',
        type: MenuType.MENU,
        parentId: 1,
        sort: 1,
        isActive: true,
        isVisible: true,
        isExternal: false,
        isCache: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        children: [],
      },
    ],
  },
];

describe('MenuForm', () => {
  beforeEach(() => {
    treeSelectState.props = [];
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          getPropertyValue: () => '',
        }) as CSSStyleDeclaration
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('only exposes directories as selectable parent menus', () => {
    renderWithProviders(
      <App>
        <MenuForm open mode="create" menuTree={menuTree} onSubmit={vi.fn()} onCancel={vi.fn()} />
      </App>
    );

    const parentOptions = treeSelectState.props.at(-1)?.treeData ?? [];

    expect(JSON.stringify(parentOptions)).toContain('设置目录');
    expect(JSON.stringify(parentOptions)).not.toContain('用户管理');
  });
});
