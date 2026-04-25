/**
 * 格式化工具函数单元测试
 *
 * 测试要点：
 * 1. 日期格式化
 * 2. 边界情况处理
 */

import { describe, it, expect } from 'vitest';
import { formatDate } from '../format';

describe('formatDate - 日期格式化', () => {
  const testDate = new Date('2024-01-15 14:30:00');

  describe('full - 完整日期时间', () => {
    it('应该格式化为 YYYY-MM-DD HH:mm:ss', () => {
      expect(formatDate.full(testDate)).toBe('2024-01-15 14:30:00');
    });

    it('应该处理字符串输入', () => {
      expect(formatDate.full('2024-01-15 14:30:00')).toBe('2024-01-15 14:30:00');
    });

    it('应该处理 null 和 undefined', () => {
      expect(formatDate.full(null)).toBe('-');
      expect(formatDate.full(undefined)).toBe('-');
    });
  });

  describe('date - 仅日期', () => {
    it('应该格式化为 YYYY-MM-DD', () => {
      expect(formatDate.date(testDate)).toBe('2024-01-15');
    });
  });

  describe('relative - 相对时间', () => {
    it('应该返回相对时间描述', () => {
      // 使用30秒前的时间（超过10秒会显示"X秒前"）
      const past = new Date(Date.now() - 30 * 1000);
      const result = formatDate.relative(past);

      // 应该显示"30秒前"
      expect(result).toMatch(/秒|分钟|小时|天|月|年/);
    });

    it('应该在10秒内显示"刚刚"', () => {
      const now = new Date();
      const result = formatDate.relative(now);

      expect(result).toBe('刚刚');
    });
  });
});
