/**
 * 权限管理Hooks
 *
 * 使用TanStack Query管理服务端状态
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionService } from '../services/permission.service';
import type {
  QueryPermissionDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../types/permission.types';

/**
 * 获取权限列表（分页）
 */
export function usePermissions(params: QueryPermissionDto) {
  return useQuery({
    queryKey: ['permissions', params],
    queryFn: () => permissionService.getPermissions(params),
    staleTime: 5 * 60 * 1000, // 5分钟内不会重新请求
  });
}

/**
 * 获取权限树（按模块分组）
 */
export function usePermissionTree() {
  return useQuery({
    queryKey: ['permissions', 'tree'],
    queryFn: () => permissionService.getPermissionTree(),
    staleTime: 5 * 60 * 1000, // 5分钟内不会重新请求
  });
}

/**
 * 创建权限（手动创建 - 一般不需要,权限通过扫描自动生成）
 */
export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePermissionDto) => permissionService.createPermission(data),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
    // onError已由axios拦截器统一处理
  });
}

/**
 * 更新权限
 */
export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePermissionDto }) =>
      permissionService.updatePermission(id, data),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
    // onError已由axios拦截器统一处理
  });
}

/**
 * 删除权限
 */
export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => permissionService.deletePermission(id),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
    // onError已由axios拦截器统一处理
  });
}
