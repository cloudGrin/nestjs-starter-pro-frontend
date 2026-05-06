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
  FamilyReadState,
  FamilyUploadedMedia,
  QueryFamilyChatMessagesParams,
  QueryFamilyPostsParams,
} from '../types/family.types';

const BASE_URL = '/family';

const FAMILY_MEDIA_MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
  '.wmv': 'video/x-ms-wmv',
};

function getFileExtension(filename: string) {
  const dotIndex = filename.lastIndexOf('.');
  return dotIndex >= 0 ? filename.slice(dotIndex).toLowerCase() : '';
}

function inferFamilyMediaMimeType(file: File) {
  if (file.type && file.type !== 'application/octet-stream') {
    return file.type;
  }

  return (
    FAMILY_MEDIA_MIME_TYPES[getFileExtension(file.name)] || file.type || 'application/octet-stream'
  );
}

function normalizeFamilyUploadFile(file: File) {
  const mimeType = inferFamilyMediaMimeType(file);
  if (file.type === mimeType) {
    return file;
  }

  return new File([file], file.name, {
    type: mimeType,
    lastModified: file.lastModified,
  });
}

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

  getState: () => request.get<FamilyReadState>(`${BASE_URL}/state`),

  markPostsRead: (postId?: number) =>
    request.post<FamilyReadState>(`${BASE_URL}/state/read-posts`, postId ? { postId } : {}, {
      requestOptions: {
        messageConfig: { successMessage: false },
      },
    }),

  markChatRead: (messageId?: number) =>
    request.post<FamilyReadState>(`${BASE_URL}/state/read-chat`, messageId ? { messageId } : {}, {
      requestOptions: {
        messageConfig: { successMessage: false },
      },
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
      const contentType = inferFamilyMediaMimeType(file);
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
    formData.append('file', normalizeFamilyUploadFile(file));
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
