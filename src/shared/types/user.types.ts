/**
 * 用户相关类型定义
 */

/**
 * 权限
 */
export interface Permission {
  id: number;
  code: string; // 格式：{module}:{resource}:{action}，如 finance:record:create
  name: string;
  description?: string;
  module: string;
  sort?: number;
  isActive: boolean;
  isSystem?: boolean;
}

/**
 * 角色
 */
export interface Role {
  id: number;
  code: string; // PARENT, CHILD, ELDER, GUEST
  name: string;
  description?: string;
  isActive: boolean;
  permissions?: Permission[]; // 角色拥有的权限列表
}

/**
 * 用户状态
 * ⚠️ 必须与后端保持一致: home-admin/src/common/enums/user.enum.ts
 */
export const UserStatus = {
  ACTIVE: 'active', // 激活
  INACTIVE: 'inactive', // 未激活
  DISABLED: 'disabled', // 禁用
  LOCKED: 'locked', // 锁定
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

/**
 * 用户
 */
export interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  realName?: string; // 真实姓名
  phone?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthday?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  status: UserStatus;
  roles: Role[];
  /**
   * 权限代码数组，如 ['user:create', 'user:read']。
   * undefined 表示当前后端响应未下发权限清单，前端只做登录态判断，由后端接口鉴权兜底。
   */
  permissions?: string[];

  // 超级管理员标识（后端JWT策略会设置）
  isSuperAdmin?: boolean; // 是否为超级管理员（拥有 super_admin 角色）
  roleCode?: string; // 主要角色码（第一个角色或 super_admin）

  createdAt: string;
  updatedAt: string;
}
