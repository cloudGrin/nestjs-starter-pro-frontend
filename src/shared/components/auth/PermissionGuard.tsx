import { usePermission, type NonEmptyArray } from '@/shared/hooks/usePermission';

interface PermissionGuardProps {
  /**
   * 所需权限（OR逻辑：拥有任一权限即可）
   * ⚠️ 必须是非空数组（至少包含一个权限代码）
   */
  permissions: NonEmptyArray<string>;
  /**
   * 无权限时显示的内容
   * @default null
   */
  fallback?: React.ReactNode;
  /**
   * 子内容
   */
  children: React.ReactNode;
}

/**
 * 权限守卫组件
 *
 * 用于条件渲染需要特定权限的UI元素
 *
 * 支持OR逻辑：只要拥有任一所需权限即可渲染children
 *
 * 使用场景：
 * - 按钮权限控制
 * - 菜单项权限控制
 * - 操作列权限控制
 *
 * @example
 * // 单个权限
 * <PermissionGuard permissions={['user:create']}>
 *   <Button type="primary">创建用户</Button>
 * </PermissionGuard>
 *
 * // 多个权限（OR逻辑）
 * <PermissionGuard permissions={['user:delete', 'user:manage']}>
 *   <Button danger>删除用户</Button>
 * </PermissionGuard>
 *
 * // 自定义无权限提示
 * <PermissionGuard
 *   permissions={['user:create']}
 *   fallback={<Tooltip title="无权限"><Button disabled>创建用户</Button></Tooltip>}
 * >
 *   <Button type="primary">创建用户</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({ permissions, fallback = null, children }: PermissionGuardProps) {
  const { hasPermission } = usePermission();

  // 检查是否拥有所需权限
  if (!hasPermission(permissions)) {
    return <>{fallback}</>;
  }

  // 拥有权限，渲染子内容
  return <>{children}</>;
}
