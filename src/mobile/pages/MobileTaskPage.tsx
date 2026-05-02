import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Dialog,
  Input,
  List,
  Popup,
  PullToRefresh,
  SearchBar,
  Selector,
  SwipeAction,
  Switch,
  Tag,
  TextArea,
  Toast,
} from 'antd-mobile';
import {
  AppstoreOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  FlagOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  SettingOutlined,
  TagsOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import {
  useCompleteTask,
  useCreateTask,
  useCreateTaskList,
  useDeleteTask,
  useDeleteTaskList,
  useReopenTask,
  useTask,
  useTaskAssignees,
  useTaskLists,
  useTasks,
  useUpdateTask,
  useUpdateTaskList,
} from '@/features/task/hooks/useTasks';
import type {
  CreateTaskDto,
  CreateTaskListDto,
  QueryTasksParams,
  Task,
  TaskAssignee,
  TaskList,
  TaskRecurrenceType,
  TaskReminderChannel,
  TaskStatus,
  TaskType,
  TaskView,
  UpdateTaskDto,
  UpdateTaskListDto,
} from '@/features/task/types/task.types';
import {
  formatTaskRecurrence,
  formatTaskReminderChannels,
  mobileTaskRecurrenceLabels,
  mobileTaskReminderChannelLabels,
} from '../utils/task';
import { MobileModuleHeader } from '../components/MobileModuleHeader';

type MobileTaskView = TaskView;

interface TaskDraft {
  title: string;
  description: string;
  listId?: number;
  assigneeId?: number;
  taskType: TaskType;
  dueAt?: Date;
  remindAt?: Date;
  important: boolean;
  urgent: boolean;
  tags: string;
  recurrenceType: TaskRecurrenceType;
  recurrenceInterval: string;
  reminderChannels: TaskReminderChannel[];
}

type MatrixQuadrant = 'important-urgent' | 'important' | 'urgent' | 'normal';

const taskViews: MobileTaskView[] = ['list', 'today', 'calendar', 'matrix', 'anniversary'];

const dockViewOptions: Array<{
  label: string;
  value: MobileTaskView;
  icon: ReactNode;
}> = [
  { label: '今天', value: 'today', icon: <CheckSquareOutlined /> },
  { label: '列表', value: 'list', icon: <FolderOpenOutlined /> },
  { label: '日历', value: 'calendar', icon: <CalendarOutlined /> },
  { label: '四象限', value: 'matrix', icon: <AppstoreOutlined /> },
  { label: '纪念日', value: 'anniversary', icon: <ClockCircleOutlined /> },
];

const taskTypeOptions: Array<{ label: string; value: TaskType }> = [
  { label: '普通任务', value: 'task' },
  { label: '纪念日', value: 'anniversary' },
];

const recurrenceOptions: Array<{ label: string; value: TaskRecurrenceType }> = [
  { label: mobileTaskRecurrenceLabels.none, value: 'none' },
  { label: mobileTaskRecurrenceLabels.daily, value: 'daily' },
  { label: mobileTaskRecurrenceLabels.weekly, value: 'weekly' },
  { label: mobileTaskRecurrenceLabels.monthly, value: 'monthly' },
  { label: mobileTaskRecurrenceLabels.yearly, value: 'yearly' },
  { label: mobileTaskRecurrenceLabels.weekdays, value: 'weekdays' },
  { label: mobileTaskRecurrenceLabels.custom, value: 'custom' },
];

const reminderChannelOptions: Array<{ label: string; value: TaskReminderChannel }> = [
  { label: mobileTaskReminderChannelLabels.internal, value: 'internal' },
  { label: mobileTaskReminderChannelLabels.bark, value: 'bark' },
  { label: mobileTaskReminderChannelLabels.feishu, value: 'feishu' },
];

const reminderOffsetOptions = [
  { label: '提前 15 分钟', amount: 15, unit: 'minute' as const },
  { label: '提前 30 分钟', amount: 30, unit: 'minute' as const },
  { label: '提前 1 小时', amount: 1, unit: 'hour' as const },
  { label: '提前 2 小时', amount: 2, unit: 'hour' as const },
  { label: '提前 1 天', amount: 1, unit: 'day' as const },
  { label: '提前 2 天', amount: 2, unit: 'day' as const },
  { label: '提前 3 天', amount: 3, unit: 'day' as const },
  { label: '提前 1 周', amount: 1, unit: 'week' as const },
];

const statusOptions: Array<{ label: string; value: 'all' | TaskStatus }> = [
  { label: '全部', value: 'all' },
  { label: '待办', value: 'pending' },
  { label: '完成', value: 'completed' },
];

const quadrantOptions: Array<{
  label: string;
  roman: string;
  value: MatrixQuadrant;
  colorClass: string;
}> = [
  { label: '重要且紧急', roman: 'I', value: 'important-urgent', colorClass: 'danger' },
  { label: '重要不紧急', roman: 'II', value: 'important', colorClass: 'warning' },
  { label: '紧急不重要', roman: 'III', value: 'urgent', colorClass: 'primary' },
  { label: '不重要不紧急', roman: 'IV', value: 'normal', colorClass: 'success' },
];

const highVolumeViews = new Set<MobileTaskView>(['calendar', 'matrix', 'anniversary']);

function parseTaskView(value: string | null): MobileTaskView {
  return value && taskViews.includes(value as MobileTaskView) ? (value as MobileTaskView) : 'today';
}

function parseTaskId(value: string | null) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function getUserName(user?: TaskAssignee | null) {
  return user?.realName || user?.nickname || user?.username || '';
}

function getTaskAssignee(task: Task, users: TaskAssignee[]) {
  return task.assignee ?? users.find((user) => user.id === task.assigneeId) ?? null;
}

function getTaskList(task: Task, lists: TaskList[]) {
  return task.list ?? lists.find((list) => list.id === task.listId) ?? null;
}

function formatDateTime(value?: string | Date | null) {
  return value ? dayjs(value).format('MM-DD HH:mm') : '';
}

function formatFullDateTime(value?: string | Date | null) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}

function getTaskDay(task: Task) {
  return dayjs(task.dueAt || task.remindAt || task.createdAt).format('YYYY-MM-DD');
}

function getViewTitle(view: MobileTaskView, month: dayjs.Dayjs) {
  if (view === 'today') return '今天';
  if (view === 'calendar') return month.format('M月');
  if (view === 'matrix') return '四象限';
  if (view === 'anniversary') return '纪念日';
  return '任务';
}

function buildQueryParams(
  view: MobileTaskView,
  filters: {
    keyword?: string;
    listId?: number;
    assigneeId?: number;
    status?: TaskStatus;
    tags?: string[];
  },
  month: dayjs.Dayjs
): QueryTasksParams {
  const params: QueryTasksParams = {
    view,
    page: 1,
    limit: highVolumeViews.has(view) ? 100 : 50,
    keyword: filters.keyword || undefined,
    listId: filters.listId,
    assigneeId: filters.assigneeId,
    status: filters.status,
    tags: filters.tags?.length ? filters.tags : undefined,
  };

  if (view === 'calendar') {
    params.startDate = month.startOf('month').toISOString();
    params.endDate = month.endOf('month').toISOString();
  }

  return params;
}

function buildEmptyDraft(defaultListId?: number, dueAt?: Date): TaskDraft {
  return {
    title: '',
    description: '',
    listId: defaultListId,
    assigneeId: undefined,
    taskType: 'task',
    dueAt,
    remindAt: undefined,
    important: false,
    urgent: false,
    tags: '',
    recurrenceType: 'none',
    recurrenceInterval: '',
    reminderChannels: ['internal'],
  };
}

function draftFromTask(task: Task): TaskDraft {
  return {
    title: task.title,
    description: task.description ?? '',
    listId: task.listId,
    assigneeId: task.assigneeId ?? undefined,
    taskType: task.taskType,
    dueAt: task.dueAt ? new Date(task.dueAt) : undefined,
    remindAt: task.remindAt ? new Date(task.remindAt) : undefined,
    important: task.important,
    urgent: task.urgent,
    tags: task.tags?.join(', ') ?? '',
    recurrenceType: task.recurrenceType,
    recurrenceInterval: task.recurrenceInterval ? String(task.recurrenceInterval) : '',
    reminderChannels: ensureInternalChannel(task.reminderChannels),
  };
}

function ensureInternalChannel(channels?: TaskReminderChannel[] | null) {
  return Array.from(new Set<TaskReminderChannel>(['internal', ...(channels ?? [])]));
}

function tagsFromText(value: string) {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function taskDraftToPayload(draft: TaskDraft, isEditing: boolean): CreateTaskDto | UpdateTaskDto {
  const title = draft.title.trim();
  if (!title) {
    throw new Error('请输入任务标题');
  }
  if (!draft.listId) {
    throw new Error('请选择清单');
  }
  if (draft.remindAt && draft.dueAt && draft.remindAt.getTime() > draft.dueAt.getTime()) {
    throw new Error('提醒时间不能晚于截止时间');
  }
  if (draft.recurrenceType !== 'none' && !draft.dueAt) {
    throw new Error('重复任务必须设置截止时间');
  }
  if (draft.taskType === 'anniversary' && !draft.dueAt) {
    throw new Error('纪念日必须设置日期');
  }

  const payload: CreateTaskDto = {
    title,
    description: draft.description.trim() || null,
    listId: draft.listId,
    assigneeId: draft.assigneeId ?? null,
    taskType: draft.taskType,
    dueAt: draft.dueAt ? draft.dueAt.toISOString() : null,
    remindAt: draft.remindAt ? draft.remindAt.toISOString() : null,
    important: draft.important,
    urgent: draft.urgent,
    tags: tagsFromText(draft.tags),
    recurrenceType: draft.recurrenceType,
    recurrenceInterval: draft.recurrenceInterval ? Number(draft.recurrenceInterval) : null,
    reminderChannels: ensureInternalChannel(draft.reminderChannels),
  };

  return isEditing ? payload : payload;
}

function getTaskQuadrant(task: Task): MatrixQuadrant {
  if (task.important && task.urgent) return 'important-urgent';
  if (task.important) return 'important';
  if (task.urgent) return 'urgent';
  return 'normal';
}

export function MobileTaskPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = parseTaskView(searchParams.get('view'));
  const selectedTaskId = parseTaskId(searchParams.get('taskId'));
  const selectedDay = searchParams.get('date') || dayjs().format('YYYY-MM-DD');
  const [keyword, setKeyword] = useState('');
  const [listId, setListId] = useState<number>();
  const [assigneeId, setAssigneeId] = useState<number>();
  const [status, setStatus] = useState<TaskStatus>();
  const [tagText, setTagText] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => dayjs(selectedDay).startOf('month'));
  const [editorOpen, setEditorOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [listManageOpen, setListManageOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<number, TaskStatus>>({});

  const taskListsQuery = useTaskLists();
  const assigneesQuery = useTaskAssignees();
  const taskLists = taskListsQuery.data ?? [];
  const activeLists = taskLists.filter((list) => !list.isArchived);
  const users = assigneesQuery.data ?? [];
  const queryParams = useMemo(() => {
    const tags = tagsFromText(tagText);
    return buildQueryParams(
      view,
      {
        keyword: keyword.trim(),
        listId,
        assigneeId,
        status,
        tags,
      },
      calendarMonth
    );
  }, [assigneeId, calendarMonth, keyword, listId, status, tagText, view]);
  const tasksQuery = useTasks(queryParams);
  const selectedTaskQuery = useTask(selectedTaskId ?? null);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const completeTask = useCompleteTask();
  const reopenTask = useReopenTask();
  const deleteTask = useDeleteTask();
  const togglePendingTaskId = (
    completeTask.isPending
      ? completeTask.variables
      : reopenTask.isPending
        ? reopenTask.variables
        : undefined
  ) as number | undefined;
  const rawTasks = useMemo(() => tasksQuery.data?.items ?? [], [tasksQuery.data?.items]);
  const tasks = useMemo(
    () =>
      rawTasks.map((task) => {
        const optimisticStatus = optimisticStatuses[task.id];
        return optimisticStatus ? { ...task, status: optimisticStatus } : task;
      }),
    [optimisticStatuses, rawTasks]
  );
  const defaultListId = activeLists[0]?.id;
  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? selectedTaskQuery.data ?? null;

  useEffect(() => {
    setOptimisticStatuses((previous) => {
      const next = { ...previous };
      let changed = false;

      rawTasks.forEach((task) => {
        if (next[task.id] === task.status) {
          delete next[task.id];
          changed = true;
        }
      });

      return changed ? next : previous;
    });
  }, [rawTasks]);

  useEffect(() => {
    if (view === 'calendar') {
      const nextMonth = dayjs(selectedDay).startOf('month');
      if (!nextMonth.isSame(calendarMonth, 'month')) {
        setCalendarMonth(nextMonth);
      }
    }
  }, [calendarMonth, selectedDay, view]);

  const updateQuery = (updater: (next: URLSearchParams) => void) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      updater(next);
      return next;
    });
  };

  const setTaskView = (nextView: MobileTaskView) => {
    updateQuery((next) => {
      next.set('view', nextView);
      next.delete('taskId');
      if (nextView === 'calendar' && !next.get('date')) {
        next.set('date', selectedDay);
      }
    });
  };

  const setCalendarDay = (day: string) => {
    updateQuery((next) => {
      next.set('view', 'calendar');
      next.set('date', day);
      next.delete('taskId');
    });
  };

  const changeCalendarMonth = (nextMonth: dayjs.Dayjs) => {
    const normalized = nextMonth.startOf('month');
    const currentDate = dayjs(selectedDay).date();
    const nextDay = normalized.date(Math.min(currentDate, normalized.daysInMonth()));
    setCalendarMonth(normalized);
    setCalendarDay(nextDay.format('YYYY-MM-DD'));
  };

  const openTaskDetail = (task: Task) => {
    updateQuery((next) => {
      next.set('taskId', String(task.id));
    });
  };

  const closeTaskDetail = () => {
    updateQuery((next) => {
      next.delete('taskId');
    });
  };

  const openCreate = () => {
    setEditingTask(null);
    setEditorOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setEditorOpen(true);
  };

  const handleSubmit = (payload: CreateTaskDto | UpdateTaskDto) => {
    if (editingTask) {
      updateTask.mutate(
        { id: editingTask.id, data: payload },
        {
          onSuccess: () => {
            setEditorOpen(false);
            setEditingTask(null);
          },
        }
      );
      return;
    }

    createTask.mutate(payload as CreateTaskDto, {
      onSuccess: () => setEditorOpen(false),
    });
  };

  const toggleComplete = (task: Task) => {
    if (togglePendingTaskId === task.id) {
      return;
    }

    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    setOptimisticStatuses((previous) => ({ ...previous, [task.id]: nextStatus }));

    const rollback = () => {
      setOptimisticStatuses((previous) => {
        const next = { ...previous };
        delete next[task.id];
        return next;
      });
    };

    if (task.status === 'completed') {
      reopenTask.mutate(task.id, {
        onSuccess: (updatedTask) =>
          setOptimisticStatuses((previous) => ({
            ...previous,
            [task.id]: updatedTask.status,
          })),
        onError: rollback,
      });
      return;
    }
    completeTask.mutate(task.id, {
      onSuccess: (updatedTask) =>
        setOptimisticStatuses((previous) => ({
          ...previous,
          [task.id]: updatedTask.status,
        })),
      onError: rollback,
    });
  };

  return (
    <div className="mobile-page mobile-task-page">
      <MobileModuleHeader
        taskMode
        title={getViewTitle(view, calendarMonth)}
        subtitle="家庭任务和 PC 任务中心保持同一套数据"
        actions={
          <>
            <Button fill="none" onClick={() => setFilterOpen(true)}>
              <FilterOutlined />
            </Button>
            <Button fill="none" onClick={() => setListManageOpen(true)}>
              <SettingOutlined />
            </Button>
          </>
        }
      />

      <div className="mobile-task-search">
        <SearchBar placeholder="搜索任务" value={keyword} onChange={setKeyword} />
      </div>

      <div className="mobile-task-content">
        <PullToRefresh onRefresh={async () => void (await tasksQuery.refetch())}>
          {view === 'calendar' ? (
            <CalendarTaskView
              month={calendarMonth}
              selectedDay={selectedDay}
              tasks={tasks}
              lists={taskLists}
              users={users}
              loading={tasksQuery.isLoading}
              onMonthChange={changeCalendarMonth}
              onDayChange={setCalendarDay}
              onOpen={openTaskDetail}
              onEdit={openEdit}
              onToggleComplete={toggleComplete}
              togglePendingTaskId={togglePendingTaskId}
              onDelete={(task) => deleteTask.mutate(task.id)}
            />
          ) : view === 'matrix' ? (
            <MatrixTaskView
              tasks={tasks}
              lists={taskLists}
              users={users}
              loading={tasksQuery.isLoading}
              onOpen={openTaskDetail}
              onEdit={openEdit}
              onToggleComplete={toggleComplete}
              togglePendingTaskId={togglePendingTaskId}
              onDelete={(task) => deleteTask.mutate(task.id)}
            />
          ) : (
            <TaskListView
              tasks={tasks}
              lists={taskLists}
              users={users}
              loading={tasksQuery.isLoading}
              emptyText={view === 'anniversary' ? '暂无纪念日' : '今天没有任务'}
              showDayHeader={view === 'list'}
              onOpen={openTaskDetail}
              onEdit={openEdit}
              onToggleComplete={toggleComplete}
              togglePendingTaskId={togglePendingTaskId}
              onDelete={(task) => deleteTask.mutate(task.id)}
            />
          )}
        </PullToRefresh>
      </div>

      <Button className="mobile-fab mobile-task-fab" color="primary" onClick={openCreate}>
        <PlusOutlined />
      </Button>

      <TaskDock view={view} onChange={setTaskView} />

      <TaskDetailSheet
        open={Boolean(selectedTaskId)}
        loading={selectedTaskQuery.isLoading && !selectedTask}
        task={selectedTask}
        lists={taskLists}
        users={users}
        togglePendingTaskId={togglePendingTaskId}
        onClose={closeTaskDetail}
        onEdit={(task) => {
          openEdit(task);
          closeTaskDetail();
        }}
        onToggleComplete={toggleComplete}
        onDelete={(task) =>
          deleteTask.mutate(task.id, {
            onSuccess: closeTaskDetail,
          })
        }
      />

      <TaskEditorPopup
        open={editorOpen}
        task={editingTask}
        lists={activeLists}
        users={users}
        defaultListId={defaultListId}
        submitting={createTask.isPending || updateTask.isPending}
        onClose={() => {
          setEditorOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmit}
      />

      <TaskFilterPopup
        open={filterOpen}
        lists={taskLists}
        users={users}
        listId={listId}
        assigneeId={assigneeId}
        status={status}
        tagText={tagText}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => {
          setListId(next.listId);
          setAssigneeId(next.assigneeId);
          setStatus(next.status);
          setTagText(next.tagText);
          setFilterOpen(false);
        }}
      />

      <TaskListManagePopup
        open={listManageOpen}
        lists={taskLists}
        onClose={() => setListManageOpen(false)}
      />

    </div>
  );
}

function TaskDock({
  view,
  onChange,
}: {
  view: MobileTaskView;
  onChange: (view: MobileTaskView) => void;
}) {
  return (
    <nav className="mobile-task-dock">
      {dockViewOptions.map((item) => (
        <button
          key={item.value}
          type="button"
          className={`mobile-task-dock-item${view === item.value ? ' active' : ''}`}
          onClick={() => onChange(item.value)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function TaskListView({
  tasks,
  lists,
  users,
  loading,
  emptyText,
  showDayHeader,
  onOpen,
  onEdit,
  onToggleComplete,
  togglePendingTaskId,
  onDelete,
}: {
  tasks: Task[];
  lists: TaskList[];
  users: TaskAssignee[];
  loading?: boolean;
  emptyText: string;
  showDayHeader?: boolean;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  togglePendingTaskId?: number;
  onDelete: (task: Task) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      const key = getTaskDay(task);
      map.set(key, [...(map.get(key) ?? []), task]);
    });
    return Array.from(map.entries()).sort(([left], [right]) => left.localeCompare(right));
  }, [tasks]);

  if (loading) {
    return <Card className="mobile-task-list-card">加载中...</Card>;
  }

  if (tasks.length === 0) {
    return <MobileEmptyState title={emptyText} />;
  }

  return (
    <div className="mobile-task-groups">
      {grouped.map(([day, dayTasks]) => (
        <section key={day}>
          {showDayHeader ? (
            <div className="mobile-task-day-title">{dayjs(day).format('MM月DD日')}</div>
          ) : null}
          <div className="mobile-task-list-card">
            {dayTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                lists={lists}
                users={users}
                onOpen={onOpen}
                onEdit={onEdit}
                onToggleComplete={onToggleComplete}
                togglePending={togglePendingTaskId === task.id}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TaskRow({
  task,
  lists,
  users,
  onOpen,
  onEdit,
  onToggleComplete,
  togglePending,
  onDelete,
  compact,
}: {
  task: Task;
  lists: TaskList[];
  users: TaskAssignee[];
  onOpen: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  togglePending?: boolean;
  onDelete?: (task: Task) => void;
  compact?: boolean;
}) {
  const list = getTaskList(task, lists);
  const assignee = getTaskAssignee(task, users);
  const isCompleted = task.status === 'completed';
  const content = (
    <div className={`mobile-task-row${compact ? ' compact' : ''}`} onClick={() => onOpen(task)}>
      <Checkbox
        checked={isCompleted}
        disabled={togglePending}
        onClick={(event: MouseEvent) => event.stopPropagation()}
        onChange={() => onToggleComplete(task)}
      />
      <div className="mobile-task-row-main">
        <div className={`mobile-task-title${isCompleted ? ' completed' : ''}`}>{task.title}</div>
        <div className="mobile-task-meta-line">
          {task.dueAt ? <span className="primary">{formatDateTime(task.dueAt)}</span> : null}
          {task.remindAt ? <span>提醒</span> : null}
          {task.recurrenceType !== 'none' ? <span>重复</span> : null}
          {assignee ? <span>{getUserName(assignee)}</span> : null}
        </div>
      </div>
      {list ? <span className="mobile-task-list-name">{list.name}</span> : null}
    </div>
  );

  if (!onEdit || !onDelete || compact) {
    return content;
  }

  return (
    <SwipeAction
      rightActions={[
        { key: 'edit', text: '编辑', color: 'primary', onClick: () => onEdit(task) },
        { key: 'delete', text: '删除', color: 'danger', onClick: () => onDelete(task) },
      ]}
    >
      {content}
    </SwipeAction>
  );
}

function MobileEmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mobile-task-empty">
      <div className="mobile-task-empty-illustration">
        <CalendarOutlined />
      </div>
      <strong>{title}</strong>
      <span>{subtitle ?? '放松一下吧'}</span>
    </div>
  );
}

function CalendarTaskView({
  month,
  selectedDay,
  tasks,
  lists,
  users,
  loading,
  onMonthChange,
  onDayChange,
  onOpen,
  onEdit,
  onToggleComplete,
  togglePendingTaskId,
  onDelete,
}: {
  month: dayjs.Dayjs;
  selectedDay: string;
  tasks: Task[];
  lists: TaskList[];
  users: TaskAssignee[];
  loading?: boolean;
  onMonthChange: (month: dayjs.Dayjs) => void;
  onDayChange: (day: string) => void;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  togglePendingTaskId?: number;
  onDelete: (task: Task) => void;
}) {
  const days = useMemo(() => {
    const start = month.startOf('month').startOf('week');
    return Array.from({ length: 42 }, (_, index) => start.add(index, 'day'));
  }, [month]);
  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      const key = getTaskDay(task);
      map.set(key, [...(map.get(key) ?? []), task]);
    });
    return map;
  }, [tasks]);
  const selectedTasks = tasksByDay.get(selectedDay) ?? [];

  return (
    <div className="mobile-calendar-view">
      <div className="mobile-calendar-controls">
        <Button size="mini" fill="none" onClick={() => onMonthChange(month.subtract(1, 'month'))}>
          上月
        </Button>
        <strong>{month.format('YYYY年M月')}</strong>
        <Button size="mini" fill="none" onClick={() => onMonthChange(month.add(1, 'month'))}>
          下月
        </Button>
      </div>
      <div className="mobile-calendar-weekdays">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mobile-calendar-board">
        {days.map((day) => {
          const dateKey = day.format('YYYY-MM-DD');
          const count = tasksByDay.get(dateKey)?.length ?? 0;
          const active = selectedDay === dateKey;
          return (
            <button
              key={dateKey}
              className={`mobile-calendar-date${active ? ' active' : ''}${
                day.isSame(month, 'month') ? '' : ' muted'
              }`}
              type="button"
              onClick={() => onDayChange(dateKey)}
            >
              <span>{day.date()}</span>
              {count > 0 ? <i>{count}</i> : null}
            </button>
          );
        })}
      </div>
      <div className="mobile-calendar-selected-card">
        <div className="mobile-calendar-selected-title">{dayjs(selectedDay).format('M月D日')}</div>
        {loading ? (
          <div className="mobile-muted">加载中...</div>
        ) : selectedTasks.length === 0 ? (
          <MobileEmptyState title="你这一天没有任务" />
        ) : (
          <div className="mobile-task-list-card flush">
            {selectedTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                lists={lists}
                users={users}
                onOpen={onOpen}
                onEdit={onEdit}
                onToggleComplete={onToggleComplete}
                togglePending={togglePendingTaskId === task.id}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MatrixTaskView({
  tasks,
  lists,
  users,
  loading,
  onOpen,
  onEdit,
  onToggleComplete,
  togglePendingTaskId,
  onDelete,
}: {
  tasks: Task[];
  lists: TaskList[];
  users: TaskAssignee[];
  loading?: boolean;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  togglePendingTaskId?: number;
  onDelete: (task: Task) => void;
}) {
  const tasksByQuadrant = useMemo(() => {
    const map = new Map<MatrixQuadrant, Task[]>();
    quadrantOptions.forEach((option) => map.set(option.value, []));
    tasks.forEach((task) => {
      const key = getTaskQuadrant(task);
      map.set(key, [...(map.get(key) ?? []), task]);
    });
    return map;
  }, [tasks]);

  if (loading) {
    return <Card className="mobile-task-list-card">加载中...</Card>;
  }

  return (
    <div className="mobile-matrix-board">
      {quadrantOptions.map((option) => {
        const quadrantTasks = tasksByQuadrant.get(option.value) ?? [];
        return (
          <section key={option.value} className={`mobile-matrix-panel ${option.colorClass}`}>
            <div className="mobile-matrix-panel-header">
              <span>{option.roman}</span>
              <strong>{option.label}</strong>
            </div>
            {quadrantTasks.length === 0 ? (
              <div className="mobile-matrix-empty">没有任务</div>
            ) : (
              <div className="mobile-matrix-task-list">
                {quadrantTasks.slice(0, 8).map((task) => (
                  <TaskRow
                    key={task.id}
                    compact
                    task={task}
                    lists={lists}
                    users={users}
                    onOpen={onOpen}
                    onEdit={onEdit}
                    onToggleComplete={onToggleComplete}
                    togglePending={togglePendingTaskId === task.id}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function TaskDetailSheet({
  open,
  loading,
  task,
  lists,
  users,
  togglePendingTaskId,
  onClose,
  onEdit,
  onToggleComplete,
  onDelete,
}: {
  open: boolean;
  loading?: boolean;
  task: Task | null;
  lists: TaskList[];
  users: TaskAssignee[];
  togglePendingTaskId?: number;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const list = task ? getTaskList(task, lists) : null;
  const assignee = task ? getTaskAssignee(task, users) : null;

  const handleDelete = async () => {
    if (!task) return;
    const confirmed = await Dialog.confirm({
      title: '删除任务',
      content: '删除后不可恢复，确定要删除这个任务吗？',
      confirmText: '删除',
      cancelText: '取消',
    });
    if (confirmed) {
      onDelete(task);
    }
  };

  return (
    <Popup visible={open} onMaskClick={onClose} bodyStyle={{ borderRadius: '18px 18px 0 0' }}>
      <div className="mobile-popup-body mobile-task-detail-sheet">
        <div className="mobile-popup-header">
          <strong>任务详情</strong>
          <Button size="mini" fill="none" onClick={onClose}>
            关闭
          </Button>
        </div>
        {loading || !task ? (
          <div className="mobile-empty">{loading ? '加载中...' : '任务不存在'}</div>
        ) : (
          <>
            <div className="mobile-task-detail-title-row">
              <Checkbox
                checked={task.status === 'completed'}
                disabled={togglePendingTaskId === task.id}
                onChange={() => onToggleComplete(task)}
              />
              <h2 className={task.status === 'completed' ? 'completed' : ''}>{task.title}</h2>
            </div>
            <div className="mobile-task-detail-meta-card">
              <DetailLine label="清单" value={list?.name || '-'} />
              <DetailLine label="负责人" value={getUserName(assignee) || '-'} />
              <DetailLine label="截止" value={formatFullDateTime(task.dueAt)} />
              <DetailLine label="提醒" value={formatFullDateTime(task.remindAt)} />
              <DetailLine
                label="重复"
                value={formatTaskRecurrence(task.recurrenceType, task.recurrenceInterval)}
              />
              <DetailLine label="渠道" value={formatTaskReminderChannels(task.reminderChannels)} />
            </div>
            {task.description ? (
              <div className="mobile-task-detail-note">{task.description}</div>
            ) : null}
            <div className="mobile-chip-row">
              {task.important ? <Tag color="danger">重要</Tag> : null}
              {task.urgent ? <Tag color="warning">紧急</Tag> : null}
              {task.taskType === 'anniversary' ? <Tag color="primary">纪念日</Tag> : null}
              {task.tags?.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
            <div className="mobile-sheet-actions">
              <Button size="small" color="danger" fill="outline" onClick={() => void handleDelete()}>
                <DeleteOutlined /> 删除
              </Button>
              <div>
                <Button size="small" color="primary" fill="outline" onClick={() => onEdit(task)}>
                  <EditOutlined /> 编辑
                </Button>
                <Button size="small" color="success" onClick={() => onToggleComplete(task)}>
                  {task.status === 'completed' ? '取消完成' : '完成'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Popup>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mobile-task-detail-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function TaskEditorPopup({
  open,
  task,
  lists,
  users,
  defaultListId,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  task: Task | null;
  lists: TaskList[];
  users: TaskAssignee[];
  defaultListId?: number;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskDto | UpdateTaskDto) => void;
}) {
  const [draft, setDraft] = useState<TaskDraft>(() => buildEmptyDraft(defaultListId));
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(task ? draftFromTask(task) : buildEmptyDraft(defaultListId));
  }, [defaultListId, open, task]);

  useEffect(() => {
    if (open) return;
    setScheduleOpen(false);
    setListOpen(false);
    setAssigneeOpen(false);
    setTagsOpen(false);
    setMoreOpen(false);
  }, [open]);

  const updateDraft = (patch: Partial<TaskDraft>) => {
    setDraft((previous) => ({ ...previous, ...patch }));
  };

  const handleSave = () => {
    try {
      onSubmit(taskDraftToPayload(draft, Boolean(task)));
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: error instanceof Error ? error.message : '请检查任务内容',
        position: 'center',
      });
    }
  };

  const selectedList = lists.find((list) => list.id === draft.listId);
  const selectedUser = users.find((user) => user.id === draft.assigneeId);

  return (
    <Popup visible={open} onMaskClick={onClose} bodyStyle={{ borderRadius: '18px 18px 0 0' }}>
      <div className="mobile-popup-body mobile-quick-editor">
        <div className="mobile-popup-header">
          <strong>{task ? '编辑任务' : '新建任务'}</strong>
          <Button size="mini" color="primary" loading={submitting} onClick={handleSave}>
            保存
          </Button>
        </div>
        <Input
          className="mobile-editor-title-input"
          value={draft.title}
          placeholder="准备做什么？"
          onChange={(title: string) => updateDraft({ title })}
        />
        <TextArea
          className="mobile-editor-description"
          value={draft.description}
          rows={3}
          placeholder="描述"
          onChange={(description: string) => updateDraft({ description })}
        />

        <div className="mobile-editor-summary">
          {draft.dueAt ? <Tag color="primary">截止 {formatDateTime(draft.dueAt)}</Tag> : null}
          {draft.remindAt ? <Tag color="warning">提醒 {formatDateTime(draft.remindAt)}</Tag> : null}
          {draft.recurrenceType !== 'none' ? (
            <Tag color="primary">
              {formatTaskRecurrence(
                draft.recurrenceType,
                draft.recurrenceInterval ? Number(draft.recurrenceInterval) : null
              )}
            </Tag>
          ) : null}
          {selectedList ? <Tag>{selectedList.name}</Tag> : null}
          {selectedUser ? <Tag>{getUserName(selectedUser)}</Tag> : null}
        </div>

        <div className="mobile-editor-toolbar">
          <button type="button" onClick={() => setScheduleOpen(true)}>
            <CalendarOutlined />
            <span>日期</span>
          </button>
          <button
            type="button"
            className={draft.important ? 'active danger' : ''}
            onClick={() => updateDraft({ important: !draft.important })}
          >
            <FlagOutlined />
            <span>重要</span>
          </button>
          <button
            type="button"
            className={draft.urgent ? 'active warning' : ''}
            onClick={() => updateDraft({ urgent: !draft.urgent })}
          >
            <ExclamationCircleOutlined />
            <span>紧急</span>
          </button>
          <button type="button" onClick={() => setTagsOpen(true)}>
            <TagsOutlined />
            <span>标签</span>
          </button>
          <button type="button" onClick={() => setListOpen(true)}>
            <FolderOpenOutlined />
            <span>清单</span>
          </button>
          <button type="button" onClick={() => setAssigneeOpen(true)}>
            <UserOutlined />
            <span>负责人</span>
          </button>
          <button type="button" onClick={() => setMoreOpen(true)}>
            <EllipsisOutlined />
            <span>更多</span>
          </button>
        </div>
      </div>

      <ScheduleSheet
        open={scheduleOpen}
        draft={draft}
        onClose={() => setScheduleOpen(false)}
        onChange={updateDraft}
      />
      <FieldSheet title="选择清单" open={listOpen} onClose={() => setListOpen(false)}>
        <Selector
          options={lists.map((list) => ({ label: list.name, value: list.id }))}
          value={draft.listId ? [draft.listId] : []}
          onChange={(items: Array<string | number>) =>
            updateDraft({ listId: Number(items[0]) || undefined })
          }
        />
      </FieldSheet>
      <FieldSheet title="负责人" open={assigneeOpen} onClose={() => setAssigneeOpen(false)}>
        <Selector
          options={[
            { label: '不指定', value: 0 },
            ...users.map((user) => ({ label: getUserName(user), value: user.id })),
          ]}
          value={[draft.assigneeId ?? 0]}
          onChange={(items: Array<string | number>) =>
            updateDraft({ assigneeId: Number(items[0]) || undefined })
          }
        />
      </FieldSheet>
      <FieldSheet title="标签" open={tagsOpen} onClose={() => setTagsOpen(false)}>
        <Input value={draft.tags} placeholder="用逗号分隔" onChange={(tags) => updateDraft({ tags })} />
      </FieldSheet>
      <FieldSheet title="更多" open={moreOpen} onClose={() => setMoreOpen(false)}>
        <div className="mobile-field mobile-field-card">
          <label>类型</label>
          <Selector
            options={taskTypeOptions}
            value={[draft.taskType]}
            onChange={(items: Array<string | number>) =>
              updateDraft({ taskType: (items[0] as TaskType) || 'task' })
            }
          />
        </div>
        <div className="mobile-field mobile-field-card">
          <label>提醒渠道</label>
          <Selector
            multiple
            options={reminderChannelOptions}
            value={draft.reminderChannels}
            onChange={(items: Array<string | number>) =>
              updateDraft({
                reminderChannels: ensureInternalChannel(items as TaskReminderChannel[]),
              })
            }
          />
        </div>
      </FieldSheet>
    </Popup>
  );
}

function ScheduleSheet({
  open,
  draft,
  onClose,
  onChange,
}: {
  open: boolean;
  draft: TaskDraft;
  onClose: () => void;
  onChange: (patch: Partial<TaskDraft>) => void;
}) {
  const [duePickerOpen, setDuePickerOpen] = useState(false);
  const [remindPickerOpen, setRemindPickerOpen] = useState(false);

  const setDuePreset = (preset: 'today' | 'tomorrow' | 'next-week') => {
    const base =
      preset === 'today'
        ? dayjs()
        : preset === 'tomorrow'
          ? dayjs().add(1, 'day')
          : dayjs().add(1, 'week');
    onChange({ dueAt: base.hour(18).minute(0).second(0).millisecond(0).toDate() });
  };

  const setReminderOffset = (option: (typeof reminderOffsetOptions)[number]) => {
    if (!draft.dueAt) {
      Toast.show({ icon: 'fail', content: '请先设置截止时间', position: 'center' });
      return;
    }
    onChange({ remindAt: dayjs(draft.dueAt).subtract(option.amount, option.unit).toDate() });
  };

  return (
    <Popup visible={open} onMaskClick={onClose} bodyStyle={{ borderRadius: '18px 18px 0 0' }}>
      <div className="mobile-popup-body mobile-schedule-sheet">
        <div className="mobile-popup-header">
          <strong>日期与规则</strong>
          <Button size="mini" fill="none" onClick={onClose}>
            完成
          </Button>
        </div>
        <div className="mobile-schedule-card">
          <label>截止</label>
          <div className="mobile-editor-chip-grid">
            <Button size="small" fill="outline" onClick={() => setDuePreset('today')}>
              今天
            </Button>
            <Button size="small" fill="outline" onClick={() => setDuePreset('tomorrow')}>
              明天
            </Button>
            <Button size="small" fill="outline" onClick={() => setDuePreset('next-week')}>
              下周
            </Button>
            <Button size="small" fill="outline" onClick={() => setDuePickerOpen(true)}>
              自定义
            </Button>
          </div>
          <div className="mobile-schedule-value">
            {draft.dueAt ? formatFullDateTime(draft.dueAt) : '未设置'}
            {draft.dueAt ? (
              <Button size="mini" fill="none" onClick={() => onChange({ dueAt: undefined })}>
                清除
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mobile-schedule-card">
          <label>提醒</label>
          <div className="mobile-editor-chip-grid">
            {reminderOffsetOptions.map((option) => (
              <Button
                key={option.label}
                size="small"
                fill="outline"
                onClick={() => setReminderOffset(option)}
              >
                {option.label}
              </Button>
            ))}
            <Button size="small" fill="outline" onClick={() => setRemindPickerOpen(true)}>
              自定义
            </Button>
          </div>
          <div className="mobile-schedule-value">
            {draft.remindAt ? formatFullDateTime(draft.remindAt) : '未提醒'}
            {draft.remindAt ? (
              <Button size="mini" fill="none" onClick={() => onChange({ remindAt: undefined })}>
                清除
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mobile-schedule-card">
          <label>重复</label>
          <Selector
            options={recurrenceOptions}
            value={[draft.recurrenceType]}
            onChange={(items: Array<string | number>) =>
              onChange({ recurrenceType: (items[0] as TaskRecurrenceType) || 'none' })
            }
          />
          {draft.recurrenceType !== 'none' && draft.recurrenceType !== 'weekdays' ? (
            <Input
              type="number"
              value={draft.recurrenceInterval}
              placeholder="重复间隔，留空为 1"
              onChange={(recurrenceInterval: string) => onChange({ recurrenceInterval })}
            />
          ) : null}
        </div>
      </div>
      <DatePicker
        visible={duePickerOpen}
        value={draft.dueAt ?? new Date()}
        precision="minute"
        onClose={() => setDuePickerOpen(false)}
        onConfirm={(dueAt: Date) => onChange({ dueAt })}
      />
      <DatePicker
        visible={remindPickerOpen}
        value={draft.remindAt ?? new Date()}
        precision="minute"
        onClose={() => setRemindPickerOpen(false)}
        onConfirm={(remindAt: Date) => onChange({ remindAt })}
      />
    </Popup>
  );
}

function FieldSheet({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Popup visible={open} onMaskClick={onClose} bodyStyle={{ borderRadius: '18px 18px 0 0' }}>
      <div className="mobile-popup-body mobile-field-sheet">
        <div className="mobile-popup-header">
          <strong>{title}</strong>
          <Button size="mini" fill="none" onClick={onClose}>
            完成
          </Button>
        </div>
        {children}
      </div>
    </Popup>
  );
}

function TaskFilterPopup({
  open,
  lists,
  users,
  listId,
  assigneeId,
  status,
  tagText,
  onClose,
  onApply,
}: {
  open: boolean;
  lists: TaskList[];
  users: TaskAssignee[];
  listId?: number;
  assigneeId?: number;
  status?: TaskStatus;
  tagText: string;
  onClose: () => void;
  onApply: (values: {
    listId?: number;
    assigneeId?: number;
    status?: TaskStatus;
    tagText: string;
  }) => void;
}) {
  const [draftListId, setDraftListId] = useState<number | undefined>(listId);
  const [draftAssigneeId, setDraftAssigneeId] = useState<number | undefined>(assigneeId);
  const [draftStatus, setDraftStatus] = useState<TaskStatus | undefined>(status);
  const [draftTags, setDraftTags] = useState(tagText);

  useEffect(() => {
    if (!open) return;
    setDraftListId(listId);
    setDraftAssigneeId(assigneeId);
    setDraftStatus(status);
    setDraftTags(tagText);
  }, [assigneeId, listId, open, status, tagText]);

  const resetFilters = () => {
    setDraftListId(undefined);
    setDraftAssigneeId(undefined);
    setDraftStatus(undefined);
    setDraftTags('');
  };

  return (
    <Popup visible={open} onMaskClick={onClose} bodyStyle={{ borderRadius: '18px 18px 0 0' }}>
      <div className="mobile-popup-body mobile-filter-popup">
        <div className="mobile-popup-header">
          <strong>筛选任务</strong>
          <Button size="mini" fill="none" onClick={onClose}>
            取消
          </Button>
        </div>
        <div className="mobile-field mobile-field-card">
          <label>清单</label>
          <Selector
            options={[
              { label: '全部', value: 0 },
              ...lists.map((list) => ({ label: list.name, value: list.id })),
            ]}
            value={[draftListId ?? 0]}
            onChange={(items: Array<string | number>) =>
              setDraftListId(Number(items[0]) || undefined)
            }
          />
        </div>
        <div className="mobile-field mobile-field-card">
          <label>负责人</label>
          <Selector
            options={[
              { label: '全部', value: 0 },
              ...users.map((user) => ({ label: getUserName(user), value: user.id })),
            ]}
            value={[draftAssigneeId ?? 0]}
            onChange={(items: Array<string | number>) =>
              setDraftAssigneeId(Number(items[0]) || undefined)
            }
          />
        </div>
        <div className="mobile-field mobile-field-card">
          <label>状态</label>
          <Selector
            options={statusOptions}
            value={[draftStatus ?? 'all']}
            onChange={(items: Array<string | number>) =>
              setDraftStatus(items[0] === 'all' ? undefined : (items[0] as TaskStatus))
            }
          />
        </div>
        <div className="mobile-field mobile-field-card">
          <label>标签</label>
          <Input value={draftTags} placeholder="用逗号分隔" onChange={setDraftTags} />
        </div>
        <div className="mobile-popup-actions">
          <Button size="small" fill="outline" onClick={resetFilters}>
            重置
          </Button>
          <Button
            size="small"
            color="primary"
            onClick={() =>
              onApply({
                listId: draftListId,
                assigneeId: draftAssigneeId,
                status: draftStatus,
                tagText: draftTags,
              })
            }
          >
            应用
          </Button>
        </div>
      </div>
    </Popup>
  );
}

function TaskListManagePopup({
  open,
  lists,
  onClose,
}: {
  open: boolean;
  lists: TaskList[];
  onClose: () => void;
}) {
  const createList = useCreateTaskList();
  const updateList = useUpdateTaskList();
  const deleteList = useDeleteTaskList();
  const [editing, setEditing] = useState<TaskList | null>(null);
  const [name, setName] = useState('');
  const [scope, setScope] = useState<'personal' | 'family'>('family');
  const [isArchived, setIsArchived] = useState(false);

  const reset = () => {
    setEditing(null);
    setName('');
    setScope('family');
    setIsArchived(false);
  };

  const editList = (list: TaskList) => {
    setEditing(list);
    setName(list.name);
    setScope(list.scope);
    setIsArchived(list.isArchived);
  };

  const saveList = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Toast.show({ icon: 'fail', content: '请输入清单名称', position: 'center' });
      return;
    }

    if (editing) {
      const payload: UpdateTaskListDto = { name: trimmedName, scope, isArchived };
      updateList.mutate({ id: editing.id, data: payload }, { onSuccess: reset });
      return;
    }

    const payload: CreateTaskListDto = { name: trimmedName, scope, isArchived: false };
    createList.mutate(payload, { onSuccess: reset });
  };

  return (
    <Popup visible={open} onMaskClick={onClose} bodyStyle={{ borderRadius: '18px 18px 0 0' }}>
      <div className="mobile-popup-body mobile-list-popup">
        <div className="mobile-popup-header">
          <strong>清单管理</strong>
          <Button size="mini" fill="outline" onClick={reset}>
            新建
          </Button>
        </div>
        <div className="mobile-form-panel mb-3">
          <div className="mobile-field">
            <label>清单名称</label>
            <Input value={name} placeholder="例如：家庭待办" onChange={setName} />
          </div>
          <div className="mobile-field">
            <label>范围</label>
            <Selector
              options={[
                { label: '家庭', value: 'family' },
                { label: '个人', value: 'personal' },
              ]}
              value={[scope]}
              onChange={(items: Array<string | number>) =>
                setScope((items[0] as 'personal' | 'family') || 'family')
              }
            />
          </div>
          {editing ? (
            <List>
              <List.Item extra={<Switch checked={isArchived} onChange={setIsArchived} />}>
                归档
              </List.Item>
            </List>
          ) : null}
          <div className="mobile-form-actions">
            <Button
              size="small"
              color="primary"
              loading={createList.isPending || updateList.isPending}
              onClick={saveList}
            >
              {editing ? '保存' : '创建'}
            </Button>
          </div>
        </div>
        <List className="mobile-form-list">
          {lists.map((list) => (
            <List.Item
              key={list.id}
              description={`${list.scope === 'family' ? '家庭' : '个人'}${list.isArchived ? ' · 已归档' : ''}`}
              extra={
                <div className="flex gap-2">
                  <Button size="mini" onClick={() => editList(list)}>
                    编辑
                  </Button>
                  <Button
                    size="mini"
                    color="danger"
                    fill="outline"
                    loading={deleteList.isPending && deleteList.variables === list.id}
                    onClick={() => deleteList.mutate(list.id)}
                  >
                    删除
                  </Button>
                </div>
              }
            >
              {list.name}
            </List.Item>
          ))}
        </List>
      </div>
    </Popup>
  );
}
