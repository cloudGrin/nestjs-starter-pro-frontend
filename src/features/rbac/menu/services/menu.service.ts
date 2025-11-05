/**
 * 菜单管理Service
 */

import { request } from '@/shared/utils/request';
import type {
  Menu,
  MenuTreeNode,
  QueryMenuDto,
  CreateMenuDto,
  UpdateMenuDto,
  ValidatePathResponse,
} from '../types/menu.types';

export const menuService = {
  /**
   * 获取菜单列表
   */
  getMenus: (params?: QueryMenuDto) =>
    request.get<Menu[]>('/menus', { params }),

  /**
   * 获取菜单树
   */
  getMenuTree: () => request.get<MenuTreeNode[]>('/menus/tree'),

  /**
   * 获取当前用户菜单树（用于动态渲染）
   */
  getUserMenus: () => request.get<MenuTreeNode[]>('/menus/user-menus'),

  /**
   * 获取菜单详情
   */
  getMenu: (id: number) => request.get<Menu>(`/menus/${id}`),

  /**
   * 创建菜单
   */
  createMenu: (data: CreateMenuDto) =>
    request.post<Menu>('/menus', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '创建菜单成功',
        },
      },
    }),

  /**
   * 更新菜单
   */
  updateMenu: (id: number, data: UpdateMenuDto) =>
    request.put<Menu>(`/menus/${id}`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '更新菜单成功',
        },
      },
    }),

  /**
   * 删除菜单（级联删除子菜单）
   */
  deleteMenu: (id: number) =>
    request.delete(`/menus/${id}`, {
      requestOptions: {
        confirmConfig: {
          message: '确定要删除该菜单吗？如果有子菜单将一并删除！',
          title: '删除菜单',
        },
        messageConfig: {
          successMessage: '删除菜单成功',
        },
      },
    }),

  /**
   * 验证路径唯一性
   */
  validatePath: (path: string, excludeId?: number) =>
    request.get<ValidatePathResponse>('/menus/validate-path', {
      params: { path, excludeId },
    }),

  /**
   * 批量启用/禁用菜单
   */
  batchUpdateStatus: (menuIds: number[], isActive: boolean) =>
    request.patch('/menus/batch-status', { menuIds, isActive }, {
      requestOptions: {
        messageConfig: {
          successMessage: `批量${isActive ? '启用' : '禁用'}菜单成功`,
        },
      },
    }),

  /**
   * 移动菜单节点
   */
  moveMenu: (id: number, targetParentId: number | null) =>
    request.patch<Menu>(`/menus/${id}/move`, { targetParentId }, {
      requestOptions: {
        messageConfig: {
          successMessage: '移动菜单成功',
        },
      },
    }),
};
