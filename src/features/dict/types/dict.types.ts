import type { PaginationParams, PaginatedResponse } from '@/shared/types/common.types';

/**
 * 字典来源
 */
export type DictSource = 'platform' | 'custom';

/**
 * 字典项状态
 */
export type DictItemStatus = 'enabled' | 'disabled';

/**
 * 字典类型
 */
export interface DictType {
  id: number;
  code: string;
  name: string;
  description?: string;
  source: DictSource;
  isEnabled: boolean;
  sort: number;
  config?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 字典项
 */
export interface DictItem {
  id: number;
  dictTypeId: number;
  dictType?: DictType;
  label: string;
  labelEn?: string;
  value: string;
  color?: string;
  icon?: string;
  description?: string;
  status: DictItemStatus;
  isDefault: boolean;
  sort: number;
  extra?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建字典类型DTO
 */
export interface CreateDictTypeDto {
  code: string;
  name: string;
  description?: string;
  source?: DictSource;
  isEnabled?: boolean;
  sort?: number;
  config?: Record<string, unknown>;
}

/**
 * 更新字典类型DTO
 */
export type UpdateDictTypeDto = Partial<CreateDictTypeDto>;

/**
 * 查询字典类型DTO
 */
export interface QueryDictTypeDto extends PaginationParams {
  code?: string;
  name?: string;
  source?: DictSource;
  isEnabled?: boolean;
}

/**
 * 字典类型列表响应
 */
export type DictTypeListResponse = PaginatedResponse<DictType>;

/**
 * 创建字典项DTO
 */
export interface CreateDictItemDto {
  dictTypeId: number;
  label: string;
  labelEn?: string;
  value: string;
  color?: string;
  icon?: string;
  description?: string;
  status?: DictItemStatus;
  isDefault?: boolean;
  sort?: number;
  extra?: Record<string, unknown>;
}

/**
 * 更新字典项DTO
 */
export type UpdateDictItemDto = Partial<CreateDictItemDto>;

/**
 * 查询字典项DTO
 */
export interface QueryDictItemDto extends PaginationParams {
  dictTypeId?: number;
  dictTypeCode?: string;
  label?: string;
  value?: string;
  status?: DictItemStatus;
}

/**
 * 字典项列表响应
 */
export type DictItemListResponse = PaginatedResponse<DictItem>;

/**
 * 批量创建字典项DTO
 */
export interface BatchCreateDictItemDto {
  dictTypeId: number;
  items: Omit<CreateDictItemDto, 'dictTypeId'>[];
}
