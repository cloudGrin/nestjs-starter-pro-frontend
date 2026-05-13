import type { PersistedClient } from '@tanstack/query-persist-client-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MOBILE_QUERY_CACHE_BUSTER,
  MOBILE_QUERY_CACHE_MAX_AGE,
  MOBILE_QUERY_CACHE_STORAGE_KEY,
  createMobileQueryPersister,
  sanitizeMobilePersistedData,
  shouldPersistMobileQuery,
} from './queryPersistence';

describe('mobile query persistence', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function createFamilyPostsData(expiresAt: string) {
    return {
      items: [
        {
          id: 1,
          content: '周末采购',
          media: [
            {
              id: 10,
              fileId: 20,
              displayUrl: '/api/v1/files/20/access?token=private-token',
              posterUrl: '/api/v1/files/20/access?token=poster-token',
              previewUrl: '/api/v1/files/20/access?token=preview-token',
              expiresAt,
            },
          ],
        },
      ],
    };
  }

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

  it('keeps family media access urls when they outlive the persisted query cache', () => {
    vi.setSystemTime('2026-05-06T10:00:00.000Z');
    const data = createFamilyPostsData('2026-05-07T10:10:01.000Z');

    expect(sanitizeMobilePersistedData(['family', 'posts', {}], data)).toEqual(data);
  });

  it('removes expiring family media access urls before writing persisted data', () => {
    vi.setSystemTime('2026-05-06T10:00:00.000Z');
    const data = createFamilyPostsData('2026-05-07T10:01:00.000Z');

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
              posterUrl: undefined,
              previewUrl: undefined,
              url: undefined,
              expiresAt: undefined,
            },
          ],
        },
      ],
    });
  });

  it('removes family media access metadata when the display url is missing', () => {
    vi.setSystemTime('2026-05-06T10:00:00.000Z');
    const data = createFamilyPostsData('2026-05-07T10:10:01.000Z');
    data.items[0].media[0].displayUrl = undefined as never;

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
              posterUrl: undefined,
              previewUrl: undefined,
              url: undefined,
              expiresAt: undefined,
            },
          ],
        },
      ],
    });
  });

  it('marks family post cache stale when media access urls are removed', () => {
    vi.useFakeTimers();
    vi.setSystemTime('2026-05-06T10:00:00.000Z');
    let storedCache = '';
    const storage: Storage = {
      length: 0,
      clear: vi.fn(),
      getItem: vi.fn(() => storedCache),
      key: vi.fn(),
      removeItem: vi.fn(),
      setItem: vi.fn((_key, value) => {
        storedCache = value;
      }),
    };
    const persister = createMobileQueryPersister(storage);
    const persistedClient = {
      timestamp: Date.now(),
      buster: MOBILE_QUERY_CACHE_BUSTER,
      clientState: {
        mutations: [],
        queries: [
          {
            queryKey: ['family', 'posts', {}],
            queryHash: '["family","posts",{}]',
            state: {
              data: createFamilyPostsData('2026-05-07T10:01:00.000Z'),
              dataUpdatedAt: Date.now(),
              error: null,
              errorUpdatedAt: 0,
              fetchFailureCount: 0,
              fetchFailureReason: null,
              fetchMeta: null,
              fetchStatus: 'idle',
              status: 'success',
            },
          },
        ],
      },
    } as PersistedClient;

    void persister.persistClient(persistedClient);
    vi.advanceTimersByTime(1000);

    expect(storage.setItem).toHaveBeenCalledWith(MOBILE_QUERY_CACHE_STORAGE_KEY, expect.any(String));
    const storedClient = JSON.parse(storedCache) as PersistedClient;
    expect(storedClient.clientState.queries[0].state.dataUpdatedAt).toBe(0);
  });

  it('uses a bounded one day cache window', () => {
    expect(MOBILE_QUERY_CACHE_MAX_AGE).toBe(24 * 60 * 60 * 1000);
    expect(MOBILE_QUERY_CACHE_BUSTER).toBe('home-mobile-cache-v2');
  });
});
