/**
 * API应用管理 Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiAuthService } from '../services/api-auth.service';
import type {
  CreateApiAppDto,
  UpdateApiAppDto,
  CreateApiKeyDto,
  QueryApiAppDto,
  QueryStatisticsDto,
} from '../types/api-auth.types';

/**
 * 获取API应用列表
 */
export function useApiApps(params: QueryApiAppDto) {
  return useQuery({
    queryKey: ['api-apps', params],
    queryFn: () => apiAuthService.getApiApps(params),
    staleTime: 5 * 60 * 1000, // 5分钟内不会重新请求
  });
}

/**
 * 获取API应用详情
 */
export function useApiApp(appId: string) {
  return useQuery({
    queryKey: ['api-apps', appId],
    queryFn: () => apiAuthService.getApiApp(appId),
    enabled: !!appId,
  });
}

/**
 * 创建API应用
 */
export function useCreateApiApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApiAppDto) => apiAuthService.createApiApp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-apps'] });
    },
  });
}

/**
 * 更新API应用
 */
export function useUpdateApiApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, data }: { appId: string; data: UpdateApiAppDto }) =>
      apiAuthService.updateApiApp(appId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['api-apps'] });
      queryClient.invalidateQueries({ queryKey: ['api-apps', variables.appId] });
    },
  });
}

/**
 * 删除API应用
 */
export function useDeleteApiApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: string) => apiAuthService.deleteApiApp(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-apps'] });
    },
  });
}

/**
 * 获取应用的密钥列表
 */
export function useApiKeys(appId: string) {
  return useQuery({
    queryKey: ['api-keys', appId],
    queryFn: () => apiAuthService.getApiKeys(appId),
    enabled: !!appId,
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}

/**
 * 生成API密钥
 */
export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, data }: { appId: string; data: CreateApiKeyDto }) =>
      apiAuthService.createApiKey(appId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', variables.appId] });
    },
  });
}

/**
 * 撤销API密钥
 */
export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: number) => apiAuthService.revokeApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

/**
 * 获取API使用统计
 */
export function useApiStatistics(appId: string, params: QueryStatisticsDto) {
  return useQuery({
    queryKey: ['api-statistics', appId, params],
    queryFn: () => apiAuthService.getStatistics(appId, params),
    enabled: !!appId,
    staleTime: 1 * 60 * 1000, // 1分钟
  });
}
