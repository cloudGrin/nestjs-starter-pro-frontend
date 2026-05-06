import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '@/features/notification/types/notification.types';
import type { Notification } from '@/features/notification/types/notification.types';
import { MobileNotificationsPage } from './MobileNotificationsPage';

const hookMocks = vi.hoisted(() => ({
  useNotifications: vi.fn(),
  useMarkAsRead: vi.fn(),
  useMarkAllAsRead: vi.fn(),
}));

vi.mock('@/features/notification/hooks/useNotifications', () => hookMocks);

const markAsRead = vi.fn();
const markAllAsRead = vi.fn();
const refetch = vi.fn().mockResolvedValue(undefined);

function createNotification(overrides: Partial<Notification>): Notification {
  return {
    id: 1,
    title: '系统通知',
    content: '请查看通知中心',
    type: NotificationType.SYSTEM,
    status: NotificationStatus.UNREAD,
    priority: NotificationPriority.NORMAL,
    createdAt: '2026-05-04T08:00:00.000Z',
    updatedAt: '2026-05-04T08:00:00.000Z',
    ...overrides,
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <MobileNotificationsPage />
    </MemoryRouter>
  );
}

describe('MobileNotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookMocks.useNotifications.mockReturnValue({
      data: {
        items: [
          createNotification({
            id: 103,
            title: '任务提醒：倒垃圾',
            content: '厨房垃圾桶满了',
            type: NotificationType.REMINDER,
            status: NotificationStatus.UNREAD,
            priority: NotificationPriority.HIGH,
            metadata: { module: 'task', taskId: 8, mobileLink: '/m/tasks/8' },
            createdAt: '2026-05-04T10:00:00.000Z',
          }),
          createNotification({
            id: 102,
            title: '任务提醒：倒垃圾',
            content: '厨房垃圾桶满了',
            type: NotificationType.REMINDER,
            status: NotificationStatus.READ,
            priority: NotificationPriority.HIGH,
            metadata: { module: 'task', taskId: 8, mobileLink: '/m/tasks/8' },
            createdAt: '2026-05-04T09:30:00.000Z',
          }),
          createNotification({
            id: 101,
            title: '任务提醒：倒垃圾',
            content: '厨房垃圾桶满了',
            type: NotificationType.REMINDER,
            status: NotificationStatus.UNREAD,
            priority: NotificationPriority.HIGH,
            metadata: { module: 'task', taskId: 8, mobileLink: '/m/tasks/8' },
            createdAt: '2026-05-04T09:00:00.000Z',
          }),
          createNotification({
            id: 99,
            title: '家庭群聊',
            content: '妈妈发来一条消息',
            type: NotificationType.MESSAGE,
            metadata: { mobileLink: '/m/family/chat' },
            createdAt: '2026-05-04T08:30:00.000Z',
          }),
        ],
        meta: { totalItems: 4 },
      },
      isLoading: false,
      refetch,
    });
    hookMocks.useMarkAsRead.mockReturnValue({ mutate: markAsRead });
    hookMocks.useMarkAllAsRead.mockReturnValue({ mutate: markAllAsRead, isPending: false });
  });

  it('merges repeated task reminders and shows a repeat badge', () => {
    renderPage();

    expect(screen.getAllByText('任务提醒：倒垃圾')).toHaveLength(1);
    expect(screen.getByText('3次')).toBeInTheDocument();
    expect(screen.getByText('家庭群聊')).toBeInTheDocument();
  });

  it('marks every unread notification in a merged reminder group as read when opened', () => {
    renderPage();

    fireEvent.click(screen.getByText('任务提醒：倒垃圾').closest('.mobile-notification-card')!);

    expect(markAsRead).toHaveBeenCalledTimes(2);
    expect(markAsRead).toHaveBeenCalledWith(103);
    expect(markAsRead).toHaveBeenCalledWith(101);
  });
});
