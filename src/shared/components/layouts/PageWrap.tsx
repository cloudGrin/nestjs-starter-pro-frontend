/**
 * 页面包装组件（企业级设计）
 *
 * 用途：
 * 1. 统一页面布局结构（头部+内容+底部）
 * 2. 提供现代化的header区域（毛玻璃+渐变+动画）
 * 3. 浅灰背景的content区域（内部Card自带白色背景，形成层次感）
 * 4. 支持sticky头部（滚动时标题区域固定）
 * 5. 自动根据菜单生成面包屑
 *
 * @example
 * <PageWrap
 *   title="用户管理"
 *   titleRight={<Button>导出</Button>}
 *   header={<SearchForm />}
 * >
 *   <Card>内容</Card>
 * </PageWrap>
 */
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
  // 自动根据菜单生成面包屑
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
      {/* 头部区域（现代化设计 - 毛玻璃 + 渐变） */}
      {(header || title || includeBreadcrumbs) && (
        <div
          className={cn(
            'page-wrap-header relative w-full px-6 py-5 backdrop-blur-xl border-b',
            themeMode === 'dark'
              ? 'bg-slate-900/50 border-slate-700/30' // 深色半透明 + 低调边框
              : 'bg-white/80 border-gray-200/50'
          )}
        >
          {/* 微妙的单色调渐变装饰 */}
          <div
            className={cn(
              'absolute inset-0 -z-10',
              themeMode === 'dark'
                ? 'bg-gradient-to-br from-slate-800/30 via-slate-900/20 to-slate-800/30' // 单色调灰色渐变，更柔和
                : 'bg-gradient-to-r from-blue-50/30 via-purple-50/20 to-pink-50/30'
            )}
          />
          {/* 极微妙的品牌色点缀（几乎看不见） */}
          {themeMode === 'dark' && (
            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-blue-600/3 via-transparent to-purple-600/3" />
          )}

          {/* 面包屑（垂直居中对齐） */}
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
                        ? 'text-blue-200 font-semibold' // 当前页：更亮的蓝色（从300→200）
                        : 'text-gray-900 font-semibold'
                      : themeMode === 'dark'
                        ? 'text-slate-200 hover:text-blue-100 cursor-pointer' // 父级：更亮的浅灰（slate-200）
                        : 'text-gray-500 hover:text-blue-600 cursor-pointer'
                  ),
                }))}
              />
            </div>
          )}

          {/* 标题 */}
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

          {/* 头部额外内容（SearchForm等） */}
          {header && <ErrorBoundary>{header}</ErrorBoundary>}
        </div>
      )}

      {/* 内容区域（浅灰背景） */}
      <div className="page-wrap-content flex-1 w-full p-4 overflow-auto">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>

      {/* 底部区域 */}
      {footer && (
        <div
          className={cn(
            'page-wrap-footer w-full px-6 py-4 border-t backdrop-blur-xl',
            themeMode === 'dark'
              ? 'bg-slate-900/60 border-purple-500/20' // 与header保持一致
              : 'bg-white border-gray-200'
          )}
        >
          <ErrorBoundary>{footer}</ErrorBoundary>
        </div>
      )}
    </div>
  );
}
