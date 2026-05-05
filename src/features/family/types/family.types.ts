import type { FileEntity } from '@/features/file/types/file.types';

export type FamilyMediaType = 'image' | 'video';
export type FamilyMediaTarget = 'circle' | 'chat';

export interface FamilyUserSummary {
  id: number;
  username: string;
  nickname?: string | null;
  realName?: string | null;
  avatar?: string | null;
}

export interface FamilyMedia {
  id: number;
  fileId: number;
  mediaType: FamilyMediaType;
  sort: number;
  mimeType?: string;
  originalName?: string;
  size?: number;
  displayUrl: string;
  expiresAt: string;
}

export interface FamilyPostComment {
  id: number;
  postId: number;
  parentCommentId?: number | null;
  replyToUserId?: number | null;
  content: string;
  authorId: number;
  author?: FamilyUserSummary;
  replyToUser?: FamilyUserSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyPost {
  id: number;
  content?: string | null;
  authorId: number;
  author?: FamilyUserSummary;
  media: FamilyMedia[];
  comments: FamilyPostComment[];
  likeCount: number;
  likedByMe: boolean;
  likedUsers?: FamilyUserSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface FamilyChatMessage {
  id: number;
  content?: string | null;
  senderId: number;
  sender?: FamilyUserSummary;
  media: FamilyMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface FamilyPaginationResult<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount?: number;
    itemsPerPage?: number;
    totalPages?: number;
    currentPage?: number;
  };
}

export interface QueryFamilyPostsParams {
  page?: number;
  limit?: number;
}

export interface QueryFamilyChatMessagesParams {
  page?: number;
  limit?: number;
  afterId?: number;
}

export interface CreateFamilyPostDto {
  content?: string | null;
  mediaFileIds?: number[];
}

export interface CreateFamilyPostCommentDto {
  content: string;
  parentCommentId?: number;
}

export interface CreateFamilyChatMessageDto {
  content?: string | null;
  mediaFileIds?: number[];
}

export interface FamilyMediaDirectUploadInitResponse {
  method: 'PUT';
  uploadUrl: string;
  uploadToken: string;
  expiresAt: string;
  headers: Record<string, string>;
}

export type FamilyUploadedMedia = FileEntity;
