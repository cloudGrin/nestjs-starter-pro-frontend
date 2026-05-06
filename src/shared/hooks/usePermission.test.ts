/**
 * usePermission Hook 测试
 *
 * 测试覆盖：
 * - ✅ hasPermission OR 逻辑
 * - ✅ hasAllPermissions AND 逻辑
 * - ✅ 超级管理员特权
 * - ✅ 未登录用户拒绝
 * - ✅ 空数组安全检查
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermission } from './usePermission';
import { setMockUser, clearMockUser, mockUsers } from '@/test/test-utils';

describe('usePermission', () => {
  beforeEach(() => {
    clearMockUser();
  });

  describe('hasPermission (OR 逻辑)', () => {
    it('应该在用户拥有单个权限时返回 true', () => {
      setMockUser(mockUsers.admin); // admin 有 user:create

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasPermission(['user:create'])).toBe(true);
    });

    it('应该在用户缺少权限时返回 false', () => {
      setMockUser(mockUsers.user); // user 没有 user:delete

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasPermission(['user:delete'])).toBe(false);
    });

    it('应该支持 OR 逻辑：拥有任一权限即返回 true', () => {
      setMockUser(mockUsers.admin); // admin 有 user:create 但没有 user:delete

      const { result } = renderHook(() => usePermission());

      // 拥有其中一个权限即可
      expect(result.current.hasPermission(['user:create', 'user:delete'])).toBe(true);
    });

    it('应该在用户不拥有任何所需权限时返回 false', () => {
      setMockUser(mockUsers.user); // user 只有 user:read 和 role:read

      const { result } = renderHook(() => usePermission());

      // 不拥有任何所需权限
      expect(result.current.hasPermission(['user:create', 'user:delete'])).toBe(false);
    });

    it('超级管理员应该自动拥有所有权限', () => {
      setMockUser(mockUsers.superAdmin);

      const { result } = renderHook(() => usePermission());

      // 超级管理员应该拥有任何权限
      expect(result.current.hasPermission(['any:random:permission'])).toBe(true);
      expect(result.current.hasPermission(['user:delete', 'role:delete'])).toBe(true);
    });

    it('应该将本地缓存里的 super_admin 角色识别为超级管理员', () => {
      setMockUser({
        ...mockUsers.user,
        roleCode: undefined,
        isSuperAdmin: undefined,
        permissions: undefined,
        roles: [{ id: 1, code: 'super_admin', name: '超级管理员', isActive: true }],
      });

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasPermission(['insurance:create'])).toBe(true);
    });

    it('应该支持后端下发的通配符权限', () => {
      setMockUser({
        ...mockUsers.user,
        permissions: ['*'],
      });

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasPermission(['insurance:create'])).toBe(true);
      expect(result.current.hasPermission(['insurance:update', 'insurance:delete'])).toBe(true);
    });

    it('应该支持模块级通配符权限', () => {
      setMockUser({
        ...mockUsers.user,
        permissions: ['insurance:*'],
      });

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasPermission(['insurance:create'])).toBe(true);
      expect(result.current.hasPermission(['task:create'])).toBe(false);
    });

    it('未登录用户应该被拒绝', () => {
      // 不设置用户（未登录）

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasPermission(['user:create'])).toBe(false);
    });

    it('空权限数组的用户应该被拒绝', () => {
      setMockUser(mockUsers.guest); // guest 没有任何权限

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasPermission(['user:create'])).toBe(false);
    });

    it('普通用户未下发权限清单时应该被拒绝', () => {
      setMockUser({
        ...mockUsers.user,
        permissions: undefined,
      });

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasPermission(['notification:read'])).toBe(false);
    });
  });

  describe('hasAllPermissions (AND 逻辑)', () => {
    it('应该在用户拥有所有权限时返回 true', () => {
      setMockUser(mockUsers.admin); // admin 有 user:read, user:create, user:update

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasAllPermissions(['user:read', 'user:create'])).toBe(true);
    });

    it('应该在用户缺少部分权限时返回 false', () => {
      setMockUser(mockUsers.admin); // admin 有 user:create 但没有 user:delete

      const { result } = renderHook(() => usePermission());

      // 缺少 user:delete 权限
      expect(result.current.hasAllPermissions(['user:create', 'user:delete'])).toBe(false);
    });

    it('超级管理员应该自动拥有所有权限', () => {
      setMockUser(mockUsers.superAdmin);

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasAllPermissions(['user:create', 'user:delete', 'role:create'])).toBe(
        true
      );
    });

    it('应该在全部权限检查中支持通配符权限', () => {
      setMockUser({
        ...mockUsers.user,
        permissions: ['*'],
      });

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasAllPermissions(['insurance:create', 'insurance:update'])).toBe(true);
    });

    it('未登录用户应该被拒绝', () => {
      const { result } = renderHook(() => usePermission());

      expect(result.current.hasAllPermissions(['user:create'])).toBe(false);
    });

    it('普通用户未下发权限清单时应该不通过全部权限检查', () => {
      setMockUser({
        ...mockUsers.user,
        permissions: undefined,
      });

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasAllPermissions(['user:read'])).toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    it('应该返回用户的所有权限', () => {
      setMockUser(mockUsers.admin);

      const { result } = renderHook(() => usePermission());

      const permissions = result.current.getUserPermissions();
      expect(permissions).toEqual(['user:read', 'user:create', 'user:update', 'role:read']);
    });

    it('应该在用户未登录时返回空数组', () => {
      const { result } = renderHook(() => usePermission());

      expect(result.current.getUserPermissions()).toEqual([]);
    });

    it('应该在用户无权限时返回空数组', () => {
      setMockUser(mockUsers.guest);

      const { result } = renderHook(() => usePermission());

      expect(result.current.getUserPermissions()).toEqual([]);
    });
  });

  describe('安全性测试', () => {
    it('空数组应该返回 false（防止安全漏洞）', () => {
      setMockUser(mockUsers.admin);

      const { result } = renderHook(() => usePermission());

      // TypeScript 类型约束应该阻止传入空数组
      // 但运行时仍需检查
      // @ts-expect-error 测试运行时安全检查
      expect(result.current.hasPermission([])).toBe(false);

      // @ts-expect-error 测试运行时安全检查
      expect(result.current.hasAllPermissions([])).toBe(false);
    });
  });

  describe('边界情况', () => {
    it('应该正确处理大量权限检查', () => {
      setMockUser(mockUsers.admin);

      const { result } = renderHook(() => usePermission());

      // 拥有其中部分权限
      expect(
        result.current.hasPermission([
          'user:read',
          'user:create',
          'user:delete', // 没有这个
          'role:delete', // 没有这个
        ])
      ).toBe(true);

      // 必须拥有所有权限
      expect(
        result.current.hasAllPermissions([
          'user:read',
          'user:create',
          'user:delete', // 没有这个
        ])
      ).toBe(false);
    });

    it('应该正确处理权限代码大小写', () => {
      setMockUser(mockUsers.admin);

      const { result } = renderHook(() => usePermission());

      // 权限代码是精确匹配的（区分大小写）
      expect(result.current.hasPermission(['USER:CREATE'])).toBe(false);
      expect(result.current.hasPermission(['user:create'])).toBe(true);
    });
  });
});
