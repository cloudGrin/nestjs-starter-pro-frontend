/**
 * 查询参数处理工具
 */

/**
 * 过滤查询参数中的空值
 *
 * 移除 undefined、null、空字符串的参数
 * 适用于API查询参数清理
 *
 * @param params 原始查询参数对象
 * @returns 过滤后的查询参数对象
 *
 * @example
 * ```typescript
 * const params = {
 *   name: 'John',
 *   age: undefined,
 *   email: '',
 *   status: 0, // 保留（0是有效值）
 *   isActive: false, // 保留（false是有效值）
 * };
 *
 * const filtered = filterEmptyParams(params);
 * // 结果：{ name: 'John', status: 0, isActive: false }
 * ```
 */
export function filterEmptyParams<T extends Record<string, any>>(
  params: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([_, value]) => {
      // 保留 0 和 false（它们是有效值）
      if (value === 0 || value === false) return true;

      // 过滤掉 undefined、null、空字符串
      return value !== undefined && value !== null && value !== '';
    })
  ) as Partial<T>;
}

/**
 * 构建查询字符串
 *
 * 自动过滤空值并转换为 URL 查询字符串
 *
 * @param params 查询参数对象
 * @returns URL 查询字符串（不包含 '?'）
 *
 * @example
 * ```typescript
 * const params = { name: 'John', age: '', page: 1 };
 * const queryString = buildQueryString(params);
 * // 结果：'name=John&page=1'
 * ```
 */
export function buildQueryString<T extends Record<string, any>>(
  params: T
): string {
  const filtered = filterEmptyParams(params);
  const searchParams = new URLSearchParams();

  Object.entries(filtered).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  return searchParams.toString();
}
