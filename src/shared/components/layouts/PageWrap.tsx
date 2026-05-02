import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';
import { Breadcrumb } from 'antd';
import { useBreadcrumb } from '@/shared/hooks/useBreadcrumb';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { RightOutlined } from '@ant-design/icons';
import styles from './PageWrap.module.css';

interface PageWrapProps {
  /** 页面内容 */
  children: ReactNode;
  /** 页面标题 */
  title?: ReactNode;
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
  includeBreadcrumbs = false,
  sticky = false,
}: PageWrapProps) {
  const breadcrumbItems = useBreadcrumb();

  return (
    <div
      className={cn('flex flex-col w-full h-full', 'bg-gray-50 dark:bg-gray-900', {
        // sticky模式：header固定在顶部
        '[&>.page-wrap-header]:sticky [&>.page-wrap-header]:top-0 [&>.page-wrap-header]:z-10':
          sticky,
        '[&>.page-wrap-content]:overflow-y-auto': sticky,
      })}
    >
      {(header || title || includeBreadcrumbs) && (
        <div
          className={cn(
            'page-wrap-header relative w-full border-b px-5 py-4',
            'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/80'
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
                separator={<RightOutlined className="text-xs text-gray-400 dark:text-slate-400" />}
                items={breadcrumbItems.map((item) => ({
                  ...item,
                  className: cn('text-sm text-gray-500 dark:text-slate-300'),
                }))}
              />
            </div>
          )}

          {title && (
            <div
              className={cn('flex items-center justify-between gap-4', {
                'mb-5': !!header,
              })}
            >
              <h1 className="m-0 min-w-0 text-xl font-bold leading-8 text-black dark:text-white">
                {title}
              </h1>
              {titleRight && (
                <div className="flex items-center gap-2 flex-shrink-0">{titleRight}</div>
              )}
            </div>
          )}

          {header && <ErrorBoundary>{header}</ErrorBoundary>}
        </div>
      )}

      <div className="page-wrap-content flex-1 w-full overflow-auto p-2 lg:p-3">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>

      {footer && (
        <div
          className={cn(
            'page-wrap-footer w-full border-t px-5 py-4',
            'border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900/80'
          )}
        >
          <ErrorBoundary>{footer}</ErrorBoundary>
        </div>
      )}
    </div>
  );
}
