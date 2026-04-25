/**
 * 动态组件注册系统
 *
 * 核心特性：
 * 1. ✅ 使用 import.meta.glob 自动扫描入口页面组件
 * 2. ✅ 支持懒加载（React.lazy）
 * 3. ✅ 类型安全（自动推断组件名）
 * 4. ✅ 无需手动注册（新建页面文件后自动可用）
 *
 * 约定式路由规范：
 * - 所有页面组件必须放在以下目录：
 *   - features/[module]/pages/[ComponentName].tsx
 *   - features/file/components/FileList.tsx（文件模块历史兼容）
 *   - shared/pages/[ComponentName].tsx
 * - 组件名通常与文件名一致（如 UserListPage.tsx 导出 UserListPage）
 * - 组件必须使用命名导出（export function UserListPage）
 *
 * 使用示例：
 * ```typescript
 * // 后端菜单表的 component 字段可存储组件名或约定别名
 * { component: 'system/users' }
 *
 * // 动态路由系统自动查找并加载组件
 * const Component = getComponent('system/users'); // 自动映射到 UserListPage
 * ```
 *
 * 新增页面流程：
 * 1. 创建页面文件（如 features/finance/pages/AccountListPage.tsx）
 * 2. 后端数据库插入菜单记录（component 字段填组件名或在此维护别名）
 * 3. 前端根据菜单自动生成路由
 */

import { lazy } from 'react';
import type { ComponentType } from 'react';

/**
 * Vite import.meta.glob 自动扫描可作为动态路由入口的页面组件
 *
 * 扫描范围：
 * - features/[module]/pages/[ComponentName].tsx
 * - features/file/components/FileList.tsx（历史菜单兼容）
 * - shared/pages/*.tsx
 *
 * 返回格式：
 * {
 *   '../features/rbac/user/pages/UserListPage.tsx': () => import('...'),
 *   '../features/dashboard/pages/DashboardPage.tsx': () => import('...'),
 *   ...
 * }
 */
const pageModules = import.meta.glob<{
  [key: string]: ComponentType<Record<string, never>>;
}>([
  '../features/**/pages/*.tsx',
  '../features/file/components/FileList.tsx',
  '../shared/pages/*.tsx',
], { eager: false });

const componentAliases: Record<string, string> = {
  Dashboard: 'DashboardPage',
  dashboard: 'DashboardPage',
  FileList: 'FileList',
  files: 'FileList',
  'system/users': 'UserListPage',
  'system/roles': 'RoleListPage',
  'system/menus': 'MenuListPage',
  'system/permissions': 'PermissionListPage',
  'system/files': 'FileList',
  'system/notifications': 'NotificationListPage',
  'system/api-apps': 'ApiAuthPage',
  UserListPage: 'UserListPage',
  RoleListPage: 'RoleListPage',
  MenuListPage: 'MenuListPage',
  PermissionListPage: 'PermissionListPage',
  NotificationListPage: 'NotificationListPage',
  ApiAuthPage: 'ApiAuthPage',
};

function normalizeComponentName(componentName: string): string {
  return componentAliases[componentName] ?? componentName;
}

/**
 * 从文件路径提取组件名
 *
 * @param path 文件路径（如 '../features/rbac/user/pages/UserListPage.tsx'）
 * @returns 组件名（如 'UserListPage'）
 *
 * @example
 * extractComponentName('../features/rbac/user/pages/UserListPage.tsx')
 * // → 'UserListPage'
 *
 * extractComponentName('../features/file/components/FileList.tsx')
 * // → 'FileList'
 */
function extractComponentName(path: string): string {
  // 匹配最后一个 / 和 .tsx 之间的部分
  const match = path.match(/\/([^/]+)\.tsx$/);
  return match ? match[1] : '';
}

/**
 * 组件注册表（懒加载）
 *
 * 结构：
 * {
 *   'UserListPage': () => import('../features/rbac/user/pages/UserListPage.tsx'),
 *   'DashboardPage': () => import('../features/dashboard/pages/DashboardPage.tsx'),
 *   ...
 * }
 */
const componentRegistry = new Map<string, () => Promise<{ [key: string]: ComponentType<Record<string, never>> }>>();

// 构建组件注册表
for (const [path, loader] of Object.entries(pageModules)) {
  const componentName = extractComponentName(path);
  if (componentName) {
    componentRegistry.set(componentName, loader as () => Promise<{ [key: string]: ComponentType<Record<string, never>> }>);
  } else {
    console.warn(`[ComponentRegistry] 无法从路径提取组件名: ${path}`);
  }
}

/**
 * 获取组件（懒加载）
 *
 * @param componentName 组件名（如 'UserListPage'）
 * @returns React 懒加载组件 | null
 *
 * @example
 * const UserListPage = getComponent('UserListPage');
 * if (UserListPage) {
 *   <Suspense fallback={<Loading />}>
 *     <UserListPage />
 *   </Suspense>
 * }
 */
export function getComponent(componentName: string): ComponentType<Record<string, never>> | null {
  const normalizedName = normalizeComponentName(componentName);
  const loader = componentRegistry.get(normalizedName);

  if (!loader) {
    console.error(
      `[ComponentRegistry] 组件 "${componentName}" 未找到。\n` +
      `请确认：\n` +
      `1. 文件是否存在于 features/[module]/pages/、features/file/components/FileList.tsx 或 shared/pages/ 目录\n` +
      `2. 组件名是否与文件名一致，或已在 componentAliases 中配置\n` +
      `3. 组件是否使用命名导出（export function ${normalizedName}）`
    );
    return null;
  }

  // 使用 React.lazy 懒加载组件
  return lazy(() =>
    loader().then((module) => {
      // 支持两种导出方式：
      // 1. 命名导出：export function UserListPage
      // 2. 默认导出：export default UserListPage
      if (normalizedName in module) {
        return { default: module[normalizedName] };
      } else if ('default' in module) {
        return { default: module.default };
      } else {
        throw new Error(
          `组件 "${componentName}" 导出格式错误。\n` +
          `请使用命名导出：export function ${normalizedName}`
        );
      }
    })
  );
}

/**
 * 获取所有已注册的组件名称列表（排序）
 *
 * 用于菜单管理页面的组件选择器
 *
 * @returns 组件名列表（字母排序）
 *
 * @example
 * const componentNames = getComponentNames();
 * // → ['ApiAuthPage', 'DashboardPage', ...]
 */
export function getComponentNames(): string[] {
  return Array.from(componentRegistry.keys()).sort();
}

/**
 * 获取组件统计信息（调试用）
 *
 * @returns 统计信息
 */
function getRegistryStats() {
  const components = getComponentNames();
  const byDirectory: Record<string, string[]> = {};

  // 按目录分组统计
  for (const [path] of Object.entries(pageModules)) {
    const match = path.match(/\.\.\/(features|shared)\/([^/]+)/);
    if (match) {
      const [, type, module] = match;
      const key = type === 'shared' ? 'shared' : `features/${module}`;
      const componentName = extractComponentName(path);

      if (!byDirectory[key]) {
        byDirectory[key] = [];
      }
      byDirectory[key].push(componentName);
    }
  }

  return {
    total: components.length,
    components,
    byDirectory,
  };
}

// 开发环境输出统计信息
if (import.meta.env.DEV) {
  const stats = getRegistryStats();
  console.log('[ComponentRegistry] 自动扫描完成');
  console.log(`[ComponentRegistry] 共找到 ${stats.total} 个页面组件`);
  console.log('[ComponentRegistry] 组件列表:', stats.components);
  console.log('[ComponentRegistry] 按模块分布:', stats.byDirectory);
}
