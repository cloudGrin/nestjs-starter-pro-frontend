import { request } from '@/shared/utils/request';
import type { User } from '@/shared/types/user.types';
import type {
  ChangePasswordDto,
  LoginDto,
  LoginResponse,
  UpdateProfileDto,
} from '../types/auth.types';

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

  /**
   * 获取当前用户资料
   */
  getProfile: () => request.get<User>('/users/profile'),

  /**
   * 更新当前用户资料
   */
  updateProfile: (data: UpdateProfileDto) => request.put<User>('/users/profile', data),

  /**
   * 修改当前用户密码
   */
  changePassword: (data: ChangePasswordDto) =>
    request.put('/users/password', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '密码修改成功',
        },
      },
    }),
};
