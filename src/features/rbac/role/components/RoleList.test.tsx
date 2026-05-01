import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleList } from './RoleList';
import {
  createMockUser,
  renderWithProviders,
  screen,
  setMockUser,
  userEvent,
} from '@/test/test-utils';
import type { Role } from '../types/role.types';

const superAdminRole: Role = {
  id: 1,
  code: 'super_admin',
  name: '超级管理员',
  description: '默认拥有所有权限和菜单',
  category: 'system',
  sort: 0,
  isActive: true,
  isSystem: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const normalRole: Role = {
  id: 2,
  code: 'editor',
  name: '编辑',
  description: '内容编辑',
  category: 'business',
  sort: 10,
  isActive: true,
  isSystem: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('RoleList', () => {
  beforeEach(() => {
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

  it('disables super_admin edit and assignment actions', async () => {
    setMockUser(
      createMockUser({
        permissions: ['role:update', 'role:access:assign', 'role:delete'],
      })
    );
    const onEdit = vi.fn();
    const onAssignAccess = vi.fn();

    renderWithProviders(
      <RoleList
        data={[superAdminRole]}
        total={1}
        onEdit={onEdit}
        onAssignAccess={onAssignAccess}
      />
    );

    const editButton = screen.getByRole('button', { name: /编辑/ });
    const accessButton = screen.getByRole('button', { name: /授权/ });

    expect(editButton).toBeDisabled();
    expect(accessButton).toBeDisabled();
    expect(screen.queryByRole('button', { name: /权限/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /菜单/ })).not.toBeInTheDocument();

    await userEvent.click(editButton);
    await userEvent.click(accessButton);

    expect(onEdit).not.toHaveBeenCalled();
    expect(onAssignAccess).not.toHaveBeenCalled();
    expect(screen.getByText('内置超管')).toBeInTheDocument();
  });

  it.each(['role:permission:assign', 'role:menu:assign'])(
    'keeps the unified authorization action visible for legacy %s users',
    async (permission) => {
      setMockUser(
        createMockUser({
          permissions: [permission],
        })
      );
      const onAssignAccess = vi.fn();

      renderWithProviders(
        <RoleList data={[normalRole]} total={1} onAssignAccess={onAssignAccess} />
      );

      await userEvent.click(screen.getByRole('button', { name: /授权/ }));

      expect(onAssignAccess).toHaveBeenCalledWith(normalRole);
    }
  );
});
