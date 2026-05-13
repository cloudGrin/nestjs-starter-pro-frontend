import { QueryClient, type Query, type QueryKey } from '@tanstack/react-query';
import {
  persistQueryClient,
  type PersistedClient,
  type Persister,
} from '@tanstack/query-persist-client-core';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const MOBILE_QUERY_CACHE_STORAGE_KEY = 'home-mobile-query-cache';
export const MOBILE_QUERY_CACHE_BUSTER = 'home-mobile-cache-v2';
export const MOBILE_QUERY_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
const FAMILY_MEDIA_LINK_PERSIST_BUFFER_MS = 5 * 60 * 1000;
const FAMILY_MEDIA_LINK_MIN_REMAINING_MS =
  MOBILE_QUERY_CACHE_MAX_AGE + FAMILY_MEDIA_LINK_PERSIST_BUFFER_MS;

interface SanitizedDataResult {
  data: unknown;
  clearedMediaUrls: boolean;
}

export function createMobileQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: MOBILE_QUERY_CACHE_MAX_AGE,
        retry: (failureCount, error) => {
          const status = (error as { response?: { status?: number } })?.response?.status;

          if (status && status >= 400 && status < 500) {
            return false;
          }

          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function shouldPersistMobileQuery(queryKey: QueryKey) {
  const [scope, type] = queryKey;

  if (scope === 'tasks' || scope === 'task-lists' || scope === 'insurance') {
    return true;
  }

  if (scope === 'notifications' || scope === 'profile') {
    return true;
  }

  if (scope === 'family') {
    return type === 'posts' || type === 'state';
  }

  return false;
}

export function shouldDehydrateMobileQuery(query: Query) {
  return query.state.status === 'success' && shouldPersistMobileQuery(query.queryKey);
}

function isFamilyPostsQueryKey(queryKey: QueryKey) {
  const [scope, type] = queryKey;
  return scope === 'family' && type === 'posts';
}

function canPersistFamilyMediaUrls(media: Record<string, unknown>, now: number) {
  const displayUrl = media.displayUrl;
  if (typeof displayUrl !== 'string' || displayUrl.trim().length === 0) {
    return false;
  }

  const expiresAt = media.expiresAt;
  if (typeof expiresAt !== 'string') {
    return false;
  }

  const expiresAtTime = Date.parse(expiresAt);
  return (
    Number.isFinite(expiresAtTime) && expiresAtTime - now > FAMILY_MEDIA_LINK_MIN_REMAINING_MS
  );
}

function sanitizeFamilyMedia(media: unknown, now: number): SanitizedDataResult {
  if (!media || typeof media !== 'object') {
    return { data: media, clearedMediaUrls: false };
  }

  const mediaRecord = media as Record<string, unknown>;
  if (canPersistFamilyMediaUrls(mediaRecord, now)) {
    return { data: media, clearedMediaUrls: false };
  }

  return {
    data: {
      ...mediaRecord,
      displayUrl: undefined,
      posterUrl: undefined,
      previewUrl: undefined,
      url: undefined,
      expiresAt: undefined,
    },
    clearedMediaUrls: true,
  };
}

function sanitizeFamilyPost(post: unknown, now: number): SanitizedDataResult {
  if (!post || typeof post !== 'object') {
    return { data: post, clearedMediaUrls: false };
  }

  let clearedMediaUrls = false;
  const nextPost = { ...(post as Record<string, unknown>) };
  if (Array.isArray(nextPost.media)) {
    nextPost.media = nextPost.media.map((media) => {
      const result = sanitizeFamilyMedia(media, now);
      clearedMediaUrls ||= result.clearedMediaUrls;
      return result.data;
    });
  }

  return { data: nextPost, clearedMediaUrls };
}

function sanitizeMobilePersistedDataWithMetadata(
  queryKey: QueryKey,
  data: unknown,
  now = Date.now()
): SanitizedDataResult {
  if (!isFamilyPostsQueryKey(queryKey)) {
    return { data, clearedMediaUrls: false };
  }

  if (Array.isArray(data)) {
    let clearedMediaUrls = false;
    const nextData = data.map((post) => {
      const result = sanitizeFamilyPost(post, now);
      clearedMediaUrls ||= result.clearedMediaUrls;
      return result.data;
    });
    return { data: nextData, clearedMediaUrls };
  }

  if (!data || typeof data !== 'object') {
    return { data, clearedMediaUrls: false };
  }

  let clearedMediaUrls = false;
  const nextData = { ...(data as Record<string, unknown>) };
  if (Array.isArray(nextData.items)) {
    nextData.items = nextData.items.map((post) => {
      const result = sanitizeFamilyPost(post, now);
      clearedMediaUrls ||= result.clearedMediaUrls;
      return result.data;
    });
  }

  return { data: nextData, clearedMediaUrls };
}

export function sanitizeMobilePersistedData(queryKey: QueryKey, data: unknown) {
  return sanitizeMobilePersistedDataWithMetadata(queryKey, data).data;
}

function sanitizePersistedClient(client: PersistedClient): PersistedClient {
  return {
    ...client,
    clientState: {
      ...client.clientState,
      queries: client.clientState.queries.map((query) => {
        const result = sanitizeMobilePersistedDataWithMetadata(query.queryKey, query.state.data);

        return {
          ...query,
          state: {
            ...query.state,
            data: result.data,
            dataUpdatedAt: result.clearedMediaUrls ? 0 : query.state.dataUpdatedAt,
          },
        };
      }),
    },
  };
}

export function createMobileQueryPersister(storage: Storage | undefined): Persister {
  return createSyncStoragePersister({
    storage,
    key: MOBILE_QUERY_CACHE_STORAGE_KEY,
    serialize: (client) => JSON.stringify(sanitizePersistedClient(client)),
    deserialize: (cache) => JSON.parse(cache) as PersistedClient,
  });
}

export function persistMobileQueryClient(queryClient: QueryClient, storage = window.localStorage) {
  return persistQueryClient({
    queryClient,
    persister: createMobileQueryPersister(storage),
    maxAge: MOBILE_QUERY_CACHE_MAX_AGE,
    buster: MOBILE_QUERY_CACHE_BUSTER,
    dehydrateOptions: {
      shouldDehydrateQuery: shouldDehydrateMobileQuery,
      shouldDehydrateMutation: () => false,
    },
  });
}

export function clearMobilePersistedQueryCache(storage = window.localStorage) {
  storage.removeItem(MOBILE_QUERY_CACHE_STORAGE_KEY);
}
