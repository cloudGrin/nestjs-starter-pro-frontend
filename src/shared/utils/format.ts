/**
 * 格式化工具
 *
 * 包含日期、数字、文件大小等常用格式化函数
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

/**
 * 数字格式化
 */
export const formatNumber = {
  /** 千分位：1,234,567.89 */
  thousands: (num: number | null | undefined, decimals?: number): string => {
    if (num === null || num === undefined) return '-';
    if (decimals !== undefined) {
      // 如果指定了小数位数，先四舍五入再格式化
      const factor = Math.pow(10, decimals);
      const rounded = Math.round(num * factor) / factor;
      return rounded.toLocaleString('zh-CN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    return num.toLocaleString('zh-CN');
  },

  /** 金额：¥1,234.56 */
  currency: (num: number | null | undefined, symbol: string = '¥'): string => {
    if (num === null || num === undefined) return '-';
    return `${symbol}${num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  /** 百分比：12.34% */
  percent: (num: number | null | undefined, precision: number = 2): string => {
    if (num === null || num === undefined) return '-';
    return `${(num * 100).toFixed(precision)}%`;
  },

  /** 百分比（percentage 是 percent 的别名） */
  percentage: (num: number | null | undefined, precision: number = 2): string => {
    return formatNumber.percent(num, precision);
  },

  /** 文件大小：1.23 MB */
  fileSize: (bytes: number | null | undefined): string => {
    if (bytes === null || bytes === undefined) return '-';
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  },

  /** 简化数字：1.2K、3.4M、5.6B */
  abbr: (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '-';
    if (num < 1000) return num.toString();

    const units = ['', 'K', 'M', 'B', 'T'];
    let size = num;
    let unitIndex = 0;

    while (size >= 1000 && unitIndex < units.length - 1) {
      size /= 1000;
      unitIndex++;
    }

    return `${size.toFixed(1)}${units[unitIndex]}`;
  },
};

/**
 * 文本格式化
 */
export const formatText = {
  /** 截断文本：Hello Wor... */
  truncate: (text: string | null | undefined, maxLength: number = 50, ellipsis: string = '...'): string => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    // 确保总长度（包括省略号）不超过 maxLength
    return `${text.substring(0, maxLength - ellipsis.length)}${ellipsis}`;
  },

  /** 隐藏手机号：138****1234 */
  maskPhone: (phone: string | null | undefined): string => {
    if (!phone) return '';
    // 如果不是有效手机号格式，直接返回原值
    if (!/^\d{11}$/.test(phone)) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  },

  /** 隐藏邮箱：abc***@example.com */
  maskEmail: (email: string | null | undefined): string => {
    if (!email) return '';
    // 如果不包含@符号，不是有效邮箱，直接返回原值
    if (!email.includes('@')) return email;
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
      // 用户名太短，只保留第一个字符
      return `${username[0]}***@${domain}`;
    }
    // 保留前2个字符，其余用***代替
    return `${username.substring(0, 2)}***@${domain}`;
  },

  /** 隐藏身份证号：110101****1234 */
  maskIdCard: (idCard: string | null | undefined): string => {
    if (!idCard) return '-';
    return idCard.replace(/(.{6}).*(.{4})/, '$1********$2');
  },
};
