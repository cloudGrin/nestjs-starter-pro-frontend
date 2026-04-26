import { request } from '@/shared/utils/request';
import type { LoginDto, LoginResponse } from '../types/auth.types';

/**
 * 认证服务
 */
export const authService = {
  /**
   * 用户登录
   */
  login: (data: LoginDto) =>
    request.post<LoginResponse>('/auth/login', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '登录成功！',
        },
      },
    }),

  /**
   * 用户登出
   */
  logout: (refreshToken?: string) => request.post('/auth/logout', { refreshToken }),
};
