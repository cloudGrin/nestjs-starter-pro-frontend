import { useEffect, useMemo, useState } from 'react';
import { Button, Card, DatePicker, Form, Input, Select, Space, Tabs } from 'antd';
import { PlusOutlined, ReloadOutlined, UnorderedListOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import { PageWrap, PermissionGuard, SearchForm } from '@/shared/components';
import {
  useCompleteTask,
  useCreateTask,
  useDeleteTask,
  useReopenTask,
  useTaskAssignees,
  useTaskLists,
  useTasks,
  useUpdateTask,
} from '../hooks/useTasks';
import { TaskAnniversaryView } from '../components/TaskAnniversaryView';
import { TaskCalendarView } from '../components/TaskCalendarView';
import { TaskFormModal } from '../components/TaskFormModal';
import { TaskListManageModal } from '../components/TaskListManageModal';
import { TaskMatrixView } from '../components/TaskMatrixView';
import { TaskTable } from '../components/TaskTable';
import type {
  CreateTaskDto,
  QueryTasksParams,
  Task,
  TaskSortField,
  TaskStatus,
  TaskView,
  UpdateTaskDto,
} from '../types/task.types';

interface TaskSearchValues {
  keyword?: string;
  listId?: number;
  status?: TaskStatus;
  assigneeId?: number;
  dateRange?: [Dayjs, Dayjs];
  tags?: string[];
}

const highVolumeViews = new Set<TaskView>(['calendar', 'matrix', 'anniversary']);
const dateRangeViews = new Set<TaskView>(['list', 'calendar']);
const TASK_PAGE_LIMIT_MAX = 100;
const taskSortFieldByColumn: Record<string, TaskSortField> = {
  title: 'title',
  dueAt: 'dueAt',
  remindAt: 'remindAt',
};

function clampLimit(limit: number) {
  return Math.min(Math.max(limit, 1), TASK_PAGE_LIMIT_MAX);
}

function supportsDateRange(view: TaskView) {
  return dateRangeViews.has(view);
}

function getDefaultLimit(view: TaskView) {
  return highVolumeViews.has(view) ? TASK_PAGE_LIMIT_MAX : 10;
}

function getCalendarDefaultRange() {
  return {
    startDate: dayjs().startOf('month').toISOString(),
    endDate: dayjs().endOf('month').toISOString(),
  };
}

function getViewDefaults(view: TaskView): QueryTasksParams {
  return {
    view,
    page: 1,
    limit: getDefaultLimit(view),
    ...(view === 'calendar' ? getCalendarDefaultRange() : {}),
  };
}

function getTaskIdFromSearch(search: string) {
  const taskId = Number(new URLSearchParams(search).get('taskId'));
  return Number.isInteger(taskId) && taskId > 0 ? taskId : undefined;
}

function getInitialQueryParams(search = window.location.search): QueryTasksParams {
  return {
    ...getViewDefaults('list'),
    taskId: getTaskIdFromSearch(search),
  };
}

function getAggregationKey(params: QueryTasksParams) {
  return [
    params.view,
    params.limit,
    params.taskId,
    params.listId,
    params.assigneeId,
    params.status,
    params.startDate,
    params.endDate,
    params.keyword,
    params.tags?.join(','),
    params.sort,
    params.order,
  ].join('|');
}

function toQueryParams(values: Record<string, unknown>, view: TaskView): QueryTasksParams {
  const searchValues = values as TaskSearchValues;
  const keyword = searchValues.keyword?.trim();
  const dateRange = searchValues.dateRange;
  const fallbackDateRange: Pick<Partial<QueryTasksParams>, 'startDate' | 'endDate'> = dateRange
    ? {}
    : view === 'calendar'
      ? getCalendarDefaultRange()
      : {};
  const shouldUseDateRange = supportsDateRange(view);

  return {
    view,
    page: 1,
    limit: getDefaultLimit(view),
    keyword: keyword || undefined,
    listId: searchValues.listId,
    status: searchValues.status,
    assigneeId: searchValues.assigneeId,
    tags: searchValues.tags?.length ? searchValues.tags : undefined,
    startDate: shouldUseDateRange
      ? dateRange?.[0]?.startOf('day').toISOString() ?? fallbackDateRange.startDate
      : undefined,
    endDate: shouldUseDateRange
      ? dateRange?.[1]?.endOf('day').toISOString() ?? fallbackDateRange.endDate
      : undefined,
  };
}

export function TaskCenterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [queryParams, setQueryParams] = useState<QueryTasksParams>(() =>
    getInitialQueryParams(location.search)
  );
  const [aggregatedTasks, setAggregatedTasks] = useState<Task[]>([]);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [listManageOpen, setListManageOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const activeView = queryParams.view ?? 'list';
  const isHighVolumeView = highVolumeViews.has(activeView);
  const canUseDateRange = supportsDateRange(activeView);
  const aggregationKey = useMemo(() => getAggregationKey(queryParams), [queryParams]);
  const taskListsQuery = useTaskLists();
  const tasksQuery = useTasks(queryParams);
  const assigneesQuery = useTaskAssignees();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const completeTask = useCompleteTask();
  const reopenTask = useReopenTask();
  const deleteTask = useDeleteTask();

  const taskLists = taskListsQuery.data ?? [];
  const users = assigneesQuery.data ?? [];

  useEffect(() => {
    const taskId = getTaskIdFromSearch(location.search);
    if (!taskId) {
      return;
    }

    setQueryParams((previous) => {
      if (previous.view === 'list' && previous.taskId === taskId) {
        return previous;
      }

      return {
        ...getViewDefaults('list'),
        taskId,
      };
    });
  }, [location.search]);

  useEffect(() => {
    const items = tasksQuery.data?.items;
    if (!isHighVolumeView || !items) {
      setAggregatedTasks([]);
      return;
    }

    setAggregatedTasks((previous) => {
      if ((queryParams.page ?? 1) <= 1) {
        return items;
      }

      const merged = new Map(previous.map((task) => [task.id, task]));
      items.forEach((task) => merged.set(task.id, task));
      return Array.from(merged.values());
    });
  }, [aggregationKey, isHighVolumeView, queryParams.page, tasksQuery.data?.items]);

  const displayTasksData = useMemo(() => {
    if (!tasksQuery.data || !isHighVolumeView) {
      return tasksQuery.data;
    }

    return {
      ...tasksQuery.data,
      items: aggregatedTasks,
      page: queryParams.page ?? tasksQuery.data.page,
    };
  }, [aggregatedTasks, isHighVolumeView, queryParams.page, tasksQuery.data]);

  const clearTaskIdFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    if (!searchParams.has('taskId')) {
      return;
    }

    searchParams.delete('taskId');
    const nextSearch = searchParams.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
      },
      { replace: true }
    );
  };

  const closeTaskForm = () => {
    setTaskFormOpen(false);
    setCurrentTask(null);
  };

  const handleCreate = () => {
    setCurrentTask(null);
    setTaskFormOpen(true);
  };

  const handleEdit = (task: Task) => {
    setCurrentTask(task);
    setTaskFormOpen(true);
  };

  const handleTaskSubmit = (payload: CreateTaskDto | UpdateTaskDto) => {
    if (currentTask) {
      updateTask.mutate(
        { id: currentTask.id, data: payload },
        {
          onSuccess: closeTaskForm,
        }
      );
      return;
    }

    createTask.mutate(payload as CreateTaskDto, {
      onSuccess: closeTaskForm,
    });
  };

  const handleSearch = (values: Record<string, unknown>) => {
    clearTaskIdFromUrl();
    setQueryParams(toQueryParams(values, activeView));
  };

  const handleReset = () => {
    clearTaskIdFromUrl();
    setQueryParams(getViewDefaults(activeView));
  };

  const handleTabChange = (key: string) => {
    const view = key as TaskView;
    clearTaskIdFromUrl();
    setQueryParams((previous) => ({
      view,
      page: 1,
      limit: getDefaultLimit(view),
      keyword: previous.keyword,
      listId: previous.listId,
      status: previous.status,
      assigneeId: previous.assigneeId,
      tags: previous.tags,
      sort: previous.sort,
      order: previous.order,
      ...(supportsDateRange(view) && view === 'calendar' && !previous.startDate && !previous.endDate
        ? getCalendarDefaultRange()
        : {}),
      ...(supportsDateRange(view) && (previous.startDate || previous.endDate)
        ? { startDate: previous.startDate, endDate: previous.endDate }
        : {}),
    }));
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    sorter: SorterResult<Task>
  ) => {
    const sortKey = typeof sorter.field === 'string' ? taskSortFieldByColumn[sorter.field] : undefined;
    const sortOrder =
      sortKey && sorter.order ? (sorter.order === 'ascend' ? 'ASC' : 'DESC') : undefined;

    setQueryParams((previous) => ({
      ...previous,
      page: pagination.current ?? 1,
      limit: clampLimit(pagination.pageSize ?? previous.limit ?? getDefaultLimit(activeView)),
      sort: sortOrder ? sortKey : undefined,
      order: sortOrder,
    }));
  };

  const handleLoadMore = () => {
    setQueryParams((previous) => ({
      ...previous,
      page: (previous.page ?? 1) + 1,
      limit: clampLimit(previous.limit ?? getDefaultLimit(activeView)),
    }));
  };

  const canLoadMore =
    isHighVolumeView &&
    (displayTasksData?.items.length ?? 0) < (displayTasksData?.total ?? 0);

  const sharedViewProps = {
    data: displayTasksData,
    loading: tasksQuery.isLoading,
    onEdit: handleEdit,
    onComplete: (task: Task) => completeTask.mutate(task.id),
    onReopen: (task: Task) => reopenTask.mutate(task.id),
    onDelete: (task: Task) => deleteTask.mutate(task.id),
  };

  return (
    <PageWrap
      title="任务中心"
      titleRight={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => tasksQuery.refetch()}>
            刷新
          </Button>
          <PermissionGuard permissions={['task-list:manage']}>
            <Button icon={<UnorderedListOutlined />} onClick={() => setListManageOpen(true)}>
              管理清单
            </Button>
          </PermissionGuard>
          <PermissionGuard permissions={['task:create']}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={taskLists.length === 0}
              onClick={handleCreate}
            >
              新建任务
            </Button>
          </PermissionGuard>
        </Space>
      }
      header={
        <SearchForm
          onSearch={handleSearch}
          onReset={handleReset}
          showRefresh
          onRefresh={() => tasksQuery.refetch()}
          defaultCollapseCount={3}
        >
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="搜索任务标题或描述" allowClear />
          </Form.Item>
          <Form.Item name="listId" label="清单">
            <Select
              allowClear
              placeholder="全部清单"
              options={taskLists.map((list) => ({
                label: list.name,
                value: list.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              allowClear
              placeholder="全部状态"
              options={[
                { label: '待办', value: 'pending' },
                { label: '已完成', value: 'completed' },
              ]}
            />
          </Form.Item>
          <Form.Item name="assigneeId" label="负责人">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="全部负责人"
              options={users.map((user) => ({
                label: user.realName || user.nickname || user.username,
                value: user.id,
              }))}
            />
          </Form.Item>
          {canUseDateRange ? (
            <Form.Item name="dateRange" label="日期范围">
              <DatePicker.RangePicker className="w-full" />
            </Form.Item>
          ) : null}
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后回车" tokenSeparators={[',']} />
          </Form.Item>
        </SearchForm>
      }
    >
      <Tabs
        activeKey={activeView}
        onChange={handleTabChange}
        items={[
          {
            key: 'list',
            label: '清单',
            children: (
              <Card>
                <TaskTable {...sharedViewProps} onTableChange={handleTableChange} />
              </Card>
            ),
          },
          {
            key: 'today',
            label: '今日',
            children: (
              <Card>
                <TaskTable {...sharedViewProps} onTableChange={handleTableChange} />
              </Card>
            ),
          },
          {
            key: 'calendar',
            label: '日历',
            children: <TaskCalendarView {...sharedViewProps} />,
          },
          {
            key: 'matrix',
            label: '四象限',
            children: <TaskMatrixView {...sharedViewProps} />,
          },
          {
            key: 'anniversary',
            label: '纪念日',
            children: <TaskAnniversaryView {...sharedViewProps} />,
          },
        ]}
      />

      {canLoadMore ? (
        <div className="mt-4 flex justify-center">
          <Button onClick={handleLoadMore} loading={tasksQuery.isLoading}>
            加载更多
          </Button>
        </div>
      ) : null}

      <TaskFormModal
        open={taskFormOpen}
        task={currentTask}
        lists={taskLists}
        users={users}
        submitting={createTask.isPending || updateTask.isPending}
        onCancel={closeTaskForm}
        onSubmit={handleTaskSubmit}
      />

      <TaskListManageModal
        open={listManageOpen}
        lists={taskLists}
        loading={taskListsQuery.isLoading}
        onCancel={() => setListManageOpen(false)}
      />
    </PageWrap>
  );
}
