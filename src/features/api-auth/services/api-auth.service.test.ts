import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiAuthService } from './api-auth.service';
import { request } from '@/shared/utils/request';

vi.mock('@/shared/utils/request', () => ({
  request: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

describe('apiAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses numeric app ids for app mutation endpoints', () => {
    apiAuthService.updateApiApp(12, { name: 'Updated' });
    apiAuthService.deleteApiApp(12);

    expect(request.put).toHaveBeenCalledWith(
      '/api-apps/12',
      { name: 'Updated' },
      expect.any(Object)
    );
    expect(request.delete).toHaveBeenCalledWith('/api-apps/12', expect.any(Object));
  });

  it('uses numeric app ids for key endpoints', () => {
    apiAuthService.getApiKeys(12);
    apiAuthService.createApiKey(12, { name: 'Production', environment: 'production' });

    expect(request.get).toHaveBeenCalledWith('/api-apps/12/keys');
    expect(request.post).toHaveBeenCalledWith(
      '/api-apps/12/keys',
      { name: 'Production', environment: 'production' },
      expect.any(Object)
    );
  });

  it('loads API scopes from the backend contract', () => {
    apiAuthService.getApiScopes();

    expect(request.get).toHaveBeenCalledWith('/api-apps/scopes');
  });

  it('queries API access logs by key, path, and status code', () => {
    apiAuthService.getApiAccessLogs(12, {
      keyId: 7,
      path: '/open/users',
      statusCode: 403,
      page: 2,
      limit: 20,
    });

    expect(request.get).toHaveBeenCalledWith('/api-apps/12/access-logs', {
      params: {
        keyId: 7,
        path: '/open/users',
        statusCode: 403,
        page: 2,
        limit: 20,
      },
    });
  });
});
