import { RouterProvider } from 'react-router-dom';
import { Spin } from 'antd';
import { AppProviders } from './providers';
import { useAppRoutes } from './useAppRoutes';
import { ErrorBoundary } from '@/shared/components';

/**
 * 全局加载组件
 */
const GlobalLoading = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <Spin size="large" />
    <div className="text-gray-500">正在加载应用...</div>
  </div>
);

/**
 * 应用路由组件
 *
 * ⚠️ 重要：必须在 AppProviders 内部调用 useAppRoutes
 * 因为 useAppRoutes 内部使用了 useQuery（需要 QueryClientProvider）
 */
function AppRouter() {
  // 动态生成路由（根据用户菜单数据）
  const router = useAppRoutes();

  // 路由加载中
  if (!router) {
    return <GlobalLoading />;
  }

  return <RouterProvider router={router} />;
}

/**
 * 应用根组件
 *
 * 架构说明：
 * 1. ErrorBoundary：捕获组件错误
 * 2. AppProviders：提供全局 Context（QueryClient、Auth、Request等）
 * 3. AppRouter：动态生成路由（必须在 Providers 内部，因为需要 QueryClient）
 */
function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
