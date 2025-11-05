/**
 * API参数验证工具（仅开发环境）
 *
 * 功能：
 * 1. 检查请求参数字段名是否与生成的API类型一致
 * 2. 在控制台输出警告信息
 * 3. 帮助开发者尽早发现字段名错误
 */

import type { AxiosRequestConfig } from 'axios';

const isDev = import.meta.env.DEV;

/**
 * 常见的字段名错误映射
 */
const COMMON_FIELD_MISTAKES: Record<string, string> = {
  // 分页相关
  pageSize: 'limit',
  size: 'limit',

  // 用户相关（仅在/users接口）
  username: 'account', // 登录时使用account

  // 搜索相关（仅在/users接口，/files接口支持keyword）
  search: 'username or email or phone',
};

/**
 * 已知的正确参数字段（从Swagger生成）
 */
const VALID_QUERY_PARAMS = new Set([
  // 分页参数
  'page',
  'limit',
  'sort',
  'order',

  // 用户查询参数
  'username',
  'email',
  'phone',
  'realName',
  'status',
  'gender',
  'roleId',

  // 角色查询参数
  'name',
  'code',
  'isActive',
  'isSystem',

  // 统计查询参数
  'days',

  // 文件管理查询参数
  'keyword',  // 文件名关键词搜索
  'module',   // 业务模块过滤
  'storage',  // 存储类型过滤
  'category', // 文件类别过滤
  'isPublic', // 是否公开访问

  // 通用参数
  'id',
  'ids',
]);

/**
 * 检查并警告错误的字段名
 */
export function validateApiParams(config: AxiosRequestConfig): void {
  if (!isDev) return; // 仅在开发环境运行

  const params = config.params;
  if (!params || typeof params !== 'object') return;

  const warnings: string[] = [];
  const url = config.url || '';

  // 检查每个参数
  Object.keys(params).forEach((key) => {
    // 检查是否使用了常见的错误字段名
    if (key in COMMON_FIELD_MISTAKES) {
      // 特殊处理：/users接口不允许keyword，但/files接口允许
      if (key === 'keyword' && url.includes('/files')) {
        return; // /files接口支持keyword，跳过检查
      }
      warnings.push(
        `❌ 参数 "${key}" 可能不正确，后端期望 "${COMMON_FIELD_MISTAKES[key]}"`
      );
    }

    // 检查是否是已知的有效参数
    if (!VALID_QUERY_PARAMS.has(key)) {
      warnings.push(
        `⚠️  参数 "${key}" 不在已知的有效参数列表中，请确认是否正确`
      );
    }
  });

  // 输出警告
  if (warnings.length > 0) {
    console.group(`🔍 API参数验证: ${config.method?.toUpperCase()} ${config.url}`);
    warnings.forEach((warning) => console.warn(warning));
    console.warn('💡 提示：请参考 Swagger 文档或 src/shared/api/generated/data-contracts.ts');
    console.groupEnd();
  }
}

/**
 * 检查登录参数
 */
export function validateLoginParams(params: Record<string, unknown>): void {
  if (!isDev) return;

  if (params.username && !params.account) {
    console.error('❌ 登录参数错误：请使用 "account" 字段而非 "username"');
    console.warn('💡 LoginDto 定义: { account: string, password: string }');
    console.warn('💡 参考: src/shared/api/generated/data-contracts.ts');
  }
}

/**
 * 检查分页参数
 */
export function validatePaginationParams(params: Record<string, unknown>): void {
  if (!isDev) return;

  const issues: string[] = [];

  if (params.pageSize !== undefined) {
    issues.push('❌ 使用了 "pageSize"，后端期望 "limit"');
  }

  if (params.size !== undefined) {
    issues.push('❌ 使用了 "size"，后端期望 "limit"');
  }

  if (params.keyword !== undefined) {
    issues.push('❌ 使用了通用的 "keyword"，后端期望具体字段（username/email/phone/realName）');
  }

  if (issues.length > 0) {
    console.group('🔍 分页参数验证');
    issues.forEach((issue) => console.warn(issue));
    console.warn('💡 正确的分页参数: { page, limit, sort?, order?, username?, email?, ... }');
    console.groupEnd();
  }
}

/**
 * 添加到请求拦截器的验证函数
 */
export function attachApiValidator() {
  if (!isDev) return;

  console.info('✅ API参数验证器已启用（开发环境）');
  console.info('💡 如果看到参数验证警告，请检查字段名是否与后端API一致');
}
