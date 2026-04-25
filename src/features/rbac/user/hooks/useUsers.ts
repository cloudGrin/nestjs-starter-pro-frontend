/**
 * 用户管理Hooks
 *
 * 使用TanStack Query管理服务端状态
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type {
  CreateUserDto,
  UpdateUserDto,
  QueryUserDto,
  AssignRolesDto,
} from '../types/user.types';

/**
 * 获取用户列表
 */
export function useUsers(params: QueryUserDto) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5分钟内不会重新请求
  });
}

/**
 * 创建用户
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => userService.createUser(data),
    onSuccess: () => {
      // 创建成功后，失效用户列表缓存
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // ⚠️ 不需要手动显示提示，Service 中已配置
    },
    // ⚠️ 不需要 onError，axios 拦截器已统一处理
  });
}

/**
 * 更新用户
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      // 更新成功后，失效相关缓存
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // ⚠️ 不需要手动显示提示，Service 中已配置
    },
    // ⚠️ 不需要 onError，axios 拦截器已统一处理
  });
}

/**
 * 删除用户
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // ⚠️ 不需要再手动显示成功提示，已在 Service 中配置
    },
    // ⚠️ 不需要 onError，axios 拦截器已统一处理错误
  });
}

/**
 * 分配角色
 */
export function useAssignRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssignRolesDto }) =>
      userService.assignRoles(id, data),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    // onError已由axios拦截器统一处理
  });
}
