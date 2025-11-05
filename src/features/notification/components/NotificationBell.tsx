/**
 * 通知铃铛组件 - 顶部导航栏通知按钮
 */

import { Badge, Dropdown, Button, List, Empty, Spin, Typography, Tooltip } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useUnreadNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { NotificationType, NotificationPriority } from '../types/notification.types';
import type { Notification } from '../types/notification.types';
import { useThemeStore } from '@/shared/stores';
import { motion } from 'framer-motion';

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
const getTypeIcon = (type: NotificationType): string => {
  const icons = {
    [NotificationType.SYSTEM]: '🔔',
    [NotificationType.MESSAGE]: '💬',
    [NotificationType.REMINDER]: '⏰',
  };
  return icons[type] || icons[NotificationType.SYSTEM];
};

/**
 * 通知铃铛组件
 */
export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { mode: themeMode } = useThemeStore();
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
    if (notification.link) {
      navigate(notification.link);
    }
  };

  /**
   * 查看全部通知
   */
  const handleViewAll = () => {
    navigate('/notifications');
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
    <div
      className={`w-[400px] max-h-[520px] rounded-2xl overflow-hidden`}
      style={{
        background:
          themeMode === 'dark'
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : '#ffffff',
        backdropFilter: themeMode === 'dark' ? 'blur(20px)' : 'none',
        boxShadow:
          themeMode === 'dark'
            ? '0 12px 40px rgba(0, 0, 0, 0.6), 0 1px 8px rgba(102, 126, 234, 0.2), inset 0 1px 0 rgba(102, 126, 234, 0.1)'
            : '0 12px 40px rgba(0, 0, 0, 0.12)',
        border:
          themeMode === 'dark'
            ? '1px solid rgba(102, 126, 234, 0.25)'
            : '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* 头部 - 渐变背景 */}
      <div
        className="flex items-center justify-between p-5"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div className="font-bold text-lg text-white flex items-center gap-2">
          🔔 通知中心
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
                className={`mb-2 p-3 rounded-xl cursor-pointer transition-all ${
                  themeMode === 'dark'
                    ? 'hover:bg-gray-700/30 hover:border-blue-400/40'
                    : 'hover:shadow-md'
                }`}
                style={{
                  background:
                    themeMode === 'dark'
                      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)'
                      : 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  border:
                    themeMode === 'dark'
                      ? '1px solid rgba(102, 126, 234, 0.18)'
                      : '1px solid rgba(102, 126, 234, 0.1)',
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  {/* 类型图标 - 渐变背景 */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* 通知内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Text
                        strong
                        className={`text-sm ${themeMode === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                      >
                        {notification.title}
                      </Text>
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getPriorityColor(notification.priority) }}
                      />
                    </div>
                    <Text
                      className={`text-xs line-clamp-2 block mb-1 ${
                        themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {notification.content}
                    </Text>
                    <Text className={`text-xs ${themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
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
        <div
          className={`p-3 ${
            themeMode === 'dark'
              ? 'border-t border-gray-700/50 bg-gray-900/30'
              : 'border-t bg-gray-50'
          }`}
        >
          <Button
            type="link"
            onClick={handleViewAll}
            className={`w-full font-medium ${themeMode === 'dark' ? 'hover:text-blue-400' : ''}`}
            style={{ color: themeMode === 'dark' ? '#818cf8' : '#667eea' }}
          >
            查看全部通知 →
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 2px 6px rgba(102, 126, 234, 0.4)',
          }}
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: '20px' }} />}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: themeMode === 'dark' ? '#a3a3a3' : '#64748b',
              }}
              className={
                themeMode === 'dark'
                  ? 'hover:bg-gray-700 hover:text-blue-400 transition-all rounded-lg'
                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all rounded-lg'
              }
            />
          </motion.div>
        </Badge>
      </Tooltip>
    </Dropdown>
  );
};
