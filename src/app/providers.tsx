import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, App, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { appConfig } from '@/shared/config/app.config';
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

  useEffect(() => {
    document.title = appConfig.title;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1677ff',
            colorInfo: '#1677ff',
            colorLink: '#1677ff',
            borderRadius: 8,
            ...(themeMode === 'dark' && {
              colorBgContainer: '#1e293b',
              colorBgElevated: '#1e293b',
              colorBorder: '#475569',
              colorBorderSecondary: '#334155',
            }),
          },
          components: {
            Card: themeMode === 'dark'
              ? {
                  headerBg: '#1e293b',
                  colorBgContainer: '#1e293b',
                  colorBorderSecondary: '#334155',
                }
              : {},
            Table: themeMode === 'dark'
              ? {
                  headerBg: '#1e293b',
                  headerColor: '#cbd5e1',
                  colorBgContainer: '#1e293b',
                  colorBorderSecondary: '#334155',
                }
              : {},
            Modal: themeMode === 'dark'
              ? {
                  contentBg: '#1e293b',
                  headerBg: '#1e293b',
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
