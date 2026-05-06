import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '@/features/notification/types/notification.types';
import { MobileModuleHeader } from './MobileModuleHeader';

const notificationHooks = vi.hoisted(() => ({
  useUnreadNotifications: vi.fn(),
}));

vi.mock('@/features/notification/hooks/useNotifications', () => notificationHooks);

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe('MobileModuleHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notificationHooks.useUnreadNotifications.mockReturnValue({ data: [] });
  });

  it('opens the module menu and navigates to another H5 module', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/tasks']}>
          <Routes>
            <Route
              path="*"
              element={
                <>
                  <MobileModuleHeader title="今天" subtitle="家庭任务" />
                  <LocationProbe />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /menu/ }));
    fireEvent.click(screen.getByText('家庭保险'));

    expect(screen.getByTestId('location')).toHaveTextContent('/insurance');
  });

  it('shows unread notification count in the module menu', () => {
    notificationHooks.useUnreadNotifications.mockReturnValue({
      data: [
        {
          id: 1,
          title: '保险提醒',
          content: '待缴费',
          type: NotificationType.REMINDER,
          status: NotificationStatus.UNREAD,
          priority: NotificationPriority.NORMAL,
          metadata: { module: 'insurance' },
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-01T00:00:00.000Z',
        },
        {
          id: 2,
          title: '任务提醒',
          content: '倒垃圾',
          type: NotificationType.REMINDER,
          status: NotificationStatus.UNREAD,
          priority: NotificationPriority.NORMAL,
          metadata: { module: 'task' },
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-01T00:00:00.000Z',
        },
      ],
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/tasks']}>
          <MobileModuleHeader title="今天" subtitle="家庭任务" />
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /menu/ }));

    expect(
      document.querySelector('.mobile-module-menu-card.notice .mobile-module-menu-badge')
    ).toHaveTextContent('2');
  });
});
