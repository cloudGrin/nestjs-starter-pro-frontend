import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userService } from './user.service';
import { request } from '@/shared/utils/request';

vi.mock('@/shared/utils/request', () => ({
  request: {
    put: vi.fn(),
  },
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enables users through the backend enable endpoint', () => {
    userService.toggleUserStatus(7, true);

    expect(request.put).toHaveBeenCalledWith('/users/7/enable', undefined, expect.any(Object));
  });

  it('disables users through the backend disable endpoint', () => {
    userService.toggleUserStatus(7, false);

    expect(request.put).toHaveBeenCalledWith('/users/7/disable', undefined, expect.any(Object));
  });
});
