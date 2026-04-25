/**
 * 角色管理Service
 */

import { request } from '@/shared/utils/request';
import type {
  Role,
  RoleWithRelations,
  RoleListResponse,
  QueryRoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
  AssignMenusDto,
} from '../types/role.types';
import type { Menu } from '../../menu/types/menu.types';

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
  getRole: (id: number) => request.get<RoleWithRelations>(`/roles/${id}`),

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
   */
  assignPermissions: (id: number, permissionIds: number[]) =>
    request.put(`/roles/${id}/permissions`, { permissionIds } satisfies AssignPermissionsDto, {
      requestOptions: {
        messageConfig: {
          successMessage: '分配权限成功',
        },
      },
    }),

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
  getRoleMenus: (id: number) => request.get<Menu[]>(`/roles/${id}/menus`),

};
