import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileTaskPage } from './MobileTaskPage';
import type { Task } from '@/features/task/types/task.types';

const taskHooks = vi.hoisted(() => ({
  useTaskLists: vi.fn(),
  useTaskAssignees: vi.fn(),
  useTasks: vi.fn(),
  useTask: vi.fn(),
  useCreateTask: vi.fn(),
  useUpdateTask: vi.fn(),
  useCompleteTask: vi.fn(),
  useReopenTask: vi.fn(),
  useDeleteTask: vi.fn(),
  useCreateTaskList: vi.fn(),
  useUpdateTaskList: vi.fn(),
  useDeleteTaskList: vi.fn(),
}));

vi.mock('@/features/task/hooks/useTasks', () => taskHooks);

const mutate = vi.fn();

const baseTask: Task = {
  id: 42,
  title: '交电费',
  description: '每月账单',
  listId: 1,
  list: { id: 1, name: '收集箱', scope: 'family', sort: 1, isArchived: false },
  assigneeId: 2,
  assignee: { id: 2, username: 'mom', nickname: '妈妈' },
  status: 'pending',
  taskType: 'task',
  dueAt: '2026-05-02T10:00:00.000Z',
  remindAt: '2026-05-02T09:00:00.000Z',
  remindedAt: null,
  completedAt: null,
  important: true,
  urgent: false,
  tags: ['家庭'],
  recurrenceType: 'monthly',
  recurrenceInterval: 1,
  reminderChannels: ['internal', 'bark'],
  sendExternalReminder: true,
  createdAt: '2026-05-01T10:00:00.000Z',
  updatedAt: '2026-05-01T10:00:00.000Z',
};

function renderPage(initialPath = '/tasks') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <MobileTaskPage />
    </MemoryRouter>
  );
}

describe('MobileTaskPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    taskHooks.useTaskLists.mockReturnValue({
      data: [{ id: 1, name: '收集箱', scope: 'family', sort: 1, isArchived: false }],
    });
    taskHooks.useTaskAssignees.mockReturnValue({
      data: [{ id: 2, username: 'mom', nickname: '妈妈' }],
    });
    taskHooks.useTasks.mockReturnValue({
      data: { items: [baseTask], total: 1, page: 1, pageSize: 100 },
      isLoading: false,
      refetch: vi.fn().mockResolvedValue(undefined),
    });
    taskHooks.useTask.mockReturnValue({ data: undefined, isLoading: false });
    taskHooks.useCreateTask.mockReturnValue({ mutate, isPending: false });
    taskHooks.useUpdateTask.mockReturnValue({ mutate, isPending: false });
    taskHooks.useCompleteTask.mockReturnValue({ mutate, isPending: false });
    taskHooks.useReopenTask.mockReturnValue({ mutate, isPending: false });
    taskHooks.useDeleteTask.mockReturnValue({ mutate, isPending: false });
    taskHooks.useCreateTaskList.mockReturnValue({ mutate, isPending: false });
    taskHooks.useUpdateTaskList.mockReturnValue({ mutate, isPending: false });
    taskHooks.useDeleteTaskList.mockReturnValue({ mutate, isPending: false });
  });

  it('defaults /m/tasks to the today task view', async () => {
    renderPage();

    await waitFor(() =>
      expect(taskHooks.useTasks).toHaveBeenCalledWith(expect.objectContaining({ view: 'today' }))
    );
    expect(screen.getByRole('heading', { name: '今天' })).toBeInTheDocument();
  });

  it('opens a task detail sheet from the taskId query parameter', async () => {
    taskHooks.useTask.mockReturnValue({ data: baseTask, isLoading: false });

    renderPage('/tasks?taskId=42');

    expect(await screen.findByText('任务详情')).toBeInTheDocument();
    expect(screen.getAllByText('交电费').length).toBeGreaterThan(0);
    expect(taskHooks.useTask).toHaveBeenCalledWith(42);
  });

  it('switches task views through the mobile task dock', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /日历/ }));

    await waitFor(() =>
      expect(taskHooks.useTasks).toHaveBeenLastCalledWith(
        expect.objectContaining({ view: 'calendar' })
      )
    );
    expect(screen.getByRole('heading', { name: /月/ })).toBeInTheDocument();
  });

  it('shows all four matrix quadrants at the same time', () => {
    renderPage('/tasks?view=matrix');

    expect(screen.getByText('重要且紧急')).toBeInTheDocument();
    expect(screen.getByText('重要不紧急')).toBeInTheDocument();
    expect(screen.getByText('紧急不重要')).toBeInTheDocument();
    expect(screen.getByText('不重要不紧急')).toBeInTheDocument();
  });

  it('creates anniversary tasks from the anniversary dock view', async () => {
    const { container } = renderPage('/tasks?view=anniversary');

    const createButton = container.querySelector('.mobile-task-fab');
    expect(createButton).not.toBeNull();
    fireEvent.click(createButton as Element);

    fireEvent.change(await screen.findByPlaceholderText('准备做什么？'), {
      target: { value: '结婚纪念日' },
    });
    fireEvent.click(screen.getByRole('button', { name: /日期/ }));
    fireEvent.click(await screen.findByRole('button', { name: '今天' }));
    fireEvent.click(screen.getByRole('button', { name: '完成' }));
    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({ taskType: 'anniversary' }),
        expect.any(Object)
      )
    );
  });
});
