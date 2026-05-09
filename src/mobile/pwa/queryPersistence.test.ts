import { describe, expect, it } from 'vitest';
import {
  MOBILE_QUERY_CACHE_BUSTER,
  MOBILE_QUERY_CACHE_MAX_AGE,
  sanitizeMobilePersistedData,
  shouldPersistMobileQuery,
} from './queryPersistence';

describe('mobile query persistence', () => {
  it('persists only the mobile offline-readable query families', () => {
    expect(shouldPersistMobileQuery(['tasks'])).toBe(true);
    expect(shouldPersistMobileQuery(['task-lists'])).toBe(true);
    expect(shouldPersistMobileQuery(['insurance', 'policies', {}])).toBe(true);
    expect(shouldPersistMobileQuery(['notifications', 'list', {}])).toBe(true);
    expect(shouldPersistMobileQuery(['family', 'posts', {}])).toBe(true);
    expect(shouldPersistMobileQuery(['family', 'state'])).toBe(true);
    expect(shouldPersistMobileQuery(['profile'])).toBe(true);

    expect(shouldPersistMobileQuery(['family', 'chat-messages', {}])).toBe(false);
    expect(shouldPersistMobileQuery(['api-keys', 1])).toBe(false);
    expect(shouldPersistMobileQuery(['menus', 'user'])).toBe(false);
    expect(shouldPersistMobileQuery(['permissions'])).toBe(false);
    expect(shouldPersistMobileQuery(['files', 'list'])).toBe(false);
  });

  it('removes expiring family media access urls before writing persisted data', () => {
    const data = {
      items: [
        {
          id: 1,
          content: '周末采购',
          media: [
            {
              id: 10,
              fileId: 20,
              displayUrl: '/api/v1/files/20/access?token=private-token',
              previewUrl: '/api/v1/files/20/access?token=preview-token',
              expiresAt: '2026-05-06T10:10:00.000Z',
            },
          ],
        },
      ],
    };

    expect(sanitizeMobilePersistedData(['family', 'posts', {}], data)).toEqual({
      items: [
        {
          id: 1,
          content: '周末采购',
          media: [
            {
              id: 10,
              fileId: 20,
              displayUrl: undefined,
              previewUrl: undefined,
              expiresAt: undefined,
            },
          ],
        },
      ],
    });
  });

  it('uses a bounded one day cache window', () => {
    expect(MOBILE_QUERY_CACHE_MAX_AGE).toBe(24 * 60 * 60 * 1000);
    expect(MOBILE_QUERY_CACHE_BUSTER).toBe('home-mobile-cache-v1');
  });
});
