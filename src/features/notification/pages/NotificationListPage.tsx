/**
 * 通知列表页面
 */

import { useState } from 'react';
import { Card, List, Tag, Button, Space, Tabs, Typography } from 'antd';
import { CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageWrap, StatusBadge, EmptyState } from '@/shared/components';
import { formatDate } from '@/shared/utils';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { NotificationStatus, NotificationType, NotificationPriority } from '../types/notification.types';
import type { Notification } from '../types/notification.types';
import { getNotificationLink } from '../utils/notificationLink';

const { Text } = Typography;

/**
 * 获取通知优先级对应的StatusBadge状态
 */
const getPriorityStatus = (priority: NotificationPriority): 'success' | 'error' | 'warning' | 'default' => {
  const statusMap = {
    [NotificationPriority.LOW]: 'default' as const,
    [NotificationPriority.NORMAL]: 'success' as const,
    [NotificationPriority.HIGH]: 'warning' as const,
    [NotificationPriority.URGENT]: 'error' as const,
  };
  return statusMap[priority] || 'default';
};

/**
 * 获取通知优先级文本
 */
const getPriorityText = (priority: NotificationPriority): string => {
  const texts = {
    [NotificationPriority.LOW]: '低',
    [NotificationPriority.NORMAL]: '普通',
    [NotificationPriority.HIGH]: '高',
    [NotificationPriority.URGENT]: '紧急',
  };
  return texts[priority] || '未知';
};

/**
 * 获取通知类型标签颜色
 */
const getTypeTagColor = (type: NotificationType): string => {
  const colors = {
    [NotificationType.SYSTEM]: 'purple',
    [NotificationType.MESSAGE]: 'cyan',
    [NotificationType.REMINDER]: 'gold',
  };
  return colors[type] || 'default';
};

/**
 * 获取通知类型文本
 */
const getTypeText = (type: NotificationType): string => {
  const texts = {
    [NotificationType.SYSTEM]: '系统通知',
    [NotificationType.MESSAGE]: '消息通知',
    [NotificationType.REMINDER]: '提醒通知',
  };
  return texts[type] || '未知类型';
};

/**
 * 通知列表页面
 */
export const NotificationListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const pageSize = 10;

  // 查询参数
  const queryParams = {
    page,
    limit: pageSize,
    status: activeTab === 'unread' ? NotificationStatus.UNREAD : undefined,
  };

  const { data, isLoading, refetch } = useNotifications(queryParams);
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // 拦截器已经提取了 data 字段，这里直接使用列表响应结构
  const notifications = data?.items || [];
  const total = data?.total || 0;

  /**
   * 处理通知点击
   */
  const handleNotificationClick = (notification: Notification) => {
    // 如果未读，标记为已读
    if (notification.status === NotificationStatus.UNREAD) {
      markAsReadMutation.mutate(notification.id);
    }

    // 如果有链接，跳转到指定页面
    const link = getNotificationLink(notification);
    if (link) {
      navigate(link);
    }
  };

  /**
   * 全部标记为已读
   */
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  /**
   * 刷新列表
   */
  const handleRefresh = () => {
    refetch();
  };

  return (
    <PageWrap
      title="通知中心"
      titleRight={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleMarkAllAsRead}
            loading={markAllAsReadMutation.isPending}
          >
            全部已读
          </Button>
        </Space>
      }
    >
      <Card>
        {/* 标签页 */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key as 'all' | 'unread');
            setPage(1);
          }}
          items={[
            { key: 'all', label: '全部通知' },
            { key: 'unread', label: '未读通知' },
          ]}
        />

        {/* 通知列表 */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <span>加载中...</span>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            title={activeTab === 'unread' ? '暂无未读通知' : '暂无通知'}
            description={
              activeTab === 'unread'
                ? '所有通知都已阅读'
                : '您还没有收到任何通知'
            }
          />
        ) : (
          <List
            dataSource={notifications}
            split={false}
            className="notification-list"
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: (newPage) => setPage(newPage),
              showSizeChanger: false,
              showTotal: (total) => `共 ${total} 条`,
            }}
            renderItem={(notification: Notification) => (
              <List.Item
                key={notification.id}
                className={`cursor-pointer
                  hover:bg-blue-50 dark:hover:bg-gray-700
                  transition-all duration-200
                  !px-4 !py-3 !rounded-lg !mx-0
                  ${
                  notification.status === NotificationStatus.UNREAD
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="w-full">
                  {/* 标题行 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Text strong className="text-base">
                        {notification.title}
                      </Text>
                      {notification.status === NotificationStatus.UNREAD && (
                        <Tag color="red" className="text-xs">
                          未读
                        </Tag>
                      )}
                    </div>
                    <Space>
                      <Tag color={getTypeTagColor(notification.type)}>
                        {getTypeText(notification.type)}
                      </Tag>
                      <StatusBadge
                        status={getPriorityStatus(notification.priority)}
                        text={getPriorityText(notification.priority)}
                      />
                    </Space>
                  </div>

                  {/* 内容 */}
                  <Text className="text-gray-600 block mb-2">
                    {notification.content}
                  </Text>

                  {/* 时间 */}
                  <Text className="text-xs text-gray-400">
                    {formatDate.full(notification.createdAt)} (
                    {formatDate.relative(notification.createdAt)})
                  </Text>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </PageWrap>
  );
};
