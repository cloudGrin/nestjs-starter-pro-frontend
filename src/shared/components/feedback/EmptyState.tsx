/**
 * 空状态组件（企业级设计）
 *
 * 用途：
 * 1. 数据为空时的友好提示（现代化动画设计）
 * 2. 支持自定义图标、文案、操作按钮、空状态插画
 * 3. 淡入动画 + 现代化插画
 *
 * @example
 * // 使用默认插画
 * <EmptyState
 *   title="暂无数据"
 *   description="还没有任何用户，快去创建一个吧"
 *   action={<Button type="primary">创建用户</Button>}
 * />
 *
 * @example
 * // 使用自定义插画
 * <EmptyState illustration={<CustomIllustration />} title="暂无数据" />
 */
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
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
  /** 图片地址（已废弃，建议使用illustration） */
  image?: string;
  /** SVG插画（优先级高于icon和image） */
  illustration?: ReactNode;
  /** 插画尺寸 */
  illustrationSize?: number;
}

export function EmptyState({
  icon,
  title = '暂无数据',
  description,
  action,
  image,
  illustration,
  illustrationSize = 200,
}: EmptyStateProps) {
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  // 如果传入了icon，使用旧的图标样式（向后兼容）
  if (icon) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        {/* 图标容器 - 渐变背景 + 缩放动画 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`
            w-24 h-24 rounded-full
            flex items-center justify-center
            mb-6
            shadow-inner
            relative
            overflow-hidden
            ${isDark ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800' : 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100'}
          `}
        >
          {/* 微妙的光晕效果 */}
          <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-gray-600/20 to-transparent' : 'bg-gradient-to-br from-white/40 to-transparent'}`} />

          {/* 图标 */}
          <div className="relative z-10">{icon}</div>
        </motion.div>

        {/* 标题 - 淡入动画 */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
        >
          {title}
        </motion.h3>

        {/* 描述 - 淡入动画 */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className={`text-sm mb-6 max-w-md text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {description}
          </motion.p>
        )}

        {/* 操作按钮 - 淡入 + 上移动画 */}
        {action && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            {action}
          </motion.div>
        )}
      </div>
    );
  }

  // 默认使用插画（现代化设计）
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* 插画 - 缩放动画 */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-8"
      >
        {illustration || (image ? <img src={image} alt="Empty" style={{ width: illustrationSize, height: illustrationSize }} /> : <EmptyIllustration size={illustrationSize} />)}
      </motion.div>

      {/* 标题 - 淡入动画 */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
      >
        {title}
      </motion.h3>

      {/* 描述 - 淡入动画 */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className={`text-sm mb-6 max-w-md text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {description}
        </motion.p>
      )}

      {/* 操作按钮 - 淡入 + 上移动画 */}
      {action && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          {action}
        </motion.div>
      )}
    </div>
  );
}
