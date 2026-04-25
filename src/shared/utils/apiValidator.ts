/**
 * API参数验证工具（仅开发环境）
 *
 * 功能：
 * 1. 检查少量高频、明确的请求参数误用
 * 2. 在控制台输出警告信息
 * 3. 帮助开发者尽早发现字段名错误
 */

import type { AxiosRequestConfig } from 'axios';

const isDev = import.meta.env.DEV;

/**
 * 常见的字段名错误映射。
 *
 * 这里只保留跨接口稳定成立的规则。接口级字段由类型和服务层约束，
 * 避免开发环境在合法请求上误报。
 */
const COMMON_FIELD_MISTAKES: Record<string, string> = {
  // 分页相关
  pageSize: 'limit',
  size: 'limit',
};

/**
 * 已知的正确参数字段（基于当前 Swagger 契约）
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

  // 文件管理查询参数
  'keyword',  // 文件名关键词搜索
  'module',   // 业务模块过滤
  'storage',  // 存储类型过滤
  'category', // 文件类别过滤
  'isPublic', // 是否公开访问

  // 通用参数
  'id',
  'ids',

  // 其他列表接口常用参数
  'keyword',
  'type',
  'parentId',
  'resource',
  'method',
  'appId',
  'environment',
]);

/**
 * 检查并警告错误的字段名
 */
export function validateApiParams(config: AxiosRequestConfig): void {
  if (!isDev) return; // 仅在开发环境运行

  const params = config.params;
  if (!params || typeof params !== 'object') return;

  const warnings: string[] = [];
  // 检查每个参数
  Object.keys(params).forEach((key) => {
    // 检查是否使用了常见的错误字段名
    if (key in COMMON_FIELD_MISTAKES) {
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
    console.warn('💡 提示：请参考 Swagger 文档或 api-docs.json');
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
