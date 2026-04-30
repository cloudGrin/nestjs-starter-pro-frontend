import type { ReactNode } from 'react';
import { EmptyIllustration } from '../illustrations';

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
  // 如果传入了icon，使用旧的图标样式（向后兼容）
  if (icon) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div
          className={`
            w-20 h-20 rounded-2xl
            flex items-center justify-center
            mb-5
            relative
            overflow-hidden
            bg-gray-100
            dark:bg-gray-800
          `}
        >
          <div className="relative z-10">{icon}</div>
        </div>

        <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>

        {description && (
          <p className="mb-6 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}

        {action && <div>{action}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 opacity-95">
        {illustration || <EmptyIllustration size={illustrationSize} />}
      </div>

      <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>

      {description && (
        <p className="mb-6 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
