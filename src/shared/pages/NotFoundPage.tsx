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

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="mb-8 relative">
        <div className="text-[160px] font-black text-gray-300 dark:text-gray-700 leading-none select-none">
          404
        </div>
      </div>

      <p className="mb-2 text-center text-xl text-gray-600 dark:text-gray-300">页面未找到</p>

      <p className="mb-8 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
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
