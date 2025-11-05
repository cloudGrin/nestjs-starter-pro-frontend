/**
 * 任务列表页面
 */

import { useState } from 'react';
import { Table, Button, Space, Tag, Tooltip, Modal, Card } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { formatDate } from '@/shared/utils';
import { PageWrap, TableActions, PermissionGuard } from '@/shared/components';
import {
  useTasks,
  useDeleteTask,
  useUpdateTaskStatus,
  useTriggerTask,
} from '../hooks/useTasks';
import type { TaskDefinition, TaskStatus } from '../types/task.types';
import { TASK_STATUS_MAP } from '../types/task.types';
import { TaskForm } from './TaskForm';
import { TaskLogViewer } from './TaskLogViewer';

export const TaskList: React.FC = () => {
  // 搜索参数
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status] = useState<TaskStatus | undefined>(undefined);

  // 查询任务列表
  const { data, isLoading, refetch } = useTasks({
    page,
    limit: pageSize, // 后端期望limit字段
    status,
  });

  // Mutations
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateTaskStatus();
  const { mutate: triggerTask, isPending: isTriggering } = useTriggerTask();

  // 模态框状态
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDefinition | null>(null);
  const [viewingTaskId, setViewingTaskId] = useState<number | null>(null);

  /**
   * 处理创建任务
   */
  const handleCreate = () => {
    setEditingTask(null);
    setFormModalVisible(true);
  };

  /**
   * 处理编辑任务
   */
  const handleEdit = (record: TaskDefinition) => {
    setEditingTask(record);
    setFormModalVisible(true);
  };

  /**
   * 处理删除任务
   */
  const handleDelete = (id: number) => {
    deleteTask(id);
  };

  /**
   * 处理切换任务状态
   */
  const handleToggleStatus = (record: TaskDefinition) => {
    const newStatus: TaskStatus = record.status === 'enabled' ? 'disabled' : 'enabled';
    updateStatus({ id: record.id, data: { status: newStatus } });
  };

  /**
   * 处理手动触发任务
   */
  const handleTrigger = (id: number) => {
    triggerTask({ id });
  };

  /**
   * 处理查看日志
   */
  const handleViewLogs = (id: number) => {
    setViewingTaskId(id);
    setLogModalVisible(true);
  };

  /**
   * 关闭表单模态框
   */
  const handleFormModalClose = () => {
    setFormModalVisible(false);
    setEditingTask(null);
  };

  /**
   * 表单提交成功
   */
  const handleFormSuccess = () => {
    handleFormModalClose();
    // ⚠️ 不需要手动 refetch，useCreateTask/useUpdateTask 的 invalidateQueries 会自动刷新
  };

  // 表格列定义
  const columns: ColumnsType<TaskDefinition> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '任务代码',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      render: (code) => <code className="text-blue-600">{code}</code>,
    },
    {
      title: 'Cron表达式',
      dataIndex: 'cron',
      key: 'cron',
      width: 150,
      render: (cron) => (
        <Tooltip title="点击查看Cron表达式说明">
          <code className="cursor-help">{cron}</code>
        </Tooltip>
      ),
    },
    {
      title: '处理器',
      dataIndex: 'handler',
      key: 'handler',
      width: 150,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: TaskStatus) => {
        const config = TASK_STATUS_MAP[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      filters: [
        { text: '启用', value: 'enabled' },
        { text: '禁用', value: 'disabled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '上次执行时间',
      dataIndex: 'lastExecutedAt',
      key: 'lastExecutedAt',
      width: 180,
      render: (date) => (date ? formatDate.full(date) : '-'),
    },
    {
      title: '下次执行时间',
      dataIndex: 'nextExecutionTime',
      key: 'nextExecutionTime',
      width: 180,
      render: (date) => (date ? formatDate.full(date) : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: formatDate.full,
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <TableActions
          actions={[
            {
              type: 'switch',
              checked: record.status === 'enabled',
              tooltip: record.status === 'enabled' ? '禁用' : '启用',
              onChange: () => handleToggleStatus(record),
              loading: isUpdatingStatus,
              permission: 'task:update',
            },
            { type: 'divider' },
            {
              type: 'button',
              label: '触发',
              icon: <PlayCircleOutlined />,
              tooltip: '手动触发',
              onClick: () => handleTrigger(record.id),
              loading: isTriggering,
              disabled: record.status === 'disabled',
              permission: 'task:trigger',
            },
            {
              type: 'button',
              label: '日志',
              icon: <FileTextOutlined />,
              tooltip: '查看日志',
              onClick: () => handleViewLogs(record.id),
              permission: 'task:read',
            },
            {
              type: 'button',
              label: '编辑',
              icon: <EditOutlined />,
              tooltip: '编辑任务',
              onClick: () => handleEdit(record),
              permission: 'task:update',
            },
            {
              type: 'button',
              label: '删除',
              icon: <DeleteOutlined />,
              tooltip: '删除任务',
              danger: true,
              onClick: () => handleDelete(record.id),
              disabled: isDeleting,
              permission: 'task:delete',
            },
          ]}
        />
      ),
    },
  ];

  return (
    <PageWrap
      title="任务调度"
      titleRight={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            刷新
          </Button>
          <PermissionGuard permissions={['task:create']}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              创建任务
            </Button>
          </PermissionGuard>
        </Space>
      }
    >
      <Card>
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1600 }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个任务`,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
          }}
        />
      </Card>

      {/* 任务表单模态框 */}
      <Modal
        title={editingTask ? '编辑任务' : '创建任务'}
        open={formModalVisible}
        onCancel={handleFormModalClose}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <TaskForm task={editingTask} onSuccess={handleFormSuccess} onCancel={handleFormModalClose} />
      </Modal>

      {/* 任务日志查看器 */}
      <Modal
        title="任务执行日志"
        open={logModalVisible}
        onCancel={() => setLogModalVisible(false)}
        footer={null}
        width={1000}
        destroyOnHidden
      >
        {viewingTaskId && <TaskLogViewer taskId={viewingTaskId} />}
      </Modal>
    </PageWrap>
  );
};
