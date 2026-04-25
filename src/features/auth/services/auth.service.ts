import { request } from '@/shared/utils/request';
import type {
  LoginDto,
  LoginResponse,
  RefreshTokenDto,
  RefreshTokenResponse,
} from '../types/auth.types';
import type { User } from '@/shared/types/user.types';

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
   * 刷新Token
   */
  refresh: (data: RefreshTokenDto) =>
    request.post<RefreshTokenResponse>('/auth/refresh', data),

  /**
   * 用户登出
   */
  logout: (refreshToken?: string) =>
    request.post('/auth/logout', { refreshToken }),

  /**
   * 获取当前用户信息
   */
  getProfile: () => request.get<User>('/users/profile'),
};
