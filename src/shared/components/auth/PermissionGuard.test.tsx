/**
 * PermissionGuard 组件测试
 *
 * 测试覆盖：
 * - ✅ 有权限时渲染 children
 * - ✅ 无权限时渲染 fallback
 * - ✅ 超级管理员自动通过所有权限检查
 * - ✅ OR 逻辑：拥有任一权限即可
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionGuard } from './PermissionGuard';
import { setMockUser, clearMockUser, mockUsers } from '@/test/test-utils';

describe('PermissionGuard', () => {
  beforeEach(() => {
    // 每个测试前清空用户状态
    clearMockUser();
  });

  it('应该在有权限时渲染 children', () => {
    // 设置用户拥有 user:create 权限
    setMockUser(mockUsers.admin); // admin 有 user:create

    render(
      <PermissionGuard permissions={['user:create']}>
        <div>创建用户按钮</div>
      </PermissionGuard>
    );

    // 应该显示 children
    expect(screen.getByText('创建用户按钮')).toBeInTheDocument();
  });

  it('应该在无权限时渲染 fallback', () => {
    // 设置用户没有 user:delete 权限
    setMockUser(mockUsers.user); // user 没有 user:delete

    render(
      <PermissionGuard permissions={['user:delete']} fallback={<div>无权限</div>}>
        <div>删除用户按钮</div>
      </PermissionGuard>
    );

    // 应该显示 fallback
    expect(screen.getByText('无权限')).toBeInTheDocument();
    // 不应该显示 children
    expect(screen.queryByText('删除用户按钮')).not.toBeInTheDocument();
  });

  it('应该在无权限且无 fallback 时不渲染任何内容', () => {
    setMockUser(mockUsers.user); // user 没有 user:delete

    const { container } = render(
      <PermissionGuard permissions={['user:delete']}>
        <div>删除用户按钮</div>
      </PermissionGuard>
    );

    // 不应该显示 children
    expect(screen.queryByText('删除用户按钮')).not.toBeInTheDocument();
    // 容器应该是空的
    expect(container.textContent).toBe('');
  });

  it('超级管理员应该自动通过所有权限检查', () => {
    setMockUser(mockUsers.superAdmin);

    render(
      <PermissionGuard permissions={['any:random:permission']}>
        <div>受保护内容</div>
      </PermissionGuard>
    );

    // 超级管理员应该能看到任何内容
    expect(screen.getByText('受保护内容')).toBeInTheDocument();
  });

  it('应该支持 OR 逻辑（拥有任一权限即可）', () => {
    setMockUser(mockUsers.admin); // admin 有 user:create 但没有 user:delete

    render(
      <PermissionGuard permissions={['user:create', 'user:delete']}>
        <div>用户操作按钮</div>
      </PermissionGuard>
    );

    // 拥有 user:create，应该显示
    expect(screen.getByText('用户操作按钮')).toBeInTheDocument();
  });

  it('应该在用户未登录时隐藏内容', () => {
    // 不设置用户（未登录）
    render(
      <PermissionGuard permissions={['user:create']} fallback={<div>请登录</div>}>
        <div>创建用户按钮</div>
      </PermissionGuard>
    );

    // 应该显示 fallback
    expect(screen.getByText('请登录')).toBeInTheDocument();
    // 不应该显示 children
    expect(screen.queryByText('创建用户按钮')).not.toBeInTheDocument();
  });

  it('应该在用户无任何权限时隐藏内容', () => {
    setMockUser(mockUsers.guest); // guest 没有任何权限

    render(
      <PermissionGuard permissions={['user:create']}>
        <div>创建用户按钮</div>
      </PermissionGuard>
    );

    // 不应该显示 children
    expect(screen.queryByText('创建用户按钮')).not.toBeInTheDocument();
  });

  it('应该正确处理多个权限的 OR 逻辑', () => {
    setMockUser(mockUsers.user); // user 只有 user:read 和 role:read

    // 测试1：拥有其中一个权限（user:read）
    const { rerender } = render(
      <PermissionGuard permissions={['user:read', 'user:delete']}>
        <div>用户操作</div>
      </PermissionGuard>
    );
    expect(screen.getByText('用户操作')).toBeInTheDocument();

    // 测试2：不拥有任何所需权限
    rerender(
      <PermissionGuard permissions={['user:create', 'user:delete']}>
        <div>用户操作</div>
      </PermissionGuard>
    );
    expect(screen.queryByText('用户操作')).not.toBeInTheDocument();
  });
});
