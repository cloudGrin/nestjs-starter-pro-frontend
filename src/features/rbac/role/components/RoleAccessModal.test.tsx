import { App } from 'antd';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleAccessModal } from './RoleAccessModal';
import {
  createMockUser,
  renderWithProviders,
  screen,
  setMockUser,
  userEvent,
} from '@/test/test-utils';
import { MenuType } from '../../menu/types/menu.types';
import type { Role } from '../types/role.types';

const hookMocks = vi.hoisted(() => ({
  useMenuTree: vi.fn(),
  usePermissionTree: vi.fn(),
  useRoleAccess: vi.fn(),
  useSaveRoleAccess: vi.fn(),
  saveRoleAccess: vi.fn(),
}));

vi.mock('../../menu/hooks/useMenus', () => ({
  useMenuTree: hookMocks.useMenuTree,
}));

vi.mock('../../permission/hooks/usePermissions', () => ({
  usePermissionTree: hookMocks.usePermissionTree,
}));

vi.mock('../hooks/useRoles', () => ({
  useRoleAccess: hookMocks.useRoleAccess,
  useSaveRoleAccess: hookMocks.useSaveRoleAccess,
}));

const role: Role = {
  id: 5,
  code: 'editor',
  name: '编辑',
  description: '内容编辑',
  sort: 10,
  isActive: true,
  isSystem: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('RoleAccessModal', () => {
  beforeEach(() => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          getPropertyValue: () => '',
        }) as CSSStyleDeclaration
    );
    setMockUser(createMockUser({ permissions: ['role:access:assign'] }));

    hookMocks.useMenuTree.mockReturnValue({
      data: [
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
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          children: [
            {
              id: 2,
              name: '用户管理',
              path: '/system/users',
              type: MenuType.MENU,
              parentId: 1,
              sort: 10,
              isActive: true,
              isVisible: true,
              isExternal: false,
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
              children: [],
            },
          ],
        },
      ],
      isLoading: false,
    });
    hookMocks.usePermissionTree.mockReturnValue({
      data: [
        {
          module: 'user',
          name: '用户管理',
          permissions: [
            {
              id: 11,
              code: 'user:read',
              name: '查看用户',
              module: 'user',
              sort: 10,
              isActive: true,
              isSystem: true,
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
        },
      ],
      isLoading: false,
    });
    hookMocks.useRoleAccess.mockReturnValue({
      data: { menuIds: [2], permissionIds: [11] },
      isLoading: false,
    });
    hookMocks.useSaveRoleAccess.mockReturnValue({
      mutate: hookMocks.saveRoleAccess,
      isPending: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    hookMocks.useMenuTree.mockClear();
    hookMocks.usePermissionTree.mockClear();
    hookMocks.saveRoleAccess.mockReset();
  });

  it('saves menu and permission selections through the unified access mutation', async () => {
    renderWithProviders(
      <App>
        <RoleAccessModal open role={role} onSuccess={vi.fn()} onCancel={vi.fn()} />
      </App>
    );

    expect(await screen.findByText('菜单访问')).toBeInTheDocument();
    expect(screen.getByText('操作权限')).toBeInTheDocument();
    expect(screen.getAllByText('用户管理').length).toBeGreaterThan(0);
    expect(screen.getByText('查看用户')).toBeInTheDocument();
    expect(hookMocks.useMenuTree).toHaveBeenCalledWith({ enabled: true });
    expect(hookMocks.usePermissionTree).toHaveBeenCalledWith({ enabled: true });

    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(hookMocks.saveRoleAccess).toHaveBeenCalledWith(
      {
        id: 5,
        data: {
          menuIds: [2],
          permissionIds: [11],
        },
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    );
  });

  it('only loads and shows the permission side for legacy permission-only assigners', async () => {
    setMockUser(createMockUser({ permissions: ['role:permission:assign'] }));

    renderWithProviders(
      <App>
        <RoleAccessModal open role={role} onSuccess={vi.fn()} onCancel={vi.fn()} />
      </App>
    );

    expect(await screen.findByText('操作权限')).toBeInTheDocument();
    expect(screen.queryByText('菜单访问')).not.toBeInTheDocument();
    expect(hookMocks.useMenuTree).toHaveBeenCalledWith({ enabled: false });
    expect(hookMocks.usePermissionTree).toHaveBeenCalledWith({ enabled: true });

    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(hookMocks.saveRoleAccess).toHaveBeenCalledWith(
      {
        id: 5,
        data: {
          menuIds: [2],
          permissionIds: [11],
        },
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    );
  });
});
