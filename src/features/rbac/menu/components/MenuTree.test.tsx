import { App } from 'antd';
import { describe, expect, it, vi } from 'vitest';
import { MenuTree } from './MenuTree';
import {
  createMockUser,
  renderWithProviders,
  setMockUser,
  screen,
  userEvent,
} from '@/test/test-utils';
import { MenuType, type MenuTreeNode } from '../types/menu.types';

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');

  return {
    ...actual,
    Tree: ({
      onDrop,
      className,
    }: {
      onDrop?: (info: {
        dragNode: { key: number };
        node: { key: number; pos?: string };
        dropToGap: boolean;
        dropPosition?: number;
      }) => void;
      className?: string;
    }) => (
      <div data-testid="menu-tree" className={className}>
        <button
          type="button"
          onClick={() =>
            onDrop?.({
              dragNode: { key: 2 },
              node: { key: 3 },
              dropToGap: false,
            })
          }
        >
          drop inside menu
        </button>
        <button
          type="button"
          onClick={() =>
            onDrop?.({
              dragNode: { key: 2 },
              node: { key: 3 },
              dropToGap: true,
              dropPosition: 1,
            } as any)
          }
        >
          drop after menu
        </button>
        <button
          type="button"
          onClick={() =>
            onDrop?.({
              dragNode: { key: 2 },
              node: { key: 3, pos: '0-0-1' },
              dropToGap: true,
              dropPosition: 0,
            })
          }
        >
          drop before second menu
        </button>
      </div>
    ),
  };
});

const treeData: MenuTreeNode[] = [
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

describe('MenuTree', () => {
  it('blocks dropping a node inside a menu item', async () => {
    setMockUser(
      createMockUser({
        permissions: ['menu:create', 'menu:update', 'menu:delete'],
      })
    );
    const onDrop = vi.fn();

    renderWithProviders(
      <App>
        <MenuTree treeData={treeData} onDrop={onDrop} />
      </App>
    );

    await userEvent.click(screen.getByRole('button', { name: 'drop inside menu' }));

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('passes target node and after position when dropping onto a gap', async () => {
    setMockUser(
      createMockUser({
        permissions: ['menu:create', 'menu:update', 'menu:delete'],
      })
    );
    const onDrop = vi.fn();

    renderWithProviders(
      <App>
        <MenuTree treeData={treeData} onDrop={onDrop} />
      </App>
    );

    await userEvent.click(screen.getByRole('button', { name: 'drop after menu' }));

    expect(onDrop).toHaveBeenCalledWith(2, 1, { targetId: 3, position: 'after' });
  });

  it('normalizes rc-tree dropPosition before detecting a gap drop before the target', async () => {
    setMockUser(
      createMockUser({
        permissions: ['menu:create', 'menu:update', 'menu:delete'],
      })
    );
    const onDrop = vi.fn();

    renderWithProviders(
      <App>
        <MenuTree treeData={treeData} onDrop={onDrop} />
      </App>
    );

    await userEvent.click(screen.getByRole('button', { name: 'drop before second menu' }));

    expect(onDrop).toHaveBeenCalledWith(2, 1, { targetId: 3, position: 'before' });
  });
});
