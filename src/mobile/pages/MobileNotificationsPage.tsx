import { useState } from 'react';
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';
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
import { MobileModuleHeader } from '../components/MobileModuleHeader';

type NotificationFilter = 'all' | 'unread';

interface NotificationGroup {
  key: string;
  primary: Notification;
  notifications: Notification[];
  unreadCount: number;
}

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

function typeIcon(type: Notification['type']) {
  if (type === NotificationType.REMINDER) return <ClockCircleOutlined />;
  if (type === NotificationType.MESSAGE) return <MessageOutlined />;
  return <BellOutlined />;
}

function getTaskReminderGroupKey(notification: Notification) {
  if (notification.type !== NotificationType.REMINDER) return null;

  const metadata = notification.metadata ?? {};
  const taskId = metadata.taskId;
  if (metadata.module !== 'task') return null;
  if (typeof taskId === 'number') return `task-reminder:${taskId}`;
  if (typeof taskId === 'string' && taskId.trim()) return `task-reminder:${taskId.trim()}`;
  return null;
}

function groupNotifications(notifications: Notification[]): NotificationGroup[] {
  const groups = new Map<string, NotificationGroup>();

  notifications.forEach((notification) => {
    const repeatedReminderKey = getTaskReminderGroupKey(notification);
    const key = repeatedReminderKey ?? `notification:${notification.id}`;
    const group = groups.get(key);

    if (group) {
      group.notifications.push(notification);
      group.unreadCount += notification.status === NotificationStatus.UNREAD ? 1 : 0;
      return;
    }

    groups.set(key, {
      key,
      primary: notification,
      notifications: [notification],
      unreadCount: notification.status === NotificationStatus.UNREAD ? 1 : 0,
    });
  });

  return Array.from(groups.values());
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
  const notificationGroups = groupNotifications(notifications);
  const unreadCount = notifications.filter(
    (notification) => notification.status === NotificationStatus.UNREAD
  ).length;
  const mergedCount = notifications.length - notificationGroups.length;

  const markGroupAsRead = (group: NotificationGroup) => {
    group.notifications.forEach((notification) => {
      if (notification.status !== NotificationStatus.UNREAD) return;
      markAsRead.mutate(notification.id);
    });
  };

  const openNotification = (group: NotificationGroup) => {
    markGroupAsRead(group);
    const link = getMobileNotificationLink(group.primary);
    if (link?.startsWith('/m/')) {
      navigate(link.replace(/^\/m/, ''));
    }
  };

  return (
    <div className="mobile-page mobile-notification-page">
      <MobileModuleHeader
        title="通知"
        actions={
          <Button
            size="small"
            className="mobile-notification-read-all"
            loading={markAllAsRead.isPending}
            onClick={() => markAllAsRead.mutate()}
          >
            <CheckCircleOutlined />
            <span>全部已读</span>
          </Button>
        }
      />

      <section className="mobile-notification-hero">
        <div>
          <span>通知中心</span>
          <strong>{unreadCount > 0 ? `${unreadCount} 条未读` : '都已处理'}</strong>
        </div>
        <div className="mobile-notification-hero-stats">
          <span>{notificationGroups.length} 组</span>
          <span>{mergedCount > 0 ? `已合并 ${mergedCount} 条` : '无重复提醒'}</span>
        </div>
      </section>

      <Selector
        className="mobile-notification-filter"
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
        <div className="mobile-notification-list">
          {notifications.length === 0 ? (
            <Empty
              className="mobile-notification-empty"
              description={notificationsQuery.isLoading ? '加载中...' : '暂无通知'}
            />
          ) : (
            notificationGroups.map((group) => (
              <SwipeAction
                key={group.key}
                rightActions={[
                  {
                    key: 'read',
                    text: '已读',
                    color: 'primary',
                    onClick: () => markGroupAsRead(group),
                  },
                ]}
              >
                <Card
                  className={`mobile-notification-card${group.unreadCount > 0 ? ' unread' : ''}`}
                  onClick={() => openNotification(group)}
                >
                  <div className={`mobile-notification-icon ${group.primary.type}`}>
                    {typeIcon(group.primary.type)}
                  </div>
                  <div className="mobile-notification-main">
                    <div className="mobile-notification-title-row">
                      <strong>{group.primary.title}</strong>
                      {group.notifications.length > 1 ? (
                        <span className="mobile-notification-repeat-badge">
                          {group.notifications.length}次
                        </span>
                      ) : null}
                    </div>

                    <div className="mobile-notification-content">{group.primary.content}</div>

                    <div className="mobile-notification-meta">
                      <span>{formatTime(group.primary.createdAt)}</span>
                      <Tag color={typeColor(group.primary.type)}>
                        {typeLabel(group.primary.type)}
                      </Tag>
                      <Tag color={priorityColor(group.primary.priority)}>
                        {priorityLabel(group.primary.priority)}
                      </Tag>
                      {group.unreadCount > 0 ? (
                        <Tag color="warning">
                          {group.unreadCount > 1 ? `${group.unreadCount} 未读` : '未读'}
                        </Tag>
                      ) : null}
                    </div>
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
