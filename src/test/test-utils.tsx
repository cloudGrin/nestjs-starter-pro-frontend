/**
 * 测试工具函数
 */

import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement, ReactNode } from 'react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { User } from '@/shared/types/user.types';

/**
 * 创建测试用的 QueryClient
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // 测试时不重试
        gcTime: 0, // 测试时不缓存
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * 测试 Wrapper（包含 QueryClientProvider）
 */
export function TestWrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/**
 * 自定义 render 函数（包含 Providers）
 */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: TestWrapper, ...options });
}

/**
 * Mock 用户数据
 */
export const mockUsers = {
  /**
   * 超级管理员
   */
  superAdmin: {
    id: 1,
    username: 'super_admin',
    email: 'super_admin@example.com',
    roleCode: 'super_admin',
    isSuperAdmin: true,
    permissions: ['*'],
    roles: [{ id: 1, code: 'super_admin', name: '超级管理员' }],
  } as User,

  /**
   * 普通管理员（有部分权限）
   */
  admin: {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    roleCode: 'admin',
    isSuperAdmin: false,
    permissions: ['user:read', 'user:create', 'user:update', 'role:read'],
    roles: [{ id: 2, code: 'admin', name: '管理员' }],
  } as User,

  /**
   * 普通用户（只有查看权限）
   */
  user: {
    id: 3,
    username: 'user',
    email: 'user@example.com',
    roleCode: 'user',
    isSuperAdmin: false,
    permissions: ['user:read', 'role:read'],
    roles: [{ id: 3, code: 'user', name: '普通用户' }],
  } as User,

  /**
   * 无权限用户
   */
  guest: {
    id: 4,
    username: 'guest',
    email: 'guest@example.com',
    roleCode: 'guest',
    isSuperAdmin: false,
    permissions: [],
    roles: [{ id: 4, code: 'guest', name: '访客' }],
  } as User,
};

/**
 * 设置 Mock 用户到 authStore
 */
export function setMockUser(user: User | null) {
  useAuthStore.setState({ user, token: user ? 'mock-token' : null });
}

/**
 * 清除 Mock 用户
 */
export function clearMockUser() {
  useAuthStore.setState({ user: null, token: null, refreshToken: null });
}

/**
 * 创建自定义 Mock 用户（兼容旧测试）
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 999,
    username: 'testuser',
    email: 'testuser@example.com',
    roleCode: 'user',
    isSuperAdmin: false,
    permissions: [],
    roles: [],
    ...overrides,
  } as User;
}

/**
 * Mock 登录（兼容旧测试）
 */
export function mockLogin(user: User) {
  setMockUser(user);
}

/**
 * Mock 登出（兼容旧测试）
 */
export function mockLogout() {
  clearMockUser();
}

// 重新导出所有 testing-library 工具
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
