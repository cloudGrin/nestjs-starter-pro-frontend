/**
 * 状态徽章组件（企业级设计）
 *
 * 用途：
 * 1. 显示状态标签（启用/禁用、成功/失败等）
 * 2. 统一的颜色规范（现代化pill设计）
 * 3. 圆角pill + 脉冲动画 + 浅色背景深色文字
 *
 * @example
 * <StatusBadge status="success" text="已启用" />
 * <StatusBadge status="error" text="已禁用" />
 * <StatusBadge status={isActive ? 'success' : 'default'} text={isActive ? '启用' : '禁用'} />
 */
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
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
    icon: <CheckCircleOutlined />,
  },
  error: {
    bgColor: isDark ? 'bg-red-900/30' : 'bg-red-50',
    textColor: isDark ? 'text-red-300' : 'text-red-700',
    borderColor: isDark ? 'border-red-700/50' : 'border-red-200',
    dotColor: isDark ? 'bg-red-400' : 'bg-red-500',
    icon: <CloseCircleOutlined />,
  },
  warning: {
    bgColor: isDark ? 'bg-yellow-900/30' : 'bg-yellow-50',
    textColor: isDark ? 'text-yellow-300' : 'text-yellow-700',
    borderColor: isDark ? 'border-yellow-700/50' : 'border-yellow-200',
    dotColor: isDark ? 'bg-yellow-400' : 'bg-yellow-500',
    icon: <ExclamationCircleOutlined />,
  },
  processing: {
    bgColor: isDark ? 'bg-blue-900/30' : 'bg-blue-50',
    textColor: isDark ? 'text-blue-300' : 'text-blue-700',
    borderColor: isDark ? 'border-blue-700/50' : 'border-blue-200',
    dotColor: isDark ? 'bg-blue-400' : 'bg-blue-500',
    icon: <ClockCircleOutlined />,
  },
  default: {
    bgColor: isDark ? 'bg-gray-800/50' : 'bg-gray-50',
    textColor: isDark ? 'text-gray-300' : 'text-gray-700',
    borderColor: isDark ? 'border-gray-700/50' : 'border-gray-200',
    dotColor: isDark ? 'bg-gray-500' : 'bg-gray-400',
    icon: <MinusCircleOutlined />,
  },
});

export function StatusBadge({
  status,
  text,
  showIcon = true,
  icon,
}: StatusBadgeProps) {
  const { mode } = useThemeStore();
  const config = getStatusConfig(mode === 'dark')[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2',
        'px-3 py-1.5 rounded-full',
        'text-xs font-medium whitespace-nowrap',
        'border',
        'transition-all duration-200',
        'hover:scale-105',
        config.bgColor,
        config.textColor,
        config.borderColor
      )}
    >
      {/* 圆点指示器（默认显示） */}
      {showIcon && !icon && (
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            'animate-pulse',
            config.dotColor
          )}
        />
      )}

      {/* 自定义图标 */}
      {icon && <span className="text-xs">{icon}</span>}

      {/* 文本 */}
      {text}
    </span>
  );
}
