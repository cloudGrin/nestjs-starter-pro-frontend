/**
 * 角色管理Hooks
 *
 * 使用TanStack Query管理服务端状态
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/role.service';
import { authService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { usePermission } from '@/shared/hooks';
import type {
  QueryRoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  AssignRoleAccessDto,
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
 * 获取角色统一授权
 */
export function useRoleAccess(id: number) {
  return useQuery({
    queryKey: ['roles', id, 'access'],
    queryFn: () => roleService.getRoleAccess(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 保存角色授权。
 * 新权限走统一接口；旧菜单/权限分配权限只保存各自有权修改的部分。
 */
export function useSaveRoleAccess() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AssignRoleAccessDto }) => {
      if (hasPermission(['role:access:assign'])) {
        return roleService.assignAccess(id, data);
      }

      const operations: Array<Promise<unknown>> = [];
      if (hasPermission(['role:menu:assign'])) {
        operations.push(roleService.assignMenus(id, { menuIds: data.menuIds }));
      }

      if (hasPermission(['role:permission:assign'])) {
        operations.push(roleService.assignPermissions(id, data.permissionIds));
      }

      if (operations.length === 0) {
        throw new Error('缺少角色授权权限');
      }

      const results = await Promise.all(operations);
      return results[results.length - 1];
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id, 'access'] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id, 'permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id, 'menus'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'user'] });

      const currentUser = useAuthStore.getState().user;
      const affectsCurrentUser = currentUser?.roles?.some((role) => role.id === variables.id);
      if (!affectsCurrentUser) {
        return;
      }

      try {
        const profile = await authService.getProfile();
        useAuthStore.getState().setUser(profile);
        queryClient.setQueryData(['profile'], profile);
      } catch {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    },
  });
}
