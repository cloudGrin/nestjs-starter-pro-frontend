/**
 * 格式化工具函数单元测试
 *
 * 测试要点：
 * 1. 日期格式化
 * 2. 数字格式化
 * 3. 文本格式化
 * 4. 边界情况处理
 */

import { describe, it, expect } from 'vitest';
import { formatDate, formatNumber, formatText } from '../format';

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

describe('formatNumber - 数字格式化', () => {
  describe('thousands - 千分位', () => {
    it('应该添加千分位分隔符', () => {
      expect(formatNumber.thousands(1234567)).toBe('1,234,567');
      expect(formatNumber.thousands(1000)).toBe('1,000');
      expect(formatNumber.thousands(999)).toBe('999');
    });

    it('应该保留小数位', () => {
      expect(formatNumber.thousands(1234.56, 2)).toBe('1,234.56');
      expect(formatNumber.thousands(1234.567, 1)).toBe('1,234.6');
    });

    it('应该处理 0 和负数', () => {
      expect(formatNumber.thousands(0)).toBe('0');
      expect(formatNumber.thousands(-1234)).toBe('-1,234');
    });
  });

  describe('currency - 货币格式', () => {
    it('应该格式化为货币格式', () => {
      expect(formatNumber.currency(1234.56)).toBe('¥1,234.56');
      expect(formatNumber.currency(1000)).toBe('¥1,000.00');
    });

    it('应该支持自定义符号', () => {
      expect(formatNumber.currency(1234.56, '$')).toBe('$1,234.56');
    });
  });

  describe('percentage - 百分比', () => {
    it('应该格式化为百分比', () => {
      expect(formatNumber.percentage(0.1234)).toBe('12.34%');
      expect(formatNumber.percentage(0.5)).toBe('50.00%');
      expect(formatNumber.percentage(1)).toBe('100.00%');
    });

    it('应该支持自定义精度', () => {
      expect(formatNumber.percentage(0.1234, 0)).toBe('12%');
      expect(formatNumber.percentage(0.1234, 1)).toBe('12.3%');
    });
  });
});

describe('formatText - 文本格式化', () => {
  describe('truncate - 文本截断', () => {
    it('应该截断超长文本', () => {
      const longText = '这是一段很长的文本内容用于测试截断功能';
      // maxLength=10 包括省略号（...），所以是 7个字符 + "..."
      expect(formatText.truncate(longText, 10)).toBe('这是一段很长的...');
    });

    it('应该不截断短文本', () => {
      const shortText = '短文本';
      expect(formatText.truncate(shortText, 10)).toBe('短文本');
    });

    it('应该支持自定义省略符', () => {
      const longText = '这是一段很长的文本';
      // maxLength=5 包括省略号（…），所以是 4个字符 + "…"
      expect(formatText.truncate(longText, 5, '…')).toBe('这是一段…');
    });
  });

  describe('maskPhone - 手机号脱敏', () => {
    it('应该脱敏手机号', () => {
      expect(formatText.maskPhone('13800138000')).toBe('138****8000');
    });

    it('应该处理无效手机号', () => {
      expect(formatText.maskPhone('123')).toBe('123');
      expect(formatText.maskPhone(null)).toBe('');
    });
  });

  describe('maskEmail - 邮箱脱敏', () => {
    it('应该脱敏邮箱', () => {
      // 实现：保留前2个字符 + "***" + "@域名"
      expect(formatText.maskEmail('test@example.com')).toBe('te***@example.com');
      expect(formatText.maskEmail('user123@gmail.com')).toBe('us***@gmail.com');
    });

    it('应该处理无效邮箱', () => {
      expect(formatText.maskEmail('invalid')).toBe('invalid');
      expect(formatText.maskEmail(null)).toBe('');
    });
  });
});
