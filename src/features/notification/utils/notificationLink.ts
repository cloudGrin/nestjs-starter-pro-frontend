import type { Notification } from '../types/notification.types';

export function getNotificationLink(notification: Notification): string | undefined {
  const link = notification.metadata?.link;
  return typeof link === 'string' && link.trim() ? link : undefined;
}

export function getMobileNotificationLink(notification: Notification): string | undefined {
  const metadata = notification.metadata ?? {};
  const mobileLink = metadata.mobileLink;
  if (typeof mobileLink === 'string' && mobileLink.trim()) {
    return mobileLink;
  }

  if (metadata.module === 'task' && typeof metadata.taskId === 'number') {
    return `/m/tasks/${metadata.taskId}`;
  }

  if (metadata.module === 'insurance' && typeof metadata.policyId === 'number') {
    return `/m/insurance/${metadata.policyId}`;
  }

  const link = getNotificationLink(notification);
  if (!link) {
    return undefined;
  }

  const legacyTaskMatch = link.match(/^\/tasks\?taskId=(\d+)$/);
  if (legacyTaskMatch?.[1]) {
    return `/m/tasks/${legacyTaskMatch[1]}`;
  }

  const legacyPolicyMatch = link.match(/^\/insurance\?policyId=(\d+)$/);
  if (legacyPolicyMatch?.[1]) {
    return `/m/insurance/${legacyPolicyMatch[1]}`;
  }

  return link.startsWith('/m/') ? link : undefined;
}
