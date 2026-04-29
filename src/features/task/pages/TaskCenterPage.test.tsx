import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { TaskCenterPage } from './TaskCenterPage';
import {
  createMockUser,
  renderWithProviders,
  setMockUser,
  userEvent,
} from '@/test/test-utils';

const taskHookMocks = vi.hoisted(() => ({
  useTaskLists: vi.fn(),
  useTasks: vi.fn(),
  useCreateTask: vi.fn(),
  useUpdateTask: vi.fn(),
  useCompleteTask: vi.fn(),
  useReopenTask: vi.fn(),
  useDeleteTask: vi.fn(),
  useCreateTaskList: vi.fn(),
  useUpdateTaskList: vi.fn(),
  useDeleteTaskList: vi.fn(),
  useTaskAssignees: vi.fn(),
}));

const userHookMocks = vi.hoisted(() => ({
  useUsers: vi.fn(),
}));

vi.mock('../hooks/useTasks', () => taskHookMocks);

vi.mock('@/features/rbac/user/hooks/useUsers', () => userHookMocks);

vi.mock('@/shared/hooks/useBreadcrumb', () => ({
  useBreadcrumb: () => [],
}));

const emptyTasks = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
};

function mockMutation() {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  };
}

function renderTaskCenter(initialPath = '/tasks') {
  window.history.pushState({}, '', initialPath);
  return renderWithProviders(
    <MemoryRouter initialEntries={[initialPath]}>
      <TaskCenterPage />
    </MemoryRouter>
  );
}

function getLastTaskQueryParams() {
  const calls = taskHookMocks.useTasks.mock.calls;
  return calls[calls.length - 1]?.[0];
}

function TaskCenterWithNotificationJump() {
  const navigate = useNavigate();

  return (
    <>
      <button type="button" onClick={() => navigate('/tasks?taskId=88')}>
        打开任务通知
      </button>
      <TaskCenterPage />
    </>
  );
}

describe('TaskCenterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/tasks');
    vi.stubGlobal('getComputedStyle', () => ({
      getPropertyValue: () => '',
    }));

    taskHookMocks.useTaskLists.mockReturnValue({
      data: [{ id: 1, name: '家庭计划', scope: 'family', sort: 0, isArchived: false }],
      isLoading: false,
    });
    taskHookMocks.useTasks.mockReturnValue({
      data: emptyTasks,
      isLoading: false,
      refetch: vi.fn(),
    });
    userHookMocks.useUsers.mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 100 },
      isLoading: false,
    });
    taskHookMocks.useCreateTask.mockReturnValue(mockMutation());
    taskHookMocks.useUpdateTask.mockReturnValue(mockMutation());
    taskHookMocks.useCompleteTask.mockReturnValue(mockMutation());
    taskHookMocks.useReopenTask.mockReturnValue(mockMutation());
    taskHookMocks.useDeleteTask.mockReturnValue(mockMutation());
    taskHookMocks.useCreateTaskList.mockReturnValue(mockMutation());
    taskHookMocks.useUpdateTaskList.mockReturnValue(mockMutation());
    taskHookMocks.useDeleteTaskList.mockReturnValue(mockMutation());
    taskHookMocks.useTaskAssignees.mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it('renders task center tabs', () => {
    setMockUser(
      createMockUser({
        permissions: ['task:read', 'task:create', 'task-list:manage'],
      })
    );

    renderTaskCenter();

    expect(screen.getByText('任务中心')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '清单' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '今日' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '日历' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '四象限' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '纪念日' })).toBeInTheDocument();
  });

  it('hides create button without task:create permission', () => {
    setMockUser(
      createMockUser({
        permissions: ['task:read'],
      })
    );

    renderTaskCenter();

    expect(screen.queryByRole('button', { name: /新建任务/ })).not.toBeInTheDocument();
  });

  it('opens task form when user has create permission', async () => {
    setMockUser(
      createMockUser({
        permissions: ['task:read', 'task:create'],
      })
    );

    renderTaskCenter();

    await userEvent.click(screen.getByRole('button', { name: /新建任务/ }));

    expect(screen.getByPlaceholderText('例如：给家里买菜、准备周会、结婚纪念日')).toBeInTheDocument();
  });

  it('initializes task query from notification taskId links', () => {
    window.history.pushState({}, '', '/tasks?taskId=42');
    setMockUser(
      createMockUser({
        permissions: ['task:read'],
      })
    );

    renderTaskCenter('/tasks?taskId=42');

    expect(taskHookMocks.useTasks).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 42,
      })
    );
  });

  it('uses task assignee options without querying the user management list', () => {
    setMockUser(
      createMockUser({
        permissions: ['task:read'],
      })
    );

    renderTaskCenter();

    expect(taskHookMocks.useTaskAssignees).toHaveBeenCalled();
  });

  it('adds a default date range when switching to calendar view', async () => {
    setMockUser(
      createMockUser({
        permissions: ['task:read'],
      })
    );

    renderTaskCenter();
    await userEvent.click(screen.getByRole('tab', { name: '日历' }));

    expect(taskHookMocks.useTasks).toHaveBeenLastCalledWith(
      expect.objectContaining({
        view: 'calendar',
        startDate: expect.any(String),
        endDate: expect.any(String),
      })
    );
  });

  it('loads the next non-table page without exceeding the backend limit', async () => {
    taskHookMocks.useTasks.mockReturnValue({
      data: {
        items: Array.from({ length: 100 }, (_, index) => ({
          id: index + 1,
          title: `任务 ${index + 1}`,
          listId: 1,
          status: 'pending',
          taskType: 'task',
          important: false,
          urgent: false,
          recurrenceType: 'none',
          sendExternalReminder: false,
          createdAt: '2026-04-01T00:00:00.000Z',
          updatedAt: '2026-04-01T00:00:00.000Z',
        })),
        total: 101,
        page: 1,
        pageSize: 100,
      },
      isLoading: false,
      refetch: vi.fn(),
    });
    setMockUser(
      createMockUser({
        permissions: ['task:read'],
      })
    );

    renderTaskCenter();
    await userEvent.click(screen.getByRole('tab', { name: '日历' }));
    await userEvent.click(await screen.findByRole('button', { name: /加载更多/ }));

    expect(taskHookMocks.useTasks).toHaveBeenLastCalledWith(
      expect.objectContaining({
        view: 'calendar',
        page: 2,
        limit: 100,
      })
    );
  });

  it('reacts to taskId changes while staying on the task center route', async () => {
    setMockUser(
      createMockUser({
        permissions: ['task:read'],
      })
    );

    window.history.pushState({}, '', '/tasks?taskId=42');
    renderWithProviders(
      <MemoryRouter initialEntries={['/tasks?taskId=42']}>
        <TaskCenterWithNotificationJump />
      </MemoryRouter>
    );

    expect(taskHookMocks.useTasks).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 42,
      })
    );

    await userEvent.click(screen.getByRole('button', { name: '打开任务通知' }));

    expect(taskHookMocks.useTasks).toHaveBeenLastCalledWith(
      expect.objectContaining({
        view: 'list',
        taskId: 88,
      })
    );
  });

  it('clears notification taskId filters when switching tabs', async () => {
    setMockUser(
      createMockUser({
        permissions: ['task:read'],
      })
    );

    renderTaskCenter('/tasks?taskId=42');
    await userEvent.click(screen.getByRole('tab', { name: '四象限' }));

    expect(getLastTaskQueryParams()).toEqual(
      expect.objectContaining({
        view: 'matrix',
      })
    );
    expect(getLastTaskQueryParams()).not.toEqual(
      expect.objectContaining({
        taskId: 42,
      })
    );
  });

  it('clears date range params when switching to views that do not support date filtering', async () => {
    setMockUser(
      createMockUser({
        permissions: ['task:read'],
      })
    );

    renderTaskCenter();
    await userEvent.click(screen.getByRole('tab', { name: '日历' }));
    expect(getLastTaskQueryParams()).toEqual(
      expect.objectContaining({
        view: 'calendar',
        startDate: expect.any(String),
        endDate: expect.any(String),
      })
    );

    await userEvent.click(screen.getByRole('tab', { name: '四象限' }));

    expect(getLastTaskQueryParams()).toEqual(
      expect.objectContaining({
        view: 'matrix',
      })
    );
    expect(getLastTaskQueryParams()).not.toEqual(
      expect.objectContaining({
        startDate: expect.any(String),
        endDate: expect.any(String),
      })
    );
  });

  it('maps table sorting to backend sort params', async () => {
    setMockUser(
      createMockUser({
        permissions: ['task:read'],
      })
    );

    renderTaskCenter();
    await userEvent.click(screen.getByRole('columnheader', { name: /截止时间/ }));

    expect(taskHookMocks.useTasks).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sort: 'dueAt',
        order: 'ASC',
      })
    );
  });
});
