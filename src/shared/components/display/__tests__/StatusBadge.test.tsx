/**
 * StatusBadge 组件测试
 *
 * 测试范围：
 * 1. 基础渲染（5种状态类型）
 * 2. 图标显示（默认圆点、隐藏图标、自定义图标）
 * 3. 深色模式支持
 * 4. 样式
 * 5. 边界情况
 */
import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { StatusBadge } from '../StatusBadge';
import { StarOutlined } from '@ant-design/icons';
import { useThemeStore } from '@/shared/stores';

// 测试辅助函数
const expectHasClass = (element: HTMLElement, className: string) => {
  expect(element.className).toContain(className);
};

describe('StatusBadge 组件', () => {
  beforeEach(() => {
    // 每次测试前重置主题为浅色模式
    useThemeStore.getState().setTheme('light');
  });

  // ==================== 基础渲染测试 ====================

  describe('基础渲染', () => {
    it('应该渲染 success 状态徽章', () => {
      render(<StatusBadge status="success" text="成功" />);

      const badge = screen.getByText('成功');
      expect(badge).toBeInTheDocument();
      expectHasClass(badge, 'bg-green-50');
      expectHasClass(badge, 'text-green-700');
    });

    it('应该渲染 error 状态徽章', () => {
      render(<StatusBadge status="error" text="失败" />);

      const badge = screen.getByText('失败');
      expect(badge).toBeInTheDocument();
      expectHasClass(badge, 'bg-red-50');
      expectHasClass(badge, 'text-red-700');
    });

    it('应该渲染 warning 状态徽章', () => {
      render(<StatusBadge status="warning" text="警告" />);

      const badge = screen.getByText('警告');
      expect(badge).toBeInTheDocument();
      expectHasClass(badge, 'bg-yellow-50');
      expectHasClass(badge, 'text-yellow-700');
    });

    it('应该渲染 processing 状态徽章', () => {
      render(<StatusBadge status="processing" text="进行中" />);

      const badge = screen.getByText('进行中');
      expect(badge).toBeInTheDocument();
      expectHasClass(badge, 'bg-blue-50');
      expectHasClass(badge, 'text-blue-700');
    });

    it('应该渲染 default 状态徽章', () => {
      render(<StatusBadge status="default" text="默认" />);

      const badge = screen.getByText('默认');
      expect(badge).toBeInTheDocument();
      expectHasClass(badge, 'bg-gray-50');
      expectHasClass(badge, 'text-gray-700');
    });
  });

  // ==================== 图标显示测试 ====================

  describe('图标显示', () => {
    it('应该默认显示圆点指示器（showIcon=true）', () => {
      const { container } = render(<StatusBadge status="success" text="成功" />);

      const dot = container.querySelector('.rounded-full.bg-green-500');
      expect(dot).toBeInTheDocument();
      expectHasClass(dot as HTMLElement, 'w-2');
      expectHasClass(dot as HTMLElement, 'h-2');
      expectHasClass(dot as HTMLElement, 'rounded-full');
    });

    it('应该在 showIcon=false 时隐藏圆点', () => {
      const { container } = render(<StatusBadge status="success" text="成功" showIcon={false} />);

      const dot = container.querySelector('.animate-pulse');
      expect(dot).not.toBeInTheDocument();
    });

    it('应该支持自定义图标', () => {
      const { container } = render(
        <StatusBadge status="success" text="成功" icon={<StarOutlined data-testid="star-icon" />} />
      );

      const starIcon = screen.getByTestId('star-icon');
      expect(starIcon).toBeInTheDocument();

      // 自定义图标时不显示圆点
      const dot = container.querySelector('.w-2.h-2.rounded-full');
      expect(dot).not.toBeInTheDocument();
    });

    it('应该在自定义图标存在时优先显示自定义图标', () => {
      const { container } = render(
        <StatusBadge
          status="success"
          text="成功"
          icon={<StarOutlined data-testid="star-icon" />}
          showIcon={true}
        />
      );

      const starIcon = screen.getByTestId('star-icon');
      expect(starIcon).toBeInTheDocument();

      const dot = container.querySelector('.w-2.h-2.rounded-full');
      expect(dot).not.toBeInTheDocument();
    });
  });

  // ==================== 深色模式测试 ====================

  describe('深色模式', () => {
    it('应该在浅色模式下使用浅色配色', () => {
      useThemeStore.getState().setTheme('light');

      render(<StatusBadge status="success" text="成功" />);

      const badge = screen.getByText('成功');
      expectHasClass(badge, 'bg-green-50');
      expectHasClass(badge, 'text-green-700');
    });

    it('应该在深色模式下使用深色配色', () => {
      useThemeStore.getState().setTheme('dark');

      render(<StatusBadge status="success" text="成功" />);

      const badge = screen.getByText('成功');
      expectHasClass(badge, 'bg-green-900/30');
      expectHasClass(badge, 'text-green-300');
    });

    it('应该在切换主题后更新样式', () => {
      const { rerender } = render(<StatusBadge status="error" text="失败" />);

      let badge = screen.getByText('失败');
      expectHasClass(badge, 'bg-red-50');

      // 切换到深色模式
      act(() => {
        useThemeStore.getState().setTheme('dark');
      });
      rerender(<StatusBadge status="error" text="失败" />);

      badge = screen.getByText('失败');
      expectHasClass(badge, 'bg-red-900/30');
    });
  });

  // ==================== 样式测试 ====================

  describe('样式', () => {
    it('应该包含正确的基础样式类', () => {
      render(<StatusBadge status="success" text="成功" />);

      const badge = screen.getByText('成功');
      expectHasClass(badge, 'inline-flex');
      expectHasClass(badge, 'items-center');
      expectHasClass(badge, 'gap-2');
      expectHasClass(badge, 'px-3');
      expectHasClass(badge, 'py-1.5');
      expectHasClass(badge, 'rounded-full');
      expectHasClass(badge, 'text-xs');
      expectHasClass(badge, 'font-medium');
      expectHasClass(badge, 'whitespace-nowrap');
    });

    it('应该包含状态过渡样式', () => {
      render(<StatusBadge status="success" text="成功" />);

      const badge = screen.getByText('成功');
      expectHasClass(badge, 'transition-all');
    });

    it('应该包含状态圆点', () => {
      const { container } = render(<StatusBadge status="processing" text="进行中" />);

      const dot = container.querySelector('.bg-blue-500');
      expect(dot).toBeInTheDocument();
      expectHasClass(dot as HTMLElement, 'bg-blue-500');
    });
  });

  // ==================== 边界情况测试 ====================

  describe('边界情况', () => {
    it('应该支持空文本', () => {
      render(<StatusBadge status="success" text="" />);

      const badge = document.querySelector('.inline-flex');
      expect(badge).toBeInTheDocument();
      // 验证有圆点但无文本
      const dot = document.querySelector('.w-2.h-2.rounded-full');
      expect(dot).toBeInTheDocument();
    });

    it('应该支持超长文本（whitespace-nowrap）', () => {
      const longText = '这是一个非常非常非常非常非常长的状态文本内容';
      render(<StatusBadge status="success" text={longText} />);

      const badge = screen.getByText(longText);
      expect(badge).toBeInTheDocument();
      expectHasClass(badge, 'whitespace-nowrap');
    });
  });

  // ==================== 组合使用测试 ====================

  describe('组合使用', () => {
    it('应该支持多个徽章并排显示', () => {
      render(
        <div>
          <StatusBadge status="success" text="成功" />
          <StatusBadge status="error" text="失败" />
          <StatusBadge status="warning" text="警告" />
        </div>
      );

      expect(screen.getByText('成功')).toBeInTheDocument();
      expect(screen.getByText('失败')).toBeInTheDocument();
      expect(screen.getByText('警告')).toBeInTheDocument();
    });

    it('应该支持在表格中使用', () => {
      const users = [
        { id: 1, name: '张三', isActive: true },
        { id: 2, name: '李四', isActive: false },
      ];

      render(
        <table>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>
                  <StatusBadge
                    status={user.isActive ? 'success' : 'error'}
                    text={user.isActive ? '已启用' : '已禁用'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );

      expect(screen.getByText('已启用')).toBeInTheDocument();
      expect(screen.getByText('已禁用')).toBeInTheDocument();
    });
  });
});
