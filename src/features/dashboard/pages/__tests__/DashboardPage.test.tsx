import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import { clearMockUser, createMockUser, renderWithProviders, setMockUser } from '@/test/test-utils';

const userHookMocks = vi.hoisted(() => ({
  useUsers: vi.fn(),
}));

const roleHookMocks = vi.hoisted(() => ({
  useRoles: vi.fn(),
}));

const menuHookMocks = vi.hoisted(() => ({
  useMenus: vi.fn(),
}));

const notificationHookMocks = vi.hoisted(() => ({
  useUnreadNotifications: vi.fn(),
  useNotifications: vi.fn(),
}));

vi.mock('@/features/rbac/user/hooks/useUsers', () => userHookMocks);
vi.mock('@/features/rbac/role/hooks/useRoles', () => roleHookMocks);
vi.mock('@/features/rbac/menu/hooks/useMenus', () => menuHookMocks);
vi.mock('@/features/notification/hooks/useNotifications', () => notificationHookMocks);

vi.mock('@/shared/components', async () => {
  const { PermissionGuard } = await vi.importActual<
    typeof import('@/shared/components/auth/PermissionGuard')
  >('@/shared/components/auth/PermissionGuard');

  return {
    PermissionGuard,
    PageWrap: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  };
});

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockUser();
    userHookMocks.useUsers.mockReturnValue({ data: { items: [], total: 0 }, isLoading: false });
    roleHookMocks.useRoles.mockReturnValue({ data: { items: [], total: 0 }, isLoading: false });
    menuHookMocks.useMenus.mockReturnValue({ data: [], isLoading: false });
    notificationHookMocks.useUnreadNotifications.mockReturnValue({ data: [], isLoading: false });
    notificationHookMocks.useNotifications.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
    });
  });

  it('does not request management data when the user lacks dashboard permissions', () => {
    setMockUser(createMockUser({ permissions: [] }));

    renderWithProviders(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(userHookMocks.useUsers).not.toHaveBeenCalled();
    expect(roleHookMocks.useRoles).not.toHaveBeenCalled();
    expect(menuHookMocks.useMenus).not.toHaveBeenCalled();
    expect(notificationHookMocks.useUnreadNotifications).not.toHaveBeenCalled();
    expect(notificationHookMocks.useNotifications).not.toHaveBeenCalled();
  });
});
