import { beforeEach, describe, expect, it, vi } from 'vitest';
import { automationService } from './automation.service';
import { request } from '@/shared/utils/request';

vi.mock('@/shared/utils/request', () => ({
  request: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}));

describe('automationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses automation task endpoints', () => {
    automationService.getTasks();
    automationService.updateConfig('cleanupExpiredRefreshTokens', {
      enabled: false,
      cronExpression: '0 4 * * *',
      params: {},
    });
    automationService.runTask('cleanupExpiredRefreshTokens');
    automationService.getLogs('cleanupExpiredRefreshTokens', {
      page: 2,
      limit: 20,
      status: 'success',
      triggerType: 'manual',
    });

    expect(request.get).toHaveBeenCalledWith('/automation/tasks');
    expect(request.put).toHaveBeenCalledWith(
      '/automation/tasks/cleanupExpiredRefreshTokens/config',
      {
        enabled: false,
        cronExpression: '0 4 * * *',
        params: {},
      },
      expect.any(Object)
    );
    expect(request.post).toHaveBeenCalledWith(
      '/automation/tasks/cleanupExpiredRefreshTokens/run',
      undefined,
      expect.objectContaining({
        requestOptions: expect.objectContaining({
          messageConfig: { successMessage: false },
        }),
      })
    );
    expect(request.get).toHaveBeenCalledWith('/automation/tasks/cleanupExpiredRefreshTokens/logs', {
      params: {
        page: 2,
        limit: 20,
        status: 'success',
        triggerType: 'manual',
      },
    });
  });
});
