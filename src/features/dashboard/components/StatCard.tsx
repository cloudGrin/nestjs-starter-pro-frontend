import { Card, Statistic } from 'antd';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  loading?: boolean;
  suffix?: string;
  prefix?: string;
  precision?: number;
}

/**
 * 统计卡片组件（已适配深色模式）
 * 用于Dashboard显示统计数据
 */
export function StatCard({
  title,
  value,
  icon,
  color,
  loading = false,
  suffix,
  prefix,
  precision = 0,
}: StatCardProps) {
  return (
    <Card loading={loading} className="h-full overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Statistic
            title={
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {title}
              </span>
            }
            value={value}
            precision={precision}
            suffix={suffix}
            prefix={prefix}
            valueStyle={{ color, fontSize: 30, fontWeight: 700, lineHeight: 1.2 }}
          />
        </div>
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${color}22, ${color}0f)`,
            color,
          }}
        >
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </Card>
  );
}
