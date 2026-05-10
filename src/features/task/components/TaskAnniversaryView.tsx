import { useMemo } from 'react';
import { Card, Empty, Space, Tag } from 'antd';
import type { PaginatedResult, Task, TaskActionPending } from '../types/task.types';
import { TaskQuickActions } from './TaskQuickActions';
import { getAnniversaryDisplay, sortAnniversaryTasks } from '../utils/taskAnniversary';

interface TaskAnniversaryViewProps {
  data?: PaginatedResult<Task>;
  loading?: boolean;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onReopen: (task: Task) => void;
  onSnooze?: (task: Task) => void;
  onDelete: (task: Task) => void;
  actionPending?: TaskActionPending | null;
}

export function TaskAnniversaryView({
  data,
  loading,
  onEdit,
  onComplete,
  onReopen,
  onSnooze,
  onDelete,
  actionPending,
}: TaskAnniversaryViewProps) {
  const tasks = useMemo(() => sortAnniversaryTasks(data?.items ?? []), [data?.items]);

  return (
    <Card loading={loading} data-testid="task-anniversary-view">
      {tasks.length === 0 && !loading ? (
        <Empty description="暂无纪念日" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task, index) => {
            const display = getAnniversaryDisplay(task);
            const featured = index === 0;

            return (
              <section
                key={task.id}
                data-testid={`task-anniversary-card-${task.id}`}
                className={[
                  'rounded-lg border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                  featured
                    ? 'border-rose-200 bg-gradient-to-br from-rose-50 via-white to-sky-50'
                    : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-500">最近一次</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {display.nextDateLabel}
                    </div>
                  </div>
                  <Tag color={display.hasDate ? 'magenta' : 'default'}>{display.yearsText}</Tag>
                </div>

                <div className="mb-4">
                  <div className="truncate text-base font-semibold text-slate-900">
                    {task.title}
                  </div>
                  <div className="mt-3 text-3xl font-bold text-rose-600">
                    {display.countdownText}
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span>原始日期 {display.sourceDateLabel}</span>
                </div>

                <Space size={[4, 4]} wrap>
                  <TaskQuickActions
                    task={task}
                    onEdit={onEdit}
                    onComplete={onComplete}
                    onReopen={onReopen}
                    onSnooze={onSnooze}
                    onDelete={onDelete}
                    actionPending={actionPending}
                  />
                </Space>
              </section>
            );
          })}
        </div>
      )}
    </Card>
  );
}
