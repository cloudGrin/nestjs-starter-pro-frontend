/**
 * 通知 Hooks - 使用 TanStack Query 管理服务端状态
 * 通过 WebSocket 实时接收通知推送
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { getSocket } from '@/shared/utils/socket';
import type { QueryNotificationDto } from '../types/notification.types';

/**
 * Query Keys
 */
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: QueryNotificationDto) =>
    [...notificationKeys.lists(), params] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
};

/**
 * 获取通知列表（分页）
 */
export const useNotifications = (params: QueryNotificationDto) => {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.getList(params),
  });
};

/**
 * 获取未读通知列表
 * 通过 WebSocket 实时接收推送，无需轮询
 */
export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationService.getUnreadList(),
  });
};

type NotificationSocket = NonNullable<ReturnType<typeof getSocket>>;

/**
 * 统一桥接 WebSocket 通知事件到 TanStack Query 缓存刷新。
 *
 * 该组件应在应用根部挂载一次，避免多个 useUnreadNotifications 调用重复注册监听器。
 */
export function NotificationEventsBridge() {
  const queryClient = useQueryClient();

  // 监听 WebSocket 通知事件
  useEffect(() => {
    const refreshNotificationQueries = () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    };

    const handleNotification = () => refreshNotificationQueries();
    const handleNotificationRead = () => refreshNotificationQueries();
    const handleNotificationReadAll = () => refreshNotificationQueries();

    const register = (socket: NotificationSocket) => {
      socket.on('notification', handleNotification);
      socket.on('notification:read', handleNotificationRead);
      socket.on('notification:readAll', handleNotificationReadAll);
    };

    const unregister = (socket: NotificationSocket) => {
      socket.off('notification', handleNotification);
      socket.off('notification:read', handleNotificationRead);
      socket.off('notification:readAll', handleNotificationReadAll);
    };

    let activeSocket: NotificationSocket | null = null;

    // 尝试获取 socket 并注册事件
    const tryRegisterEvents = () => {
      const socket = getSocket();
      if (!socket?.connected || socket === activeSocket) {
        return;
      }

      if (activeSocket) {
        unregister(activeSocket);
      }

      register(socket);
      activeSocket = socket;
    };

    // 立即尝试注册
    tryRegisterEvents();

    // Socket 会在登录后或 token 刷新后建立/替换，这里持续检查实例变化。
    const retryTimer = setInterval(tryRegisterEvents, 1000);

    // 清理函数
    return () => {
      clearInterval(retryTimer);

      // 移除事件监听
      if (activeSocket) {
        unregister(activeSocket);
      }
    };
  }, [queryClient]);

  return null;
}

/**
 * 标记单条通知为已读
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      // 刷新通知列表和未读通知
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
    },
    // onError已由axios拦截器统一处理
  });
};

/**
 * 标记所有通知为已读
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Service层已配置successMessage，不需要在这里显示
      // 刷新通知列表和未读通知
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
    },
    // onError已由axios拦截器统一处理
  });
};
