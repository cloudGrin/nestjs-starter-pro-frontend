import type { ReactNode } from 'react';
import { EmptyIllustration } from '../illustrations';
import { useThemeStore } from '@/shared/stores';

interface EmptyStateProps {
  /** 图标 */
  icon?: ReactNode;
  /** 主标题 */
  title?: string;
  /** 描述文字 */
  description?: string;
  /** 操作按钮 */
  action?: ReactNode;
  /** 插画（优先级高于icon） */
  illustration?: ReactNode;
  /** 插画尺寸 */
  illustrationSize?: number;
}

export function EmptyState({
  icon,
  title = '暂无数据',
  description,
  action,
  illustration,
  illustrationSize = 200,
}: EmptyStateProps) {
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  // 如果传入了icon，使用旧的图标样式（向后兼容）
  if (icon) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div
          className={`
            w-24 h-24 rounded-full
            flex items-center justify-center
            mb-6
            relative
            overflow-hidden
            ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
          `}
        >
          <div className="relative z-10">{icon}</div>
        </div>

        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {title}
        </h3>

        {description && (
          <p
            className={`text-sm mb-6 max-w-md text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {description}
          </p>
        )}

        {action && <div>{action}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-8">{illustration || <EmptyIllustration size={illustrationSize} />}</div>

      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
        {title}
      </h3>

      {description && (
        <p
          className={`text-sm mb-6 max-w-md text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
