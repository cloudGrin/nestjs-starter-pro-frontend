import {
  BellOutlined,
  CheckSquareOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Badge, SafeArea, TabBar } from 'antd-mobile';
import { useUnreadNotifications } from '@/features/notification/hooks/useNotifications';

const tabItems = [
  { key: '/tasks', title: '任务', icon: <CheckSquareOutlined /> },
  { key: '/insurance', title: '保险', icon: <SafetyCertificateOutlined /> },
  { key: '/notifications', title: '通知', icon: <BellOutlined /> },
  { key: '/profile', title: '我的', icon: <UserOutlined /> },
];

function getActiveTab(pathname: string) {
  return tabItems.find((item) => pathname.startsWith(item.key))?.key ?? '/tasks';
}

export function MobileShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const unreadQuery = useUnreadNotifications();
  const unreadCount = unreadQuery.data?.length ?? 0;
  const activeKey = getActiveTab(location.pathname);

  return (
    <div className="mobile-shell">
      <main className="mobile-content">
        <Outlet />
      </main>
      <footer className="mobile-tabbar">
        <TabBar activeKey={activeKey} onChange={(key: string) => navigate(key)}>
          {tabItems.map((item) => (
            <TabBar.Item
              key={item.key}
              icon={
                item.key === '/notifications' && unreadCount > 0 ? (
                  <Badge content={unreadCount > 99 ? '99+' : unreadCount}>{item.icon}</Badge>
                ) : (
                  item.icon
                )
              }
              title={item.title}
            />
          ))}
        </TabBar>
        <SafeArea position="bottom" />
      </footer>
    </div>
  );
}
