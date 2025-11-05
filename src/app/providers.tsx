import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, App, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { queryClient } from '@/shared/config/query.config';
import { RequestContextProvider } from './RequestContextProvider';
import { useThemeStore } from '@/shared/stores';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * 应用全局 Providers
 *
 * 说明：
 * - 主题同步由index.html的防闪烁脚本和themeStore共同处理
 * - 不需要在这里添加useEffect同步主题，避免重复处理
 */
export function AppProviders({ children }: AppProvidersProps) {
  const themeMode = useThemeStore((state) => state.mode);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#667eea', // 品牌色（蓝紫色）
            colorInfo: '#667eea',
            colorLink: '#91d1ff', // 深色模式下的链接色更亮
            borderRadius: 8, // 增加圆角
            // 深色模式下的玻璃拟态配色
            ...(themeMode === 'dark' && {
              colorBgContainer: 'rgba(30, 41, 59, 0.6)', // Card/Modal背景：半透明深色
              colorBgElevated: 'rgba(30, 41, 59, 0.8)', // Dropdown/Popover背景：更不透明
              colorBorder: 'rgba(102, 126, 234, 0.2)', // 边框：品牌色
              colorBorderSecondary: 'rgba(102, 126, 234, 0.1)',
            }),
          },
          components: {
            // Card 玻璃拟态样式
            Card: themeMode === 'dark'
              ? {
                  headerBg: 'rgba(30, 41, 59, 0.4)',
                  colorBgContainer: 'rgba(30, 41, 59, 0.6)',
                  colorBorderSecondary: 'rgba(102, 126, 234, 0.2)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.08)',
                }
              : {},
            // Table 玻璃拟态样式
            Table: themeMode === 'dark'
              ? {
                  headerBg: 'rgba(30, 41, 59, 0.5)',
                  headerColor: '#cbd5e1',
                  colorBgContainer: 'rgba(30, 41, 59, 0.4)',
                  colorBorderSecondary: 'rgba(102, 126, 234, 0.15)',
                }
              : {},
            // Modal 玻璃拟态样式
            Modal: themeMode === 'dark'
              ? {
                  contentBg: 'rgba(30, 41, 59, 0.9)',
                  headerBg: 'rgba(30, 41, 59, 0.95)',
                  boxShadow: '0 12px 48px rgba(102, 126, 234, 0.15)',
                }
              : {},
          },
        }}
      >
        <App>
          <RequestContextProvider>{children}</RequestContextProvider>
        </App>
      </ConfigProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
