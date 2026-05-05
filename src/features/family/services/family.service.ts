import axios from 'axios';
import { appConfig } from '@/shared/config/app.config';
import { request } from '@/shared/utils/request';
import type {
  CreateFamilyChatMessageDto,
  CreateFamilyPostCommentDto,
  CreateFamilyPostDto,
  FamilyChatMessage,
  FamilyMediaDirectUploadInitResponse,
  FamilyMediaTarget,
  FamilyPaginationResult,
  FamilyPost,
  FamilyUploadedMedia,
  QueryFamilyChatMessagesParams,
  QueryFamilyPostsParams,
} from '../types/family.types';

const BASE_URL = '/family';

export const familyService = {
  getPosts: (params: QueryFamilyPostsParams) =>
    request.get<FamilyPaginationResult<FamilyPost>>(`${BASE_URL}/posts`, { params }),

  getPost: (id: number) => request.get<FamilyPost>(`${BASE_URL}/posts/${id}`),

  createPost: (data: CreateFamilyPostDto) =>
    request.post<FamilyPost>(`${BASE_URL}/posts`, data, {
      requestOptions: {
        messageConfig: { successMessage: '已发布' },
      },
    }),

  createComment: (postId: number, data: CreateFamilyPostCommentDto) =>
    request.post(`${BASE_URL}/posts/${postId}/comments`, data, {
      requestOptions: {
        messageConfig: { successMessage: false },
      },
    }),

  likePost: (postId: number) =>
    request.post(`${BASE_URL}/posts/${postId}/like`, undefined, {
      requestOptions: {
        messageConfig: { successMessage: false },
      },
    }),

  unlikePost: (postId: number) =>
    request.delete(`${BASE_URL}/posts/${postId}/like`, {
      requestOptions: {
        messageConfig: { successMessage: false },
      },
    }),

  getChatMessages: (params: QueryFamilyChatMessagesParams) =>
    request.get<FamilyPaginationResult<FamilyChatMessage>>(`${BASE_URL}/chat/messages`, {
      params,
    }),

  createChatMessage: (data: CreateFamilyChatMessageDto) =>
    request.post<FamilyChatMessage>(`${BASE_URL}/chat/messages`, data, {
      requestOptions: {
        messageConfig: { successMessage: false },
      },
    }),

  uploadFamilyMedia: async (
    file: File,
    target: FamilyMediaTarget,
    onProgress?: (progress: number) => void
  ): Promise<FamilyUploadedMedia> => {
    if (appConfig.familyMediaUploadMode === 'oss') {
      const contentType = file.type || 'application/octet-stream';
      const initResult = await request.post<FamilyMediaDirectUploadInitResponse>(
        `${BASE_URL}/media/direct-upload/initiate`,
        {
          target,
          originalName: file.name,
          mimeType: contentType,
          size: file.size,
        },
        {
          requestOptions: {
            messageConfig: { successMessage: false },
          },
        }
      );

      await axios.put(initResult.uploadUrl, file, {
        headers: initResult.headers,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            onProgress(Math.round((progressEvent.loaded * 95) / progressEvent.total));
          }
        },
      });

      const media = await request.post<FamilyUploadedMedia>(
        `${BASE_URL}/media/direct-upload/complete`,
        { uploadToken: initResult.uploadToken },
        {
          requestOptions: {
            messageConfig: { successMessage: false },
          },
        }
      );
      onProgress?.(100);
      return media;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('target', target);

    const media = await request.post<FamilyUploadedMedia>(`${BASE_URL}/media/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      requestOptions: {
        messageConfig: { successMessage: false },
      },
      onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
        if (progressEvent.total && onProgress) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    onProgress?.(100);
    return media;
  },
};
