import { useState } from 'react';
import { Button, Card, message, Space, Table, Tooltip, Typography } from 'antd';
import {
  EditOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageWrap, StatusBadge, TableActions } from '@/shared/components';
import { formatDate } from '@/shared/utils';
import { AutomationConfigModal } from '../components/AutomationConfigModal';
import { AutomationLogDrawer } from '../components/AutomationLogDrawer';
import {
  useAutomationTasks,
  useRunAutomationTask,
  useUpdateAutomationTaskConfig,
} from '../hooks/useAutomationTasks';
import type {
  AutomationTask,
  AutomationTaskLastStatus,
  AutomationTaskLog,
  UpdateAutomationTaskConfigDto,
} from '../types/automation.types';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

export function AutomationTaskPage() {
  const tasksQuery = useAutomationTasks();
  const updateConfig = useUpdateAutomationTaskConfig();
  const runTask = useRunAutomationTask();
  const [editingTask, setEditingTask] = useState<AutomationTask | null>(null);
  const [logTask, setLogTask] = useState<AutomationTask | null>(null);

  const handleSaveConfig = (taskKey: string, data: UpdateAutomationTaskConfigDto) => {
    updateConfig.mutate(
      { taskKey, data },
      {
        onSuccess: () => setEditingTask(null),
      }
    );
  };

  const handleRunTask = (task: AutomationTask) => {
    runTask.mutate(task.key, {
      onSuccess: showRunResult,
    });
  };

  const columns: ColumnsType<AutomationTask> = [
    {
      title: '任务',
      dataIndex: 'name',
      width: 280,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.name}</Text>
          <Text code className="text-xs">
            {record.key}
          </Text>
          {record.description && (
            <Text type="secondary" className="text-xs">
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '启用',
      dataIndex: ['config', 'enabled'],
      width: 90,
      render: (_, record) =>
        record.config?.enabled ? (
          <StatusBadge status="success" text="启用" />
        ) : (
          <StatusBadge status="default" text="停用" />
        ),
    },
    {
      title: 'Cron',
      dataIndex: ['config', 'cronExpression'],
      width: 150,
      render: (_, record) => (
        <Text code>{record.config?.cronExpression ?? record.defaultCron}</Text>
      ),
    },
    {
      title: '最近状态',
      dataIndex: ['config', 'lastStatus'],
      width: 110,
      render: (_, record) =>
        renderLastStatus(
          record.config?.isRunning ? 'running' : (record.config?.lastStatus ?? 'never')
        ),
    },
    {
      title: '最近执行',
      dataIndex: ['config', 'lastStartedAt'],
      width: 180,
      render: (_, record) => formatDate.full(record.config?.lastStartedAt),
    },
    {
      title: '耗时',
      dataIndex: ['config', 'lastDurationMs'],
      width: 100,
      render: (_, record) =>
        typeof record.config?.lastDurationMs === 'number'
          ? `${record.config.lastDurationMs} ms`
          : '-',
    },
    {
      title: '消息',
      dataIndex: ['config', 'lastMessage'],
      ellipsis: true,
      render: (_, record) => {
        const text = record.config?.lastError || record.config?.lastMessage || '-';
        return (
          <Tooltip title={text}>
            <Text type={record.config?.lastError ? 'danger' : undefined}>{text}</Text>
          </Tooltip>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <TableActions
          actions={[
            {
              label: '执行',
              icon: <PlayCircleOutlined />,
              onClick: () => handleRunTask(record),
              loading: runTask.isPending && runTask.variables === record.key,
              permission: 'automation:execute',
            },
            {
              label: '编辑',
              icon: <EditOutlined />,
              onClick: () => setEditingTask(record),
              permission: 'automation:update',
            },
            {
              label: '日志',
              icon: <FileTextOutlined />,
              onClick: () => setLogTask(record),
              permission: 'automation:read',
            },
          ]}
        />
      ),
    },
  ];

  return (
    <PageWrap
      title="自动化任务"
      titleRight={
        <Button
          icon={<ReloadOutlined />}
          loading={tasksQuery.isFetching}
          onClick={() => tasksQuery.refetch()}
        >
          刷新
        </Button>
      }
    >
      <Card>
        <Table
          rowKey="key"
          dataSource={tasksQuery.data ?? []}
          columns={columns}
          loading={tasksQuery.isLoading}
          scroll={{ x: 1300 }}
          pagination={false}
        />
      </Card>

      <AutomationConfigModal
        open={Boolean(editingTask)}
        task={editingTask}
        loading={updateConfig.isPending}
        onCancel={() => setEditingTask(null)}
        onSubmit={handleSaveConfig}
      />

      <AutomationLogDrawer
        open={Boolean(logTask)}
        task={logTask}
        onClose={() => setLogTask(null)}
      />
    </PageWrap>
  );
}

function renderLastStatus(status: AutomationTaskLastStatus) {
  const map: Record<
    AutomationTaskLastStatus,
    { badge: Parameters<typeof StatusBadge>[0]['status']; text: string }
  > = {
    never: { badge: 'default', text: '未执行' },
    running: { badge: 'processing', text: '运行中' },
    success: { badge: 'success', text: '成功' },
    failed: { badge: 'error', text: '失败' },
    skipped: { badge: 'warning', text: '跳过' },
  };
  const item = map[status];
  return <StatusBadge status={item.badge} text={item.text} />;
}

function showRunResult(log: AutomationTaskLog) {
  if (log.status === 'success') {
    message.success(log.resultMessage || '任务执行成功');
    return;
  }

  if (log.status === 'skipped') {
    message.warning(log.resultMessage || '任务正在运行，本次触发已跳过');
    return;
  }

  message.error(log.errorMessage || '任务执行失败');
}
