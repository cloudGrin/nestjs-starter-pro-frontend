import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configService } from '../services/config.service';
import type {
  QuerySystemConfigDto,
  CreateSystemConfigDto,
  UpdateSystemConfigDto,
  UpdateConfigValueDto,
  BatchUpdateConfigDto,
} from '../types/config.types';

// ==================== 系统配置 Hooks ====================

/**
 * 获取配置列表（分页）
 */
export function useConfigs(params: QuerySystemConfigDto) {
  return useQuery({
    queryKey: ['system-configs', params],
    queryFn: () => configService.getConfigs(params),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

/**
 * 获取所有启用的配置
 */
export function useEnabledConfigs() {
  return useQuery({
    queryKey: ['system-configs', 'enabled'],
    queryFn: () => configService.getEnabledConfigs(),
    staleTime: 10 * 60 * 1000, // 10分钟
  });
}

/**
 * 获取配置映射（键值对）
 */
export function useConfigMap(keys?: string) {
  return useQuery({
    queryKey: ['system-configs', 'map', keys],
    queryFn: () => configService.getConfigMap(keys),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 根据键名获取配置
 */
export function useConfigByKey(key: string) {
  return useQuery({
    queryKey: ['system-configs', 'key', key],
    queryFn: () => configService.getConfigByKey(key),
    enabled: !!key,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 获取配置值
 */
export function useConfigValue(key: string) {
  return useQuery({
    queryKey: ['system-configs', 'value', key],
    queryFn: () => configService.getConfigValue(key),
    enabled: !!key,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 获取配置详情
 */
export function useConfig(id: number) {
  return useQuery({
    queryKey: ['system-configs', id],
    queryFn: () => configService.getConfig(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 创建配置项
 */
export function useCreateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSystemConfigDto) => configService.createConfig(data),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['system-configs'] });
    },
    // onError已由axios拦截器统一处理
  });
}

/**
 * 更新配置项
 */
export function useUpdateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSystemConfigDto }) =>
      configService.updateConfig(id, data),
    onSuccess: (_, variables) => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['system-configs'] });
      queryClient.invalidateQueries({ queryKey: ['system-configs', variables.id] });
    },
    // onError已由axios拦截器统一处理
  });
}

/**
 * 切换配置启用状态
 */
export function useToggleConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => configService.toggleConfigEnabled(id),
    onSuccess: (_, id) => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['system-configs'] });
      queryClient.invalidateQueries({ queryKey: ['system-configs', id] });
    },
    // onError已由axios拦截器统一处理
  });
}

/**
 * 设置配置值
 */
export function useSetConfigValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateConfigValueDto }) =>
      configService.setConfigValue(key, data),
    onSuccess: (_, variables) => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['system-configs'] });
      queryClient.invalidateQueries({ queryKey: ['system-configs', 'key', variables.key] });
      queryClient.invalidateQueries({ queryKey: ['system-configs', 'value', variables.key] });
    },
    // onError已由axios拦截器统一处理
  });
}

/**
 * 批量更新配置值
 */
export function useBatchUpdateConfigs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BatchUpdateConfigDto) => configService.batchUpdateConfigs(data),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['system-configs'] });
    },
    // onError已由axios拦截器统一处理
  });
}

/**
 * 删除配置项
 */
export function useDeleteConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => configService.deleteConfig(id),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['system-configs'] });
    },
    // onError已由axios拦截器统一处理
  });
}
