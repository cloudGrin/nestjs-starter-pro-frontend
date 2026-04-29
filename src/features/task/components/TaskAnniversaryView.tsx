import dayjs from 'dayjs';
import { Card, Empty, List, Space, Tag } from 'antd';
import { formatDate } from '@/shared/utils';
import type { PaginatedResult, Task } from '../types/task.types';
import { TaskQuickActions } from './TaskQuickActions';

interface TaskAnniversaryViewProps {
  data?: PaginatedResult<Task>;
  loading?: boolean;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onReopen: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function getCountdownText(date?: string | null) {
  if (!date) {
    return '未设置日期';
  }

  const target = dayjs(date).startOf('day');
  const diffDays = target.diff(dayjs().startOf('day'), 'day');

  if (diffDays === 0) {
    return '今天';
  }
  if (diffDays > 0) {
    return `还有 ${diffDays} 天`;
  }
  return `已过 ${Math.abs(diffDays)} 天`;
}

export function TaskAnniversaryView({
  data,
  loading,
  onEdit,
  onComplete,
  onReopen,
  onDelete,
}: TaskAnniversaryViewProps) {
  const tasks = data?.items ?? [];

  return (
    <Card loading={loading}>
      {tasks.length === 0 && !loading ? (
        <Empty description="暂无纪念日" />
      ) : (
        <List
          dataSource={tasks}
          renderItem={(task) => (
            <List.Item
              actions={[
                <TaskQuickActions
                  key="actions"
                  task={task}
                  onEdit={onEdit}
                  onComplete={onComplete}
                  onReopen={onReopen}
                  onDelete={onDelete}
                />,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <span className="font-medium">{task.title}</span>
                    <Tag color="volcano">{getCountdownText(task.dueAt)}</Tag>
                  </Space>
                }
                description={
                  <Space size={[8, 4]} wrap>
                    <span>日期：{formatDate.date(task.dueAt)}</span>
                    <span>提醒：{formatDate.full(task.remindAt)}</span>
                    <span>重复：{task.recurrenceType}</span>
                    {task.reminderChannels?.map((channel) => <Tag key={channel}>{channel}</Tag>)}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
