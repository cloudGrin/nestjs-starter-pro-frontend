import type { Notification } from '../types/notification.types';

export function getNotificationLink(notification: Notification): string | undefined {
  const link = notification.metadata?.link;
  return typeof link === 'string' && link.trim() ? link : undefined;
}
