/**
 * 通知铃铛组件 - 顶部导航栏通知按钮
 */

import { Badge, Dropdown, Button, List, Empty, Spin, Typography, Tooltip } from 'antd';
import {
  ArrowRightOutlined,
  BellOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useUnreadNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { NotificationType, NotificationPriority } from '../types/notification.types';
import type { Notification } from '../types/notification.types';
import { getNotificationLink } from '../utils/notificationLink';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text } = Typography;

/**
 * 获取通知优先级颜色
 */
const getPriorityColor = (priority: NotificationPriority): string => {
  const colors = {
    [NotificationPriority.LOW]: '#1890ff',
    [NotificationPriority.NORMAL]: '#52c41a',
    [NotificationPriority.HIGH]: '#faad14',
    [NotificationPriority.URGENT]: '#ff4d4f',
  };
  return colors[priority] || colors[NotificationPriority.NORMAL];
};

/**
 * 获取通知类型图标
 */
const getTypeIcon = (type: NotificationType): React.ReactNode => {
  const icons = {
    [NotificationType.SYSTEM]: <BellOutlined />,
    [NotificationType.MESSAGE]: <MessageOutlined />,
    [NotificationType.REMINDER]: <ClockCircleOutlined />,
  };
  return icons[type] || icons[NotificationType.SYSTEM];
};

/**
 * 通知铃铛组件
 */
export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useUnreadNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // 拦截器已经提取了data字段，这里直接使用即可
  const unreadNotifications = data || [];
  const unreadCount = unreadNotifications.length;

  /**
   * 处理通知点击
   */
  const handleNotificationClick = (notification: Notification) => {
    // 标记为已读
    markAsReadMutation.mutate(notification.id);

    // 如果有链接，跳转到指定页面
    const link = getNotificationLink(notification);
    if (link) {
      navigate(link);
    }
  };

  /**
   * 查看全部通知
   */
  const handleViewAll = () => {
    navigate('/system/notifications');
  };

  /**
   * 全部标记为已读
   */
  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  /**
   * 下拉菜单内容
   */
  const dropdownContent = (
    <div className="max-h-[520px] w-[400px] overflow-hidden rounded-lg border border-black/5 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:border-slate-600/80 dark:bg-slate-950">
      <div className="flex items-center justify-between bg-[#1677ff] p-5 dark:bg-slate-800">
        <div className="font-bold text-lg text-white flex items-center gap-2">
          <BellOutlined />
          通知中心
          {unreadCount > 0 && (
            <span className="bg-white/30 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            type="text"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleMarkAllAsRead}
            loading={markAllAsReadMutation.isPending}
            style={{ color: 'white' }}
            className="hover:bg-white/20"
          >
            全部已读
          </Button>
        )}
      </div>

      {/* 通知列表 */}
      <div className="max-h-[380px] overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Spin />
          </div>
        ) : unreadNotifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无未读通知"
            className="py-12"
          />
        ) : (
          <List
            dataSource={unreadNotifications}
            renderItem={(notification: Notification) => (
              <div
                key={notification.id}
                className="mb-2 cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-3 hover:bg-indigo-50 dark:border-slate-600/80 dark:bg-slate-800/90 dark:hover:border-blue-400/40 dark:hover:bg-gray-700/30"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#e6f4ff] text-xl text-[#1677ff] dark:bg-slate-700 dark:text-blue-300">
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* 通知内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Text strong className="text-sm text-gray-800 dark:text-gray-200">
                        {notification.title}
                      </Text>
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getPriorityColor(notification.priority) }}
                      />
                    </div>
                    <Text className="mb-1 block line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                      {notification.content}
                    </Text>
                    <Text className="text-xs text-gray-400 dark:text-gray-500">
                      {dayjs(notification.createdAt).fromNow()}
                    </Text>
                  </div>
                </div>
              </div>
            )}
          />
        )}
      </div>

      {/* 底部 */}
      {unreadNotifications.length > 0 && (
        <div className="border-t bg-gray-50 p-3 dark:border-gray-700/50 dark:bg-gray-900/30">
          <Button
            type="link"
            onClick={handleViewAll}
            className="w-full font-medium text-[#1677ff]! dark:hover:text-blue-400!"
          >
            查看全部通知 <ArrowRightOutlined />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown popupRender={() => dropdownContent} trigger={['click']} placement="bottomRight">
      <Tooltip title={unreadCount > 0 ? `${unreadCount} 条未读通知` : '通知中心'}>
        <Badge
          count={unreadCount}
          offset={[-4, 4]}
          style={{
            background: '#1677ff',
          }}
        >
          <Button
            type="text"
            icon={<BellOutlined className="app-header-icon" />}
            className="app-header-icon-button"
          />
        </Badge>
      </Tooltip>
    </Dropdown>
  );
};
