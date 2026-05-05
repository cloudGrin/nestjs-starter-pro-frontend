import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { familyService } from '../services/family.service';
import type {
  CreateFamilyChatMessageDto,
  CreateFamilyPostCommentDto,
  CreateFamilyPostDto,
  FamilyPaginationResult,
  FamilyPost,
  QueryFamilyChatMessagesParams,
  QueryFamilyPostsParams,
} from '../types/family.types';

export const familyQueryKeys = {
  all: ['family'] as const,
  posts: () => ['family', 'posts'] as const,
  postList: (params: QueryFamilyPostsParams) => ['family', 'posts', params] as const,
  post: (id: number) => ['family', 'posts', id] as const,
  chatMessages: () => ['family', 'chat-messages'] as const,
  chatMessageList: (params: QueryFamilyChatMessagesParams) =>
    ['family', 'chat-messages', params] as const,
};

const FAMILY_MEDIA_LINK_REFRESH_BUFFER_MS = 60 * 1000;

function isReusableFamilyMediaLink(expiresAt: string, now: number) {
  const expiresAtTime = Date.parse(expiresAt);
  return Number.isFinite(expiresAtTime) && expiresAtTime - now > FAMILY_MEDIA_LINK_REFRESH_BUFFER_MS;
}

export function mergeStableFamilyPostMediaUrls(
  previous: FamilyPaginationResult<FamilyPost> | undefined,
  next: FamilyPaginationResult<FamilyPost>,
  now = Date.now()
): FamilyPaginationResult<FamilyPost> {
  if (!previous?.items.length) {
    return next;
  }

  const previousMediaByKey = new Map(
    previous.items.flatMap((post) =>
      post.media.map((media) => [`${media.id}:${media.fileId}`, media] as const)
    )
  );

  return {
    ...next,
    items: next.items.map((post) => ({
      ...post,
      media: post.media.map((media) => {
        const previousMedia = previousMediaByKey.get(`${media.id}:${media.fileId}`);
        if (
          !previousMedia ||
          !isReusableFamilyMediaLink(previousMedia.expiresAt, now)
        ) {
          return media;
        }

        return {
          ...media,
          displayUrl: previousMedia.displayUrl,
          expiresAt: previousMedia.expiresAt,
        };
      }),
    })),
  };
}

export function useFamilyPosts(params: QueryFamilyPostsParams) {
  const queryClient = useQueryClient();
  const queryKey = familyQueryKeys.postList(params);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const next = await familyService.getPosts(params);
      const previous = queryClient.getQueryData<FamilyPaginationResult<FamilyPost>>(queryKey);
      return mergeStableFamilyPostMediaUrls(previous, next);
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useFamilyPost(id: number) {
  return useQuery({
    queryKey: familyQueryKeys.post(id),
    queryFn: () => familyService.getPost(id),
    enabled: Number.isInteger(id) && id > 0,
    staleTime: 30 * 1000,
  });
}

export function useCreateFamilyPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFamilyPostDto) => familyService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.posts() });
    },
  });
}

export function useCreateFamilyComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, ...data }: { postId: number } & CreateFamilyPostCommentDto) =>
      familyService.createComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.posts() });
    },
  });
}

export function useLikeFamilyPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => familyService.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.posts() });
    },
  });
}

export function useUnlikeFamilyPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => familyService.unlikePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.posts() });
    },
  });
}

export function useFamilyChatMessages(params: QueryFamilyChatMessagesParams) {
  return useQuery({
    queryKey: familyQueryKeys.chatMessageList(params),
    queryFn: () => familyService.getChatMessages(params),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useCreateFamilyChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFamilyChatMessageDto) => familyService.createChatMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.chatMessages() });
    },
  });
}
