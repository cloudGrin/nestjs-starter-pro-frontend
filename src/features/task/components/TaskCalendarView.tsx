import dayjs from 'dayjs';
import { Card, Empty, List, Space, Tag } from 'antd';
import { formatDate } from '@/shared/utils';
import type { PaginatedResult, Task, TaskActionPending } from '../types/task.types';
import { TaskQuickActions } from './TaskQuickActions';

interface TaskCalendarViewProps {
  data?: PaginatedResult<Task>;
  loading?: boolean;
  startDate?: string;
  endDate?: string;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onReopen: (task: Task) => void;
  onDelete: (task: Task) => void;
  actionPending?: TaskActionPending | null;
}

function isDateInRange(date?: string | null, startDate?: string, endDate?: string) {
  if (!date) {
    return false;
  }

  const value = dayjs(date);
  if (startDate && value.isBefore(dayjs(startDate))) {
    return false;
  }

  if (endDate && value.isAfter(dayjs(endDate))) {
    return false;
  }

  return true;
}

function getGroupDate(task: Task, startDate?: string, endDate?: string) {
  const dueAtInRange = isDateInRange(task.dueAt, startDate, endDate);
  const remindAtInRange = isDateInRange(task.remindAt, startDate, endDate);

  if (dueAtInRange) {
    return task.dueAt;
  }

  if (remindAtInRange) {
    return task.remindAt;
  }

  return task.dueAt ?? task.remindAt;
}

function groupTasksByDate(tasks: Task[], startDate?: string, endDate?: string) {
  const groups = new Map<string, Task[]>();

  for (const task of tasks) {
    const date = getGroupDate(task, startDate, endDate);
    const key = date ? dayjs(date).format('YYYY-MM-DD') : '未设置日期';
    groups.set(key, [...(groups.get(key) ?? []), task]);
  }

  return Array.from(groups.entries()).sort(([left], [right]) => {
    if (left === '未设置日期') return 1;
    if (right === '未设置日期') return -1;
    return left.localeCompare(right);
  });
}

export function TaskCalendarView({
  data,
  loading,
  startDate,
  endDate,
  onEdit,
  onComplete,
  onReopen,
  onDelete,
  actionPending,
}: TaskCalendarViewProps) {
  const groups = groupTasksByDate(data?.items ?? [], startDate, endDate);

  if (loading && groups.length === 0) {
    return <Card title="加载中" loading />;
  }

  if (!loading && groups.length === 0) {
    return <Empty description="当前日期范围内没有任务" />;
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      {groups.map(([date, tasks]) => (
        <Card
          key={date}
          loading={loading}
          title={date}
          extra={<span className="text-xs text-slate-500">{tasks.length} 项</span>}
        >
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
                    actionPending={actionPending}
                  />,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <span>{task.title}</span>
                      {task.status === 'completed' ? <Tag color="green">已完成</Tag> : null}
                    </Space>
                  }
                  description={
                    <Space size={[8, 4]} wrap>
                      <span>截止：{formatDate.full(task.dueAt)}</span>
                      <span>提醒：{formatDate.full(task.remindAt)}</span>
                      {task.list?.name ? <Tag>{task.list.name}</Tag> : null}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ))}
    </Space>
  );
}
