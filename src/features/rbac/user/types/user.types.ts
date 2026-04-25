/**
 * 用户管理模块类型定义
 */

import type { User, UserStatus } from '@/shared/types/user.types';

/**
 * 创建用户DTO
 */
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  realName?: string;
  nickname?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthday?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  status?: UserStatus;
  roleIds?: number[]; // 角色ID列表
}

/**
 * 更新用户DTO
 */
export interface UpdateUserDto {
  email?: string;
  realName?: string;
  nickname?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthday?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  status?: UserStatus;
  roleIds?: number[];
}

/**
 * 查询用户DTO（与后端PaginationDto保持一致）
 */
export interface QueryUserDto {
  page?: number; // 页码，默认1
  limit?: number; // 每页数量，默认10（后端使用limit而非pageSize）
  sort?: string; // 排序字段
  order?: 'ASC' | 'DESC'; // 排序方向
  username?: string; // 用户名模糊查询
  email?: string; // 邮箱模糊查询
  phone?: string; // 手机号模糊查询
  realName?: string; // 真实姓名模糊查询
  status?: UserStatus; // 状态筛选
  gender?: 'male' | 'female' | 'unknown'; // 性别筛选
  roleId?: number; // 按角色筛选
}

/**
 * 用户列表响应
 */
export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 分配角色DTO
 */
export interface AssignRolesDto {
  roleIds: number[];
}
