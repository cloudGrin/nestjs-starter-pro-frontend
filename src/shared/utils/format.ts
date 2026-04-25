/**
 * 格式化工具
 *
 * 包含当前页面实际使用的日期格式化函数
 */
import dayjs from 'dayjs';

/**
 * 日期格式化
 */
export const formatDate = {
  /** 完整日期时间：2025-10-30 12:30:45 */
  full: (date: string | Date | null | undefined): string => {
    if (!date) return '-';
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  },

  /** 日期：2025-10-30 */
  date: (date: string | Date | null | undefined): string => {
    if (!date) return '-';
    return dayjs(date).format('YYYY-MM-DD');
  },

  /** 时间：12:30:45 */
  time: (date: string | Date | null | undefined): string => {
    if (!date) return '-';
    return dayjs(date).format('HH:mm:ss');
  },

  /** 短时间：12:30 */
  shortTime: (date: string | Date | null | undefined): string => {
    if (!date) return '-';
    return dayjs(date).format('HH:mm');
  },

  /** 相对时间：3分钟前、2小时前、5天前 */
  relative: (date: string | Date | null | undefined): string => {
    if (!date) return '-';
    const now = dayjs();
    const target = dayjs(date);
    const diff = now.diff(target, 'second');

    if (diff < 0) return '刚刚'; // 未来时间
    if (diff < 10) return '刚刚'; // 10秒内显示"刚刚"
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;

    return formatDate.date(date);
  },

  /** 友好格式：今天 12:30、昨天 15:45、2025-10-28 */
  friendly: (date: string | Date | null | undefined): string => {
    if (!date) return '-';
    const now = dayjs();
    const target = dayjs(date);
    const diffDays = now.diff(target, 'day');

    if (diffDays === 0) return `今天 ${target.format('HH:mm')}`;
    if (diffDays === 1) return `昨天 ${target.format('HH:mm')}`;
    if (diffDays < 7) return `${diffDays}天前 ${target.format('HH:mm')}`;

    return target.format('YYYY-MM-DD HH:mm');
  },
};
