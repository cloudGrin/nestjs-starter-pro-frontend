/**
 * RoleGuard 组件测试
 *
 * 测试覆盖：
 * 1. 拥有所需角色时渲染children
 * 2. 没有所需角色时渲染fallback
 * 3. OR逻辑：拥有任一角色即可
 * 4. 未登录时的处理
 * 5. 未提供fallback时的默认行为
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleGuard } from '../RoleGuard';

// Mock useRole hook
vi.mock('@/shared/hooks/useRole', () => ({
  useRole: vi.fn(),
}));

import { useRole } from '@/shared/hooks/useRole';

describe('RoleGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染 children', () => {
    it('当用户拥有所需角色时应该渲染children（单个角色）', () => {
      // Mock useRole返回 hasRole = true
      vi.mocked(useRole).mockReturnValue({
        hasRole: vi.fn((roles: string[]) => roles.includes('admin')),
        hasAllRoles: vi.fn(),
        getUserRoles: vi.fn(() => []),
        getUserRoleCodes: vi.fn(() => ['admin']),
      });

      render(
        <RoleGuard roles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('当用户拥有任一所需角色时应该渲染children（OR逻辑）', () => {
      // Mock useRole - 用户拥有 admin 角色
      vi.mocked(useRole).mockReturnValue({
        hasRole: vi.fn((roles: string[]) => {
          const userRoles = ['admin'];
          return roles.some((r) => userRoles.includes(r));
        }),
        hasAllRoles: vi.fn(),
        getUserRoles: vi.fn(() => []),
        getUserRoleCodes: vi.fn(() => ['admin']),
      });

      render(
        <RoleGuard roles={['admin', 'super_admin']}>
          <div>Privileged Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Privileged Content')).toBeInTheDocument();
    });

    it('当用户拥有多个角色时应该渲染children', () => {
      // Mock useRole - 用户拥有多个角色
      vi.mocked(useRole).mockReturnValue({
        hasRole: vi.fn((roles: string[]) => {
          const userRoles = ['admin', 'user'];
          return roles.some((r) => userRoles.includes(r));
        }),
        hasAllRoles: vi.fn(),
        getUserRoles: vi.fn(() => []),
        getUserRoleCodes: vi.fn(() => ['admin', 'user']),
      });

      render(
        <RoleGuard roles={['user']}>
          <div>User Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('User Content')).toBeInTheDocument();
    });
  });

  describe('渲染 fallback', () => {
    it('当用户没有所需角色时应该渲染fallback', () => {
      // Mock useRole - 用户没有所需角色
      vi.mocked(useRole).mockReturnValue({
        hasRole: vi.fn(() => false),
        hasAllRoles: vi.fn(),
        getUserRoles: vi.fn(() => []),
        getUserRoleCodes: vi.fn(() => ['user']),
      });

      render(
        <RoleGuard roles={['admin']} fallback={<div>No Permission</div>}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
      expect(screen.getByText('No Permission')).toBeInTheDocument();
    });

    it('当用户未登录时应该渲染fallback', () => {
      // Mock useRole - 未登录（无角色）
      vi.mocked(useRole).mockReturnValue({
        hasRole: vi.fn(() => false),
        hasAllRoles: vi.fn(),
        getUserRoles: vi.fn(() => []),
        getUserRoleCodes: vi.fn(() => []),
      });

      render(
        <RoleGuard roles={['admin']} fallback={<div>Please Login</div>}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
      expect(screen.getByText('Please Login')).toBeInTheDocument();
    });

    it('当没有提供fallback时应该渲染null（不显示任何内容）', () => {
      // Mock useRole - 用户没有所需角色
      vi.mocked(useRole).mockReturnValue({
        hasRole: vi.fn(() => false),
        hasAllRoles: vi.fn(),
        getUserRoles: vi.fn(() => []),
        getUserRoleCodes: vi.fn(() => ['user']),
      });

      const { container } = render(
        <RoleGuard roles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
      // 应该渲染空Fragment
      expect(container.textContent).toBe('');
    });
  });

  describe('边界情况', () => {
    it('当roles为空数组时，应该使用hasRole的默认逻辑', () => {
      // Mock useRole
      const mockHasRole = vi.fn((roles: string[]) => roles.length === 0);
      vi.mocked(useRole).mockReturnValue({
        hasRole: mockHasRole,
        hasAllRoles: vi.fn(),
        getUserRoles: vi.fn(() => []),
        getUserRoleCodes: vi.fn(() => []),
      });

      render(
        <RoleGuard roles={[]}>
          <div>Always Visible</div>
        </RoleGuard>
      );

      expect(mockHasRole).toHaveBeenCalledWith([]);
    });

    it('应该正确传递roles参数到hasRole', () => {
      const mockHasRole = vi.fn(() => true);
      vi.mocked(useRole).mockReturnValue({
        hasRole: mockHasRole,
        hasAllRoles: vi.fn(),
        getUserRoles: vi.fn(() => []),
        getUserRoleCodes: vi.fn(() => []),
      });

      render(
        <RoleGuard roles={['admin', 'super_admin']}>
          <div>Content</div>
        </RoleGuard>
      );

      expect(mockHasRole).toHaveBeenCalledWith(['admin', 'super_admin']);
    });
  });
});
