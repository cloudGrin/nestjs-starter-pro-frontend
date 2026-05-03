import { Button, Space } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { PermissionGuard } from '@/shared/components';
import type { Task, TaskActionPending, TaskActionType } from '../types/task.types';

interface TaskQuickActionsProps {
  task: Task;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onReopen: (task: Task) => void;
  onSnooze?: (task: Task) => void;
  onDelete: (task: Task) => void;
  actionPending?: TaskActionPending | null;
}

function isActionPending(
  actionPending: TaskActionPending | null | undefined,
  task: Task,
  type?: TaskActionType
) {
  return actionPending?.taskId === task.id && (!type || actionPending.type === type);
}

export function TaskQuickActions({
  task,
  onEdit,
  onComplete,
  onReopen,
  onSnooze,
  onDelete,
  actionPending,
}: TaskQuickActionsProps) {
  const rowPending = isActionPending(actionPending, task);

  return (
    <Space size={4} wrap>
      {task.status === 'completed' ? (
        <PermissionGuard permissions={['task:update']}>
          <Button
            size="small"
            type="text"
            icon={<RollbackOutlined />}
            loading={isActionPending(actionPending, task, 'reopen')}
            disabled={rowPending}
            onClick={() => onReopen(task)}
          >
            重开
          </Button>
        </PermissionGuard>
      ) : (
        <PermissionGuard permissions={['task:complete']}>
          <Button
            size="small"
            type="text"
            icon={<CheckCircleOutlined />}
            loading={isActionPending(actionPending, task, 'complete')}
            disabled={rowPending}
            onClick={() => onComplete(task)}
          >
            完成
          </Button>
        </PermissionGuard>
      )}
      {onSnooze && task.status !== 'completed' && task.remindAt ? (
        <PermissionGuard permissions={['task:update']}>
          <Button
            size="small"
            type="text"
            icon={<ClockCircleOutlined />}
            loading={isActionPending(actionPending, task, 'snooze')}
            disabled={rowPending}
            onClick={() => onSnooze(task)}
          >
            稍后
          </Button>
        </PermissionGuard>
      ) : null}
      <PermissionGuard permissions={['task:update']}>
        <Button
          size="small"
          type="text"
          icon={<EditOutlined />}
          disabled={rowPending}
          onClick={() => onEdit(task)}
        >
          编辑
        </Button>
      </PermissionGuard>
      <PermissionGuard permissions={['task:delete']}>
        <Button
          danger
          size="small"
          type="text"
          icon={<DeleteOutlined />}
          loading={isActionPending(actionPending, task, 'delete')}
          disabled={rowPending}
          onClick={() => onDelete(task)}
        >
          删除
        </Button>
      </PermissionGuard>
    </Space>
  );
}
