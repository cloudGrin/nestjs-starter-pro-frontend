import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from './auth.service';
import { request } from '@/shared/utils/request';

vi.mock('@/shared/utils/request', () => ({
  request: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses current-user endpoints for profile and password actions', () => {
    authService.getProfile();
    authService.updateProfile({ nickname: 'Home Admin' });
    authService.changePassword({
      oldPassword: 'OldPass123',
      newPassword: 'NewPass123',
      confirmPassword: 'NewPass123',
    });

    expect(request.get).toHaveBeenCalledWith('/users/profile');
    expect(request.put).toHaveBeenCalledWith('/users/profile', { nickname: 'Home Admin' });
    expect(request.put).toHaveBeenCalledWith(
      '/users/password',
      {
        oldPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
      },
      expect.any(Object)
    );
  });
});
