import { request } from '@/shared/utils/request';
import type {
  SystemConfig,
  CreateSystemConfigDto,
  UpdateSystemConfigDto,
  QuerySystemConfigDto,
  SystemConfigListResponse,
  UpdateConfigValueDto,
  BatchUpdateConfigDto,
  ConfigMapResponse,
} from '../types/config.types';

/**
 * 系统配置Service
 */
export const configService = {
  /**
   * 获取配置列表（分页）
   */
  getConfigs: (params: QuerySystemConfigDto) =>
    request.get<SystemConfigListResponse>('/system-configs', { params }),

  /**
   * 获取所有启用的配置
   */
  getEnabledConfigs: () => request.get<SystemConfig[]>('/system-configs/enabled'),

  /**
   * 获取配置映射（键值对）
   * @param keys 可选，指定键名数组（逗号分隔字符串）
   */
  getConfigMap: (keys?: string) =>
    request.get<ConfigMapResponse>('/system-configs/map', { params: { keys } }),

  /**
   * 根据键名获取配置
   */
  getConfigByKey: (key: string) => request.get<SystemConfig>(`/system-configs/key/${key}`),

  /**
   * 获取配置值
   */
  getConfigValue: (key: string) =>
    request.get<{ key: string; value: string }>(`/system-configs/value/${key}`),

  /**
   * 获取配置详情
   */
  getConfig: (id: number) => request.get<SystemConfig>(`/system-configs/${id}`),

  /**
   * 创建配置项
   */
  createConfig: (data: CreateSystemConfigDto) =>
    request.post<SystemConfig>('/system-configs', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '创建配置项成功',
        },
      },
    }),

  /**
   * 更新配置项
   */
  updateConfig: (id: number, data: UpdateSystemConfigDto) =>
    request.put<SystemConfig>(`/system-configs/${id}`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '更新配置项成功',
        },
      },
    }),

  /**
   * 切换启用状态
   */
  toggleConfigEnabled: (id: number) =>
    request.put<SystemConfig>(`/system-configs/${id}/toggle`, undefined, {
      requestOptions: {
        messageConfig: {
          successMessage: '切换状态成功',
        },
      },
    }),

  /**
   * 设置配置值
   */
  setConfigValue: (key: string, data: UpdateConfigValueDto) =>
    request.put<SystemConfig>(`/system-configs/key/${key}/value`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '设置配置值成功',
        },
      },
    }),

  /**
   * 批量更新配置值
   */
  batchUpdateConfigs: (data: BatchUpdateConfigDto) =>
    request.post<{ message: string }>('/system-configs/batch', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '批量更新配置成功',
        },
      },
    }),

  /**
   * 删除配置项
   */
  deleteConfig: (id: number) =>
    request.delete(`/system-configs/${id}`, {
      requestOptions: {
        confirmConfig: {
          message: '确定要删除这个配置项吗？',
          title: '删除配置项',
        },
        messageConfig: {
          successMessage: '删除配置项成功',
        },
      },
    }),
};
