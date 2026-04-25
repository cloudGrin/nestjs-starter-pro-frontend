/**
 * 角色管理Hooks
 *
 * 使用TanStack Query管理服务端状态
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/role.service';
import type {
  QueryRoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  AssignMenusDto,
} from '../types/role.types';

/**
 * 获取角色列表（分页）
 */
export function useRoles(params: QueryRoleDto) {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => roleService.getRoles(params),
    staleTime: 5 * 60 * 1000, // 5分钟内不会重新请求
  });
}

/**
 * 获取所有活跃角色
 */
export function useActiveRoles() {
  return useQuery({
    queryKey: ['roles', 'active'],
    queryFn: () => roleService.getActiveRoles(),
    staleTime: 10 * 60 * 1000, // 10分钟内不会重新请求
  });
}

/**
 * 获取角色详情
 */
export function useRole(id: number) {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => roleService.getRole(id),
    enabled: !!id,
  });
}

/**
 * 创建角色
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleDto) => roleService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

/**
 * 更新角色
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleDto }) =>
      roleService.updateRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] });
    },
  });
}

/**
 * 删除角色
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

/**
 * 分配权限
 */
export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, permissionIds }: { id: number; permissionIds: number[] }) =>
      roleService.assignPermissions(id, permissionIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id, 'permissions'] });
    },
  });
}

/**
 * 分配菜单
 */
export function useAssignMenus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssignMenusDto }) =>
      roleService.assignMenus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id, 'menus'] });
    },
  });
}

/**
 * 获取角色的菜单
 */
export function useRoleMenus(id: number) {
  return useQuery({
    queryKey: ['roles', id, 'menus'],
    queryFn: () => roleService.getRoleMenus(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
