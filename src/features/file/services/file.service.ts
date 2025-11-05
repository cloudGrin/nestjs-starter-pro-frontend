/**
 * 文件管理服务
 */

import { request } from '@/shared/utils/request';
import type {
  FileEntity,
  FileListResponse,
  QueryFileDto,
  SignedUrlResponse,
  ChunkUploadResponse,
  ChunkUploadProgress,
  UploadChunkDto,
} from '../types/file.types';

const BASE_URL = '/files';

/**
 * 上传文件（直传）
 */
export const uploadFile = async (
  file: File,
  options?: {
    module?: string;
    tags?: string;
    isPublic?: boolean;
    remark?: string;
    onProgress?: (progress: number) => void;
  }
): Promise<FileEntity> => {
  const formData = new FormData();
  formData.append('file', file);
  if (options?.module) formData.append('module', options.module);
  if (options?.tags) formData.append('tags', options.tags);
  if (options?.isPublic !== undefined) formData.append('isPublic', String(options.isPublic));
  if (options?.remark) formData.append('remark', options.remark);

  return await request.post<FileEntity>(`${BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
      if (progressEvent.total && options?.onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        options.onProgress(progress);
      }
    },
  });
};

/**
 * 上传文件分片
 */
export const uploadChunk = async (params: UploadChunkDto): Promise<ChunkUploadResponse> => {
  const formData = new FormData();
  formData.append('chunk', params.chunk);
  formData.append('uploadId', params.uploadId);
  formData.append('chunkIndex', String(params.chunkIndex));
  formData.append('totalChunks', String(params.totalChunks));
  formData.append('chunkSize', String(params.chunkSize));
  formData.append('totalSize', String(params.totalSize));
  formData.append('filename', params.filename);
  formData.append('hash', params.hash);
  if (params.module) formData.append('module', params.module);
  if (params.tags) formData.append('tags', params.tags);
  if (params.isPublic !== undefined) formData.append('isPublic', String(params.isPublic));
  if (params.remark) formData.append('remark', params.remark);

  return await request.post<ChunkUploadResponse>(
    `${BASE_URL}/upload/chunk`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

/**
 * 查询分片上传进度
 */
export const getChunkProgress = async (uploadId: string): Promise<ChunkUploadProgress> => {
  return await request.get<ChunkUploadProgress>(
    `${BASE_URL}/upload/${uploadId}/progress`
  );
};

/**
 * 获取文件列表
 */
export const getFiles = async (params: QueryFileDto): Promise<FileListResponse> => {
  return await request.get<FileListResponse>(BASE_URL, { params });
};

/**
 * 获取文件详情
 */
export const getFileById = async (id: number): Promise<FileEntity> => {
  return await request.get<FileEntity>(`${BASE_URL}/${id}`);
};

/**
 * 生成文件下载签名URL
 */
export const getSignedUrl = async (
  id: number,
  expiresIn?: number
): Promise<SignedUrlResponse> => {
  return await request.get<SignedUrlResponse>(`${BASE_URL}/${id}/signed-url`, {
    params: { expiresIn },
  });
};

/**
 * 下载文件
 */
export const downloadFile = async (id: number, filename?: string): Promise<void> => {
  const response = await request.get(`${BASE_URL}/${id}/download`, {
    responseType: 'blob',
  });

  // 创建下载链接
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename || `file_${id}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * 删除文件
 */
export const deleteFile = async (id: number): Promise<void> => {
  await request.delete(`${BASE_URL}/${id}`, {
    requestOptions: {
      confirmConfig: {
        message: '确定要删除该文件吗？删除后将无法恢复。',
        title: '删除文件',
      },
      messageConfig: {
        successMessage: '文件删除成功',
      },
    },
  });
};

/**
 * 批量删除文件
 */
export const deleteFiles = async (ids: number[]): Promise<void> => {
  await request.delete(`${BASE_URL}/batch`, {
    data: ids,
    requestOptions: {
      confirmConfig: {
        message: `确定要删除这 ${ids.length} 个文件吗？删除后将无法恢复。`,
        title: '批量删除文件',
      },
      messageConfig: {
        successMessage: '文件批量删除成功',
      },
    },
  });
};
