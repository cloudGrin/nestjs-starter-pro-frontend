/**
 * useRole hook 测试
 *
 * 测试范围：
 * 1. hasRole (OR 逻辑)
 * 2. hasAllRoles (AND 逻辑)
 * 3. getUserRoles
 * 4. getUserRoleCodes
 * 5. 未登录用户
 * 6. 空角色数组
 * 7. 边界情况
 */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useRole } from '../useRole';
import { setMockUser, clearMockUser } from '@/test/test-utils';

describe('useRole', () => {
  beforeEach(() => {
    clearMockUser();
  });

  // ==================== hasRole (OR 逻辑) 测试 ====================

  describe('hasRole (OR 逻辑)', () => {
    it('应该在用户拥有指定角色时返回 true', () => {
      setMockUser({
        roles: [
          { id: 1, code: 'PARENT', name: '家长' },
          { id: 2, code: 'USER', name: '普通用户' },
        ],
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasRole(['PARENT'])).toBe(true);
      expect(result.current.hasRole(['USER'])).toBe(true);
    });

    it('应该在用户拥有任一所需角色时返回 true (OR 逻辑)', () => {
      setMockUser({
        roles: [
          { id: 1, code: 'PARENT', name: '家长' },
          { id: 2, code: 'USER', name: '普通用户' },
        ],
      });

      const { result } = renderHook(() => useRole());

      // 拥有 PARENT，即使不拥有 ADMIN 也返回 true
      expect(result.current.hasRole(['PARENT', 'ADMIN'])).toBe(true);

      // 拥有 USER，即使不拥有 GUEST 也返回 true
      expect(result.current.hasRole(['USER', 'GUEST'])).toBe(true);
    });

    it('应该在用户不拥有任何所需角色时返回 false', () => {
      setMockUser({
        roles: [
          { id: 1, code: 'USER', name: '普通用户' },
        ],
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasRole(['PARENT'])).toBe(false);
      expect(result.current.hasRole(['ADMIN'])).toBe(false);
      expect(result.current.hasRole(['PARENT', 'ADMIN'])).toBe(false);
    });

    it('应该在用户未登录时返回 false', () => {
      clearMockUser();

      const { result } = renderHook(() => useRole());

      expect(result.current.hasRole(['PARENT'])).toBe(false);
      expect(result.current.hasRole(['USER'])).toBe(false);
    });

    it('应该在传入空数组时返回 true', () => {
      setMockUser({
        roles: [
          { id: 1, code: 'USER', name: '普通用户' },
        ],
      });

      const { result } = renderHook(() => useRole());

      // 空数组表示不需要任何角色，所以返回 true
      expect(result.current.hasRole([])).toBe(true);
    });
  });

  // ==================== hasAllRoles (AND 逻辑) 测试 ====================

  describe('hasAllRoles (AND 逻辑)', () => {
    it('应该在用户拥有所有指定角色时返回 true', () => {
      setMockUser({
        roles: [
          { id: 1, code: 'PARENT', name: '家长' },
          { id: 2, code: 'ADMIN', name: '管理员' },
          { id: 3, code: 'USER', name: '普通用户' },
        ],
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasAllRoles(['PARENT', 'ADMIN'])).toBe(true);
      expect(result.current.hasAllRoles(['PARENT', 'USER'])).toBe(true);
      expect(result.current.hasAllRoles(['ADMIN', 'USER'])).toBe(true);
    });

    it('应该在用户缺少任一所需角色时返回 false (AND 逻辑)', () => {
      setMockUser({
        roles: [
          { id: 1, code: 'PARENT', name: '家长' },
          { id: 2, code: 'USER', name: '普通用户' },
        ],
      });

      const { result } = renderHook(() => useRole());

      // 缺少 ADMIN 角色
      expect(result.current.hasAllRoles(['PARENT', 'ADMIN'])).toBe(false);

      // 缺少 GUEST 角色
      expect(result.current.hasAllRoles(['USER', 'GUEST'])).toBe(false);
    });

    it('应该在用户拥有单个所需角色时返回 true', () => {
      setMockUser({
        roles: [
          { id: 1, code: 'PARENT', name: '家长' },
        ],
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasAllRoles(['PARENT'])).toBe(true);
    });

    it('应该在用户未登录时返回 false', () => {
      clearMockUser();

      const { result } = renderHook(() => useRole());

      expect(result.current.hasAllRoles(['PARENT'])).toBe(false);
      expect(result.current.hasAllRoles(['PARENT', 'ADMIN'])).toBe(false);
    });

    it('应该在传入空数组时返回 true', () => {
      setMockUser({
        roles: [
          { id: 1, code: 'USER', name: '普通用户' },
        ],
      });

      const { result } = renderHook(() => useRole());

      // 空数组表示不需要任何角色，所以返回 true
      expect(result.current.hasAllRoles([])).toBe(true);
    });
  });

  // ==================== getUserRoles 测试 ====================

  describe('getUserRoles', () => {
    it('应该返回用户的所有角色', () => {
      const mockRoles = [
        { id: 1, code: 'PARENT', name: '家长' },
        { id: 2, code: 'USER', name: '普通用户' },
      ];

      setMockUser({
        roles: mockRoles,
      });

      const { result } = renderHook(() => useRole());

      const roles = result.current.getUserRoles();
      expect(roles).toEqual(mockRoles);
      expect(roles.length).toBe(2);
    });

    it('应该在用户未登录时返回空数组', () => {
      clearMockUser();

      const { result } = renderHook(() => useRole());

      const roles = result.current.getUserRoles();
      expect(roles).toEqual([]);
      expect(roles.length).toBe(0);
    });

    it('应该在用户没有角色时返回空数组', () => {
      setMockUser({
        roles: [],
      });

      const { result } = renderHook(() => useRole());

      const roles = result.current.getUserRoles();
      expect(roles).toEqual([]);
    });
  });

  // ==================== getUserRoleCodes 测试 ====================

  describe('getUserRoleCodes', () => {
    it('应该返回用户的所有角色代码', () => {
      setMockUser({
        roles: [
          { id: 1, code: 'PARENT', name: '家长' },
          { id: 2, code: 'ADMIN', name: '管理员' },
          { id: 3, code: 'USER', name: '普通用户' },
        ],
      });

      const { result } = renderHook(() => useRole());

      const codes = result.current.getUserRoleCodes();
      expect(codes).toEqual(['PARENT', 'ADMIN', 'USER']);
      expect(codes.length).toBe(3);
    });

    it('应该在用户未登录时返回空数组', () => {
      clearMockUser();

      const { result } = renderHook(() => useRole());

      const codes = result.current.getUserRoleCodes();
      expect(codes).toEqual([]);
      expect(codes.length).toBe(0);
    });

    it('应该在用户没有角色时返回空数组', () => {
      setMockUser({
        roles: [],
      });

      const { result } = renderHook(() => useRole());

      const codes = result.current.getUserRoleCodes();
      expect(codes).toEqual([]);
    });
  });

  // ==================== 边界情况测试 ====================

  describe('边界情况', () => {
    it('应该处理角色代码大小写敏感', () => {
      setMockUser({
        roles: [
          { id: 1, code: 'PARENT', name: '家长' },
        ],
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasRole(['PARENT'])).toBe(true);
      // 大小写不同，应该返回 false
      expect(result.current.hasRole(['parent'])).toBe(false);
      expect(result.current.hasRole(['Parent'])).toBe(false);
    });

    it('应该处理重复的角色', () => {
      setMockUser({
        roles: [
          { id: 1, code: 'USER', name: '普通用户' },
          { id: 2, code: 'USER', name: '普通用户（重复）' },
        ],
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasRole(['USER'])).toBe(true);
      const codes = result.current.getUserRoleCodes();
      expect(codes).toEqual(['USER', 'USER']);
    });

    it('应该处理大量角色', () => {
      const manyRoles = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        code: `ROLE_${i}`,
        name: `角色${i}`,
      }));

      setMockUser({
        roles: manyRoles,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasRole(['ROLE_0'])).toBe(true);
      expect(result.current.hasRole(['ROLE_99'])).toBe(true);
      expect(result.current.hasRole(['ROLE_50'])).toBe(true);
      expect(result.current.getUserRoleCodes().length).toBe(100);
    });

    it('应该处理特殊字符的角色代码', () => {
      setMockUser({
        roles: [
          { id: 1, code: 'ROLE_WITH-DASH', name: '带横杠的角色' },
          { id: 2, code: 'ROLE_WITH_UNDERSCORE', name: '带下划线的角色' },
        ],
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasRole(['ROLE_WITH-DASH'])).toBe(true);
      expect(result.current.hasRole(['ROLE_WITH_UNDERSCORE'])).toBe(true);
    });
  });

  // ==================== 组合场景测试 ====================

  describe('组合场景', () => {
    it('应该支持同时使用 hasRole 和 hasAllRoles', () => {
      setMockUser({
        roles: [
          { id: 1, code: 'PARENT', name: '家长' },
          { id: 2, code: 'USER', name: '普通用户' },
        ],
      });

      const { result } = renderHook(() => useRole());

      // OR 逻辑：拥有任一角色即可
      expect(result.current.hasRole(['PARENT', 'ADMIN'])).toBe(true);

      // AND 逻辑：必须拥有所有角色
      expect(result.current.hasAllRoles(['PARENT', 'USER'])).toBe(true);
      expect(result.current.hasAllRoles(['PARENT', 'ADMIN'])).toBe(false);
    });

    it('应该支持获取角色后进行判断', () => {
      setMockUser({
        roles: [
          { id: 1, code: 'PARENT', name: '家长' },
        ],
      });

      const { result } = renderHook(() => useRole());

      const roles = result.current.getUserRoles();
      expect(roles.length).toBe(1);

      const codes = result.current.getUserRoleCodes();
      expect(codes).toContain('PARENT');

      expect(result.current.hasRole(codes)).toBe(true);
    });
  });
});
