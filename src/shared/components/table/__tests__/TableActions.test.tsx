import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableActions } from '../TableActions';
import { setMockUser, clearMockUser, mockUsers } from '@/test/test-utils';

type Action = {
  type?: 'button';
  label: string;
  onClick: () => void;
  permission?: string | string[];
  tooltip?: string;
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
};

describe('TableActions 组件', () => {
  beforeEach(() => {
    clearMockUser();
  });

  describe('按钮渲染', () => {
    it('应该渲染单个按钮', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [{ label: '编辑', onClick: vi.fn() }];

      render(<TableActions actions={actions} />);

      expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
    });

    it('应该渲染多个按钮', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn() },
        { label: '查看', onClick: vi.fn() },
        { label: '删除', onClick: vi.fn() },
      ];

      render(<TableActions actions={actions} />);

      expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /查看/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /删除/ })).toBeInTheDocument();
    });

    it('应该为危险操作添加特殊样式', () => {
      setMockUser(mockUsers.admin);

      render(<TableActions actions={[{ label: '删除', onClick: vi.fn(), danger: true }]} />);

      expect(screen.getByRole('button', { name: /删除/ })).toHaveClass('ant-btn-dangerous');
    });

    it('应该支持禁用状态', () => {
      setMockUser(mockUsers.admin);

      render(<TableActions actions={[{ label: '编辑', onClick: vi.fn(), disabled: true }]} />);

      expect(screen.getByRole('button', { name: /编辑/ })).toBeDisabled();
    });

    it('应该支持加载状态', () => {
      setMockUser(mockUsers.admin);

      render(<TableActions actions={[{ label: '保存', onClick: vi.fn(), loading: true }]} />);

      expect(screen.getByRole('button', { name: /保存/ })).toBeInTheDocument();
    });
  });

  describe('点击事件', () => {
    it('点击按钮应该触发 onClick 回调', async () => {
      setMockUser(mockUsers.admin);
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<TableActions actions={[{ label: '编辑', onClick: handleClick }]} />);

      await user.click(screen.getByRole('button', { name: /编辑/ }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('禁用的按钮不应该触发点击事件', async () => {
      setMockUser(mockUsers.admin);
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<TableActions actions={[{ label: '编辑', onClick: handleClick, disabled: true }]} />);

      await user.click(screen.getByRole('button', { name: /编辑/ }));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('权限控制', () => {
    it('应该只显示有权限的操作', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn(), permission: 'user:update' },
        { label: '删除', onClick: vi.fn(), permission: 'user:delete' },
      ];

      render(<TableActions actions={actions} />);

      expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /删除/ })).not.toBeInTheDocument();
    });

    it('应该支持多个权限的 OR 逻辑', () => {
      setMockUser(mockUsers.admin);

      render(
        <TableActions
          actions={[
            {
              label: '管理',
              onClick: vi.fn(),
              permission: ['user:delete', 'user:update'],
            },
          ]}
        />
      );

      expect(screen.getByRole('button', { name: /管理/ })).toBeInTheDocument();
    });

    it('超级管理员应该看到所有操作', () => {
      setMockUser(mockUsers.superAdmin);

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn(), permission: 'any:permission' },
        { label: '删除', onClick: vi.fn(), permission: 'another:permission' },
      ];

      render(<TableActions actions={actions} />);

      expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /删除/ })).toBeInTheDocument();
    });
  });

  describe('折叠菜单', () => {
    it('操作数量 <= maxVisible 时不应该折叠', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn() },
        { label: '查看', onClick: vi.fn() },
        { label: '删除', onClick: vi.fn() },
      ];

      render(<TableActions actions={actions} maxVisible={3} />);

      expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /查看/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /删除/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /更多/ })).not.toBeInTheDocument();
    });

    it('操作数量 > maxVisible 时应该折叠', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn() },
        { label: '查看', onClick: vi.fn() },
        { label: '复制', onClick: vi.fn() },
        { label: '删除', onClick: vi.fn() },
      ];

      render(<TableActions actions={actions} maxVisible={3} />);

      expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /查看/ })).toBeInTheDocument();
      expect(screen.getByLabelText(/more/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /复制/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /删除/ })).not.toBeInTheDocument();
    });

    it('点击更多按钮应该展开下拉菜单', async () => {
      setMockUser(mockUsers.admin);
      const user = userEvent.setup();

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn() },
        { label: '查看', onClick: vi.fn() },
        { label: '复制', onClick: vi.fn() },
        { label: '删除', onClick: vi.fn() },
      ];

      render(<TableActions actions={actions} maxVisible={2} />);

      await user.click(screen.getByLabelText(/more/i));

      expect(await screen.findByText('复制')).toBeInTheDocument();
      expect(await screen.findByText('删除')).toBeInTheDocument();
    });
  });

  describe('边界情况', () => {
    it('应该处理空操作数组', () => {
      setMockUser(mockUsers.admin);

      render(<TableActions actions={[]} />);

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('应该处理所有操作都无权限的情况', () => {
      setMockUser(mockUsers.guest);

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn(), permission: 'user:update' },
        { label: '删除', onClick: vi.fn(), permission: 'user:delete' },
      ];

      render(<TableActions actions={actions} />);

      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /编辑/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /删除/ })).not.toBeInTheDocument();
    });

    it('应该处理未登录用户', () => {
      render(
        <TableActions actions={[{ label: '编辑', onClick: vi.fn(), permission: 'user:update' }]} />
      );

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('应该处理 maxVisible=1 的情况', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn() },
        { label: '删除', onClick: vi.fn() },
      ];

      render(<TableActions actions={actions} maxVisible={1} />);

      expect(screen.queryByRole('button', { name: /^编辑$/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^删除$/ })).not.toBeInTheDocument();
      expect(screen.getByLabelText(/more/i)).toBeInTheDocument();
    });
  });
});
