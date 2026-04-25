/**
 * 动态路由 Hook
 *
 * 核心功能：根据用户菜单数据动态创建路由配置
 *
 * 使用方式：
 * ```tsx
 * function App() {
 *   const router = useAppRoutes();
 *   if (!router) return <PageLoading />;
 *   return <RouterProvider router={router} />;
 * }
 * ```
 */

import { useMemo, lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { generateRoutesWithDefault } from './generateRoutes';
import { PageLoading } from './routeFallbacks';
import { useUserMenus } from '@/features/rbac/menu/hooks/useMenus';
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';
import { useAuthStore } from '@/features/auth/stores/authStore';

// ==================== 特殊页面（不在菜单系统中）====================

/**
 * 登录页面（公开访问）
 */
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({
    default: m.LoginPage,
  }))
);

/**
 * 主布局组件
 */
const MainLayout = lazy(() =>
  import('@/shared/components/layouts/MainLayout').then((m) => ({
    default: m.MainLayout,
  }))
);

/**
 * 404 页面
 */
const NotFoundPage = lazy(() =>
  import('@/shared/pages/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
  }))
);

/**
 * Suspense 包装器
 */
const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<PageLoading text="正在加载应用..." />}>
    <Component />
  </Suspense>
);

/**
 * 动态路由 Hook
 *
 * @returns React Router 实例 | null（加载中）
 */
export function useAppRoutes() {
  // ⚠️ 重要：使用 useAuthStore 监听 token 变化，而不是直接读取 localStorage
  // 这样登录成功后能自动重新生成路由配置
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = !!token;

  // 只有登录后才获取用户菜单（避免401错误）
  const { data: userMenus, isLoading, error } = useUserMenus({
    enabled: isAuthenticated, // ← 关键：未登录时禁用查询
  });

  // 动态生成路由配置
  const router = useMemo(() => {
    // 未登录：返回基础路由（登录页 + 404）
    if (!isAuthenticated) {
      return createBrowserRouter([
        {
          path: '/login',
          element: withSuspense(LoginPage),
        },
        {
          path: '*',
          element: <Navigate to="/login" replace />,
        },
      ]);
    }

    // 菜单加载失败，返回基础路由（只有登录页）
    if (error) {
      console.error('[动态路由] 加载用户菜单失败', error);
      return createBrowserRouter([
        {
          path: '/login',
          element: withSuspense(LoginPage),
        },
        {
          path: '*',
          element: <Navigate to="/login" replace />,
        },
      ]);
    }

    // 菜单加载中，返回 null
    if (isLoading || !userMenus) {
      return null;
    }

    // 生成动态路由
    const dynamicRoutes = generateRoutesWithDefault(userMenus);

    console.log('[动态路由] 生成路由配置', {
      menuCount: userMenus.length,
      routeCount: dynamicRoutes.length,
      routes: dynamicRoutes,
    });

    // 创建完整的路由配置
    return createBrowserRouter([
      // ========== 公开路由 ==========
      {
        path: '/login',
        element: withSuspense(LoginPage),
      },

      // ========== 受保护路由（需要登录）==========
      {
        path: '/',
        element: <ProtectedRoute />, // JWT 认证守卫
        children: [
          {
            path: '',
            element: withSuspense(MainLayout), // 主布局
            children: dynamicRoutes, // ← 动态路由（从菜单数据生成）
          },
        ],
      },

      // ========== 404 路由 ==========
      {
        path: '*',
        element: withSuspense(NotFoundPage),
      },
    ]);
  }, [isAuthenticated, userMenus, isLoading, error]);

  return router;
}
