import type { PaginationParams, PaginatedResponse } from '@/shared/types/common.types';

/**
 * 配置类型
 */
export type ConfigType = 'text' | 'number' | 'boolean' | 'json' | 'array';

/**
 * 配置分组
 */
export type ConfigGroup = 'system' | 'business' | 'security' | 'third_party' | 'other';

/**
 * 系统配置
 */
export interface SystemConfig {
  id: number;
  configKey: string;
  configName: string;
  configValue: string;
  configType: ConfigType;
  configGroup: ConfigGroup;
  description?: string;
  defaultValue?: string;
  isSystem: boolean;
  isEnabled: boolean;
  sort: number;
  extra?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建系统配置DTO
 */
export interface CreateSystemConfigDto {
  configKey: string;
  configName: string;
  configValue?: string;
  configType?: ConfigType;
  configGroup?: ConfigGroup;
  description?: string;
  defaultValue?: string;
  isEnabled?: boolean;
  sort?: number;
  extra?: Record<string, unknown>;
}

/**
 * 更新系统配置DTO
 */
export type UpdateSystemConfigDto = Partial<CreateSystemConfigDto>;

/**
 * 查询系统配置DTO
 */
export interface QuerySystemConfigDto extends PaginationParams {
  configKey?: string;
  configName?: string;
  configType?: ConfigType;
  configGroup?: ConfigGroup;
  isEnabled?: boolean;
}

/**
 * 系统配置列表响应
 */
export type SystemConfigListResponse = PaginatedResponse<SystemConfig>;

/**
 * 更新配置值DTO
 */
export interface UpdateConfigValueDto {
  configValue: string;
}

/**
 * 批量更新配置DTO
 */
export interface BatchUpdateConfigDto {
  configs: Record<string, string>;
}

/**
 * 配置映射响应（键值对）
 */
export type ConfigMapResponse = Record<string, string>;
