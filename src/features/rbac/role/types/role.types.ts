/**
 * 角色管理模块类型定义
 */

import type { Permission } from '../../permission/types/permission.types';

/**
 * 角色实体
 */
export interface Role {
  id: number;
  code: string;
  name: string;
  description?: string;
  isSystem: boolean; // 是否系统角色（系统角色不可删除）
  isActive: boolean;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 角色详情（包含关联数据）
 */
export interface RoleWithRelations extends Role {
  permissions?: Permission[];
  menus?: any[]; // 后续菜单模块完成后改为Menu[]
}

/**
 * 查询角色DTO
 */
export interface QueryRoleDto {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  name?: string; // 按角色名称搜索
  code?: string; // 按角色代码搜索
  isActive?: boolean; // 按状态筛选
}

/**
 * 角色列表响应
 */
export interface RoleListResponse {
  items: Role[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 创建角色DTO
 */
export interface CreateRoleDto {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: number[];
}

/**
 * 更新角色DTO
 */
export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  sort?: number;
}

/**
 * 分配权限DTO
 */
export interface AssignPermissionsDto {
  permissionIds: number[];
}

/**
 * 分配菜单DTO
 */
export interface AssignMenusDto {
  menuIds: number[];
}

/**
 * 角色有效权限响应
 */
export interface EffectivePermissionsResponse {
  roleId: number;
  permissions: string[]; // 权限代码数组，如 ['user:create', 'user:read']
  count: number;
}
