import { Card, Statistic } from 'antd';
import type { ReactNode } from 'react';
import { useThemeStore } from '@/shared/stores';
import { cn } from '@/shared/utils/cn';

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
  const { mode: themeMode } = useThemeStore();

  return (
    <Card loading={loading} className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Statistic
            title={
              <span className={cn(themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500')}>
                {title}
              </span>
            }
            value={value}
            precision={precision}
            suffix={suffix}
            prefix={prefix}
            valueStyle={{ color, fontSize: '28px', fontWeight: 600 }}
          />
        </div>
        <div
          className="flex items-center justify-center w-16 h-16 rounded-full"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
    </Card>
  );
}
