/**
 * 通知类型定义
 */

/**
 * 通知类型枚举
 */
export const NotificationType = {
  SYSTEM: 'system', // 系统通知
  MESSAGE: 'message', // 消息通知
  REMINDER: 'reminder', // 提醒通知
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

/**
 * 通知状态枚举
 */
export const NotificationStatus = {
  UNREAD: 'unread', // 未读
  READ: 'read', // 已读
} as const;

export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

/**
 * 通知优先级枚举
 */
export const NotificationPriority = {
  LOW: 'low', // 低
  NORMAL: 'normal', // 普通
  HIGH: 'high', // 高
  URGENT: 'urgent', // 紧急
} as const;

export type NotificationPriority = (typeof NotificationPriority)[keyof typeof NotificationPriority];

/**
 * 通知实体
 */
export interface Notification {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  status: NotificationStatus;
  priority: NotificationPriority;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建通知DTO
 */
export interface CreateNotificationDto {
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetUserIds?: number[]; // 指定接收用户
  broadcast?: boolean; // true表示广播给所有用户
  link?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 查询通知DTO
 */
export interface QueryNotificationDto {
  page?: number;
  limit?: number;
  status?: NotificationStatus; // 通知状态过滤
  type?: NotificationType; // 通知类型过滤
  keyword?: string; // 关键字搜索
  startDate?: string; // 开始日期
  endDate?: string; // 结束日期
}

/**
 * 标记已读响应
 */
export interface MarkReadAllResponse {
  message: string;
  affected: number;
}
