import { afterEach, describe, expect, it, vi } from 'vitest';
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

describe('RoleList', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('disables super_admin edit and assignment actions', async () => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          getPropertyValue: () => '',
        }) as CSSStyleDeclaration
    );
    setMockUser(
      createMockUser({
        permissions: ['role:update', 'role:permission:assign', 'role:menu:assign', 'role:delete'],
      })
    );
    const onEdit = vi.fn();
    const onAssignPermissions = vi.fn();

    renderWithProviders(
      <RoleList
        data={[superAdminRole]}
        total={1}
        onEdit={onEdit}
        onAssignPermissions={onAssignPermissions}
      />
    );

    const editButton = screen.getByRole('button', { name: /编辑/ });
    const permissionButton = screen.getByRole('button', { name: /权限/ });

    expect(editButton).toBeDisabled();
    expect(permissionButton).toBeDisabled();

    await userEvent.click(editButton);
    await userEvent.click(permissionButton);

    expect(onEdit).not.toHaveBeenCalled();
    expect(onAssignPermissions).not.toHaveBeenCalled();
    expect(screen.getByText('内置超管')).toBeInTheDocument();
  });
});
