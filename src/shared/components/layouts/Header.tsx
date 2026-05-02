import { Layout, Avatar, Dropdown, Button, Space, Tooltip, Breadcrumb } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  LockOutlined,
  BulbOutlined,
  BulbFilled,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { NotificationBell } from '@/features/notification/components/NotificationBell';
import { PermissionGuard } from '@/shared/components/auth/PermissionGuard';
import { useThemeStore } from '@/shared/stores';
import { useBreadcrumb } from '@/shared/hooks/useBreadcrumb';
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
  const breadcrumbItems = useBreadcrumb();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: '修改密码',
      onClick: () => navigate('/profile?tab=password'),
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
      className="header-bg flex shrink-0 items-center justify-between border-b px-4! transition-theme"
      style={{
        height: 'var(--app-header-height)',
        minHeight: 'var(--app-header-height)',
        lineHeight: 'normal',
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="text"
          icon={
            collapsed ? (
              <MenuUnfoldOutlined className="app-header-icon" />
            ) : (
              <MenuFoldOutlined className="app-header-icon" />
            )
          }
          onClick={onToggleCollapsed}
          className="app-header-icon-button"
        />

        {breadcrumbItems.length > 0 && (
          <Breadcrumb
            className="app-breadcrumbs hidden min-w-0 sm:block"
            separator={<RightOutlined className="text-[10px] text-slate-400 dark:text-slate-500" />}
            items={breadcrumbItems.map((item) => ({
              ...item,
              className: 'text-sm text-slate-500 dark:text-slate-400',
            }))}
          />
        )}
      </div>

      <Space size="small" className="shrink-0">
        <PermissionGuard permissions={['notification:read']}>
          <NotificationBell />
        </PermissionGuard>

        <Tooltip title={themeMode === 'dark' ? '切换为浅色模式' : '切换为深色模式'}>
          <Button
            type="text"
            icon={
              themeMode === 'dark' ? (
                <BulbFilled className="app-header-icon" />
              ) : (
                <BulbOutlined className="app-header-icon" />
              )
            }
            onClick={toggleTheme}
            className="app-header-icon-button"
          />
        </Tooltip>

        <Dropdown
          menu={{
            items: userMenuItems,
          }}
          trigger={['click']}
          placement="bottomRight"
          overlayClassName="min-w-[188px] rounded-lg p-2"
        >
          <div className="user-info-trigger flex cursor-pointer items-center rounded-lg px-2 py-1.5 hover:bg-indigo-50 dark:hover:bg-slate-800">
            <div className="relative shrink-0">
              <Avatar
                icon={<UserOutlined />}
                size={38}
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                }}
              />
            </div>
            <div className="ml-2 hidden min-w-0 flex-col sm:flex">
              <span className="max-w-[120px] truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {user?.nickname || user?.username}
              </span>
              <span className="max-w-[120px] truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email || '管理员'}
              </span>
            </div>
            <div className="pointer-events-none ml-2 hidden text-slate-400 dark:text-slate-500 sm:block">
              <DownOutlined />
            </div>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
