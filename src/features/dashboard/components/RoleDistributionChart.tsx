import { Card, Alert } from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useRoleDistribution } from '../hooks/useStatistics';
import { useThemeStore } from '@/shared/stores';

/**
 * 角色分布饼图（已适配深色模式）
 * 显示各角色的用户数量分布
 */
export function RoleDistributionChart() {
  const { mode: themeMode } = useThemeStore();
  const { data, isLoading, error } = useRoleDistribution();

  if (error) {
    return (
      <Card title="角色分布">
        <Alert
          message="加载失败"
          description="无法获取角色分布数据,请稍后重试"
          type="error"
          showIcon
        />
      </Card>
    );
  }

  // 转换数据格式
  const chartData = data?.data?.map((role) => ({
    name: role.roleName,
    value: role.userCount,
    percentage: role.percentage,
  })) || [];

  // 清爽莫兰迪色系
  const COLORS = [
    '#69b1ff', // 浅蓝
    '#95de64', // 浅绿
    '#ffd666', // 浅橙
    '#ff85c0', // 浅粉
    '#b37feb', // 浅紫
    '#5cdbd3', // 浅青
    '#ffa39e', // 浅珊瑚
  ];

  // 自定义标签渲染
  const renderLabel = (entry: { name?: string; percentage?: number }) => {
    if (!entry || !entry.name || typeof entry.percentage !== 'number') {
      return '';
    }
    return `${entry.name} (${entry.percentage.toFixed(1)}%)`;
  };

  return (
    <Card
      title="角色分布"
      loading={isLoading}
      className="shadow-sm hover:shadow-md transition-shadow"
      extra={
        data && (
          <div className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            总用户数: <span className="font-semibold">{data.totalUsers}</span>
          </div>
        )
      }
    >
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : '#fff',
                border: themeMode === 'dark' ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid #d9d9d9',
                borderRadius: '4px',
                color: themeMode === 'dark' ? '#e2e8f0' : '#000',
              }}
              formatter={(value: number, name: string, props: unknown) => {
                const payload = props as { payload: { percentage: number } };
                return [
                  `${value}人 (${payload.payload.percentage.toFixed(1)}%)`,
                  name,
                ];
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div
          className={`h-[300px] flex items-center justify-center ${themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
        >
          暂无数据
        </div>
      )}
    </Card>
  );
}
