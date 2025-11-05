/**
 * 404 页面
 *
 * 用途：
 * 1. 路由不存在时显示
 * 2. 使用现代化设计
 * 3. 提供返回首页按钮
 */
import { Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore } from '@/shared/stores';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen px-4 ${isDark ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      {/* 404大字 - 缩放动画 */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-8 relative"
      >
        <div className="text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 leading-none select-none">
          404
        </div>
        {/* 装饰圆圈 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-50 -z-10 ${isDark ? 'bg-yellow-700' : 'bg-yellow-200'}`}
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={`absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-50 -z-10 ${isDark ? 'bg-blue-700' : 'bg-blue-200'}`}
        />
      </motion.div>

      {/* 描述 - 淡入动画 */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className={`text-xl mb-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
      >
        页面未找到
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className={`text-sm mb-8 text-center max-w-md ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
      >
        抱歉，您访问的页面不存在或已被移除
      </motion.p>

      {/* 返回按钮 - 淡入 + 上移动画 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Button
          type="primary"
          size="large"
          icon={<HomeOutlined />}
          onClick={() => navigate('/dashboard')}
          className="px-8 py-6 h-auto text-base font-medium shadow-lg hover:shadow-xl transition-all"
        >
          返回首页
        </Button>
      </motion.div>
    </div>
  );
}
