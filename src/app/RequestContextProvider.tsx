/**
 * 请求上下文 Provider
 *
 * 用途：
 * 1. 为 axios 拦截器提供 message 和 modal 实例
 * 2. 解决 Ant Design 5.x 静态方法无法获取 App 上下文的问题
 *
 * 原理：
 * - 使用 App.useApp() 获取 message 和 modal 实例
 * - 通过全局变量暴露给 request.ts
 */
import { useLayoutEffect } from 'react';
import { App } from 'antd';
import { notification } from 'antd';
import { registerRequestFeedback } from '@/shared/utils/requestFeedback';

interface RequestContextProviderProps {
  children: React.ReactNode;
}

/**
 * 请求上下文 Provider
 */
export function RequestContextProvider({ children }: RequestContextProviderProps) {
  const { message, modal } = App.useApp();

  useLayoutEffect(() => {
    return registerRequestFeedback({
      success: (content) => message.success(content),
      error: (content) => message.error(content),
      notifyError: (options) => notification.error(options),
      confirm: (options) =>
        new Promise((resolve) => {
          modal.confirm({
            title: options.title || '确认操作',
            content: options.message,
            okText: options.okText || '确认',
            cancelText: options.cancelText || '取消',
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
          });
        }),
    });
  }, [message, modal]);

  return <>{children}</>;
}
