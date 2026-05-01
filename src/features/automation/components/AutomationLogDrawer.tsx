import { useState } from 'react';
import { Drawer, Select, Space, Table, Tag, Typography } from 'antd';
import { formatDate } from '@/shared/utils';
import { useAutomationTaskLogs } from '../hooks/useAutomationTasks';
import type {
  AutomationTask,
  AutomationTaskLog,
  AutomationTaskLogStatus,
  AutomationTaskTriggerType,
  QueryAutomationTaskLogsDto,
} from '../types/automation.types';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface AutomationLogDrawerProps {
  open: boolean;
  task: AutomationTask | null;
  onClose: () => void;
}

const statusOptions: Array<{ label: string; value: AutomationTaskLogStatus }> = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
  { label: '跳过', value: 'skipped' },
];

const triggerOptions: Array<{ label: string; value: AutomationTaskTriggerType }> = [
  { label: '定时', value: 'schedule' },
  { label: '手动', value: 'manual' },
  { label: '系统', value: 'system' },
];

export function AutomationLogDrawer({ open, task, onClose }: AutomationLogDrawerProps) {
  const [query, setQuery] = useState<QueryAutomationTaskLogsDto>({ page: 1, limit: 10 });
  const logsQuery = useAutomationTaskLogs(task?.key ?? null, query, { enabled: open });

  const columns: ColumnsType<AutomationTaskLog> = [
    {
      title: '开始时间',
      dataIndex: 'startedAt',
      width: 180,
      render: formatDate.full,
    },
    {
      title: '触发',
      dataIndex: 'triggerType',
      width: 90,
      render: (triggerType: AutomationTaskTriggerType) => (
        <Tag>{getTriggerText(triggerType)}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: AutomationTaskLogStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'durationMs',
      width: 100,
      render: (durationMs: number) => `${durationMs} ms`,
    },
    {
      title: '消息',
      dataIndex: 'resultMessage',
      render: (_, record) => (
        <Text type={record.errorMessage ? 'danger' : undefined}>
          {record.errorMessage || record.resultMessage || '-'}
        </Text>
      ),
    },
  ];

  return (
    <Drawer
      title={task ? `${task.name} 执行日志` : '执行日志'}
      open={open}
      onClose={onClose}
      width={920}
      destroyOnHidden
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Text type="secondary">{task?.key}</Text>
        <Space wrap>
          <Select
            allowClear
            placeholder="状态"
            className="w-28"
            options={statusOptions}
            value={query.status}
            onChange={(status) => setQuery((current) => ({ ...current, page: 1, status }))}
          />
          <Select
            allowClear
            placeholder="触发方式"
            className="w-32"
            options={triggerOptions}
            value={query.triggerType}
            onChange={(triggerType) =>
              setQuery((current) => ({ ...current, page: 1, triggerType }))
            }
          />
        </Space>
      </div>
      <Table
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={logsQuery.data?.items ?? []}
        loading={logsQuery.isLoading}
        pagination={{
          current: logsQuery.data?.page ?? query.page ?? 1,
          pageSize: logsQuery.data?.pageSize ?? query.limit ?? 10,
          total: logsQuery.data?.total ?? 0,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) =>
            setQuery((current) => ({ ...current, page, limit: pageSize })),
        }}
      />
    </Drawer>
  );
}

function getStatusText(status: AutomationTaskLogStatus) {
  const map: Record<AutomationTaskLogStatus, string> = {
    success: '成功',
    failed: '失败',
    skipped: '跳过',
  };
  return map[status];
}

function getStatusColor(status: AutomationTaskLogStatus) {
  const map: Record<AutomationTaskLogStatus, string> = {
    success: 'green',
    failed: 'red',
    skipped: 'gold',
  };
  return map[status];
}

function getTriggerText(triggerType: AutomationTaskTriggerType) {
  const map: Record<AutomationTaskTriggerType, string> = {
    schedule: '定时',
    manual: '手动',
    system: '系统',
  };
  return map[triggerType];
}
