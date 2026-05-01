/**
 * 文件管理 Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FileAccessDisposition, QueryFileDto } from '../types/file.types';
import * as fileService from '../services/file.service';

const FILE_QUERY_KEY = 'files';

/**
 * 获取文件列表
 */
export const useFiles = (params: QueryFileDto) => {
  return useQuery({
    queryKey: [FILE_QUERY_KEY, 'list', params],
    queryFn: () => fileService.getFiles(params),
  });
};

/**
 * 获取文件存储选项
 */
export const useFileStorageOptions = () => {
  return useQuery({
    queryKey: [FILE_QUERY_KEY, 'storage-options'],
    queryFn: fileService.getFileStorageOptions,
  });
};

/**
 * 上传文件（直传）
 */
export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      options,
    }: {
      file: File;
      options?: Parameters<typeof fileService.uploadFile>[1];
    }) =>
      options?.storage === 'oss'
        ? fileService.directUploadFile(file, options)
        : fileService.uploadFile(file, options),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: [FILE_QUERY_KEY, 'list'] });
    },
    // onError已由axios拦截器统一处理
  });
};

/**
 * 创建临时访问链接
 */
export const useCreateFileAccessLink = () => {
  return useMutation({
    mutationFn: ({ id, disposition }: { id: number; disposition?: FileAccessDisposition }) =>
      fileService.createFileAccessLink(id, disposition),
  });
};

/**
 * 下载文件
 */
export const useDownloadFile = () => {
  return useMutation({
    mutationFn: ({ id, filename }: { id: number; filename?: string }) =>
      fileService.downloadFile(id, filename),
    // onSuccess/onError已由axios拦截器和Service层统一处理
  });
};

/**
 * 获取文件预览 Blob
 */
export const usePreviewFile = () => {
  return useMutation({
    mutationFn: fileService.getFileBlob,
  });
};

/**
 * 删除文件
 */
export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fileService.deleteFile,
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: [FILE_QUERY_KEY, 'list'] });
    },
    // onError已由axios拦截器统一处理
  });
};
