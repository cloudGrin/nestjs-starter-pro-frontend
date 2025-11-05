/**
 * EmptyState 组件单元测试
 *
 * 测试要点：
 * 1. 默认渲染
 * 2. 自定义文案渲染
 * 3. 操作按钮渲染
 * 4. 自定义插画渲染
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { EmptyState } from '../EmptyState';
import { Button } from 'antd';

// Mock themeStore to avoid window.matchMedia error during initialization
vi.mock('@/shared/stores/themeStore', () => ({
  useThemeStore: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  })),
}));

describe('EmptyState 组件', () => {
  it('应该渲染默认空状态', () => {
    renderWithProviders(<EmptyState />);

    // 只检查标题，默认没有描述
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('应该渲染自定义标题和描述', () => {
    renderWithProviders(
      <EmptyState
        title="搜索无结果"
        description="换个关键词试试吧"
      />
    );

    expect(screen.getByText('搜索无结果')).toBeInTheDocument();
    expect(screen.getByText('换个关键词试试吧')).toBeInTheDocument();
  });

  it('应该渲染操作按钮并响应点击', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <EmptyState
        title="暂无用户"
        description="快去创建一个吧"
        action={
          <Button type="primary" onClick={handleClick}>
            创建用户
          </Button>
        }
      />
    );

    const button = screen.getByRole('button', { name: '创建用户' });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('应该支持自定义插画尺寸', () => {
    renderWithProviders(<EmptyState illustrationSize={150} />);

    // 验证组件渲染成功
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('应该支持不显示描述', () => {
    renderWithProviders(<EmptyState title="空数据" />);

    expect(screen.getByText('空数据')).toBeInTheDocument();
    // 不应该有描述文字
    expect(screen.queryByText('还没有任何内容')).not.toBeInTheDocument();
  });
});
