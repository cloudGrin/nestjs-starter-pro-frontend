import { Card, List, Avatar, Tag, Empty } from 'antd';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useUsers } from '@/features/rbac/user/hooks/useUsers';
import { useThemeStore } from '@/shared/stores';
import { cn } from '@/shared/utils/cn';
import { UserStatus } from '@/shared/types/user.types';
// TODO: 等待实现notification模块
// import { useNotifications } from '@/features/notification/hooks/useNotifications';

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 临时通知类型定义
interface TempNotification {
  id: number;
  title: string;
  level: 'error' | 'warning' | 'success' | 'info';
  isRead: boolean;
  createdAt: string;
}

/**
 * 最近活动组件（已适配深色模式）
 * 显示最近创建的用户和最近的通知
 */
export function RecentActivities() {
  const { mode: themeMode } = useThemeStore();

  // 获取最近创建的5个用户
  const { data: usersData, isLoading: usersLoading } = useUsers({
    page: 1,
    limit: 5,
  });

  // TODO: 等待实现notification模块
  // // 获取最近5条通知
  // const { data: notificationsData, isLoading: notificationsLoading } = useNotifications({
  //   page: 1,
  //   pageSize: 5,
  // });

  const users = usersData?.items || [];
  // const notifications = notificationsData?.items || [];
  const notifications: TempNotification[] = []; // 临时空数组
  const notificationsLoading = false;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* 最近创建的用户 */}
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
          <Empty description="暂无用户" />
        ) : (
          <List
            dataSource={users}
            renderItem={(user) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: '#1890ff' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <span>{user.username}</span>
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
                        'flex items-center gap-1',
                        themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'
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

      {/* 最近通知 */}
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
          <Empty description="暂无通知" />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        backgroundColor:
                          notification.level === 'error'
                            ? '#f5222d'
                            : notification.level === 'warning'
                              ? '#faad14'
                              : notification.level === 'success'
                                ? '#52c41a'
                                : '#1890ff',
                      }}
                      icon={<ClockCircleOutlined />}
                    />
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <span>{notification.title}</span>
                      {!notification.isRead && <Tag color="red">未读</Tag>}
                    </div>
                  }
                  description={
                    <span
                      className={cn(
                        'flex items-center gap-1',
                        themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'
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
    </div>
  );
}
