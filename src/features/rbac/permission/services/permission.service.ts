/**
 * 权限管理Service
 */

import { request } from '@/shared/utils/request';
import type {
  Permission,
  PermissionTreeNode,
  PermissionListResponse,
  QueryPermissionDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../types/permission.types';

export const permissionService = {
  /**
   * 获取权限列表（分页）
   */
  getPermissions: (params: QueryPermissionDto) =>
    request.get<PermissionListResponse>('/permissions', { params }),

  /**
   * 获取权限树（按模块分组）
   */
  getPermissionTree: () =>
    request.get<PermissionTreeNode[]>('/permissions/tree'),

  /**
   * 获取权限详情
   */
  getPermission: (id: number) =>
    request.get<Permission>(`/permissions/${id}`),

  /**
   * 创建权限（手动创建 - 一般不需要,权限通过扫描自动生成）
   */
  createPermission: (data: CreatePermissionDto) =>
    request.post<Permission>('/permissions', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '创建权限成功',
        },
      },
    }),

  /**
   * 更新权限
   */
  updatePermission: (id: number, data: UpdatePermissionDto) =>
    request.put<Permission>(`/permissions/${id}`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '更新权限成功',
        },
      },
    }),

  /**
   * 删除权限
   */
  deletePermission: (id: number) =>
    request.delete(`/permissions/${id}`, {
      requestOptions: {
        confirmConfig: {
          message: '确定要删除该权限吗？',
          title: '删除权限',
        },
        messageConfig: {
          successMessage: '删除权限成功',
        },
      },
    }),

};
