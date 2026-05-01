/**
 * 文件管理服务
 */

import axios from 'axios';
import { request } from '@/shared/utils/request';
import type {
  DirectUploadInitResponse,
  FileAccessDisposition,
  FileAccessLinkResponse,
  FileEntity,
  FileListResponse,
  FileStorageOptionsResponse,
  QueryFileDto,
  UploadFileOptions,
} from '../types/file.types';
import { resolveFileAccessUrl } from '../utils/file-url';

const BASE_URL = '/files';

/**
 * 上传文件（直传）
 */
export const uploadFile = async (file: File, options?: UploadFileOptions): Promise<FileEntity> => {
  const formData = new FormData();
  formData.append('file', file);
  if (options?.storage) formData.append('storage', options.storage);
  if (options?.module) formData.append('module', options.module);
  if (options?.tags) formData.append('tags', options.tags);
  if (options?.isPublic !== undefined) formData.append('isPublic', String(options.isPublic));
  if (options?.remark) formData.append('remark', options.remark);

  return await request.post<FileEntity>(`${BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    requestOptions: {
      messageConfig: {
        successMessage: '文件上传成功',
      },
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
 * 获取可用存储选项
 */
export const getFileStorageOptions = async (): Promise<FileStorageOptionsResponse> => {
  return await request.get<FileStorageOptionsResponse>(`${BASE_URL}/storage-options`);
};

/**
 * OSS 浏览器直传
 */
export const directUploadFile = async (
  file: File,
  options?: UploadFileOptions
): Promise<FileEntity> => {
  const contentType = file.type || 'application/octet-stream';
  const initResult = await request.post<DirectUploadInitResponse>(
    `${BASE_URL}/direct-upload/initiate`,
    {
      originalName: file.name,
      mimeType: contentType,
      size: file.size,
      module: options?.module,
      tags: options?.tags,
      isPublic: options?.isPublic ?? false,
      remark: options?.remark,
    },
    {
      requestOptions: {
        messageConfig: {
          successMessage: false,
        },
      },
    }
  );

  await axios.put(initResult.uploadUrl, file, {
    headers: initResult.headers,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && options?.onProgress) {
        const progress = Math.round((progressEvent.loaded * 95) / progressEvent.total);
        options.onProgress(progress);
      }
    },
  });

  const entity = await request.post<FileEntity>(
    `${BASE_URL}/direct-upload/complete`,
    { uploadToken: initResult.uploadToken },
    {
      requestOptions: {
        messageConfig: {
          successMessage: '文件上传成功',
        },
      },
    }
  );
  options?.onProgress?.(100);
  return entity;
};

/**
 * 获取文件列表
 */
export const getFiles = async (params: QueryFileDto): Promise<FileListResponse> => {
  return await request.get<FileListResponse>(BASE_URL, { params });
};

/**
 * 创建临时访问链接
 */
export const createFileAccessLink = async (
  id: number,
  disposition: FileAccessDisposition = 'attachment'
): Promise<FileAccessLinkResponse> => {
  return await request.post<FileAccessLinkResponse>(`${BASE_URL}/${id}/access-link`, {
    disposition,
  });
};

/**
 * 获取文件二进制内容（用于鉴权预览，不触发浏览器下载）
 */
export const getFileBlob = async (id: number): Promise<Blob> => {
  return await request.get<Blob>(`${BASE_URL}/${id}/download`, {
    responseType: 'blob',
  });
};

/**
 * 下载文件
 */
export const downloadFile = async (id: number, filename?: string): Promise<void> => {
  const { url } = await createFileAccessLink(id, 'attachment');
  const link = document.createElement('a');
  link.href = resolveFileAccessUrl(url);
  link.setAttribute('download', filename || `file_${id}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
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
