import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';
import { appConfig } from '@/shared/config/app.config';
import { connectSocket, disconnectSocket } from '@/shared/utils/socket';
import type { User } from '@/shared/types/user.types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;

  login: (account: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

/**
 * 认证状态管理
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,

      /**
       * 用户登录
       */
      login: async (account: string, password: string) => {
        const response = await authService.login({ account, password });

        // 扁平化权限：从 roles[].permissions[].code 提取为 permissions: string[]
        const permissions = new Set<string>();
        if (response.user.roles) {
          response.user.roles.forEach((role) => {
            if (role.permissions) {
              role.permissions.forEach((permission) => {
                permissions.add(permission.code);
              });
            }
          });
        }

        // 添加扁平化的permissions到user对象
        const userWithPermissions = {
          ...response.user,
          permissions: Array.from(permissions),
        };

        // 保存到状态和 localStorage
        set({
          token: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken,
          user: userWithPermissions,
        });

        // 同步到 localStorage（persist 中间件会自动处理，这里是备份）
        localStorage.setItem(appConfig.tokenKey, response.tokens.accessToken);
        localStorage.setItem(appConfig.refreshTokenKey, response.tokens.refreshToken);

        // 登录成功后，连接 WebSocket
        try {
          connectSocket();
          console.log('[Auth] WebSocket connected after login');
        } catch (error) {
          console.error('[Auth] Failed to connect WebSocket:', error);
        }
      },

      /**
       * 用户登出
       */
      logout: async () => {
        const { refreshToken } = get();

        try {
          if (refreshToken) {
            await authService.logout(refreshToken);
          }
        } finally {
          // 断开 WebSocket
          disconnectSocket();

          // 清除状态
          set({ token: null, refreshToken: null, user: null });

          // 清除 localStorage
          localStorage.removeItem(appConfig.tokenKey);
          localStorage.removeItem(appConfig.refreshTokenKey);
        }
      },

      /**
       * 清除认证信息
       */
      clearAuth: () => {
        // 断开 WebSocket
        disconnectSocket();

        set({ token: null, refreshToken: null, user: null });
        localStorage.removeItem(appConfig.tokenKey);
        localStorage.removeItem(appConfig.refreshTokenKey);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
