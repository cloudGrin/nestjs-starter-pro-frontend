import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';
import { appConfig } from '@/shared/config/app.config';
import type { User } from '@/shared/types/user.types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;

  login: (account: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

interface TokenRefreshedPayload {
  accessToken?: string;
  refreshToken?: string;
}

function extractPermissions(user: User): string[] | undefined {
  if (user.permissions) {
    return user.permissions;
  }

  const permissions = new Set<string>();
  user.roles?.forEach((role) => {
    role.permissions?.forEach((permission) => {
      permissions.add(permission.code);
    });
  });

  return permissions.size > 0 ? Array.from(permissions) : undefined;
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

        const userWithPermissions = {
          ...response.user,
          permissions: extractPermissions(response.user),
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

if (typeof window !== 'undefined') {
  window.addEventListener('auth:token-refreshed', (event) => {
    const { accessToken, refreshToken } =
      (event as CustomEvent<TokenRefreshedPayload>).detail || {};
    if (!accessToken) return;

    useAuthStore.setState((state) => ({
      token: accessToken,
      refreshToken: refreshToken || state.refreshToken,
    }));
    localStorage.setItem(appConfig.tokenKey, accessToken);

    if (refreshToken) {
      localStorage.setItem(appConfig.refreshTokenKey, refreshToken);
    }
  });

  window.addEventListener('auth:session-expired', () => {
    useAuthStore.getState().clearAuth();
  });
}
