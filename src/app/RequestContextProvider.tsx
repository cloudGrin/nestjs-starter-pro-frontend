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
import { useEffect } from 'react';
import { App } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';

interface RequestContextProviderProps {
  children: React.ReactNode;
}

// 全局变量：暴露给 request.ts 使用
let globalMessage: MessageInstance;
let globalModal: Omit<ModalStaticFunctions, 'warn'>;

/**
 * 获取全局 message 实例
 */
// eslint-disable-next-line react-refresh/only-export-components
export function getGlobalMessage(): MessageInstance {
  if (!globalMessage) {
    throw new Error('RequestContextProvider not initialized. Make sure it wraps your app.');
  }
  return globalMessage;
}

/**
 * 获取全局 modal 实例
 */
// eslint-disable-next-line react-refresh/only-export-components
export function getGlobalModal(): Omit<ModalStaticFunctions, 'warn'> {
  if (!globalModal) {
    throw new Error('RequestContextProvider not initialized. Make sure it wraps your app.');
  }
  return globalModal;
}

/**
 * 请求上下文 Provider
 */
export function RequestContextProvider({ children }: RequestContextProviderProps) {
  const { message, modal } = App.useApp();

  useEffect(() => {
    // 初始化全局实例
    globalMessage = message;
    globalModal = modal;
  }, [message, modal]);

  return <>{children}</>;
}
