/**
 * 通知 Hooks - 使用 TanStack Query 管理服务端状态
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { notificationService } from '../services/notification.service';
import type { QueryNotificationDto } from '../types/notification.types';

/**
 * Query Keys
 */
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: QueryNotificationDto) => [...notificationKeys.lists(), params] as const,
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
 */
export const useUnreadNotifications = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationService.getUnreadList(),
    enabled: Boolean(token && user),
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
