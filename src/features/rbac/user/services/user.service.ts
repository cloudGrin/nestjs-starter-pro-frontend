/**
 * 用户管理Service
 */

import { request } from '@/shared/utils/request';
import type { User } from '@/shared/types/user.types';
import type {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserNotificationSettingsDto,
  QueryUserDto,
  UserNotificationSettings,
  UserListResponse,
  AssignRolesDto,
} from '../types/user.types';

interface MutationRequestOptions {
  silent?: boolean;
}

export const userService = {
  /**
   * 获取用户列表（分页）
   */
  getUsers: (params: QueryUserDto) => request.get<UserListResponse>('/users', { params }),

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
  updateUser: (id: number, data: UpdateUserDto, options?: MutationRequestOptions) =>
    options?.silent
      ? request.put<User>(`/users/${id}`, data)
      : request.put<User>(`/users/${id}`, data, {
          requestOptions: {
            messageConfig: {
              successMessage: '更新用户成功',
            },
          },
        }),

  getNotificationSettings: (id: number) =>
    request.get<UserNotificationSettings>(`/users/${id}/notification-settings`),

  updateNotificationSettings: (
    id: number,
    data: UpdateUserNotificationSettingsDto,
    options?: MutationRequestOptions
  ) =>
    options?.silent
      ? request.put<UserNotificationSettings>(`/users/${id}/notification-settings`, data)
      : request.put<UserNotificationSettings>(`/users/${id}/notification-settings`, data, {
          requestOptions: {
            messageConfig: {
              successMessage: '更新通知绑定成功',
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
};
