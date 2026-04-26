import { Card, List, Avatar, Tag } from 'antd';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useUsers } from '@/features/rbac/user/hooks/useUsers';
import { useNotifications } from '@/features/notification/hooks/useNotifications';
import { EmptyState, PermissionGuard } from '@/shared/components';
import { useThemeStore } from '@/shared/stores';
import { cn } from '@/shared/utils/cn';
import { UserStatus } from '@/shared/types/user.types';
import {
  NotificationPriority,
  NotificationStatus,
} from '@/features/notification/types/notification.types';

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

function RecentUsersCard() {
  const { mode: themeMode } = useThemeStore();
  const { data: usersData, isLoading: usersLoading } = useUsers({
    page: 1,
    limit: 5,
  });

  const users = usersData?.items || [];

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <UserOutlined />
          最近创建的用户
        </span>
      }
      loading={usersLoading}
    >
      {users.length === 0 ? (
        <EmptyState title="暂无用户" illustrationSize={120} />
      ) : (
        <List
          dataSource={users}
          renderItem={(user) => (
            <List.Item className="rounded-lg px-2!">
              <List.Item.Meta
                avatar={
                  <Avatar style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                }
                title={
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-semibold text-slate-800 dark:text-slate-100">
                      {user.username}
                    </span>
                    {user.status === UserStatus.ACTIVE ? (
                      <Tag color="success">正常</Tag>
                    ) : user.status === UserStatus.DISABLED ? (
                      <Tag color="error">禁用</Tag>
                    ) : (
                      <Tag color="warning">锁定</Tag>
                    )}
                  </div>
                }
                description={
                  <span
                    className={cn(
                      'flex items-center gap-1 text-xs',
                      themeMode === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    )}
                  >
                    <ClockCircleOutlined />
                    {dayjs(user.createdAt).fromNow()}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}

function RecentNotificationsCard() {
  const { mode: themeMode } = useThemeStore();
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications({
    page: 1,
    limit: 5,
  });

  const notifications = notificationsData?.items || [];

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <ClockCircleOutlined />
          最近通知
        </span>
      }
      loading={notificationsLoading}
    >
      {notifications.length === 0 ? (
        <EmptyState title="暂无通知" illustrationSize={120} />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(notification) => (
            <List.Item className="rounded-lg px-2!">
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor:
                        notification.priority === NotificationPriority.URGENT
                          ? '#f5222d'
                          : notification.priority === NotificationPriority.HIGH
                            ? '#faad14'
                            : notification.priority === NotificationPriority.NORMAL
                              ? '#52c41a'
                              : '#1890ff',
                    }}
                    icon={<ClockCircleOutlined />}
                  />
                }
                title={
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-semibold text-slate-800 dark:text-slate-100">
                      {notification.title}
                    </span>
                    {notification.status === NotificationStatus.UNREAD && (
                      <Tag color="red">未读</Tag>
                    )}
                  </div>
                }
                description={
                  <span
                    className={cn(
                      'flex items-center gap-1 text-xs',
                      themeMode === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    )}
                  >
                    <ClockCircleOutlined />
                    {dayjs(notification.createdAt).fromNow()}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}

/**
 * 最近活动组件（已适配深色模式）
 * 显示当前用户有权限访问的最近创建用户和最近通知
 */
export function RecentActivities() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
      <PermissionGuard permissions={['user:read']}>
        <RecentUsersCard />
      </PermissionGuard>
      <PermissionGuard permissions={['notification:read']}>
        <RecentNotificationsCard />
      </PermissionGuard>
    </div>
  );
}
