import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import { useThemeStore } from '@/shared/stores';

type StatusType = 'success' | 'error' | 'warning' | 'processing' | 'default';

interface StatusBadgeProps {
  /** 状态类型 */
  status: StatusType;
  /** 显示文字 */
  text: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 自定义图标 */
  icon?: ReactNode;
}

const getStatusConfig = (isDark: boolean) => ({
  success: {
    bgColor: isDark ? 'bg-green-900/30' : 'bg-green-50',
    textColor: isDark ? 'text-green-300' : 'text-green-700',
    borderColor: isDark ? 'border-green-700/50' : 'border-green-200',
    dotColor: isDark ? 'bg-green-400' : 'bg-green-500',
  },
  error: {
    bgColor: isDark ? 'bg-red-900/30' : 'bg-red-50',
    textColor: isDark ? 'text-red-300' : 'text-red-700',
    borderColor: isDark ? 'border-red-700/50' : 'border-red-200',
    dotColor: isDark ? 'bg-red-400' : 'bg-red-500',
  },
  warning: {
    bgColor: isDark ? 'bg-yellow-900/30' : 'bg-yellow-50',
    textColor: isDark ? 'text-yellow-300' : 'text-yellow-700',
    borderColor: isDark ? 'border-yellow-700/50' : 'border-yellow-200',
    dotColor: isDark ? 'bg-yellow-400' : 'bg-yellow-500',
  },
  processing: {
    bgColor: isDark ? 'bg-blue-900/30' : 'bg-blue-50',
    textColor: isDark ? 'text-blue-300' : 'text-blue-700',
    borderColor: isDark ? 'border-blue-700/50' : 'border-blue-200',
    dotColor: isDark ? 'bg-blue-400' : 'bg-blue-500',
  },
  default: {
    bgColor: isDark ? 'bg-gray-800/50' : 'bg-gray-50',
    textColor: isDark ? 'text-gray-300' : 'text-gray-700',
    borderColor: isDark ? 'border-gray-700/50' : 'border-gray-200',
    dotColor: isDark ? 'bg-gray-500' : 'bg-gray-400',
  },
});

export function StatusBadge({ status, text, showIcon = true, icon }: StatusBadgeProps) {
  const { mode } = useThemeStore();
  const config = getStatusConfig(mode === 'dark')[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2',
        'rounded-full px-2.5 py-1',
        'text-xs font-medium whitespace-nowrap',
        'border',
        config.bgColor,
        config.textColor,
        config.borderColor
      )}
    >
      {showIcon && !icon && <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />}

      {icon && <span className="text-xs">{icon}</span>}

      {text}
    </span>
  );
}
