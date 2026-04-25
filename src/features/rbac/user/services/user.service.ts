/**
 * 用户管理Service
 */

import { request } from '@/shared/utils/request';
import type { User } from '@/shared/types/user.types';
import type {
  CreateUserDto,
  UpdateUserDto,
  QueryUserDto,
  UserListResponse,
  AssignRolesDto,
} from '../types/user.types';

export const userService = {
  /**
   * 获取用户列表（分页）
   */
  getUsers: (params: QueryUserDto) =>
    request.get<UserListResponse>('/users', { params }),

  /**
   * 获取用户详情
   */
  getUser: (id: number) => request.get<User>(`/users/${id}`),

  /**
   * 创建用户
   */
  createUser: (data: CreateUserDto) =>
    request.post<User>('/users', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '创建用户成功',
        },
      },
    }),

  /**
   * 更新用户
   */
  updateUser: (id: number, data: UpdateUserDto) =>
    request.put<User>(`/users/${id}`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '更新用户成功',
        },
      },
    }),

  /**
   * 删除用户（软删除）
   */
  deleteUser: (id: number) =>
    request.delete(`/users/${id}`, {
      requestOptions: {
        confirmConfig: {
          message: '确定要删除该用户吗？删除后可以从回收站恢复。',
          title: '删除用户',
        },
        messageConfig: {
          successMessage: '删除用户成功',
        },
      },
    }),

  /**
   * 批量删除用户
   */
  batchDeleteUsers: (ids: number[]) =>
    request.delete('/users/batch', {
      data: { ids },
      requestOptions: {
        confirmConfig: {
          message: `确定要删除选中的 ${ids.length} 个用户吗？删除后可以从回收站恢复。`,
          title: '批量删除用户',
        },
        messageConfig: {
          successMessage: `成功删除 ${ids.length} 个用户`,
        },
      },
    }),

  /**
   * 分配角色
   */
  assignRoles: (id: number, data: AssignRolesDto) =>
    request.put<User>(`/users/${id}/roles`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '分配角色成功',
        },
      },
    }),

  /**
   * 获取用户权限列表
   */
  getUserPermissions: (id: number) =>
    request.get<{ permissions: string[] }>(`/users/${id}/permissions`),

  /**
   * 启用/禁用用户
   */
  toggleUserStatus: (id: number, enabled: boolean) =>
    request.put(`/users/${id}/${enabled ? 'enable' : 'disable'}`, undefined, {
      requestOptions: {
        messageConfig: {
          successMessage: enabled ? '用户已启用' : '用户已禁用',
        },
      },
    }),
};
