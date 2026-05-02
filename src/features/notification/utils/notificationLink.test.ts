import { describe, expect, it } from 'vitest';
import {
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '../types/notification.types';
import type { Notification } from '../types/notification.types';
import { getMobileNotificationLink } from './notificationLink';

function createNotification(metadata: Record<string, unknown>): Notification {
  return {
    id: 1,
    title: '提醒',
    content: '内容',
    type: NotificationType.REMINDER,
    status: NotificationStatus.UNREAD,
    priority: NotificationPriority.NORMAL,
    metadata,
    createdAt: '2026-05-02T00:00:00.000Z',
    updatedAt: '2026-05-02T00:00:00.000Z',
  };
}

describe('getMobileNotificationLink', () => {
  it('prefers explicit mobile links', () => {
    expect(getMobileNotificationLink(createNotification({ mobileLink: '/m/tasks/12' }))).toBe(
      '/m/tasks/12'
    );
  });

  it('builds mobile task and insurance links from metadata', () => {
    expect(getMobileNotificationLink(createNotification({ module: 'task', taskId: 12 }))).toBe(
      '/m/tasks/12'
    );
    expect(
      getMobileNotificationLink(createNotification({ module: 'insurance', policyId: 8 }))
    ).toBe('/m/insurance/8');
  });

  it('converts legacy desktop reminder links', () => {
    expect(getMobileNotificationLink(createNotification({ link: '/tasks?taskId=12' }))).toBe(
      '/m/tasks/12'
    );
    expect(getMobileNotificationLink(createNotification({ link: '/insurance?policyId=8' }))).toBe(
      '/m/insurance/8'
    );
  });
});
