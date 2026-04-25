import { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { NotificationEventsBridge } from '@/features/notification/hooks/useNotifications';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const { Content } = Layout;

/**
 * 主布局组件（简化版，已拆分Sidebar和Header）
 */
export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen">
      <NotificationEventsBridge />
      <Sidebar collapsed={collapsed} />

      <Layout className="content-bg transition-theme">
        <Header collapsed={collapsed} onToggleCollapsed={() => setCollapsed(!collapsed)} />

        <Content className="h-full overflow-y-auto relative w-full overflow-x-hidden bg-transparent">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
