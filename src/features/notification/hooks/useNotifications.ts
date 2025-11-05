/**
 * 通知 Hooks - 使用 TanStack Query 管理服务端状态
 * 通过 WebSocket 实时接收通知推送
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { getSocket } from '@/shared/utils/socket';
import type {
  QueryNotificationDto,
  CreateNotificationDto,
} from '../types/notification.types';

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
  const queryClient = useQueryClient();

  // 监听 WebSocket 通知事件
  useEffect(() => {
    // 定义事件处理器
    const handleNotification = (notification: unknown) => {
      console.log('[WebSocket] New notification received:', notification);
      // 刷新未读通知列表
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    };

    const handleNotificationRead = (data: { id: number }) => {
      console.log('[WebSocket] Notification marked as read:', data.id);
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    };

    const handleNotificationReadAll = (data: { affected: number }) => {
      console.log('[WebSocket] All notifications marked as read:', data.affected);
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    };

    // 尝试获取 socket 并注册事件
    const tryRegisterEvents = () => {
      const socket = getSocket();
      if (!socket || !socket.connected) {
        return false;
      }

      console.log('[useUnreadNotifications] Registering WebSocket event listeners');
      socket.on('notification', handleNotification);
      socket.on('notification:read', handleNotificationRead);
      socket.on('notification:readAll', handleNotificationReadAll);
      return true;
    };

    // 立即尝试注册
    const registered = tryRegisterEvents();

    // 如果未注册成功，设置定时器等待连接
    let retryTimer: NodeJS.Timeout | null = null;
    if (!registered) {
      retryTimer = setInterval(() => {
        if (tryRegisterEvents()) {
          // 注册成功，清除定时器
          if (retryTimer) {
            clearInterval(retryTimer);
            retryTimer = null;
          }
        }
      }, 1000); // 每秒检查一次
    }

    // 清理函数
    return () => {
      // 清除定时器
      if (retryTimer) {
        clearInterval(retryTimer);
      }

      // 移除事件监听
      const socket = getSocket();
      if (socket) {
        socket.off('notification', handleNotification);
        socket.off('notification:read', handleNotificationRead);
        socket.off('notification:readAll', handleNotificationReadAll);
        console.log('[useUnreadNotifications] Removed WebSocket event listeners');
      }
    };
  }, [queryClient]);

  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationService.getUnreadList(),
    // ❌ 不再使用轮询，改用 WebSocket 推送
    // refetchInterval: 30000,
  });
};

/**
 * 创建通知
 */
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotificationDto) =>
      notificationService.create(data),
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
