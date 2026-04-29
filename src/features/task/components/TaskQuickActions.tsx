import { Button, Space } from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { PermissionGuard } from '@/shared/components';
import type { Task } from '../types/task.types';

interface TaskQuickActionsProps {
  task: Task;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onReopen: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskQuickActions({
  task,
  onEdit,
  onComplete,
  onReopen,
  onDelete,
}: TaskQuickActionsProps) {
  return (
    <Space size={4} wrap>
      {task.status === 'completed' ? (
        <PermissionGuard permissions={['task:update']}>
          <Button size="small" type="text" icon={<RollbackOutlined />} onClick={() => onReopen(task)}>
            重开
          </Button>
        </PermissionGuard>
      ) : (
        <PermissionGuard permissions={['task:complete']}>
          <Button
            size="small"
            type="text"
            icon={<CheckCircleOutlined />}
            onClick={() => onComplete(task)}
          >
            完成
          </Button>
        </PermissionGuard>
      )}
      <PermissionGuard permissions={['task:update']}>
        <Button size="small" type="text" icon={<EditOutlined />} onClick={() => onEdit(task)}>
          编辑
        </Button>
      </PermissionGuard>
      <PermissionGuard permissions={['task:delete']}>
        <Button
          danger
          size="small"
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => onDelete(task)}
        >
          删除
        </Button>
      </PermissionGuard>
    </Space>
  );
}
