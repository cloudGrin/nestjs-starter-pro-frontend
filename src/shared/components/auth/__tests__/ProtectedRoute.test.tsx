/**
 * ProtectedRoute 组件测试
 *
 * 测试覆盖：
 * 1. JWT认证检查（未登录重定向）
 * 2. 权限检查（OR逻辑）
 * 3. 角色检查（OR逻辑）
 * 4. 通过所有检查后渲染Outlet
 * 5. 自定义fallback和redirectTo
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../ProtectedRoute';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}));

// Mock useAuthStore
vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock usePermission
vi.mock('@/shared/hooks/usePermission', () => ({
  usePermission: vi.fn(),
}));

import { useAuthStore } from '@/features/auth/stores/authStore';
import { usePermission } from '@/shared/hooks/usePermission';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('JWT认证检查', () => {
    it('未登录（无token）时应该重定向到登录页', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: null,
        user: null,
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => []),
      });

      render(<ProtectedRoute />);

      // 应该渲染Navigate组件，重定向到/login
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
      expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
    });

    it('有token但无user时应该重定向到登录页', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: 'mock-token',
        user: null,
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => []),
      });

      render(<ProtectedRoute />);

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
    });

    it('应该支持自定义重定向路径', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: null,
        user: null,
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => []),
      });

      render(<ProtectedRoute redirectTo="/custom-login" />);

      expect(screen.getByTestId('navigate')).toHaveTextContent('/custom-login');
    });
  });

  describe('权限检查', () => {
    it('已登录且无权限检查时应该渲染Outlet', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: 'mock-token',
        user: { id: 1, username: 'test', permissions: [] },
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => []),
      });

      render(<ProtectedRoute />);

      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('拥有所需权限时应该渲染Outlet', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: 'mock-token',
        user: { id: 1, username: 'test', permissions: ['user:read'] },
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(() => true),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => ['user:read']),
      });

      render(<ProtectedRoute permissions={['user:read']} />);

      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    it('拥有任一所需权限时应该渲染Outlet（OR逻辑）', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: 'mock-token',
        user: { id: 1, username: 'test', permissions: ['user:read'] },
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(() => true), // hasPermission内部已实现OR逻辑
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => ['user:read']),
      });

      render(<ProtectedRoute permissions={['user:read', 'user:create']} />);

      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    it('没有所需权限时应该显示403页面', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: 'mock-token',
        user: { id: 1, username: 'test', permissions: [] },
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(() => false),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => []),
      });

      render(<ProtectedRoute permissions={['user:delete']} />);

      expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('无权限访问此页面')).toBeInTheDocument();
      expect(screen.getByText(/所需权限:/)).toBeInTheDocument();
    });

    it('没有所需权限且提供fallback时应该显示fallback', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: 'mock-token',
        user: { id: 1, username: 'test', permissions: [] },
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(() => false),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => []),
      });

      render(
        <ProtectedRoute
          permissions={['user:delete']}
          fallback={<div>Custom No Permission</div>}
        />
      );

      expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
      expect(screen.queryByText('403')).not.toBeInTheDocument();
      expect(screen.getByText('Custom No Permission')).toBeInTheDocument();
    });
  });

  describe('角色检查', () => {
    it('拥有所需角色时应该渲染Outlet', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: 'mock-token',
        user: {
          id: 1,
          username: 'test',
          roles: [{ id: 1, code: 'admin', name: '管理员' }],
        },
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => []),
      });

      render(<ProtectedRoute roles={['admin']} />);

      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    it('拥有任一所需角色时应该渲染Outlet（OR逻辑）', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: 'mock-token',
        user: {
          id: 1,
          username: 'test',
          roles: [{ id: 1, code: 'user', name: '普通用户' }],
        },
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => []),
      });

      render(<ProtectedRoute roles={['user', 'admin']} />);

      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    it('没有所需角色时应该显示403页面', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: 'mock-token',
        user: {
          id: 1,
          username: 'test',
          roles: [{ id: 1, code: 'user', name: '普通用户' }],
        },
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => []),
      });

      render(<ProtectedRoute roles={['admin']} />);

      expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText(/所需角色:/)).toBeInTheDocument();
    });

    it('没有所需角色且提供fallback时应该显示fallback', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: 'mock-token',
        user: {
          id: 1,
          username: 'test',
          roles: [{ id: 1, code: 'user', name: '普通用户' }],
        },
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => []),
      });

      render(<ProtectedRoute roles={['admin']} fallback={<div>Not Admin</div>} />);

      expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
      expect(screen.queryByText('403')).not.toBeInTheDocument();
      expect(screen.getByText('Not Admin')).toBeInTheDocument();
    });

    it('用户没有任何角色时应该显示403页面', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: 'mock-token',
        user: {
          id: 1,
          username: 'test',
          roles: [],
        },
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => []),
      });

      render(<ProtectedRoute roles={['admin']} />);

      expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
      expect(screen.getByText('403')).toBeInTheDocument();
    });
  });

  describe('组合检查', () => {
    it('同时指定权限和角色时，两者都通过才渲染Outlet', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: 'mock-token',
        user: {
          id: 1,
          username: 'test',
          permissions: ['user:read'],
          roles: [{ id: 1, code: 'admin', name: '管理员' }],
        },
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(() => true),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => ['user:read']),
      });

      render(<ProtectedRoute permissions={['user:read']} roles={['admin']} />);

      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    it('同时指定权限和角色，权限不足时显示403', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: 'mock-token',
        user: {
          id: 1,
          username: 'test',
          permissions: [],
          roles: [{ id: 1, code: 'admin', name: '管理员' }],
        },
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(() => false),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => []),
      });

      render(<ProtectedRoute permissions={['user:delete']} roles={['admin']} />);

      expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
      expect(screen.getByText('403')).toBeInTheDocument();
    });

    it('同时指定权限和角色，角色不足时显示403', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        token: 'mock-token',
        user: {
          id: 1,
          username: 'test',
          permissions: ['user:read'],
          roles: [{ id: 1, code: 'user', name: '普通用户' }],
        },
      } as any);

      vi.mocked(usePermission).mockReturnValue({
        hasPermission: vi.fn(() => true),
        hasAllPermissions: vi.fn(),
        getUserPermissions: vi.fn(() => ['user:read']),
      });

      render(<ProtectedRoute permissions={['user:read']} roles={['admin']} />);

      expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
      expect(screen.getByText('403')).toBeInTheDocument();
    });
  });
});
