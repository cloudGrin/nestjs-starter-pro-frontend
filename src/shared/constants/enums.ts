/**
 * 通用枚举定义
 * 注意：使用常量对象代替enum，以支持erasableSyntaxOnly模式
 */

/**
 * 布尔值枚举
 * 用于数据库中使用数字表示布尔值的场景
 */
export const BooleanEnum = {
  True: 1,
  False: 0,
} as const;

export type BooleanEnum = (typeof BooleanEnum)[keyof typeof BooleanEnum];

/**
 * 排序方向枚举
 */
export const SortEnum = {
  Asc: 'ASC',
  Desc: 'DESC',
} as const;

export type SortEnum = (typeof SortEnum)[keyof typeof SortEnum];

/**
 * 状态枚举
 * 用于表示启用/禁用状态
 */
export const StatusEnum = {
  Enabled: 1,
  Disabled: 0,
} as const;

export type StatusEnum = (typeof StatusEnum)[keyof typeof StatusEnum];
