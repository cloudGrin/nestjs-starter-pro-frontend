import { useAuthStore } from '@/features/auth/stores/authStore';

/**
 * 角色判断Hook
 *
 * 提供角色判断功能，支持OR逻辑
 *
 * @example
 * function AdminPanel() {
 *   const { hasRole } = useRole();
 *
 *   if (!hasRole(['PARENT', 'ADMIN'])) {
 *     return <div>无权限访问</div>;
 *   }
 *
 *   return <div>管理面板</div>;
 * }
 */
export function useRole() {
  const { user } = useAuthStore();

  /**
   * 检查是否拥有指定角色
   *
   * 使用OR逻辑：只要拥有任一所需角色即返回true
   *
   * @param roles 角色代码数组，如 ['PARENT', 'ADMIN']
   * @returns 拥有任一角色返回true，否则返回false
   *
   * @example
   * // 单个角色
   * hasRole(['PARENT']) // 拥有PARENT角色返回true
   *
   * // 多个角色（OR逻辑）
   * hasRole(['PARENT', 'ADMIN']) // 拥有PARENT或ADMIN任一角色即返回true
   */
  const hasRole = (roles: string[]): boolean => {
    if (!user?.roles) return false;
    if (roles.length === 0) return true;

    const userRoleCodes = user.roles.map((r) => r.code);

    // OR逻辑：只要拥有任一所需角色即可
    return roles.some((r) => userRoleCodes.includes(r));
  };

  /**
   * 检查是否拥有所有指定角色
   *
   * 使用AND逻辑：必须拥有所有所需角色才返回true
   *
   * @param roles 角色代码数组
   * @returns 拥有所有角色返回true，否则返回false
   *
   * @example
   * hasAllRoles(['PARENT', 'ADMIN']) // 必须同时拥有两个角色
   */
  const hasAllRoles = (roles: string[]): boolean => {
    if (!user?.roles) return false;
    if (roles.length === 0) return true;

    const userRoleCodes = user.roles.map((r) => r.code);

    // AND逻辑：必须拥有所有所需角色
    return roles.every((r) => userRoleCodes.includes(r));
  };

  /**
   * 获取当前用户的所有角色
   *
   * @returns 角色数组
   */
  const getUserRoles = () => {
    return user?.roles || [];
  };

  /**
   * 获取当前用户的所有角色代码
   *
   * @returns 角色代码数组
   */
  const getUserRoleCodes = (): string[] => {
    return user?.roles?.map((r) => r.code) || [];
  };

  return {
    hasRole,
    hasAllRoles,
    getUserRoles,
    getUserRoleCodes,
  };
}
