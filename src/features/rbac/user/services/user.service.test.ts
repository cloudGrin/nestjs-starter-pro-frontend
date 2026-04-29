import { beforeEach, describe, expect, it, vi } from 'vitest';
import { request } from '@/shared/utils/request';
import { userService } from './user.service';

vi.mock('@/shared/utils/request', () => ({
  request: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

describe('userService notification settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses user scoped notification settings endpoints', () => {
    userService.getNotificationSettings(12);
    userService.updateNotificationSettings(12, {
      barkKey: 'user-bark-key',
      feishuUserId: 'ou_user_1',
    });

    expect(request.get).toHaveBeenCalledWith('/users/12/notification-settings');
    expect(request.put).toHaveBeenCalledWith(
      '/users/12/notification-settings',
      {
        barkKey: 'user-bark-key',
        feishuUserId: 'ou_user_1',
      },
      expect.any(Object)
    );
  });

  it('can suppress success messages for compound user edits', () => {
    userService.updateUser(12, { email: 'new@example.com' }, { silent: true });
    userService.updateNotificationSettings(
      12,
      {
        barkKey: 'user-bark-key',
        feishuUserId: 'ou_user_1',
      },
      { silent: true }
    );

    expect(request.put).toHaveBeenCalledWith('/users/12', { email: 'new@example.com' });
    expect(request.put).toHaveBeenCalledWith('/users/12/notification-settings', {
      barkKey: 'user-bark-key',
      feishuUserId: 'ou_user_1',
    });
  });
});
