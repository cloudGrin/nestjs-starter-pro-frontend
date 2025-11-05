/**
 * 骨架屏组件（企业级设计）
 *
 * 用途：
 * 1. 加载时显示骨架屏，提升用户体验
 * 2. 支持表格、卡片、表单等多种场景
 * 3. 流畅的加载动画
 *
 * @example
 * // 表格骨架屏
 * <TableSkeleton rows={10} columns={6} />
 *
 * // 卡片骨架屏
 * <CardSkeleton />
 *
 * // 表单骨架屏
 * <FormSkeleton fields={4} />
 */
import { Skeleton as AntSkeleton } from 'antd';

interface TableSkeletonProps {
  /** 行数 */
  rows?: number;
  /** 列数 */
  columns?: number;
  /** 是否显示操作列 */
  showActions?: boolean;
}

/**
 * 表格骨架屏
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  showActions = true,
}: TableSkeletonProps) {
  const actualColumns = showActions ? columns + 1 : columns;

  return (
    <div className="space-y-4">
      {/* 表头 */}
      <div className="flex gap-4 pb-3 border-b border-gray-200">
        {Array.from({ length: actualColumns }).map((_, i) => (
          <div
            key={i}
            className={
              showActions && i === actualColumns - 1
                ? 'w-32 flex-shrink-0'
                : 'flex-1 min-w-0'
            }
          >
            <AntSkeleton.Input
              active
              size="small"
              className="w-full"
              style={{
                minWidth: 'auto',
                height: '20px',
              }}
            />
          </div>
        ))}
      </div>

      {/* 表格行 */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: actualColumns }).map((_, j) => (
            <div
              key={j}
              className={
                showActions && j === actualColumns - 1
                  ? 'w-32 flex-shrink-0'
                  : 'flex-1 min-w-0'
              }
            >
              <AntSkeleton.Input
                active
                size="small"
                className="w-full"
                style={{
                  minWidth: 'auto',
                  height: '24px',
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * 卡片骨架屏
 */
export function CardSkeleton() {
  return (
    <div className="p-6 space-y-4 bg-white rounded-lg border border-gray-200">
      {/* 标题 */}
      <AntSkeleton.Input
        active
        size="default"
        className="w-1/3"
        style={{ height: '28px' }}
      />

      {/* 段落 */}
      <AntSkeleton active paragraph={{ rows: 3 }} title={false} />

      {/* 底部操作区 */}
      <div className="flex justify-end gap-2 pt-2">
        <AntSkeleton.Button active size="default" />
        <AntSkeleton.Button active size="default" />
      </div>
    </div>
  );
}

/**
 * 表单骨架屏
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          {/* 表单项标签 */}
          <AntSkeleton.Input
            active
            size="small"
            className="w-24"
            style={{ height: '20px' }}
          />

          {/* 表单项输入框 */}
          <AntSkeleton.Input
            active
            size="large"
            block
            style={{ height: '40px' }}
          />
        </div>
      ))}

      {/* 表单按钮 */}
      <div className="flex justify-end gap-2 pt-4">
        <AntSkeleton.Button active size="large" />
        <AntSkeleton.Button active size="large" />
      </div>
    </div>
  );
}

/**
 * 列表骨架屏
 */
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200"
        >
          {/* 头像/图标 */}
          <AntSkeleton.Avatar active size="large" shape="circle" />

          {/* 内容区域 */}
          <div className="flex-1 space-y-2">
            <AntSkeleton.Input
              active
              size="small"
              className="w-1/3"
              style={{ height: '20px' }}
            />
            <AntSkeleton.Input
              active
              size="small"
              className="w-2/3"
              style={{ height: '16px' }}
            />
          </div>

          {/* 操作区域 */}
          <AntSkeleton.Button active size="default" />
        </div>
      ))}
    </div>
  );
}

/**
 * 统计卡片骨架屏
 */
export function StatCardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 space-y-4">
      {/* 标题 */}
      <AntSkeleton.Input
        active
        size="small"
        className="w-1/2"
        style={{ height: '20px' }}
      />

      {/* 数值 */}
      <AntSkeleton.Input
        active
        size="large"
        className="w-3/4"
        style={{ height: '36px' }}
      />

      {/* 描述 */}
      <AntSkeleton.Input
        active
        size="small"
        className="w-full"
        style={{ height: '16px' }}
      />
    </div>
  );
}

/**
 * 详情页骨架屏
 */
export function Detailskeleton() {
  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <div className="space-y-3">
        <AntSkeleton.Input
          active
          size="large"
          className="w-1/2"
          style={{ height: '32px' }}
        />
        <AntSkeleton.Input
          active
          size="small"
          className="w-1/3"
          style={{ height: '20px' }}
        />
      </div>

      {/* 内容区域 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <AntSkeleton.Input
                active
                size="small"
                className="w-24"
                style={{ height: '16px' }}
              />
              <AntSkeleton.Input
                active
                size="default"
                className="w-full"
                style={{ height: '24px' }}
              />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <AntSkeleton.Input
                active
                size="small"
                className="w-24"
                style={{ height: '16px' }}
              />
              <AntSkeleton.Input
                active
                size="default"
                className="w-full"
                style={{ height: '24px' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 底部操作 */}
      <div className="flex justify-end gap-2">
        <AntSkeleton.Button active size="large" />
        <AntSkeleton.Button active size="large" />
      </div>
    </div>
  );
}
