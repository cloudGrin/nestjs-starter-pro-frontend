import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const { Content } = Layout;

/**
 * 主布局组件（简化版，已拆分Sidebar和Header）
 */
export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // 检查登录状态
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <Layout className="min-h-screen">
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
