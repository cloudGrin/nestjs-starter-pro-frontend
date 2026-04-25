/**
 * 文件管理服务
 */

import { request } from '@/shared/utils/request';
import type {
  FileEntity,
  FileListResponse,
  QueryFileDto,
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
 * 获取文件列表
 */
export const getFiles = async (params: QueryFileDto): Promise<FileListResponse> => {
  return await request.get<FileListResponse>(BASE_URL, { params });
};

/**
 * 下载文件
 */
export const downloadFile = async (id: number, filename?: string): Promise<void> => {
  const response = await request.get<Blob>(`${BASE_URL}/${id}/download`, {
    responseType: 'blob',
  });

  // 创建下载链接
  const blob = response instanceof Blob ? response : new Blob([response]);
  const url = window.URL.createObjectURL(blob);
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
