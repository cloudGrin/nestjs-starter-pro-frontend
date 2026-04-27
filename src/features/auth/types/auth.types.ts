/**
 * 认证相关类型定义
 */

import type { User } from '@/shared/types/user.types';

/**
 * 登录请求
 */
export interface LoginDto {
  account: string; // 后端使用 account 字段（用户名或邮箱）
  password: string;
}

/**
 * 登录响应（匹配后端返回结构）
 */
export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // 秒
    sessionId: string;
  };
}

type ProfileFormFields = Pick<
  User,
  'realName' | 'nickname' | 'phone' | 'gender' | 'birthday' | 'address' | 'bio' | 'avatar'
>;

export type UpdateProfileDto = Partial<{
  [Field in keyof ProfileFormFields]: Field extends 'gender'
    ? ProfileFormFields[Field]
    : ProfileFormFields[Field] | null;
}>;

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
