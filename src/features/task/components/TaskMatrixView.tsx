import { Card, Empty, Space, Tag } from 'antd';
import { formatDate } from '@/shared/utils';
import type { PaginatedResult, Task } from '../types/task.types';
import { TaskQuickActions } from './TaskQuickActions';

interface TaskMatrixViewProps {
  data?: PaginatedResult<Task>;
  loading?: boolean;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onReopen: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const quadrants = [
  {
    key: 'important-urgent',
    title: '重要且紧急',
    description: '今天必须处理',
    match: (task: Task) => task.important && task.urgent,
  },
  {
    key: 'important-not-urgent',
    title: '重要不紧急',
    description: '计划推进',
    match: (task: Task) => task.important && !task.urgent,
  },
  {
    key: 'not-important-urgent',
    title: '不重要但紧急',
    description: '尽快处理或委托',
    match: (task: Task) => !task.important && task.urgent,
  },
  {
    key: 'not-important-not-urgent',
    title: '不重要不紧急',
    description: '有空再做',
    match: (task: Task) => !task.important && !task.urgent,
  },
];

function TaskCard({
  task,
  onEdit,
  onComplete,
  onReopen,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onReopen: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <Space direction="vertical" size={6} className="w-full">
        <div className="font-medium text-slate-900 dark:text-slate-100">{task.title}</div>
        <div className="text-xs text-slate-500">截止：{formatDate.full(task.dueAt)}</div>
        {task.tags?.length ? (
          <Space size={[0, 4]} wrap>
            {task.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Space>
        ) : null}
        <TaskQuickActions
          task={task}
          onEdit={onEdit}
          onComplete={onComplete}
          onReopen={onReopen}
          onDelete={onDelete}
        />
      </Space>
    </div>
  );
}

export function TaskMatrixView({
  data,
  loading,
  onEdit,
  onComplete,
  onReopen,
  onDelete,
}: TaskMatrixViewProps) {
  const tasks = data?.items ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {quadrants.map((quadrant) => {
        const quadrantTasks = tasks.filter(quadrant.match);

        return (
          <Card
            key={quadrant.key}
            loading={loading}
            title={quadrant.title}
            extra={<span className="text-xs text-slate-500">{quadrant.description}</span>}
          >
            {quadrantTasks.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无任务" />
            ) : (
              <Space direction="vertical" size={12} className="w-full">
                {quadrantTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onComplete={onComplete}
                    onReopen={onReopen}
                    onDelete={onDelete}
                  />
                ))}
              </Space>
            )}
          </Card>
        );
      })}
    </div>
  );
}
