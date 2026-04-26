import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { NotificationBell } from './NotificationBell';
import { renderWithProviders, userEvent } from '@/test/test-utils';
import { NotificationPriority, NotificationStatus, NotificationType } from '../types/notification.types';

const navigateMock = vi.fn();

const hookMocks = vi.hoisted(() => ({
  useUnreadNotifications: vi.fn(),
  useMarkAsRead: vi.fn(),
  useMarkAllAsRead: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('../hooks/useNotifications', () => hookMocks);

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookMocks.useUnreadNotifications.mockReturnValue({
      data: [
        {
          id: 1,
          title: '系统通知',
          content: '请查看通知中心',
          type: NotificationType.SYSTEM,
          status: NotificationStatus.UNREAD,
          priority: NotificationPriority.NORMAL,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      isLoading: false,
    });
    hookMocks.useMarkAsRead.mockReturnValue({ mutate: vi.fn(), isPending: false });
    hookMocks.useMarkAllAsRead.mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it('opens the backend menu route when viewing all notifications', async () => {
    renderWithProviders(<NotificationBell />);

    await userEvent.click(screen.getByRole('button', { name: 'bell' }));
    await userEvent.click(await screen.findByRole('button', { name: /查看全部通知/ }));

    expect(navigateMock).toHaveBeenCalledWith('/system/notifications');
  });
});
