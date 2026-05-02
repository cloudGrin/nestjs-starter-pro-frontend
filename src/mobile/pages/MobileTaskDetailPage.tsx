import { useState } from 'react';
import { Button, Card, Dialog, List, NavBar, Tag } from 'antd-mobile';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  useCompleteTask,
  useDeleteTask,
  useReopenTask,
  useTask,
  useTaskAssignees,
  useTaskLists,
  useUpdateTask,
} from '@/features/task/hooks/useTasks';
import type {
  CreateTaskDto,
  Task,
  TaskAssignee,
  TaskList,
  UpdateTaskDto,
} from '@/features/task/types/task.types';
import { TaskEditorPopup } from './MobileTaskPage';
import { formatTaskRecurrence, formatTaskReminderChannels } from '../utils/task';

function formatDateTime(value?: string | null) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}

function userName(user?: TaskAssignee | null) {
  return user?.realName || user?.nickname || user?.username || '-';
}

function findList(task: Task, lists: TaskList[]) {
  return task.list ?? lists.find((list) => list.id === task.listId) ?? null;
}

function findAssignee(task: Task, users: TaskAssignee[]) {
  return task.assignee ?? users.find((user) => user.id === task.assigneeId) ?? null;
}

export function MobileTaskDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const taskId = Number(params.id);
  const [editorOpen, setEditorOpen] = useState(false);
  const taskQuery = useTask(Number.isInteger(taskId) ? taskId : null);
  const listsQuery = useTaskLists();
  const usersQuery = useTaskAssignees();
  const updateTask = useUpdateTask();
  const completeTask = useCompleteTask();
  const reopenTask = useReopenTask();
  const deleteTask = useDeleteTask();
  const task = taskQuery.data;
  const lists = listsQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const list = task ? findList(task, lists) : null;
  const assignee = task ? findAssignee(task, users) : null;
  const isCompleted = task?.status === 'completed';

  const handleSubmit = (payload: CreateTaskDto | UpdateTaskDto) => {
    if (!task) return;
    updateTask.mutate(
      { id: task.id, data: payload },
      {
        onSuccess: () => setEditorOpen(false),
      }
    );
  };

  const handleDelete = async () => {
    if (!task) return;
    const confirmed = await Dialog.confirm({
      title: '删除任务',
      content: '删除后不可恢复，确定要删除这个任务吗？',
      confirmText: '删除',
      cancelText: '取消',
    });
    if (!confirmed) return;
    deleteTask.mutate(task.id, {
      onSuccess: () => navigate('/tasks', { replace: true }),
    });
  };

  return (
    <div className="mobile-detail-page">
      <NavBar onBack={() => navigate(-1)}>任务详情</NavBar>
      <div className="mobile-detail-body mobile-detail-body-with-actions">
        {!task ? (
          <Card className="mobile-card">{taskQuery.isLoading ? '加载中...' : '任务不存在'}</Card>
        ) : (
          <div className="mobile-section">
            <Card className="mobile-card">
              <h1 className="mobile-title">{task.title}</h1>
              <div className="mobile-chip-row mt-3">
                <Tag color={task.status === 'completed' ? 'success' : 'primary'}>
                  {task.status === 'completed' ? '已完成' : '待办'}
                </Tag>
                {task.important ? <Tag color="danger">重要</Tag> : null}
                {task.urgent ? <Tag color="warning">紧急</Tag> : null}
                {task.taskType === 'anniversary' ? <Tag color="primary">纪念日</Tag> : null}
              </div>
              {task.description ? (
                <p className="mt-3 whitespace-pre-wrap">{task.description}</p>
              ) : null}
            </Card>

            <List className="mobile-detail-list">
              <List.Item extra={list?.name || '-'}>清单</List.Item>
              <List.Item extra={userName(assignee)}>负责人</List.Item>
              <List.Item extra={formatDateTime(task.dueAt)}>截止时间</List.Item>
              <List.Item extra={formatDateTime(task.remindAt)}>提醒时间</List.Item>
              <List.Item extra={formatTaskRecurrence(task.recurrenceType, task.recurrenceInterval)}>
                重复规则
              </List.Item>
              <List.Item extra={formatTaskReminderChannels(task.reminderChannels)}>
                提醒渠道
              </List.Item>
              <List.Item extra={task.tags?.join(', ') || '-'}>标签</List.Item>
            </List>
          </div>
        )}
      </div>
      {task ? (
        <div className="mobile-bottom-actions">
          <Button
            size="small"
            color="danger"
            fill="outline"
            loading={deleteTask.isPending}
            onClick={() => void handleDelete()}
          >
            删除
          </Button>
          <div className="mobile-bottom-actions-right">
            <Button
              size="small"
              color={isCompleted ? 'default' : 'success'}
              onClick={() =>
                isCompleted ? reopenTask.mutate(task.id) : completeTask.mutate(task.id)
              }
            >
              {isCompleted ? '重开' : '完成'}
            </Button>
            <Button size="small" color="primary" onClick={() => setEditorOpen(true)}>
              编辑
            </Button>
          </div>
        </div>
      ) : null}
      <TaskEditorPopup
        open={editorOpen}
        task={task ?? null}
        lists={lists.filter((item) => !item.isArchived)}
        users={users}
        defaultListId={lists.find((item) => !item.isArchived)?.id}
        submitting={updateTask.isPending}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
