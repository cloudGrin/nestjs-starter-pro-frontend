import { QueryClient, type Query, type QueryKey } from '@tanstack/react-query';
import {
  persistQueryClient,
  type PersistedClient,
  type Persister,
} from '@tanstack/query-persist-client-core';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const MOBILE_QUERY_CACHE_STORAGE_KEY = 'home-mobile-query-cache';
export const MOBILE_QUERY_CACHE_BUSTER = 'home-mobile-cache-v1';
export const MOBILE_QUERY_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

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

function sanitizeFamilyMedia(media: unknown) {
  if (!media || typeof media !== 'object') {
    return media;
  }

  return {
    ...(media as Record<string, unknown>),
    displayUrl: undefined,
    previewUrl: undefined,
    url: undefined,
    expiresAt: undefined,
  };
}

function sanitizeFamilyPost(post: unknown) {
  if (!post || typeof post !== 'object') {
    return post;
  }

  const nextPost = { ...(post as Record<string, unknown>) };
  if (Array.isArray(nextPost.media)) {
    nextPost.media = nextPost.media.map(sanitizeFamilyMedia);
  }

  return nextPost;
}

export function sanitizeMobilePersistedData(queryKey: QueryKey, data: unknown) {
  const [scope, type] = queryKey;
  if (scope !== 'family' || type !== 'posts') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeFamilyPost);
  }

  if (!data || typeof data !== 'object') {
    return data;
  }

  const nextData = { ...(data as Record<string, unknown>) };
  if (Array.isArray(nextData.items)) {
    nextData.items = nextData.items.map(sanitizeFamilyPost);
  }

  return nextData;
}

function sanitizePersistedClient(client: PersistedClient): PersistedClient {
  return {
    ...client,
    clientState: {
      ...client.clientState,
      queries: client.clientState.queries.map((query) => ({
        ...query,
        state: {
          ...query.state,
          data: sanitizeMobilePersistedData(query.queryKey, query.state.data),
        },
      })),
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
