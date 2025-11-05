import { Layout, Avatar, Dropdown, Button, Space, Tooltip } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { NotificationBell } from '@/features/notification/components/NotificationBell';
import { useThemeStore } from '@/shared/stores';
import type { MenuProps } from 'antd';
import { motion } from 'framer-motion';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

/**
 * 顶部导航栏组件（企业级设计 - 流畅动画）
 */
export function Header({ collapsed, onToggleCollapsed }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { mode: themeMode, toggleTheme } = useThemeStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <span className="font-medium">个人信息</span>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span className="font-medium text-red-500">退出登录</span>,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <AntHeader
      className="pl-6! flex items-center justify-between pr-4! header-bg border-b transition-theme"
    >
      {/* 折叠按钮 - 添加旋转动画 */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          type="text"
          icon={
            <motion.span
              initial={false}
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="inline-block"
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </motion.span>
          }
          onClick={onToggleCollapsed}
          className="text-text-secondary hover:bg-gray-700 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all rounded-lg w-10 h-10 text-lg"
        />
      </motion.div>

      <Space size="middle">
        {/* 通知铃铛 */}
        <NotificationBell />

        {/* 主题切换按钮 */}
        <Tooltip title={themeMode === 'dark' ? '切换为浅色模式' : '切换为深色模式'}>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="text"
              icon={
                themeMode === 'dark' ? (
                  <BulbFilled style={{ fontSize: '20px' }} className="text-yellow-500" />
                ) : (
                  <BulbOutlined style={{ fontSize: '20px' }} className="text-gray-600" />
                )
              }
              onClick={toggleTheme}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className={
                themeMode === 'dark'
                  ? 'hover:bg-gray-700 hover:text-yellow-400 transition-all rounded-lg'
                  : 'hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 hover:text-amber-600 transition-all rounded-lg'
              }
            />
          </motion.div>
        </Tooltip>

        {/* 用户菜单 - 添加hover动画 */}
        <Dropdown
          menu={{
            items: userMenuItems,
          }}
          trigger={['click']}
          placement="bottomRight"
          overlayClassName="min-w-[180px] rounded-xl p-2"
        >
          <div
            className="user-info-trigger flex items-center cursor-pointer px-3 py-2 rounded-xl transition-all hover:bg-blue-50 dark:hover:bg-gray-700 hover:scale-[1.005] active:scale-[0.98]"
          >
            <div className="avatar-wrapper relative">
              <Avatar
                icon={<UserOutlined />}
                size={42}
                className="mr-3"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              />
            </div>
            <div className="flex flex-col ml-2">
              <span className="text-gray-800 dark:text-gray-200 font-bold text-sm transition-colors">
                {user?.nickname || user?.username}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {user?.email || '管理员'}
              </span>
            </div>
            <motion.div
              className="ml-2 text-gray-400 dark:text-gray-500 pointer-events-none"
              animate={{ y: [0, 2, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              ▼
            </motion.div>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
