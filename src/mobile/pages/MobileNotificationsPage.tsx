import { useState } from 'react';
import { Button, Card, Empty, PullToRefresh, Selector, SwipeAction, Tag } from 'antd-mobile';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from '@/features/notification/hooks/useNotifications';
import {
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '@/features/notification/types/notification.types';
import type { Notification } from '@/features/notification/types/notification.types';
import { getMobileNotificationLink } from '@/features/notification/utils/notificationLink';

type NotificationFilter = 'all' | 'unread';

function formatTime(value: string) {
  return dayjs(value).format('MM-DD HH:mm');
}

function priorityColor(priority: Notification['priority']) {
  if (priority === 'urgent' || priority === 'high') return 'danger';
  if (priority === 'low') return 'default';
  return 'primary';
}

function priorityLabel(priority: Notification['priority']) {
  const labels: Record<Notification['priority'], string> = {
    [NotificationPriority.LOW]: '低',
    [NotificationPriority.NORMAL]: '普通',
    [NotificationPriority.HIGH]: '高',
    [NotificationPriority.URGENT]: '紧急',
  };
  return labels[priority] ?? priority;
}

function typeColor(type: Notification['type']) {
  if (type === NotificationType.REMINDER) return 'warning';
  if (type === NotificationType.MESSAGE) return 'primary';
  return 'default';
}

function typeLabel(type: Notification['type']) {
  const labels: Record<Notification['type'], string> = {
    [NotificationType.SYSTEM]: '系统通知',
    [NotificationType.MESSAGE]: '消息通知',
    [NotificationType.REMINDER]: '提醒通知',
  };
  return labels[type] ?? type;
}

export function MobileNotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const notificationsQuery = useNotifications({
    page: 1,
    limit: 50,
    status: filter === 'unread' ? NotificationStatus.UNREAD : undefined,
  });
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const notifications = notificationsQuery.data?.items ?? [];

  const openNotification = (notification: Notification) => {
    if (notification.status === NotificationStatus.UNREAD) {
      markAsRead.mutate(notification.id);
    }
    const link = getMobileNotificationLink(notification);
    if (link?.startsWith('/m/')) {
      navigate(link.replace(/^\/m/, ''));
    }
  };

  return (
    <div className="mobile-page">
      <div className="mobile-page-header">
        <div>
          <h1 className="mobile-title">通知</h1>
          <div className="mobile-subtitle">任务和保险提醒会优先打开 H5 详情</div>
        </div>
        <Button
          size="small"
          loading={markAllAsRead.isPending}
          onClick={() => markAllAsRead.mutate()}
        >
          全部已读
        </Button>
      </div>

      <Selector
        options={[
          { label: '全部', value: 'all' },
          { label: '未读', value: 'unread' },
        ]}
        value={[filter]}
        onChange={(items: Array<string | number>) =>
          setFilter((items[0] as NotificationFilter) || 'all')
        }
      />

      <PullToRefresh onRefresh={async () => void (await notificationsQuery.refetch())}>
        <div className="mobile-section mt-3">
          {notifications.length === 0 ? (
            <Empty description={notificationsQuery.isLoading ? '加载中...' : '暂无通知'} />
          ) : (
            notifications.map((notification) => (
              <SwipeAction
                key={notification.id}
                rightActions={[
                  {
                    key: 'read',
                    text: '已读',
                    color: 'primary',
                    onClick: () => markAsRead.mutate(notification.id),
                  },
                ]}
              >
                <Card className="mobile-card" onClick={() => openNotification(notification)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold">{notification.title}</div>
                      <div className="mobile-subtitle">{formatTime(notification.createdAt)}</div>
                    </div>
                    <div className="flex gap-1">
                      <Tag color={typeColor(notification.type)}>{typeLabel(notification.type)}</Tag>
                      <Tag color={priorityColor(notification.priority)}>
                        {priorityLabel(notification.priority)}
                      </Tag>
                      {notification.status === NotificationStatus.UNREAD ? (
                        <Tag color="warning">未读</Tag>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap mobile-muted">
                    {notification.content}
                  </div>
                </Card>
              </SwipeAction>
            ))
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}
