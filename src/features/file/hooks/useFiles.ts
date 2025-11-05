/**
 * 文件管理 Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryFileDto, UploadChunkDto } from '../types/file.types';
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
 * 获取文件详情
 */
export const useFile = (id: number) => {
  return useQuery({
    queryKey: [FILE_QUERY_KEY, 'detail', id],
    queryFn: () => fileService.getFileById(id),
    enabled: !!id,
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
    }) => fileService.uploadFile(file, options),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: [FILE_QUERY_KEY, 'list'] });
    },
    // onError已由axios拦截器统一处理
  });
};

/**
 * 上传文件分片
 */
export const useUploadChunk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UploadChunkDto) => fileService.uploadChunk(params),
    onSuccess: (data) => {
      // Service层已配置successMessage，不需要在这里显示
      if (data.completed) {
        queryClient.invalidateQueries({ queryKey: [FILE_QUERY_KEY, 'list'] });
      }
    },
    // onError已由axios拦截器统一处理
  });
};

/**
 * 查询分片上传进度
 */
export const useChunkProgress = (uploadId: string, enabled = true) => {
  return useQuery({
    queryKey: [FILE_QUERY_KEY, 'chunk-progress', uploadId],
    queryFn: () => fileService.getChunkProgress(uploadId),
    enabled: enabled && !!uploadId,
    refetchInterval: 2000, // 每2秒轮询一次
  });
};

/**
 * 获取文件签名URL
 */
export const useSignedUrl = (id: number, expiresIn?: number) => {
  return useQuery({
    queryKey: [FILE_QUERY_KEY, 'signed-url', id, expiresIn],
    queryFn: () => fileService.getSignedUrl(id, expiresIn),
    enabled: !!id,
    staleTime: 0, // 立即过期，每次都重新获取
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

/**
 * 批量删除文件
 */
export const useDeleteFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fileService.deleteFiles,
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: [FILE_QUERY_KEY, 'list'] });
    },
    // onError已由axios拦截器统一处理
  });
};
