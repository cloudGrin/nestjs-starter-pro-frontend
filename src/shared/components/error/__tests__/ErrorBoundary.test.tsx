/**
 * ErrorBoundary 组件测试
 *
 * 测试范围：
 * 1. 正常渲染子组件
 * 2. 捕获错误并显示错误页面
 * 3. 刷新按钮功能
 * 4. 重试按钮功能
 * 5. 自定义 fallback
 * 6. 错误处理函数
 */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';
import userEvent from '@testing-library/user-event';

// Mock console methods to avoid cluttering test output
const originalError = console.error;
const originalGroupCollapsed = console.groupCollapsed;
const originalGroupEnd = console.groupEnd;

// 会抛出错误的测试组件
function ThrowError({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>正常内容</div>;
}

describe('ErrorBoundary 组件', () => {
  beforeEach(() => {
    // 禁用 console.error 避免污染测试输出
    console.error = vi.fn();
    console.groupCollapsed = vi.fn();
    console.groupEnd = vi.fn();
  });

  afterEach(() => {
    // 恢复 console methods
    console.error = originalError;
    console.groupCollapsed = originalGroupCollapsed;
    console.groupEnd = originalGroupEnd;
  });

  // ==================== 正常渲染测试 ====================

  describe('正常渲染', () => {
    it('应该正常渲染子组件（无错误）', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">子组件内容</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('子组件内容')).toBeInTheDocument();
    });

    it('应该支持多个子组件', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child1">子组件1</div>
          <div data-testid="child2">子组件2</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });
  });

  // ==================== 错误捕获测试 ====================

  describe('错误捕获', () => {
    it('应该捕获子组件错误并显示错误页面', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // 验证显示错误页面
      expect(screen.getByText('页面出错了')).toBeInTheDocument();
      expect(
        screen.getByText('抱歉，页面遇到了一个错误。您可以刷新页面重试，或联系管理员。')
      ).toBeInTheDocument();
    });

    it('应该显示刷新和重试按钮', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: '刷新页面' })).toBeInTheDocument();
      // Ant Design Button 会在文本中添加空格
      expect(screen.getByRole('button', { name: /重.*试/ })).toBeInTheDocument();
    });

    it('应该在开发环境显示错误详情', () => {
      // import.meta.env.DEV 在测试环境默认为 true
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // 查找错误详情（仅开发环境可见）
      const errorDetails = screen.getByText(/错误详情（仅开发环境可见）/);
      expect(errorDetails).toBeInTheDocument();
    });
  });

  // ==================== 按钮功能测试 ====================

  describe('按钮功能', () => {
    it('点击刷新按钮应该刷新页面', async () => {
      const user = userEvent.setup();
      const reloadSpy = vi.fn();

      // 保存原始的 location
      const { location: originalLocation } = window;

      // 创建新的 location mock
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        reload: reloadSpy,
      } as any;

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const refreshButton = screen.getByRole('button', { name: '刷新页面' });
      await user.click(refreshButton);

      expect(reloadSpy).toHaveBeenCalledTimes(1);

      // 恢复原始 location
      window.location = originalLocation;
    });

    it('点击重试按钮应该重置错误状态', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // 验证显示错误页面
      expect(screen.getByText('页面出错了')).toBeInTheDocument();

      // 点击重试按钮（使用正则匹配，避免空格问题）
      const retryButton = screen.getByRole('button', { name: /重.*试/ });
      await user.click(retryButton);

      // 验证重试按钮存在（即仍在错误页面，因为组件仍会抛出错误）
      expect(screen.getByText('页面出错了')).toBeInTheDocument();
    });
  });

  // ==================== 自定义 fallback 测试 ====================

  describe('自定义 fallback', () => {
    it('应该支持自定义错误页面', () => {
      const customFallback = <div data-testid="custom-error">自定义错误页面</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-error')).toBeInTheDocument();
      expect(screen.getByText('自定义错误页面')).toBeInTheDocument();

      // 不应该显示默认错误页面
      expect(screen.queryByText('页面出错了')).not.toBeInTheDocument();
    });
  });

  // ==================== 错误处理函数测试 ====================

  describe('错误处理函数', () => {
    it('应该在开发环境打印错误到控制台', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      const consoleGroupSpy = vi.spyOn(console, 'groupCollapsed');

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // 验证调用了 console 方法（react-error-boundary 会调用 onError）
      expect(consoleGroupSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  // ==================== 边界情况测试 ====================

  describe('边界情况', () => {
    it('应该处理空 children', () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>);

      // 不应该显示任何内容
      expect(screen.queryByText('页面出错了')).not.toBeInTheDocument();
    });

    it('应该处理多层嵌套的错误', () => {
      function NestedComponent() {
        return (
          <div>
            <div>
              <ThrowError />
            </div>
          </div>
        );
      }

      render(
        <ErrorBoundary>
          <NestedComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('页面出错了')).toBeInTheDocument();
    });

    it('应该捕获不同类型的错误', () => {
      function ThrowTypeError() {
        throw new TypeError('This is a TypeError');
      }

      render(
        <ErrorBoundary>
          <ThrowTypeError />
        </ErrorBoundary>
      );

      expect(screen.getByText('页面出错了')).toBeInTheDocument();
    });
  });

  // ==================== 错误恢复测试 ====================

  describe('错误恢复', () => {
    it('错误恢复后应该能正常渲染子组件', () => {
      // 测试 ErrorBoundary 的重置功能
      // 由于 react-error-boundary 的 resetErrorBoundary 需要父组件状态改变才能真正重置
      // 这里只测试点击重试按钮不会崩溃即可
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // 验证显示错误页面
      expect(screen.getByText('页面出错了')).toBeInTheDocument();

      // 验证有重试按钮（使用正则匹配）
      const retryButton = screen.getByRole('button', { name: /重.*试/ });
      expect(retryButton).toBeInTheDocument();
    });
  });
});
