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
  posterUrl?: string;
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
  afterId?: number;
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

export interface FamilyReadState {
  unreadPosts: number;
  unreadChatMessages: number;
  latestPostId: number | null;
  latestChatMessageId: number | null;
  lastReadPostId: number | null;
  lastReadChatMessageId: number | null;
}

export interface FamilyPostCreatedEvent {
  postId: number;
  authorId: number;
  author?: FamilyUserSummary;
  createdAt: string;
}

export interface FamilyChatMessageCreatedEvent {
  messageId: number;
  senderId: number;
  sender?: FamilyUserSummary;
  createdAt: string;
}

export interface FamilyMediaDirectUploadInitResponse {
  method: 'PUT';
  uploadUrl: string;
  uploadToken: string;
  expiresAt: string;
  headers: Record<string, string>;
}

export type FamilyUploadedMedia = FileEntity;

export interface BabyProfile {
  id: number;
  nickname: string;
  birthDate: string;
  birthTime?: string | null;
  avatarFileId?: number | null;
  avatarUrl?: string | null;
  birthHeightCm?: number | null;
  birthWeightKg?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BabyGrowthRecord {
  id: number;
  measuredAt: string;
  heightCm?: number | null;
  weightKg?: number | null;
  remark?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BabyBirthdayMedia {
  id: number;
  fileId: number;
  contributionId?: number | null;
  uploaderId: number;
  uploader?: FamilyUserSummary;
  sort: number;
  originalName?: string;
  mimeType?: string;
  size?: number;
  displayUrl: string;
  expiresAt: string;
  createdAt?: string;
}

export interface BabyBirthdayContribution {
  id: number;
  birthdayId: number;
  authorId: number;
  author?: FamilyUserSummary;
  content?: string | null;
  media: BabyBirthdayMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface BabyBirthday {
  id: number;
  year: number;
  title: string;
  description?: string | null;
  coverFileId?: number | null;
  coverUrl?: string | null;
  mediaCount: number;
  contributionCount: number;
  media: BabyBirthdayMedia[];
  contributions: BabyBirthdayContribution[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BabyOverview {
  profile: BabyProfile | null;
  latestGrowthRecord: BabyGrowthRecord | null;
  growthRecords: BabyGrowthRecord[];
  birthdays: BabyBirthday[];
}

export interface SaveBabyProfileDto {
  nickname: string;
  birthDate: string;
  birthTime?: string | null;
  avatarFileId?: number | null;
  birthHeightCm?: number | null;
  birthWeightKg?: number | null;
}

export interface CreateBabyGrowthRecordDto {
  measuredAt: string;
  heightCm?: number | null;
  weightKg?: number | null;
  remark?: string | null;
}

export type UpdateBabyGrowthRecordDto = Partial<CreateBabyGrowthRecordDto>;

export interface CreateBabyBirthdayDto {
  year: number;
  title: string;
  description?: string | null;
  coverFileId?: number | null;
}

export type UpdateBabyBirthdayDto = Partial<CreateBabyBirthdayDto>;

export interface CreateBabyBirthdayContributionDto {
  content?: string | null;
  mediaFileIds?: number[];
}
