import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAppRoutes } from '../useAppRoutes';

vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: (selector: (state: { token: string | null }) => unknown) =>
    selector({ token: 'test-token' }),
}));

vi.mock('@/features/rbac/menu/hooks/useMenus', () => ({
  useUserMenus: () => ({
    data: undefined,
    isLoading: false,
    error: new Error('menus failed'),
  }),
}));

describe('useAppRoutes', () => {
  it('returns a fallback router when loading user menus fails without cached data', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAppRoutes());

    expect(result.current).not.toBeNull();

    consoleError.mockRestore();
  });
});
