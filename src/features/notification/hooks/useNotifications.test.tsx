import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NotificationEventsBridge,
  notificationKeys,
  useUnreadNotifications,
} from './useNotifications';
import { createTestQueryClient, renderWithProviders } from '@/test/test-utils';

const socketMocks = vi.hoisted(() => ({
  socket: {
    connected: true,
    on: vi.fn(),
    off: vi.fn(),
  },
  getSocket: vi.fn(),
  getList: vi.fn(),
  getUnreadList: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
}));

vi.mock('@/shared/utils/socket', () => ({
  getSocket: socketMocks.getSocket,
}));

vi.mock('../services/notification.service', () => ({
  notificationService: {
    getList: socketMocks.getList,
    getUnreadList: socketMocks.getUnreadList,
    markAsRead: socketMocks.markAsRead,
    markAllAsRead: socketMocks.markAllAsRead,
  },
}));

function UnreadNotificationsConsumer() {
  useUnreadNotifications();
  return null;
}

describe('notification hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socketMocks.getSocket.mockReturnValue(socketMocks.socket);
    socketMocks.getUnreadList.mockResolvedValue([]);
  });

  it('useUnreadNotifications 只负责查询，不隐式注册 WebSocket 监听', async () => {
    renderWithProviders(
      <>
        <UnreadNotificationsConsumer />
        <UnreadNotificationsConsumer />
      </>
    );

    await waitFor(() => expect(socketMocks.getUnreadList).toHaveBeenCalled());

    expect(socketMocks.socket.on).not.toHaveBeenCalled();
  });

  it('NotificationEventsBridge 统一注册通知事件并刷新通知查询', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    render(
      <QueryClientProvider client={queryClient}>
        <NotificationEventsBridge />
      </QueryClientProvider>
    );

    await waitFor(() => expect(socketMocks.socket.on).toHaveBeenCalledTimes(3));

    const notificationHandler = socketMocks.socket.on.mock.calls.find(
      ([eventName]) => eventName === 'notification'
    )?.[1] as (notification: unknown) => void;

    act(() => {
      notificationHandler({ id: 1 });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: notificationKeys.unread() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: notificationKeys.lists() });
  });
});
