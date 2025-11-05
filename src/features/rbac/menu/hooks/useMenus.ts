/**
 * 菜单管理Hooks
 *
 * 使用TanStack Query管理服务端状态
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '../services/menu.service';
import type {
  QueryMenuDto,
  CreateMenuDto,
  UpdateMenuDto,
} from '../types/menu.types';

/**
 * 获取菜单列表
 */
export function useMenus(params?: QueryMenuDto) {
  return useQuery({
    queryKey: ['menus', params],
    queryFn: () => menuService.getMenus(params),
    staleTime: 5 * 60 * 1000, // 5分钟内不会重新请求
  });
}

/**
 * 获取菜单树
 */
export function useMenuTree() {
  return useQuery({
    queryKey: ['menus', 'tree'],
    queryFn: () => menuService.getMenuTree(),
    staleTime: 5 * 60 * 1000, // 5分钟内不会重新请求
  });
}

/**
 * 获取当前用户菜单树
 *
 * @param options - 查询选项
 * @param options.enabled - 是否启用查询（默认true）
 */
export function useUserMenus(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['menus', 'user'],
    queryFn: () => menuService.getUserMenus(),
    staleTime: 5 * 60 * 1000, // 5分钟内不会重新请求
    enabled: options?.enabled ?? true, // 默认启用
  });
}

/**
 * 获取菜单详情
 */
export function useMenu(id: number) {
  return useQuery({
    queryKey: ['menus', id],
    queryFn: () => menuService.getMenu(id),
    enabled: !!id,
  });
}

/**
 * 创建菜单
 */
export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMenuDto) => menuService.createMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}

/**
 * 更新菜单
 */
export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMenuDto }) =>
      menuService.updateMenu(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menus', variables.id] });
    },
  });
}

/**
 * 删除菜单
 */
export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => menuService.deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}

/**
 * 验证路径唯一性
 */
export function useValidatePath(path: string, excludeId?: number) {
  return useQuery({
    queryKey: ['menus', 'validate-path', path, excludeId],
    queryFn: () => menuService.validatePath(path, excludeId),
    enabled: !!path,
  });
}

/**
 * 批量更新状态
 */
export function useBatchUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ menuIds, isActive }: { menuIds: number[]; isActive: boolean }) =>
      menuService.batchUpdateStatus(menuIds, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}

/**
 * 移动菜单节点
 */
export function useMoveMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, targetParentId }: { id: number; targetParentId: number | null }) =>
      menuService.moveMenu(id, targetParentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}
