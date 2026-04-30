import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

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

const statusConfig = {
  success: {
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-700/50',
    dotColor: 'bg-green-500 dark:bg-green-400',
  },
  error: {
    bgColor: 'bg-red-50 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-700/50',
    dotColor: 'bg-red-500 dark:bg-red-400',
  },
  warning: {
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    borderColor: 'border-yellow-200 dark:border-yellow-700/50',
    dotColor: 'bg-yellow-500 dark:bg-yellow-400',
  },
  processing: {
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-700/50',
    dotColor: 'bg-blue-500 dark:bg-blue-400',
  },
  default: {
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    textColor: 'text-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-200 dark:border-gray-700/50',
    dotColor: 'bg-gray-400 dark:bg-gray-500',
  },
};

export function StatusBadge({ status, text, showIcon = true, icon }: StatusBadgeProps) {
  const config = statusConfig[status];

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
