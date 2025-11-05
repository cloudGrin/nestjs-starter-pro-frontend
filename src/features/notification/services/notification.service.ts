/**
 * 通知服务 - API调用
 */

import { request } from '@/shared/utils/request';
import type {
  Notification,
  CreateNotificationDto,
  QueryNotificationDto,
  MarkReadAllResponse,
} from '../types/notification.types';

const BASE_URL = '/notifications';

interface NotificationListResponse {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 通知服务
 */
export const notificationService = {
  /**
   * 创建通知
   */
  create: (data: CreateNotificationDto) => {
    return request.post<Notification[]>(BASE_URL, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '通知发送成功',
        },
      },
    });
  },

  /**
   * 获取通知列表（分页）
   */
  getList: (params: QueryNotificationDto) => {
    return request.get<NotificationListResponse>(BASE_URL, { params });
  },

  /**
   * 获取未读通知列表
   */
  getUnreadList: () => {
    return request.get<Notification[]>(`${BASE_URL}/unread`);
  },

  /**
   * 标记单条通知为已读
   */
  markAsRead: (id: number) => {
    return request.put<void>(`${BASE_URL}/${id}/read`, undefined, {
      requestOptions: {
        messageConfig: {
          successMessage: '标记已读成功',
        },
      },
    });
  },

  /**
   * 标记所有通知为已读
   */
  markAllAsRead: () => {
    return request.put<MarkReadAllResponse>(`${BASE_URL}/read-all`, undefined, {
      requestOptions: {
        messageConfig: {
          successMessage: '全部标记已读成功',
        },
      },
    });
  },
};
