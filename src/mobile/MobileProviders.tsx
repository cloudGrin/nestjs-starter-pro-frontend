import { useEffect, useLayoutEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Dialog, Toast } from 'antd-mobile';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import { queryClient } from '@/shared/config/query.config';
import { useThemeStore } from '@/shared/stores';
import { registerRequestFeedback } from '@/shared/utils/requestFeedback';

interface MobileProvidersProps {
  children: React.ReactNode;
}

export function MobileProviders({ children }: MobileProvidersProps) {
  const themeMode = useThemeStore((state) => state.mode);

  useEffect(() => {
    document.title = '家庭助手';
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  useLayoutEffect(() => {
    return registerRequestFeedback({
      success: (content) => Toast.show({ icon: 'success', content, position: 'center' }),
      error: (content) => Toast.show({ icon: 'fail', content, position: 'center' }),
      notifyError: ({ message, description }) => {
        void Dialog.alert({
          title: message,
          content: description || message,
          confirmText: '知道了',
        });
      },
      confirm: (options) =>
        Dialog.confirm({
          title: options.title || '确认操作',
          content: options.message,
          confirmText: options.okText || '确认',
          cancelText: options.cancelText || '取消',
        }),
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN}>{children}</ConfigProvider>
    </QueryClientProvider>
  );
}
