import { useRole } from '@/shared/hooks/useRole';

interface RoleGuardProps {
  /**
   * 所需角色（OR逻辑：拥有任一角色即可）
   */
  roles: string[];
  /**
   * 无角色权限时显示的内容
   * @default null
   */
  fallback?: React.ReactNode;
  /**
   * 子内容
   */
  children: React.ReactNode;
}

/**
 * 角色守卫组件
 *
 * 用于条件渲染需要特定角色的UI元素
 *
 * 支持OR逻辑：只要拥有任一所需角色即可渲染children
 *
 * 使用场景：
 * - 基于角色的按钮控制
 * - 基于角色的菜单项控制
 * - 基于角色的页面区域控制
 *
 * @example
 * // 单个角色
 * <RoleGuard roles={['PARENT']}>
 *   <Button type="primary">家长专属功能</Button>
 * </RoleGuard>
 *
 * // 多个角色（OR逻辑）
 * <RoleGuard roles={['PARENT', 'ADMIN']}>
 *   <Button danger>删除功能</Button>
 * </RoleGuard>
 *
 * // 自定义无角色提示
 * <RoleGuard
 *   roles={['PARENT']}
 *   fallback={<div>仅家长可见</div>}
 * >
 *   <AdminPanel />
 * </RoleGuard>
 */
export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const { hasRole } = useRole();

  // 检查是否拥有所需角色
  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }

  // 拥有角色，渲染子内容
  return <>{children}</>;
}
