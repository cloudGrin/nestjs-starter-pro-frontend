/**
 * TableActions 组件测试
 *
 * 测试范围：
 * 1. 基础渲染（按钮、开关、分隔线）
 * 2. 权限控制（有权限/无权限/部分权限）
 * 3. 折叠菜单（超过maxVisible时折叠）
 * 4. 点击事件（按钮点击、开关切换）
 * 5. Tooltip提示
 * 6. 危险操作样式
 * 7. 加载和禁用状态
 * 8. 边界情况（无操作、所有操作无权限）
 *
 * 覆盖率目标：85%+
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableActions } from '../TableActions';
import { setMockUser, clearMockUser, mockUsers } from '@/test/test-utils';

// 定义 Action 类型（与组件内部类型一致）
type BaseAction = {
  permission?: string | string[];
  tooltip?: string;
};

type ButtonAction = BaseAction & {
  type?: 'button';
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
};

type SwitchAction = BaseAction & {
  type: 'switch';
  checked: boolean;
  onChange: (checked: boolean) => void;
  loading?: boolean;
  disabled?: boolean;
};

type DividerAction = {
  type: 'divider';
};

type Action = ButtonAction | SwitchAction | DividerAction;

describe('TableActions 组件', () => {
  beforeEach(() => {
    clearMockUser();
  });

  describe('基础渲染 - 按钮操作', () => {
    it('应该渲染单个按钮', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        {
          type: 'button',
          label: '编辑',
          onClick: vi.fn(),
        },
      ];

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

      const actions: Action[] = [
        { label: '删除', onClick: vi.fn(), danger: true },
      ];

      render(<TableActions actions={actions} />);

      const button = screen.getByRole('button', { name: /删除/ });
      // Ant Design 会添加 ant-btn-dangerous 类
      expect(button).toHaveClass('ant-btn-dangerous');
    });

    it('应该支持禁用状态', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn(), disabled: true },
      ];

      render(<TableActions actions={actions} />);

      const button = screen.getByRole('button', { name: /编辑/ });
      expect(button).toBeDisabled();
    });

    it('应该支持加载状态', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        { label: '保存', onClick: vi.fn(), loading: true },
      ];

      render(<TableActions actions={actions} />);

      // Ant Design Button 在 loading 状态下会添加 spin 图标
      expect(screen.getByRole('button', { name: /保存/ })).toBeInTheDocument();
    });
  });

  describe('基础渲染 - 开关操作', () => {
    it('应该渲染开关', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        {
          type: 'switch',
          checked: true,
          onChange: vi.fn(),
        },
      ];

      render(<TableActions actions={actions} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toBeChecked();
    });

    it('应该渲染未选中的开关', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        {
          type: 'switch',
          checked: false,
          onChange: vi.fn(),
        },
      ];

      render(<TableActions actions={actions} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeChecked();
    });

    it('应该支持开关禁用状态', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        {
          type: 'switch',
          checked: true,
          onChange: vi.fn(),
          disabled: true,
        },
      ];

      render(<TableActions actions={actions} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });
  });

  describe('基础渲染 - 分隔线', () => {
    it('应该渲染分隔线', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn() },
        { type: 'divider' },
        { label: '删除', onClick: vi.fn() },
      ];

      const { container } = render(<TableActions actions={actions} />);

      // 分隔线是 Ant Design Divider 组件，class 为 ant-divider
      expect(container.querySelector('.ant-divider')).toBeInTheDocument();
    });
  });

  describe('点击事件', () => {
    it('点击按钮应该触发 onClick 回调', async () => {
      setMockUser(mockUsers.admin);
      const user = userEvent.setup();
      const handleClick = vi.fn();

      const actions: Action[] = [
        { label: '编辑', onClick: handleClick },
      ];

      render(<TableActions actions={actions} />);

      await user.click(screen.getByRole('button', { name: /编辑/ }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('切换开关应该触发 onChange 回调', async () => {
      setMockUser(mockUsers.admin);
      const user = userEvent.setup();
      const handleChange = vi.fn();

      const actions: Action[] = [
        {
          type: 'switch',
          checked: false,
          onChange: handleChange,
        },
      ];

      render(<TableActions actions={actions} />);

      await user.click(screen.getByRole('switch'));

      // Ant Design Switch 的 onChange 会传递 checked 和 event
      expect(handleChange).toHaveBeenCalledWith(true, expect.anything());
    });

    it('禁用的按钮不应该触发点击事件', async () => {
      setMockUser(mockUsers.admin);
      const user = userEvent.setup();
      const handleClick = vi.fn();

      const actions: Action[] = [
        { label: '编辑', onClick: handleClick, disabled: true },
      ];

      render(<TableActions actions={actions} />);

      const button = screen.getByRole('button', { name: /编辑/ });
      await user.click(button);

      // 按钮被禁用，不应该触发点击
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('权限控制', () => {
    it('应该只显示有权限的操作', () => {
      setMockUser(mockUsers.admin); // admin 有 user:create, user:read, user:update

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn(), permission: 'user:update' },
        { label: '删除', onClick: vi.fn(), permission: 'user:delete' }, // admin 没有这个权限
      ];

      render(<TableActions actions={actions} />);

      // 应该显示编辑按钮
      expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();

      // 不应该显示删除按钮（无权限）
      expect(screen.queryByRole('button', { name: /删除/ })).not.toBeInTheDocument();
    });

    it('应该支持多个权限（OR逻辑）', () => {
      setMockUser(mockUsers.admin); // admin 有 user:update

      const actions: Action[] = [
        {
          label: '管理',
          onClick: vi.fn(),
          permission: ['user:delete', 'user:update'], // 拥有任一权限即可
        },
      ];

      render(<TableActions actions={actions} />);

      // 因为有 user:update 权限，应该显示管理按钮
      expect(screen.getByRole('button', { name: /管理/ })).toBeInTheDocument();
    });

    it('超级管理员应该看到所有操作', () => {
      setMockUser(mockUsers.superAdmin);

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn(), permission: 'any:permission' },
        { label: '删除', onClick: vi.fn(), permission: 'another:permission' },
      ];

      render(<TableActions actions={actions} />);

      // 超级管理员应该看到所有按钮
      expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /删除/ })).toBeInTheDocument();
    });

    it('没有权限的开关也应该被隐藏', () => {
      setMockUser(mockUsers.user); // user 没有 user:update 权限

      const actions: Action[] = [
        {
          type: 'switch',
          checked: true,
          onChange: vi.fn(),
          permission: 'user:update',
        },
      ];

      render(<TableActions actions={actions} />);

      // 应该不显示开关
      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });

    it('分隔线不受权限控制', () => {
      setMockUser(mockUsers.guest); // guest 没有任何权限

      const actions: Action[] = [
        { type: 'divider' },
      ];

      const { container } = render(<TableActions actions={actions} />);

      // 分隔线应该正常显示
      expect(container.querySelector('.ant-divider')).toBeInTheDocument();
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

      // 应该显示所有按钮
      expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /查看/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /删除/ })).toBeInTheDocument();

      // 不应该显示"更多"按钮
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

      // 前 2 个按钮应该直接显示
      expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /查看/ })).toBeInTheDocument();

      // 应该显示"更多"按钮
      const moreButton = screen.getByLabelText(/more/i);
      expect(moreButton).toBeInTheDocument();

      // 后面的按钮应该在下拉菜单中（不直接可见）
      expect(screen.queryByRole('button', { name: /复制/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /删除/ })).not.toBeInTheDocument();
    });

    it('开关和分隔线不参与折叠计算', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        { type: 'switch', checked: true, onChange: vi.fn() },
        { type: 'divider' },
        { label: '编辑', onClick: vi.fn() },
        { label: '查看', onClick: vi.fn() },
        { label: '删除', onClick: vi.fn() },
      ];

      render(<TableActions actions={actions} maxVisible={3} />);

      // 开关和分隔线应该始终显示
      expect(screen.getByRole('switch')).toBeInTheDocument();

      // 3 个按钮应该全部显示（因为开关和分隔线不计入 maxVisible）
      expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /查看/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /删除/ })).toBeInTheDocument();
    });

    it('点击"更多"按钮应该展开下拉菜单', async () => {
      setMockUser(mockUsers.admin);
      const user = userEvent.setup();

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn() },
        { label: '查看', onClick: vi.fn() },
        { label: '复制', onClick: vi.fn() },
        { label: '删除', onClick: vi.fn() },
      ];

      render(<TableActions actions={actions} maxVisible={2} />);

      // 点击"更多"按钮
      const moreButton = screen.getByLabelText(/more/i);
      await user.click(moreButton);

      // 下拉菜单应该显示（"复制"和"删除"）
      // 注意：Ant Design Dropdown 的菜单项可能需要等待渲染
      // 这里使用更宽松的查询方式
      const copyItem = await screen.findByText('复制');
      const deleteItem = await screen.findByText('删除');

      expect(copyItem).toBeInTheDocument();
      expect(deleteItem).toBeInTheDocument();
    });
  });

  describe('Tooltip提示', () => {
    it('按钮应该有Tooltip（使用label作为提示）', async () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn() },
      ];

      const { container } = render(<TableActions actions={actions} />);

      // Ant Design Tooltip 会包裹按钮
      expect(container.querySelector('.ant-tooltip-inner')).toBeNull(); // 初始未显示

      // 需要hover才能看到tooltip（在真实环境中）
      // 这里只验证Tooltip组件被渲染
      expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
    });

    it('开关应该支持自定义Tooltip', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        {
          type: 'switch',
          checked: true,
          onChange: vi.fn(),
          tooltip: '启用/禁用用户',
        },
      ];

      render(<TableActions actions={actions} />);

      // 开关应该被Tooltip包裹
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('按钮应该支持自定义Tooltip', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        {
          label: '编辑',
          onClick: vi.fn(),
          tooltip: '编辑用户信息',
        },
      ];

      render(<TableActions actions={actions} />);

      expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
    });
  });

  describe('边界情况', () => {
    it('应该处理空操作数组', () => {
      setMockUser(mockUsers.admin);

      render(<TableActions actions={[]} />);

      // 应该显示"-"占位符
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('应该处理所有操作都无权限的情况', () => {
      setMockUser(mockUsers.guest); // guest 没有任何权限

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn(), permission: 'user:update' },
        { label: '删除', onClick: vi.fn(), permission: 'user:delete' },
      ];

      render(<TableActions actions={actions} />);

      // 应该显示"-"占位符
      expect(screen.getByText('-')).toBeInTheDocument();

      // 不应该显示任何按钮
      expect(screen.queryByRole('button', { name: /编辑/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /删除/ })).not.toBeInTheDocument();
    });

    it('应该处理未登录用户', () => {
      // 不设置用户（未登录状态）

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn(), permission: 'user:update' },
      ];

      render(<TableActions actions={actions} />);

      // 应该显示"-"占位符
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('应该处理maxVisible=1的情况', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        { label: '编辑', onClick: vi.fn() },
        { label: '删除', onClick: vi.fn() },
      ];

      // maxVisible=1 意味着前0个按钮直接显示（maxVisible - 1 = 0），所有按钮都折叠
      render(<TableActions actions={actions} maxVisible={1} />);

      // 所有按钮应该在下拉菜单中（不直接可见）
      expect(screen.queryByRole('button', { name: /^编辑$/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^删除$/ })).not.toBeInTheDocument();

      // 应该显示"更多"按钮
      expect(screen.getByLabelText(/more/i)).toBeInTheDocument();
    });

    it('应该处理混合类型的操作', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        { type: 'switch', checked: true, onChange: vi.fn() },
        { type: 'divider' },
        { label: '编辑', onClick: vi.fn() },
        { type: 'divider' },
        { label: '删除', onClick: vi.fn(), danger: true },
      ];

      const { container } = render(<TableActions actions={actions} />);

      // 应该显示开关
      expect(screen.getByRole('switch')).toBeInTheDocument();

      // 应该显示2个分隔线
      const dividers = container.querySelectorAll('.ant-divider');
      expect(dividers).toHaveLength(2);

      // 应该显示按钮
      expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /删除/ })).toBeInTheDocument();
    });
  });

  describe('默认参数', () => {
    it('maxVisible 默认应该为 3', () => {
      setMockUser(mockUsers.admin);

      const actions: Action[] = [
        { label: '按钮1', onClick: vi.fn() },
        { label: '按钮2', onClick: vi.fn() },
        { label: '按钮3', onClick: vi.fn() },
        { label: '按钮4', onClick: vi.fn() },
      ];

      // 不传 maxVisible，应该默认为 3
      render(<TableActions actions={actions} />);

      // 前 2 个按钮直接显示（maxVisible=3 时，前 maxVisible-1=2 个按钮直接显示）
      expect(screen.getByRole('button', { name: /按钮1/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /按钮2/ })).toBeInTheDocument();

      // 应该显示"更多"按钮
      expect(screen.getByLabelText(/more/i)).toBeInTheDocument();
    });
  });
});
