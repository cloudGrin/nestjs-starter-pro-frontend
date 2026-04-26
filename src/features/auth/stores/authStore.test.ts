/**
 * authStore 测试
 *
 * 测试覆盖：
 * - ✅ 登录流程
 * - ✅ 登出流程
 * - ✅ Token 刷新
 * - ✅ 权限扁平化
 * - ✅ LocalStorage 同步
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';
import { authService } from '../services/auth.service';

// Mock authService
vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock app config
vi.mock('@/shared/config/app.config', () => ({
  appConfig: {
    tokenKey: 'test-token',
    refreshTokenKey: 'test-refresh-token',
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    // 重置 store 状态
    useAuthStore.setState({ token: null, refreshToken: null, user: null });

    // 清除 localStorage
    localStorage.clear();

    // 重置所有 mock
    vi.clearAllMocks();
  });

  describe('token lifecycle events', () => {
    it('应该在请求层刷新 Token 后同步 store 和 localStorage', () => {
      useAuthStore.setState({
        token: 'old-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          roles: [],
          permissions: [],
        },
      });

      window.dispatchEvent(
        new CustomEvent('auth:token-refreshed', {
          detail: { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' },
        })
      );

      expect(useAuthStore.getState().token).toBe('new-access-token');
      expect(useAuthStore.getState().refreshToken).toBe('new-refresh-token');
      expect(localStorage.getItem('test-token')).toBe('new-access-token');
      expect(localStorage.getItem('test-refresh-token')).toBe('new-refresh-token');
    });

    it('应该在请求层判定会话过期后清理认证状态', () => {
      useAuthStore.setState({
        token: 'old-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          roles: [],
          permissions: [],
        },
      });
      localStorage.setItem('test-token', 'old-access-token');
      localStorage.setItem('test-refresh-token', 'mock-refresh-token');

      window.dispatchEvent(new Event('auth:session-expired'));

      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().refreshToken).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
      expect(localStorage.getItem('test-token')).toBeNull();
      expect(localStorage.getItem('test-refresh-token')).toBeNull();
    });
  });

  describe('login', () => {
    it('应该成功登录并保存用户信息', async () => {
      const mockResponse = {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          roles: [
            {
              id: 1,
              code: 'admin',
              name: '管理员',
              permissions: [
                { id: 1, code: 'user:create', name: '创建用户' },
                { id: 2, code: 'user:read', name: '查看用户' },
              ],
            },
          ],
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };

      vi.mocked(authService.login).mockResolvedValue(mockResponse);

      await useAuthStore.getState().login('testuser', 'password123');

      const state = useAuthStore.getState();

      // 检查状态
      expect(state.token).toBe('mock-access-token');
      expect(state.refreshToken).toBe('mock-refresh-token');
      expect(state.user).toBeDefined();
      expect(state.user?.username).toBe('testuser');

      // 检查 localStorage
      expect(localStorage.getItem('test-token')).toBe('mock-access-token');
      expect(localStorage.getItem('test-refresh-token')).toBe('mock-refresh-token');

      // 检查 authService 被调用
      expect(authService.login).toHaveBeenCalledWith({
        account: 'testuser',
        password: 'password123',
      });
    });

    it('应该正确扁平化权限', async () => {
      const mockResponse = {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          roles: [
            {
              id: 1,
              code: 'admin',
              name: '管理员',
              permissions: [
                { id: 1, code: 'user:create', name: '创建用户' },
                { id: 2, code: 'user:read', name: '查看用户' },
              ],
            },
            {
              id: 2,
              code: 'editor',
              name: '编辑',
              permissions: [
                { id: 2, code: 'user:read', name: '查看用户' }, // 重复权限
                { id: 3, code: 'user:update', name: '更新用户' },
              ],
            },
          ],
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };

      vi.mocked(authService.login).mockResolvedValue(mockResponse);

      await useAuthStore.getState().login('testuser', 'password123');

      const state = useAuthStore.getState();

      // 应该去重并扁平化
      expect(state.user?.permissions).toEqual(
        expect.arrayContaining(['user:create', 'user:read', 'user:update'])
      );
      expect(state.user?.permissions).toHaveLength(3); // 去重后只有3个
    });

    it('应该处理登录失败', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        useAuthStore.getState().login('testuser', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');

      const state = useAuthStore.getState();

      // 状态应该保持为空
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.user).toBeNull();
    });
  });

  describe('logout', () => {
    it('应该成功登出并清除所有状态', async () => {
      // 先设置登录状态
      useAuthStore.setState({
        token: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          permissions: ['user:read'],
        } as any,
      });

      localStorage.setItem('test-token', 'mock-access-token');
      localStorage.setItem('test-refresh-token', 'mock-refresh-token');

      vi.mocked(authService.logout).mockResolvedValue(undefined);

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();

      // 检查状态已清空
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.user).toBeNull();

      // 检查 localStorage 已清空
      expect(localStorage.getItem('test-token')).toBeNull();
      expect(localStorage.getItem('test-refresh-token')).toBeNull();

      // 检查 authService 被调用
      expect(authService.logout).toHaveBeenCalledWith('mock-refresh-token');
    });

    it('应该在 API 调用失败时仍然清空状态', async () => {
      useAuthStore.setState({
        token: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        } as any,
      });

      // 模拟网络错误（直接 reject）
      vi.mocked(authService.logout).mockImplementation(() => {
        return Promise.reject(new Error('Network error'));
      });

      // logout 会抛出错误，但 finally 块仍然会清空状态
      try {
        await useAuthStore.getState().logout();
      } catch (error) {
        // 预期会有错误，忽略即可
      }

      const state = useAuthStore.getState();

      // 即使 API 失败，状态也应该被清空（finally 块执行）
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.user).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('应该清除所有认证信息', () => {
      useAuthStore.setState({
        token: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com' } as any,
      });

      localStorage.setItem('test-token', 'mock-access-token');
      localStorage.setItem('test-refresh-token', 'mock-refresh-token');

      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();

      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.user).toBeNull();

      expect(localStorage.getItem('test-token')).toBeNull();
      expect(localStorage.getItem('test-refresh-token')).toBeNull();
    });
  });
});
