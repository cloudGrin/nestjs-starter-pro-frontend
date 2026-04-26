import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUnreadNotifications } from './useNotifications';
import { renderWithProviders } from '@/test/test-utils';

const serviceMocks = vi.hoisted(() => ({
  getList: vi.fn(),
  getUnreadList: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
}));

vi.mock('../services/notification.service', () => ({
  notificationService: {
    getList: serviceMocks.getList,
    getUnreadList: serviceMocks.getUnreadList,
    markAsRead: serviceMocks.markAsRead,
    markAllAsRead: serviceMocks.markAllAsRead,
  },
}));

function UnreadNotificationsConsumer() {
  useUnreadNotifications();
  return null;
}

describe('notification hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMocks.getUnreadList.mockResolvedValue([]);
  });

  it('useUnreadNotifications 只负责查询未读通知', async () => {
    renderWithProviders(
      <>
        <UnreadNotificationsConsumer />
        <UnreadNotificationsConsumer />
      </>
    );

    await waitFor(() => expect(serviceMocks.getUnreadList).toHaveBeenCalled());
  });
});
