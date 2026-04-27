/**
 * 文件管理模块类型定义
 */

/**
 * 文件实体
 */
export interface FileEntity {
  id: number;
  originalName: string;
  filename: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  module?: string;
  tags?: string; // 数据库存储为逗号分隔的字符串（如："测试,截图"）
  isPublic: boolean;
  uploaderId: number;
  uploader?: {
    id: number;
    username: string;
    nickname?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * 文件查询参数
 */
export interface QueryFileDto {
  page?: number;
  limit?: number; // 后端期望limit，不是pageSize
  sort?: string;
  order?: 'ASC' | 'DESC';
  keyword?: string;
  storage?: 'local' | 'oss';
  category?: string;
  module?: string;
  isPublic?: boolean;
}

/**
 * 文件列表响应
 */
export interface FileListResponse {
  items: FileEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 文件模块类型
 */
export type FileModule = 'user-avatar' | 'document' | 'image' | 'video' | 'audio' | 'other';

/**
 * 文件大小限制（字节）
 */
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 500 * 1024 * 1024, // 500MB
  audio: 50 * 1024 * 1024, // 50MB
  document: 50 * 1024 * 1024, // 50MB
  default: 50 * 1024 * 1024, // 50MB
} as const;
