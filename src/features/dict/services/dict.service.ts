import { request } from '@/shared/utils/request';
import type {
  DictType,
  DictItem,
  CreateDictTypeDto,
  UpdateDictTypeDto,
  QueryDictTypeDto,
  DictTypeListResponse,
  CreateDictItemDto,
  UpdateDictItemDto,
  QueryDictItemDto,
  DictItemListResponse,
  BatchCreateDictItemDto,
} from '../types/dict.types';

/**
 * 字典类型Service
 */
export const dictTypeService = {
  /**
   * 获取字典类型列表（分页）
   */
  getTypes: (params: QueryDictTypeDto) =>
    request.get<DictTypeListResponse>('/dict-types', { params }),

  /**
   * 获取所有启用的字典类型
   */
  getEnabledTypes: () => request.get<DictType[]>('/dict-types/enabled'),

  /**
   * 根据编码获取字典类型
   */
  getTypeByCode: (code: string) => request.get<DictType>(`/dict-types/code/${code}`),

  /**
   * 获取字典类型详情
   */
  getType: (id: number) => request.get<DictType>(`/dict-types/${id}`),

  /**
   * 创建字典类型
   */
  createType: (data: CreateDictTypeDto) =>
    request.post<DictType>('/dict-types', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '创建字典类型成功',
        },
      },
    }),

  /**
   * 更新字典类型
   */
  updateType: (id: number, data: UpdateDictTypeDto) =>
    request.put<DictType>(`/dict-types/${id}`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '更新字典类型成功',
        },
      },
    }),

  /**
   * 切换启用状态
   */
  toggleTypeEnabled: (id: number) =>
    request.put<DictType>(`/dict-types/${id}/toggle`, undefined, {
      requestOptions: {
        messageConfig: {
          successMessage: '切换状态成功',
        },
      },
    }),

  /**
   * 删除字典类型
   */
  deleteType: (id: number) =>
    request.delete(`/dict-types/${id}`, {
      requestOptions: {
        confirmConfig: {
          message: '删除字典类型会同时删除其下的所有字典项，确定要删除吗？',
          title: '删除字典类型',
        },
        messageConfig: {
          successMessage: '删除字典类型成功',
        },
      },
    }),
};

/**
 * 字典项Service
 */
export const dictItemService = {
  /**
   * 获取字典项列表（分页）
   */
  getItems: (params: QueryDictItemDto) =>
    request.get<DictItemListResponse>('/dict-items', { params }),

  /**
   * 根据字典类型ID获取启用的字典项
   */
  getEnabledItemsByTypeId: (typeId: number) =>
    request.get<DictItem[]>(`/dict-items/type/${typeId}/enabled`),

  /**
   * 根据字典类型编码获取启用的字典项
   */
  getEnabledItemsByTypeCode: (typeCode: string) =>
    request.get<DictItem[]>(`/dict-items/type/code/${typeCode}/enabled`),

  /**
   * 获取字典类型的默认值
   */
  getDefaultItem: (typeId: number) => request.get<DictItem>(`/dict-items/type/${typeId}/default`),

  /**
   * 根据字典类型编码和值获取字典项
   */
  getItemByTypeCodeAndValue: (typeCode: string, value: string) =>
    request.get<DictItem>(`/dict-items/type/code/${typeCode}/value/${value}`),

  /**
   * 获取字典项详情
   */
  getItem: (id: number) => request.get<DictItem>(`/dict-items/${id}`),

  /**
   * 创建字典项
   */
  createItem: (data: CreateDictItemDto) =>
    request.post<DictItem>('/dict-items', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '创建字典项成功',
        },
      },
    }),

  /**
   * 批量创建字典项
   */
  batchCreateItems: (data: BatchCreateDictItemDto) =>
    request.post<DictItem[]>('/dict-items/batch', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '批量创建字典项成功',
        },
      },
    }),

  /**
   * 更新字典项
   */
  updateItem: (id: number, data: UpdateDictItemDto) =>
    request.put<DictItem>(`/dict-items/${id}`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '更新字典项成功',
        },
      },
    }),

  /**
   * 切换启用状态
   */
  toggleItemStatus: (id: number) =>
    request.put<DictItem>(`/dict-items/${id}/toggle-status`, undefined, {
      requestOptions: {
        messageConfig: {
          successMessage: '切换状态成功',
        },
      },
    }),

  /**
   * 删除字典项
   */
  deleteItem: (id: number) =>
    request.delete(`/dict-items/${id}`, {
      requestOptions: {
        confirmConfig: {
          message: '确定要删除这个字典项吗？',
          title: '删除字典项',
        },
        messageConfig: {
          successMessage: '删除字典项成功',
        },
      },
    }),
};
