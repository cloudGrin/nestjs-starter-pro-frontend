/**
 * 测试工具函数
 *
 * 用途：
 * 1. 提供自定义的 render 函数（包含 React Router、React Query、Zustand 等）
 * 2. 提供常用的 Mock 数据和工厂函数
 * 3. 提供测试辅助函数
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { User } from '@/shared/types/user.types';
import type { Role } from '@/features/rbac/role/types/role.types';

/**
 * 自定义 render 函数（包含全局 Provider）
 *
 * @example
 * renderWithProviders(<MyComponent />);
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  }: RenderOptions & { queryClient?: QueryClient } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), queryClient };
}

/**
 * Mock 用户数据工厂
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    realName: '测试用户',
    phone: '13800138000',
    avatar: null,
    status: 'active',
    isActive: true,
    roles: [],
    permissions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Mock 角色数据工厂
 */
export function createMockRole(overrides?: Partial<Role>): Role {
  return {
    id: 1,
    name: '管理员',
    code: 'admin',
    description: '系统管理员角色',
    sort: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * 等待异步操作完成
 */
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock axios 请求
 */
export function mockAxios(data: unknown, delay = 0) {
  return {
    get: vi.fn(() =>
      delay > 0
        ? new Promise((resolve) => setTimeout(() => resolve({ data }), delay))
        : Promise.resolve({ data })
    ),
    post: vi.fn(() =>
      delay > 0
        ? new Promise((resolve) => setTimeout(() => resolve({ data }), delay))
        : Promise.resolve({ data })
    ),
    put: vi.fn(() =>
      delay > 0
        ? new Promise((resolve) => setTimeout(() => resolve({ data }), delay))
        : Promise.resolve({ data })
    ),
    delete: vi.fn(() =>
      delay > 0
        ? new Promise((resolve) => setTimeout(() => resolve({ data }), delay))
        : Promise.resolve({ data })
    ),
  };
}

/**
 * 模拟用户登录（设置 localStorage）
 */
export function mockLogin(user: User = createMockUser()) {
  const authData = {
    token: 'mock-token',
    refreshToken: 'mock-refresh-token',
    user,
  };
  localStorage.setItem('auth-storage', JSON.stringify({ state: authData }));
  return authData;
}

/**
 * 清除登录状态
 */
export function mockLogout() {
  localStorage.removeItem('auth-storage');
}

// 重新导出 testing-library 的所有工具
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
