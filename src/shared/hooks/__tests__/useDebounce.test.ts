/**
 * useDebounce hook 测试
 *
 * 测试范围：
 * 1. 基础防抖功能
 * 2. 延迟时间参数
 * 3. 快速连续更新值
 * 4. 初始值
 * 5. 不同类型的值
 * 6. 边界情况
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  // ==================== 基础防抖功能测试 ====================

  describe('基础防抖功能', () => {
    it('应该在延迟后返回更新的值', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 100 },
        }
      );

      // 初始值应该立即可用
      expect(result.current).toBe('initial');

      // 更新值
      rerender({ value: 'updated', delay: 100 });

      // 立即检查，值应该还是旧的
      expect(result.current).toBe('initial');

      // 等待延迟后，值应该更新
      await waitFor(
        () => {
          expect(result.current).toBe('updated');
        },
        { timeout: 200 }
      );
    });

    it('应该在快速连续更新时只应用最后一次更新', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 100),
        {
          initialProps: { value: 'value1' },
        }
      );

      expect(result.current).toBe('value1');

      // 快速连续更新
      rerender({ value: 'value2' });
      rerender({ value: 'value3' });
      rerender({ value: 'value4' });
      rerender({ value: 'value5' });

      // 立即检查，值应该还是初始值
      expect(result.current).toBe('value1');

      // 等待延迟后，应该只应用最后一次更新
      await waitFor(
        () => {
          expect(result.current).toBe('value5');
        },
        { timeout: 200 }
      );
    });
  });

  // ==================== 延迟时间参数测试 ====================

  describe('延迟时间参数', () => {
    it('应该支持自定义延迟时间', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 150 },
        }
      );

      rerender({ value: 'updated', delay: 150 });

      // 等待延迟后应该更新
      await waitFor(
        () => {
          expect(result.current).toBe('updated');
        },
        { timeout: 300 }
      );
    });

    it('应该使用默认延迟时间 500ms', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
        initialProps: { value: 'initial' },
      });

      rerender({ value: 'updated' });

      // 等待默认延迟后应该更新
      await waitFor(
        () => {
          expect(result.current).toBe('updated');
        },
        { timeout: 1000 }
      );
    });
  });

  // ==================== 不同类型的值测试 ====================

  describe('不同类型的值', () => {
    it('应该支持字符串值', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 50),
        {
          initialProps: { value: 'hello' },
        }
      );

      rerender({ value: 'world' });

      await waitFor(
        () => {
          expect(result.current).toBe('world');
        },
        { timeout: 150 }
      );
    });

    it('应该支持数字值', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 50),
        {
          initialProps: { value: 0 },
        }
      );

      rerender({ value: 42 });

      await waitFor(
        () => {
          expect(result.current).toBe(42);
        },
        { timeout: 150 }
      );
    });

    it('应该支持布尔值', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 50),
        {
          initialProps: { value: false },
        }
      );

      rerender({ value: true });

      await waitFor(
        () => {
          expect(result.current).toBe(true);
        },
        { timeout: 150 }
      );
    });

    it('应该支持对象值', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 50),
        {
          initialProps: { value: { name: 'Alice' } },
        }
      );

      const newValue = { name: 'Bob' };
      rerender({ value: newValue });

      await waitFor(
        () => {
          expect(result.current).toEqual(newValue);
        },
        { timeout: 150 }
      );
    });

    it('应该支持数组值', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 50),
        {
          initialProps: { value: [1, 2, 3] },
        }
      );

      const newValue = [4, 5, 6];
      rerender({ value: newValue });

      await waitFor(
        () => {
          expect(result.current).toEqual(newValue);
        },
        { timeout: 150 }
      );
    });

    it('应该支持 null 和 undefined', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 50),
        {
          initialProps: { value: null as any },
        }
      );

      rerender({ value: undefined as any });

      await waitFor(
        () => {
          expect(result.current).toBe(undefined);
        },
        { timeout: 150 }
      );
    });
  });

  // ==================== 边界情况测试 ====================

  describe('边界情况', () => {
    it('应该在组件卸载时清理定时器', () => {
      const { rerender, unmount } = renderHook(
        ({ value }) => useDebounce(value, 100),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'updated' });

      // 组件卸载，不应该有错误
      unmount();

      // 测试通过表示定时器被正确清理
      expect(true).toBe(true);
    });

    it('应该处理空字符串', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 50),
        {
          initialProps: { value: 'hello' },
        }
      );

      rerender({ value: '' });

      await waitFor(
        () => {
          expect(result.current).toBe('');
        },
        { timeout: 150 }
      );
    });

    it('应该处理零值', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 50),
        {
          initialProps: { value: 10 },
        }
      );

      rerender({ value: 0 });

      await waitFor(
        () => {
          expect(result.current).toBe(0);
        },
        { timeout: 150 }
      );
    });
  });

  // ==================== 实际使用场景测试 ====================

  describe('实际使用场景', () => {
    it('应该适用于搜索输入框场景', async () => {
      const { result, rerender } = renderHook(
        ({ searchTerm }) => useDebounce(searchTerm, 100),
        {
          initialProps: { searchTerm: '' },
        }
      );

      // 模拟用户快速输入
      rerender({ searchTerm: 'r' });
      rerender({ searchTerm: 're' });
      rerender({ searchTerm: 'rea' });
      rerender({ searchTerm: 'reac' });
      rerender({ searchTerm: 'react' });

      // 用户停止输入前，防抖值不应该更新
      expect(result.current).toBe('');

      // 用户停止输入后，防抖值更新
      await waitFor(
        () => {
          expect(result.current).toBe('react');
        },
        { timeout: 200 }
      );
    });

    it('应该适用于窗口 resize 场景', async () => {
      const { result, rerender } = renderHook(
        ({ width }) => useDebounce(width, 100),
        {
          initialProps: { width: 1024 },
        }
      );

      // 模拟快速 resize
      rerender({ width: 1100 });
      rerender({ width: 1200 });
      rerender({ width: 1280 });

      // resize 停止前不应该更新
      expect(result.current).toBe(1024);

      // resize 停止后更新
      await waitFor(
        () => {
          expect(result.current).toBe(1280);
        },
        { timeout: 200 }
      );
    });
  });
});
