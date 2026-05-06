import { useAuthStore } from '@/features/auth/stores/authStore';

/**
 * 非空数组类型（至少包含一个元素）
 * 用于防止权限检查时传入空数组导致安全漏洞
 */
export type NonEmptyArray<T> = [T, ...T[]];

function getRoleCodes(user?: { roles?: unknown[] } | null): string[] {
  return (user?.roles ?? [])
    .map((role) => {
      if (typeof role === 'string') {
        return role;
      }

      if (role && typeof role === 'object') {
        const roleLike = role as { code?: unknown; isActive?: boolean };
        if (roleLike.isActive === false) {
          return '';
        }
        return typeof roleLike.code === 'string' ? roleLike.code : '';
      }

      return '';
    })
    .filter(Boolean);
}

function isSuperAdminUser(
  user?: {
    isSuperAdmin?: boolean;
    roleCode?: string | null;
    roles?: unknown[];
  } | null
): boolean {
  return (
    user?.isSuperAdmin === true ||
    user?.roleCode === 'super_admin' ||
    getRoleCodes(user).includes('super_admin')
  );
}

function normalizePermissionCodes(permissions?: unknown[]): string[] {
  return (permissions ?? [])
    .map((permission) => {
      if (typeof permission === 'string') {
        return permission;
      }

      if (permission && typeof permission === 'object') {
        const permissionLike = permission as { code?: unknown; isActive?: boolean };
        if (permissionLike.isActive === false) {
          return '';
        }
        return typeof permissionLike.code === 'string' ? permissionLike.code : '';
      }

      return '';
    })
    .filter(Boolean);
}

function getPermissionCodes(user?: { permissions?: unknown[]; roles?: unknown[] } | null) {
  if (Array.isArray(user?.permissions)) {
    return normalizePermissionCodes(user.permissions);
  }

  const rolePermissions = (user?.roles ?? []).flatMap((role) => {
    if (!role || typeof role !== 'object') {
      return [];
    }

    return normalizePermissionCodes((role as { permissions?: unknown[] }).permissions);
  });

  return rolePermissions.length > 0 ? Array.from(new Set(rolePermissions)) : undefined;
}

function permissionMatches(required: string, granted: string): boolean {
  if (granted === '*' || granted === '*:*:*') {
    return true;
  }

  if (granted === required) {
    return true;
  }

  const requiredParts = required.split(':');
  const grantedParts = granted.split(':');

  for (let index = 0; index < Math.max(requiredParts.length, grantedParts.length); index += 1) {
    const requiredPart = requiredParts[index];
    const grantedPart = grantedParts[index];

    if (grantedPart === '*') {
      continue;
    }

    if (requiredPart !== grantedPart) {
      return false;
    }
  }

  return true;
}

function hasGrantedPermission(required: string, grantedPermissions: string[]): boolean {
  return grantedPermissions.some((permission) => permissionMatches(required, permission));
}

/**
 * 权限判断Hook
 *
 * 提供权限判断功能，支持OR逻辑（与后端PermissionsGuard一致）
 *
 * ⚠️ 安全提示：
 * - hasPermission() 和 hasAllPermissions() 不接受空数组
 * - 如果不需要权限控制，请不要使用 PermissionGuard 组件
 *
 * @example
 * function UserActions() {
 *   const { hasPermission } = usePermission();
 *
 *   return (
 *     <Space>
 *       {hasPermission(['user:create']) && (
 *         <Button type="primary">创建用户</Button>
 *       )}
 *       {hasPermission(['user:delete', 'user:manage']) && (
 *         <Button danger>删除用户</Button>
 *       )}
 *     </Space>
 *   );
 * }
 */
export function usePermission() {
  const { user } = useAuthStore();

  /**
   * 检查是否拥有指定权限
   *
   * 使用OR逻辑：只要拥有任一所需权限即返回true
   *
   * ⚠️ TypeScript约束：permissions 必须是非空数组（编译时检查）
   *
   * @param permissions 权限代码数组（至少1个），如 ['user:create'] 或 ['user:delete', 'user:manage']
   * @returns 拥有任一权限返回true，否则返回false
   *
   * @example
   * // ✅ 正确：单个权限
   * hasPermission(['user:create'])
   *
   * // ✅ 正确：多个权限（OR逻辑）
   * hasPermission(['user:delete', 'user:manage'])
   *
   * // ❌ 错误：空数组（TypeScript 编译错误）
   * hasPermission([])
   */
  const hasPermission = (permissions: NonEmptyArray<string>): boolean => {
    // ⚠️ 空数组检查：防止误用导致安全漏洞
    if (permissions.length === 0) {
      console.warn(
        '[usePermission] 传入空数组！这通常是代码错误。' +
          '如果不需要权限控制，请不要使用 PermissionGuard 组件。'
      );
      // 返回 false 更安全（宁可误杀，不可放过）
      return false;
    }

    // 未登录，拒绝
    if (!user) return false;

    // ✅ 超级管理员自动拥有所有权限（与后端 PermissionsGuard 逻辑一致）
    if (isSuperAdminUser(user)) {
      return true;
    }

    const userPermissions = getPermissionCodes(user);

    // 权限清单缺失时不能默认放行，避免低权限账号看到不可执行的操作。
    // 页面访问由后端菜单接口过滤，按钮/局部入口必须等权限清单明确后再展示。
    if (userPermissions === undefined) {
      return false;
    }

    // 普通用户检查权限数组
    if (userPermissions.length === 0) {
      return false;
    }

    // OR逻辑：只要拥有任一所需权限即可
    return permissions.some((permission) => hasGrantedPermission(permission, userPermissions));
  };

  /**
   * 检查是否拥有所有指定权限
   *
   * 使用AND逻辑：必须拥有所有所需权限才返回true
   *
   * ⚠️ 注意：
   * - 后端使用OR逻辑，前端提供AND逻辑仅用于特殊场景
   * - TypeScript约束：permissions 必须是非空数组
   *
   * @param permissions 权限代码数组（至少1个）
   * @returns 拥有所有权限返回true，否则返回false
   *
   * @example
   * // ✅ 正确
   * hasAllPermissions(['user:create', 'user:update'])
   *
   * // ❌ 错误：空数组（TypeScript 编译错误）
   * hasAllPermissions([])
   */
  const hasAllPermissions = (permissions: NonEmptyArray<string>): boolean => {
    // ⚠️ 空数组检查：防止误用
    if (permissions.length === 0) {
      console.warn('[usePermission] hasAllPermissions() 传入空数组，这通常是代码错误');
      return false;
    }

    // 未登录，拒绝
    if (!user) return false;

    // ✅ 超级管理员自动拥有所有权限
    if (isSuperAdminUser(user)) {
      return true;
    }

    const userPermissions = getPermissionCodes(user);

    if (userPermissions === undefined) {
      return false;
    }

    if (userPermissions.length === 0) {
      return false;
    }

    // AND逻辑：必须拥有所有所需权限
    return permissions.every((permission) => hasGrantedPermission(permission, userPermissions));
  };

  /**
   * 检查是否拥有指定角色
   *
   * 使用OR逻辑：只要拥有任一所需角色即返回true
   *
   * @param roles 角色代码数组（至少1个），如 ['admin'] 或 ['admin', 'editor']
   * @returns 拥有任一角色返回true，否则返回false
   */
  const hasRole = (roles: NonEmptyArray<string>): boolean => {
    if (roles.length === 0) {
      console.warn('[usePermission] hasRole() 传入空数组，这通常是代码错误');
      return false;
    }

    // 未登录，拒绝
    if (!user) return false;

    // 超级管理员自动拥有所有角色
    if (isSuperAdminUser(user)) {
      return true;
    }

    // 检查角色数组
    if (!user.roles || user.roles.length === 0) {
      return false;
    }

    // OR逻辑：只要拥有任一所需角色即可
    const userRoleCodes = getRoleCodes(user);
    return roles.some((r) => userRoleCodes.includes(r));
  };

  /**
   * 获取当前用户的所有权限
   *
   * @returns 权限代码数组
   */
  const getUserPermissions = (): string[] => {
    if (!user) {
      return [];
    }

    if (isSuperAdminUser(user)) {
      return ['*'];
    }

    return getPermissionCodes(user) ?? [];
  };

  return {
    hasPermission,
    hasAllPermissions,
    hasRole,
    getUserPermissions,
  };
}
