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
  MoveMenuDto,
} from '../types/menu.types';

export const menuService = {
  /**
   * 获取菜单列表
   */
  getMenus: (params?: QueryMenuDto) => request.get<Menu[]>('/menus', { params }),

  /**
   * 获取菜单树
   */
  getMenuTree: () => request.get<MenuTreeNode[]>('/menus/tree'),

  /**
   * 获取当前用户菜单树（用于动态渲染）
   */
  getUserMenus: () => request.get<MenuTreeNode[]>('/menus/user-menus'),

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
   * 删除菜单
   */
  deleteMenu: (id: number) =>
    request.delete(`/menus/${id}`, {
      requestOptions: {
        confirmConfig: {
          message: '确定要删除该菜单吗？存在子菜单时请先移除或调整子菜单。',
          title: '删除菜单',
        },
        messageConfig: {
          successMessage: '删除菜单成功',
        },
      },
    }),

  /**
   * 移动菜单节点
   */
  moveMenu: (id: number, data: MoveMenuDto) =>
    request.patch<Menu>(`/menus/${id}/move`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '移动菜单成功',
        },
      },
    }),
};
