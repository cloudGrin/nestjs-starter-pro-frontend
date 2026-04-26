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
            colorPrimary: '#667eea',
            colorInfo: '#667eea',
            colorLink: themeMode === 'dark' ? '#91d1ff' : '#667eea',
            borderRadius: 8,
            colorText: themeMode === 'dark' ? '#e5e7eb' : '#111827',
            colorTextSecondary: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
            colorBorder: themeMode === 'dark' ? 'rgba(102, 126, 234, 0.22)' : '#e2e8f0',
            colorBorderSecondary: themeMode === 'dark' ? 'rgba(102, 126, 234, 0.14)' : '#eef2f7',
            controlHeight: 36,
            controlHeightLG: 42,
            ...(themeMode === 'dark' && {
              colorBgContainer: 'rgba(30, 41, 59, 0.72)',
              colorBgElevated: 'rgba(30, 41, 59, 0.92)',
            }),
          },
          components: {
            Card:
              themeMode === 'dark'
                ? {
                    headerBg: 'rgba(30, 41, 59, 0.52)',
                    colorBgContainer: 'rgba(30, 41, 59, 0.72)',
                    colorBorderSecondary: 'rgba(102, 126, 234, 0.18)',
                    boxShadow: '0 8px 30px rgba(15, 23, 42, 0.22)',
                  }
                : {
                    headerBg: '#ffffff',
                    colorBorderSecondary: '#edf2f7',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                  },
            Table:
              themeMode === 'dark'
                ? {
                    headerBg: 'rgba(30, 41, 59, 0.86)',
                    headerColor: '#cbd5e1',
                    colorBgContainer: 'rgba(30, 41, 59, 0.72)',
                    colorBorderSecondary: 'rgba(102, 126, 234, 0.14)',
                  }
                : {
                    headerBg: '#f8fafc',
                    headerColor: '#334155',
                    colorBorderSecondary: '#edf2f7',
                  },
            Modal:
              themeMode === 'dark'
                ? {
                    contentBg: 'rgba(30, 41, 59, 0.96)',
                    headerBg: 'rgba(30, 41, 59, 0.96)',
                  }
                : {},
            Button: {
              primaryShadow: '0 6px 16px rgba(102, 126, 234, 0.22)',
            },
            Menu: {
              itemBorderRadius: 8,
              itemHeight: 42,
            },
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
