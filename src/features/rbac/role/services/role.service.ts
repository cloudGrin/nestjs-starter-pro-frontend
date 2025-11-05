/**
 * 角色管理Service
 */

import { request } from '@/shared/utils/request';
import type {
  Role,
  RoleListResponse,
  QueryRoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  AssignMenusDto,
  EffectivePermissionsResponse,
} from '../types/role.types';

export const roleService = {
  /**
   * 获取角色列表（分页）
   */
  getRoles: (params: QueryRoleDto) =>
    request.get<RoleListResponse>('/roles', { params }),

  /**
   * 获取所有活跃角色（用于用户分配角色）
   */
  getActiveRoles: () => request.get<Role[]>('/roles/active'),

  /**
   * 获取角色详情
   */
  getRole: (id: number) => request.get<Role>(`/roles/${id}`),

  /**
   * 创建角色
   */
  createRole: (data: CreateRoleDto) =>
    request.post<Role>('/roles', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '创建角色成功',
        },
      },
    }),

  /**
   * 更新角色
   */
  updateRole: (id: number, data: UpdateRoleDto) =>
    request.put<Role>(`/roles/${id}`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '更新角色成功',
        },
      },
    }),

  /**
   * 删除角色
   */
  deleteRole: (id: number) =>
    request.delete(`/roles/${id}`, {
      requestOptions: {
        confirmConfig: {
          message: '确定要删除该角色吗？',
          title: '删除角色',
        },
        messageConfig: {
          successMessage: '删除角色成功',
        },
      },
    }),

  /**
   * 分配权限
   * 注意：后端期望的请求体是权限ID数组，不是对象
   */
  assignPermissions: (id: number, permissionIds: number[]) =>
    request.put(`/roles/${id}/permissions`, permissionIds, {
      requestOptions: {
        messageConfig: {
          successMessage: '分配权限成功',
        },
      },
    }),

  /**
   * 获取角色的有效权限
   */
  getEffectivePermissions: (id: number) =>
    request.get<EffectivePermissionsResponse>(`/roles/${id}/effective-permissions`),

  /**
   * 分配菜单
   */
  assignMenus: (id: number, data: AssignMenusDto) =>
    request.post(`/roles/${id}/menus`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '分配菜单成功',
        },
      },
    }),

  /**
   * 获取角色的菜单
   */
  getRoleMenus: (id: number) => request.get<any[]>(`/roles/${id}/menus`),

  /**
   * 移除菜单
   */
  revokeMenus: (id: number, menuIds: number[]) =>
    request.delete(`/roles/${id}/menus`, {
      data: { menuIds },
      requestOptions: {
        messageConfig: {
          successMessage: '移除菜单成功',
        },
      },
    }),
};
