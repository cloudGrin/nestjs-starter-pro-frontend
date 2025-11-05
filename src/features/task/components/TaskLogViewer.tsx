/**
 * 任务执行日志查看器
 */

import { Table, Tag, Typography, Empty, Spin, Tabs } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { formatDate } from '@/shared/utils';
import { useTaskLogs } from '../hooks/useTasks';
import type { TaskExecutionLog, TaskExecutionStatus } from '../types/task.types';
import { TASK_EXECUTION_STATUS_MAP } from '../types/task.types';
import { TaskStatistics } from './TaskStatistics';

const { Text, Paragraph } = Typography;

interface TaskLogViewerProps {
  taskId: number;
}

/**
 * 格式化执行时长
 */
const formatDuration = (duration?: number): string => {
  if (!duration) return '-';
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分${seconds % 60}秒`;
  } else if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
};

/**
 * 获取状态图标
 */
const getStatusIcon = (status: TaskExecutionStatus) => {
  switch (status) {
    case 'SUCCESS':
      return <CheckCircleOutlined className="text-green-500" />;
    case 'FAILED':
      return <CloseCircleOutlined className="text-red-500" />;
    case 'RUNNING':
      return <ClockCircleOutlined className="text-blue-500" />;
    case 'TIMEOUT':
      return <ClockCircleOutlined className="text-yellow-500" />;
    default:
      return <ClockCircleOutlined className="text-gray-500" />;
  }
};

export const TaskLogViewer: React.FC<TaskLogViewerProps> = ({ taskId }) => {
  const { data: logs, isLoading } = useTaskLogs(taskId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Spin size="large" />
        <div className="text-gray-500">加载日志中...</div>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Empty
        description="暂无执行日志"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="py-12"
      />
    );
  }

  // 表格列定义
  const columns: ColumnsType<TaskExecutionLog> = [
    {
      title: '执行ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: TaskExecutionStatus) => {
        const config = TASK_EXECUTION_STATUS_MAP[status];
        return (
          <span className="flex items-center gap-2">
            {getStatusIcon(status)}
            <Tag color={config.color}>{config.text}</Tag>
          </span>
        );
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 180,
      render: formatDate.full,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 180,
      render: (date) => (date ? formatDate.full(date) : '-'),
    },
    {
      title: '执行时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 150,
      render: formatDuration,
    },
    {
      title: '重试次数',
      dataIndex: 'retryCount',
      key: 'retryCount',
      width: 100,
      render: (count) => (count ? <Tag color="warning">{count}次</Tag> : '-'),
    },
  ];

  // 可展开行，显示输出和错误信息
  const expandedRowRender = (record: TaskExecutionLog) => {
    return (
      <div className="p-4 bg-gray-50">
        {record.output && (
          <div className="mb-4">
            <Text strong className="block mb-2">
              执行输出:
            </Text>
            <Paragraph
              className="bg-white p-3 rounded border border-gray-200 font-mono text-sm"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
            >
              {record.output}
            </Paragraph>
          </div>
        )}
        {record.error && (
          <div>
            <Text strong className="block mb-2 text-red-500">
              错误信息:
            </Text>
            <Paragraph
              className="bg-red-50 p-3 rounded border border-red-200 font-mono text-sm text-red-600"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
            >
              {record.error}
            </Paragraph>
          </div>
        )}
        {!record.output && !record.error && (
          <Text type="secondary">无输出信息</Text>
        )}
      </div>
    );
  };

  return (
    <Tabs
      defaultActiveKey="logs"
      items={[
        {
          key: 'logs',
          label: '执行日志',
          children: (
            <Table
              columns={columns}
              dataSource={logs}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showTotal: (total) => `共 ${total} 条日志`,
              }}
              expandable={{
                expandedRowRender,
                expandRowByClick: true,
              }}
              size="small"
            />
          ),
        },
        {
          key: 'statistics',
          label: '执行统计',
          children: <TaskStatistics taskId={taskId} />,
        },
      ]}
    />
  );
};
