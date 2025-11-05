/**
 * 任务执行统计组件
 */

import { Card, Row, Col, Statistic } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTaskLogs } from '../hooks/useTasks';

interface TaskStatisticsProps {
  taskId: number;
}

interface LogStatistics {
  成功: number;
  失败: number;
  超时: number;
  执行中: number;
  总执行次数: number;
  平均执行时长: number;
}

interface ChartDataItem {
  date: string;
  成功: number;
  失败: number;
  超时: number;
}

export const TaskStatistics: React.FC<TaskStatisticsProps> = ({ taskId }) => {
  const { data: logs, isLoading } = useTaskLogs(taskId);

  if (isLoading || !logs) {
    return null;
  }

  // 计算统计数据
  const stats: LogStatistics = {
    成功: logs.filter((log) => log.status === 'SUCCESS').length,
    失败: logs.filter((log) => log.status === 'FAILED').length,
    超时: logs.filter((log) => log.status === 'TIMEOUT').length,
    执行中: logs.filter((log) => log.status === 'RUNNING').length,
    总执行次数: logs.length,
    平均执行时长: 0,
  };

  // 计算平均执行时长（仅统计成功的）
  const successLogs = logs.filter((log) => log.status === 'SUCCESS' && log.duration);
  if (successLogs.length > 0) {
    const totalDuration = successLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    stats.平均执行时长 = Math.round(totalDuration / successLogs.length);
  }

  // 准备图表数据（按日期统计）
  const dateMap = new Map<string, { 成功: number; 失败: number; 超时: number }>();

  logs.forEach((log) => {
    const date = log.startTime.split('T')[0]; // 提取日期部分
    if (!dateMap.has(date)) {
      dateMap.set(date, { 成功: 0, 失败: 0, 超时: 0 });
    }
    const entry = dateMap.get(date)!;
    if (log.status === 'SUCCESS') entry.成功++;
    else if (log.status === 'FAILED') entry.失败++;
    else if (log.status === 'TIMEOUT') entry.超时++;
  });

  // 转换为Recharts数据格式
  const chartData: ChartDataItem[] = Array.from(dateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14) // 最近14天
    .map(([date, counts]) => ({
      date: date.substring(5), // 只显示月-日
      成功: counts.成功,
      失败: counts.失败,
      超时: counts.超时,
    }));

  // 格式化执行时长
  const formatDuration = (ms: number): string => {
    if (ms === 0) return '-';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分${seconds % 60}秒`;
    const hours = Math.floor(minutes / 60);
    return `${hours}小时${minutes % 60}分`;
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic
              title="总执行次数"
              value={stats.总执行次数}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SyncOutlined />}
              suffix="次"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成功"
              value={stats.成功}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
              suffix={`次 (${stats.总执行次数 > 0 ? ((stats.成功 / stats.总执行次数) * 100).toFixed(1) : 0}%)`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="失败"
              value={stats.失败}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
              suffix={`次 (${stats.总执行次数 > 0 ? ((stats.失败 / stats.总执行次数) * 100).toFixed(1) : 0}%)`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均执行时长"
              value={formatDuration(stats.平均执行时长)}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 执行趋势图 */}
      {chartData.length > 0 && (
        <Card title="执行趋势（最近14天）" className="mb-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="成功" fill="#52c41a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="失败" fill="#f5222d" radius={[4, 4, 0, 0]} />
              <Bar dataKey="超时" fill="#faad14" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};
