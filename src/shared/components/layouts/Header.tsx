import { Layout, Avatar, Dropdown, Button, Space, Tooltip } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BulbOutlined,
  BulbFilled,
  DownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { NotificationBell } from '@/features/notification/components/NotificationBell';
import { PermissionGuard } from '@/shared/components/auth/PermissionGuard';
import { useThemeStore } from '@/shared/stores';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

/**
 * 顶部导航栏组件
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
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span className="font-medium text-red-500">退出登录</span>,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <AntHeader className="pl-6! flex items-center justify-between pr-4! header-bg border-b transition-theme">
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggleCollapsed}
        className="text-text-secondary hover:bg-gray-700 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all rounded-lg w-10 h-10 text-lg"
      />

      <Space size="middle">
        <PermissionGuard permissions={['notification:read']}>
          <NotificationBell />
        </PermissionGuard>

        <Tooltip title={themeMode === 'dark' ? '切换为浅色模式' : '切换为深色模式'}>
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
                : 'hover:bg-amber-50 hover:text-amber-600 transition-all rounded-lg'
            }
          />
        </Tooltip>

        <Dropdown
          menu={{
            items: userMenuItems,
          }}
          trigger={['click']}
          placement="bottomRight"
          overlayClassName="min-w-[180px] rounded-xl p-2"
        >
          <div className="user-info-trigger flex items-center cursor-pointer px-3 py-2 rounded-xl transition-all hover:bg-blue-50 dark:hover:bg-gray-700">
            <div className="relative">
              <Avatar
                icon={<UserOutlined />}
                size={42}
                className="mr-3"
                style={{
                  background: '#1677ff',
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
            <div className="ml-2 text-gray-400 dark:text-gray-500 pointer-events-none">
              <DownOutlined />
            </div>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
