/**
 * 404 页面
 *
 * 用途：
 * 1. 路由不存在时显示
 * 2. 提供返回首页按钮
 */
import { Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/shared/stores';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen px-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8 relative">
        <div className="text-[160px] font-black text-gray-300 dark:text-gray-700 leading-none select-none">
          404
        </div>
      </div>

      <p className={`text-xl mb-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        页面未找到
      </p>

      <p className={`text-sm mb-8 text-center max-w-md ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        抱歉，您访问的页面不存在或已被移除
      </p>

      <Button
        type="primary"
        size="large"
        icon={<HomeOutlined />}
        onClick={() => navigate('/')}
        className="px-8 py-6 h-auto text-base font-medium"
      >
        返回首页
      </Button>
    </div>
  );
}
