import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { familyService } from '../services/family.service';
import type {
  CreateFamilyChatMessageDto,
  CreateFamilyPostDto,
  QueryFamilyChatMessagesParams,
  QueryFamilyPostsParams,
} from '../types/family.types';

export const familyQueryKeys = {
  all: ['family'] as const,
  posts: () => ['family', 'posts'] as const,
  postList: (params: QueryFamilyPostsParams) => ['family', 'posts', params] as const,
  chatMessages: () => ['family', 'chat-messages'] as const,
  chatMessageList: (params: QueryFamilyChatMessagesParams) =>
    ['family', 'chat-messages', params] as const,
};

export function useFamilyPosts(params: QueryFamilyPostsParams) {
  return useQuery({
    queryKey: familyQueryKeys.postList(params),
    queryFn: () => familyService.getPosts(params),
    placeholderData: keepPreviousData,
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
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      familyService.createComment(postId, { content }),
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
