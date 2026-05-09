import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { familyService } from '../services/family.service';
import type {
  CreateBabyBirthdayContributionDto,
  CreateBabyBirthdayDto,
  CreateBabyGrowthRecordDto,
  CreateFamilyChatMessageDto,
  CreateFamilyPostCommentDto,
  CreateFamilyPostDto,
  FamilyPaginationResult,
  FamilyPost,
  QueryFamilyChatMessagesParams,
  QueryFamilyPostsParams,
  SaveBabyProfileDto,
  UpdateBabyBirthdayDto,
  UpdateBabyGrowthRecordDto,
} from '../types/family.types';

export const familyQueryKeys = {
  all: ['family'] as const,
  posts: () => ['family', 'posts'] as const,
  postList: (params: QueryFamilyPostsParams) => ['family', 'posts', params] as const,
  post: (id: number) => ['family', 'posts', id] as const,
  chatMessages: () => ['family', 'chat-messages'] as const,
  chatMessageList: (params: QueryFamilyChatMessagesParams) =>
    ['family', 'chat-messages', params] as const,
  state: () => ['family', 'state'] as const,
  baby: () => ['family', 'baby'] as const,
};

const FAMILY_MEDIA_LINK_REFRESH_BUFFER_MS = 60 * 1000;

function isReusableFamilyMediaLink(expiresAt: string, now: number) {
  const expiresAtTime = Date.parse(expiresAt);
  return (
    Number.isFinite(expiresAtTime) && expiresAtTime - now > FAMILY_MEDIA_LINK_REFRESH_BUFFER_MS
  );
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
        if (!previousMedia || !isReusableFamilyMediaLink(previousMedia.expiresAt, now)) {
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

export function useBabyOverview() {
  return useQuery({
    queryKey: familyQueryKeys.baby(),
    queryFn: () => familyService.getBabyOverview(),
    staleTime: 60 * 1000,
  });
}

export function useSaveBabyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveBabyProfileDto) => familyService.saveBabyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.baby() });
    },
  });
}

export function useCreateBabyGrowthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBabyGrowthRecordDto) => familyService.createBabyGrowthRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.baby() });
    },
  });
}

export function useUpdateBabyGrowthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBabyGrowthRecordDto }) =>
      familyService.updateBabyGrowthRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.baby() });
    },
  });
}

export function useDeleteBabyGrowthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => familyService.deleteBabyGrowthRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.baby() });
    },
  });
}

export function useCreateBabyBirthday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBabyBirthdayDto) => familyService.createBabyBirthday(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.baby() });
    },
  });
}

export function useUpdateBabyBirthday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBabyBirthdayDto }) =>
      familyService.updateBabyBirthday(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.baby() });
    },
  });
}

export function useDeleteBabyBirthday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => familyService.deleteBabyBirthday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.baby() });
    },
  });
}

export function useCreateBabyBirthdayContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      birthdayId,
      data,
    }: {
      birthdayId: number;
      data: CreateBabyBirthdayContributionDto;
    }) => familyService.createBabyBirthdayContribution(birthdayId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.baby() });
    },
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
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.state() });
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
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.state() });
    },
  });
}

export function useFamilyState() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const stateQuery = useQuery({
    queryKey: familyQueryKeys.state(),
    queryFn: () => familyService.getState(),
    enabled: Boolean(token),
    staleTime: 15 * 1000,
  });
  const markPostsRead = useMutation({
    mutationFn: (postId?: number) => familyService.markPostsRead(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.state() });
    },
  });
  const markChatRead = useMutation({
    mutationFn: (messageId?: number) => familyService.markChatRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.state() });
    },
  });

  return {
    ...stateQuery,
    markPostsRead: markPostsRead.mutate,
    markPostsReadAsync: markPostsRead.mutateAsync,
    markChatRead: markChatRead.mutate,
    markChatReadAsync: markChatRead.mutateAsync,
    isMarkingPostsRead: markPostsRead.isPending,
    isMarkingChatRead: markChatRead.isPending,
  };
}
