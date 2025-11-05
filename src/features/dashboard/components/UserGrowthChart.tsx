import { Card, Alert } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useUserGrowth } from '../hooks/useStatistics';
import { useThemeStore } from '@/shared/stores';

/**
 * 用户增长趋势图（已适配深色模式）
 * 显示最近7天的用户增长情况
 */
export function UserGrowthChart() {
  const { mode: themeMode } = useThemeStore();
  const { data, isLoading, error } = useUserGrowth({ days: 7 });

  if (error) {
    return (
      <Card title="用户增长趋势">
        <Alert
          message="加载失败"
          description="无法获取用户增长数据,请稍后重试"
          type="error"
          showIcon
        />
      </Card>
    );
  }

  // 格式化数据：将YYYY-MM-DD转换为MM-DD显示
  const chartData = data?.data?.map((point) => ({
    date: point.date.substring(5), // 截取MM-DD部分
    总用户数: point.totalUsers,
    活跃用户: point.activeUsers,
    新增用户: point.newUsers,
  })) || [];

  // 计算增长率显示颜色
  const growthColor = (data?.growthRate || 0) >= 0 ? '#95de64' : '#ff85c0';

  return (
    <Card
      title="用户增长趋势"
      loading={isLoading}
      className="shadow-sm hover:shadow-md transition-shadow"
      extra={
        data && (
          <div className="text-sm">
            <span className={themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              增长率:{' '}
            </span>
            <span style={{ color: growthColor, fontWeight: 600 }}>
              {data.growthRate > 0 ? '+' : ''}
              {data.growthRate}%
            </span>
            <span className={themeMode === 'dark' ? 'text-gray-500 ml-2' : 'text-gray-500 ml-2'}>
              ({data.growth > 0 ? '+' : ''}
              {data.growth}人)
            </span>
          </div>
        )
      }
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={themeMode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : '#f0f0f0'}
          />
          <XAxis
            dataKey="date"
            stroke={themeMode === 'dark' ? '#94a3b8' : '#8c8c8c'}
            style={{ fontSize: 12 }}
          />
          <YAxis
            stroke={themeMode === 'dark' ? '#94a3b8' : '#8c8c8c'}
            style={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : '#fff',
              border: themeMode === 'dark' ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid #d9d9d9',
              borderRadius: '4px',
              color: themeMode === 'dark' ? '#e2e8f0' : '#000',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="总用户数"
            stroke="#69b1ff"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="活跃用户"
            stroke="#95de64"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="新增用户"
            stroke="#ffd666"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
