import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const { Content } = Layout;
const MOBILE_SIDEBAR_QUERY = '(max-width: 767px)';

function getInitialCollapsed() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia(MOBILE_SIDEBAR_QUERY).matches;
}

/**
 * 主布局组件（简化版，已拆分Sidebar和Header）
 */
export function MainLayout() {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_SIDEBAR_QUERY);
    const syncCollapsed = (event: MediaQueryListEvent) => {
      setCollapsed(event.matches);
    };

    mediaQuery.addEventListener('change', syncCollapsed);
    return () => mediaQuery.removeEventListener('change', syncCollapsed);
  }, []);

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
