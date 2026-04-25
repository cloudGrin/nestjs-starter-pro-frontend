import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from './auth.service';
import { request } from '@/shared/utils/request';

vi.mock('@/shared/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads the profile from the current users endpoint', () => {
    authService.getProfile();

    expect(request.get).toHaveBeenCalledWith('/users/profile');
  });
});
