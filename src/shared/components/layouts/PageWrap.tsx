import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';
import { Breadcrumb } from 'antd';
import { useBreadcrumb } from '@/shared/hooks/useBreadcrumb';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { RightOutlined } from '@ant-design/icons';
import styles from './PageWrap.module.css';
import { useThemeStore } from '@/shared/stores';

interface PageWrapProps {
  /** 页面内容 */
  children: ReactNode;
  /** 页面标题 */
  title?: string;
  /** 标题右侧内容（通常是操作按钮） */
  titleRight?: ReactNode;
  /** 头部额外内容（通常是SearchForm） */
  header?: ReactNode;
  /** 底部内容 */
  footer?: ReactNode;
  /** 是否显示面包屑 */
  includeBreadcrumbs?: boolean;
  /** 是否启用sticky头部 */
  sticky?: boolean;
}

/**
 * 页面包装组件
 * 提供统一的页面布局结构
 */
export function PageWrap({
  children,
  title,
  titleRight,
  header,
  footer,
  includeBreadcrumbs = true,
  sticky = false,
}: PageWrapProps) {
  const { mode: themeMode } = useThemeStore();
  const breadcrumbItems = useBreadcrumb();

  return (
    <div
      className={cn('flex flex-col w-full h-full', themeMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50', {
        // sticky模式：header固定在顶部
        '[&>.page-wrap-header]:sticky [&>.page-wrap-header]:top-0 [&>.page-wrap-header]:z-10 [&>.page-wrap-header]:shadow-sm':
          sticky,
        '[&>.page-wrap-content]:overflow-y-auto': sticky,
      })}
    >
      {(header || title || includeBreadcrumbs) && (
        <div
          className={cn(
            'page-wrap-header relative w-full px-6 py-5 border-b',
            themeMode === 'dark'
              ? 'bg-slate-900 border-slate-700'
              : 'bg-white border-gray-200'
          )}
        >
          {includeBreadcrumbs && breadcrumbItems.length > 0 && (
            <div
              className={cn(styles['breadcrumb-container'], 'pt-0.5', {
                'mb-4': !!title || !!header,
              })}
            >
              <Breadcrumb
                className="app-breadcrumbs"
                separator={
                  <RightOutlined
                    className={cn(
                      'text-xs transition-colors',
                      themeMode === 'dark' ? 'text-slate-300' : 'text-gray-400' // 深色模式更亮
                    )}
                  />
                }
                items={breadcrumbItems.map((item, index) => ({
                  ...item,
                  className: cn(
                    'text-sm transition-all duration-200',
                    index === breadcrumbItems.length - 1
                      ? themeMode === 'dark'
                        ? 'text-slate-100 font-semibold'
                        : 'text-gray-900 font-semibold'
                      : themeMode === 'dark'
                        ? 'text-slate-300 hover:text-slate-100 cursor-pointer'
                        : 'text-gray-500 hover:text-blue-600 cursor-pointer'
                  ),
                }))}
              />
            </div>
          )}

          {title && (
            <div
              className={cn('flex items-center justify-between', {
                'mb-5': !!header,
              })}
            >
              <h1
                className={cn(
                  'text-xl font-bold leading-8 m-0',
                  themeMode === 'dark'
                    ? 'text-white'
                    : 'text-black'
                )}
              >
                {title}
              </h1>
              {titleRight && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {titleRight}
                </div>
              )}
            </div>
          )}

          {header && <ErrorBoundary>{header}</ErrorBoundary>}
        </div>
      )}

      <div className="page-wrap-content flex-1 w-full p-4 overflow-auto">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>

      {footer && (
        <div
          className={cn(
            'page-wrap-footer w-full px-6 py-4 border-t',
            themeMode === 'dark'
              ? 'bg-slate-900 border-slate-700'
              : 'bg-white border-gray-200'
          )}
        >
          <ErrorBoundary>{footer}</ErrorBoundary>
        </div>
      )}
    </div>
  );
}
