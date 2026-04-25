/**
 * 错误边界组件
 *
 * 用途：
 * 1. 捕获子组件的 JavaScript 错误
 * 2. 显示友好的错误页面
 * 3. 防止整个应用崩溃
 *
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button, Result } from 'antd';
import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';

interface ErrorBoundaryProps {
  /** 子元素 */
  children: ReactNode;
  /** 自定义错误页面 */
  fallback?: ReactNode;
}

/**
 * 错误回退页面
 */
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const currentError = error instanceof Error ? error : new Error(String(error));

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Result
        status="error"
        title="页面出错了"
        subTitle="抱歉，页面遇到了一个错误。您可以刷新页面重试，或联系管理员。"
        extra={[
          <Button key="refresh" type="primary" onClick={() => window.location.reload()}>
            刷新页面
          </Button>,
          <Button key="reset" onClick={resetErrorBoundary}>
            重试
          </Button>,
        ]}
      >
        {/* 开发环境：显示错误详情 */}
        {import.meta.env.DEV && (
          <div className="mt-4 text-left">
            <details className="bg-red-50 border border-red-200 rounded p-4">
              <summary className="cursor-pointer font-medium text-red-800">
                错误详情（仅开发环境可见）
              </summary>
              <pre className="mt-2 text-sm text-red-600 overflow-auto">
                {currentError.message}
                {'\n\n'}
                {currentError.stack}
              </pre>
            </details>
          </div>
        )}
      </Result>
    </div>
  );
}

/**
 * 错误处理函数
 */
function onError(error: unknown, errorInfo: React.ErrorInfo) {
  // 开发环境：打印错误到控制台
  if (import.meta.env.DEV) {
    console.groupCollapsed('🚨 ErrorBoundary caught an error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.groupEnd();
  }
}

/**
 * 错误边界组件
 */
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : ErrorFallback}
      onError={onError}
    >
      {children}
    </ReactErrorBoundary>
  );
}
