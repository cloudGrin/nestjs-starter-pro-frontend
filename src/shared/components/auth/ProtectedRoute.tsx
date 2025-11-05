import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { usePermission, type NonEmptyArray } from '@/shared/hooks/usePermission';

interface ProtectedRouteProps {
  /**
   * 所需权限（OR逻辑：拥有任一权限即可）
   * ⚠️ 如果传入该参数，必须是非空数组
   */
  permissions?: NonEmptyArray<string>;
  /**
   * 所需角色（OR逻辑：拥有任一角色即可）
   */
  roles?: string[];
  /**
   * 未认证时重定向路径
   * @default '/login'
   */
  redirectTo?: string;
  /**
   * 无权限时显示的内容
   */
  fallback?: React.ReactNode;
}

/**
 * 路由守卫组件
 *
 * 功能：
 * 1. JWT认证检查：验证用户是否已登录
 * 2. 权限检查：验证用户是否拥有所需权限（OR逻辑）
 * 3. 角色检查：验证用户是否拥有所需角色（OR逻辑）
 *
 * 使用场景：
 * - 保护需要登录的路由
 * - 保护需要特定权限的路由
 * - 保护需要特定角色的路由
 *
 * @example
 * // 1. 只验证登录
 * <Route path="/" element={<ProtectedRoute />}>
 *   <Route path="dashboard" element={<Dashboard />} />
 * </Route>
 *
 * // 2. 验证登录 + 权限
 * <Route
 *   path="/users"
 *   element={<ProtectedRoute permissions={['user:read']} />}
 * >
 *   <Route index element={<UserList />} />
 * </Route>
 *
 * // 3. 验证登录 + 角色
 * <Route
 *   path="/admin"
 *   element={<ProtectedRoute roles={['PARENT', 'ADMIN']} />}
 * >
 *   <Route index element={<AdminPanel />} />
 * </Route>
 */
export function ProtectedRoute({
  permissions,
  roles,
  redirectTo = '/login',
  fallback,
}: ProtectedRouteProps) {
  const { token, user } = useAuthStore();
  const { hasPermission } = usePermission(); // ← 使用 usePermission Hook

  // 1. JWT认证检查：未登录则重定向到登录页
  if (!token || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // 2. 权限检查（如果指定了permissions）
  // ⚠️ 使用 hasPermission() 而非直接检查数组，确保超级管理员逻辑生效
  if (permissions && permissions.length > 0) {
    if (!hasPermission(permissions)) {
      // 无权限时显示fallback或403页面
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-300">403</h1>
            <p className="mt-4 text-lg text-gray-600">无权限访问此页面</p>
            <p className="mt-2 text-sm text-gray-400">
              所需权限: {permissions.join(' 或 ')}
            </p>
          </div>
        </div>
      );
    }
  }

  // 3. 角色检查（如果指定了roles）
  if (roles && roles.length > 0) {
    const userRoleCodes = user.roles?.map((r) => r.code) || [];
    const hasRole = roles.some((r) => userRoleCodes.includes(r));
    if (!hasRole) {
      // 无角色权限时显示fallback或403页面
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-300">403</h1>
            <p className="mt-4 text-lg text-gray-600">无权限访问此页面</p>
            <p className="mt-2 text-sm text-gray-400">所需角色: {roles.join(' 或 ')}</p>
          </div>
        </div>
      );
    }
  }

  // 4. 通过所有检查，渲染子路由
  return <Outlet />;
}
