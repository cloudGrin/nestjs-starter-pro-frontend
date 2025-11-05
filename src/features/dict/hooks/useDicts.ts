import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dictTypeService, dictItemService } from '../services/dict.service';
import type {
  QueryDictTypeDto,
  CreateDictTypeDto,
  UpdateDictTypeDto,
  QueryDictItemDto,
  CreateDictItemDto,
  UpdateDictItemDto,
  BatchCreateDictItemDto,
} from '../types/dict.types';

// ==================== 字典类型 Hooks ====================

/**
 * 获取字典类型列表
 */
export function useDictTypes(params: QueryDictTypeDto) {
  return useQuery({
    queryKey: ['dict-types', params],
    queryFn: () => dictTypeService.getTypes(params),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

/**
 * 获取所有启用的字典类型
 */
export function useEnabledDictTypes() {
  return useQuery({
    queryKey: ['dict-types', 'enabled'],
    queryFn: () => dictTypeService.getEnabledTypes(),
    staleTime: 10 * 60 * 1000, // 10分钟
  });
}

/**
 * 根据编码获取字典类型
 */
export function useDictTypeByCode(code: string) {
  return useQuery({
    queryKey: ['dict-types', 'code', code],
    queryFn: () => dictTypeService.getTypeByCode(code),
    enabled: !!code,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 获取字典类型详情
 */
export function useDictType(id: number) {
  return useQuery({
    queryKey: ['dict-types', id],
    queryFn: () => dictTypeService.getType(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 创建字典类型
 */
export function useCreateDictType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDictTypeDto) => dictTypeService.createType(data),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['dict-types'] });
    },
    // onError已由axios拦截器统一处理
  });
}

/**
 * 更新字典类型
 */
export function useUpdateDictType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDictTypeDto }) =>
      dictTypeService.updateType(id, data),
    onSuccess: (_, variables) => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['dict-types'] });
      queryClient.invalidateQueries({ queryKey: ['dict-types', variables.id] });
    },
    // onError已由axios拦截器统一处理
  });
}

/**
 * 切换字典类型启用状态
 */
export function useToggleDictType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dictTypeService.toggleTypeEnabled(id),
    onSuccess: (_, id) => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['dict-types'] });
      queryClient.invalidateQueries({ queryKey: ['dict-types', id] });
    },
    // onError已由axios拦截器统一处理
  });
}

/**
 * 删除字典类型
 */
export function useDeleteDictType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dictTypeService.deleteType(id),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['dict-types'] });
    },
    // onError已由axios拦截器统一处理
  });
}

// ==================== 字典项 Hooks ====================

/**
 * 获取字典项列表
 */
export function useDictItems(params: QueryDictItemDto) {
  return useQuery({
    queryKey: ['dict-items', params],
    queryFn: () => dictItemService.getItems(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 根据字典类型ID获取启用的字典项
 */
export function useEnabledDictItemsByTypeId(typeId: number) {
  return useQuery({
    queryKey: ['dict-items', 'type', typeId, 'enabled'],
    queryFn: () => dictItemService.getEnabledItemsByTypeId(typeId),
    enabled: !!typeId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 根据字典类型编码获取启用的字典项
 */
export function useEnabledDictItemsByTypeCode(typeCode: string) {
  return useQuery({
    queryKey: ['dict-items', 'type-code', typeCode, 'enabled'],
    queryFn: () => dictItemService.getEnabledItemsByTypeCode(typeCode),
    enabled: !!typeCode,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 获取字典类型的默认值
 */
export function useDefaultDictItem(typeId: number) {
  return useQuery({
    queryKey: ['dict-items', 'type', typeId, 'default'],
    queryFn: () => dictItemService.getDefaultItem(typeId),
    enabled: !!typeId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 获取字典项详情
 */
export function useDictItem(id: number) {
  return useQuery({
    queryKey: ['dict-items', id],
    queryFn: () => dictItemService.getItem(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 创建字典项
 */
export function useCreateDictItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDictItemDto) => dictItemService.createItem(data),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['dict-items'] });
    },
    // onError已由axios拦截器统一处理
  });
}

/**
 * 批量创建字典项
 */
export function useBatchCreateDictItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BatchCreateDictItemDto) => dictItemService.batchCreateItems(data),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['dict-items'] });
    },
    // onError已由axios拦截器统一处理
  });
}

/**
 * 更新字典项
 */
export function useUpdateDictItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDictItemDto }) =>
      dictItemService.updateItem(id, data),
    onSuccess: (_, variables) => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['dict-items'] });
      queryClient.invalidateQueries({ queryKey: ['dict-items', variables.id] });
    },
    // onError已由axios拦截器统一处理
  });
}

/**
 * 切换字典项启用状态
 */
export function useToggleDictItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dictItemService.toggleItemStatus(id),
    onSuccess: (_, id) => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['dict-items'] });
      queryClient.invalidateQueries({ queryKey: ['dict-items', id] });
    },
    // onError已由axios拦截器统一处理
  });
}

/**
 * 删除字典项
 */
export function useDeleteDictItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dictItemService.deleteItem(id),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['dict-items'] });
    },
    // onError已由axios拦截器统一处理
  });
}
