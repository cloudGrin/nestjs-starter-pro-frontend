import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Empty,
  Input,
  List,
  Popup,
  PullToRefresh,
  SearchBar,
  Segmented,
  Selector,
  SwipeAction,
  Switch,
  Tag,
  TextArea,
  Toast,
} from 'antd-mobile';
import { FilterOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  useCompleteTask,
  useCreateTask,
  useCreateTaskList,
  useDeleteTask,
  useDeleteTaskList,
  useReopenTask,
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
  mobileTaskRecurrenceLabels,
  mobileTaskReminderChannelLabels,
} from '../utils/task';

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

const viewOptions: Array<{ label: string; value: MobileTaskView }> = [
  { label: '列表', value: 'list' },
  { label: '今日', value: 'today' },
  { label: '日历', value: 'calendar' },
  { label: '矩阵', value: 'matrix' },
  { label: '纪念日', value: 'anniversary' },
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

const statusOptions: Array<{ label: string; value: 'all' | TaskStatus }> = [
  { label: '全部', value: 'all' },
  { label: '待办', value: 'pending' },
  { label: '完成', value: 'completed' },
];

type MatrixQuadrant = 'important-urgent' | 'important' | 'urgent' | 'normal';

const quadrantOptions: Array<{
  label: string;
  value: MatrixQuadrant;
  hint: string;
}> = [
  { label: '重要且紧急', value: 'important-urgent', hint: '立即处理' },
  { label: '重要不紧急', value: 'important', hint: '计划推进' },
  { label: '紧急不重要', value: 'urgent', hint: '尽快安排' },
  { label: '不重要不紧急', value: 'normal', hint: '有空再看' },
];

const highVolumeViews = new Set<MobileTaskView>(['calendar', 'matrix', 'anniversary']);

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

function getTaskDay(task: Task) {
  return dayjs(task.dueAt || task.remindAt || task.createdAt).format('YYYY-MM-DD');
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
  calendarMonth: dayjs.Dayjs
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
    params.startDate = calendarMonth.startOf('month').toISOString();
    params.endDate = calendarMonth.endOf('month').toISOString();
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
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function taskDraftToPayload(draft: TaskDraft, isEditing: boolean): CreateTaskDto | UpdateTaskDto {
  if (!draft.title.trim()) {
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
    title: draft.title.trim(),
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

  const description = draft.description.trim();
  if (description) {
    payload.description = description;
  } else if (isEditing) {
    payload.description = null;
  }

  return payload;
}

export function MobileTaskPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<MobileTaskView>('list');
  const [keyword, setKeyword] = useState('');
  const [listId, setListId] = useState<number>();
  const [assigneeId, setAssigneeId] = useState<number>();
  const [status, setStatus] = useState<TaskStatus>();
  const [tagText, setTagText] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => dayjs().startOf('month'));
  const [selectedDay, setSelectedDay] = useState(() => dayjs().format('YYYY-MM-DD'));
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
    <div className="mobile-page">
      <div className="mobile-page-header">
        <div>
          <h1 className="mobile-title">任务</h1>
          <div className="mobile-subtitle">和 PC 任务中心共享同一套任务能力</div>
        </div>
        <Button fill="none" onClick={() => setListManageOpen(true)}>
          <SettingOutlined />
        </Button>
      </div>

      <div className="mobile-section">
        <SearchBar placeholder="搜索任务" value={keyword} onChange={setKeyword} />
        <Segmented
          block
          className="mobile-view-tabs"
          options={viewOptions.map((option) => ({
            label: option.label,
            value: option.value,
          }))}
          value={view}
          onChange={(value) => {
            if (value) {
              setView(value as MobileTaskView);
              setStatus(undefined);
            }
          }}
        />
        <div className="mobile-filter-row">
          <Button size="small" fill="outline" onClick={() => setFilterOpen(true)}>
            <FilterOutlined /> 筛选
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <PullToRefresh onRefresh={async () => void (await tasksQuery.refetch())}>
          {view === 'calendar' ? (
            <CalendarTaskView
              month={calendarMonth}
              selectedDay={selectedDay}
              tasks={tasks}
              lists={taskLists}
              users={users}
              loading={tasksQuery.isLoading}
              onMonthChange={setCalendarMonth}
              onDayChange={setSelectedDay}
              onOpen={(task) => navigate(`/tasks/${task.id}`)}
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
              onOpen={(task) => navigate(`/tasks/${task.id}`)}
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
              emptyText={view === 'anniversary' ? '暂无纪念日' : '暂无任务'}
              onOpen={(task) => navigate(`/tasks/${task.id}`)}
              onEdit={openEdit}
              onToggleComplete={toggleComplete}
              togglePendingTaskId={togglePendingTaskId}
              onDelete={(task) => deleteTask.mutate(task.id)}
            />
          )}
        </PullToRefresh>
      </div>

      <Button className="mobile-fab" color="primary" onClick={openCreate}>
        <PlusOutlined />
      </Button>

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

function TaskListView({
  tasks,
  lists,
  users,
  loading,
  emptyText,
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
    return <Card className="mobile-card">加载中...</Card>;
  }

  if (tasks.length === 0) {
    return <Empty description={emptyText} />;
  }

  return (
    <div className="mobile-section">
      {grouped.map(([day, dayTasks]) => (
        <div key={day}>
          <div className="mb-2 text-sm font-semibold mobile-muted">
            {dayjs(day).format('MM月DD日')}
          </div>
          <div className="mobile-section">
            {dayTasks.map((task) => (
              <TaskCard
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
        </div>
      ))}
    </div>
  );
}

function TaskCard({
  task,
  lists,
  users,
  onOpen,
  onEdit,
  onToggleComplete,
  togglePending,
  onDelete,
}: {
  task: Task;
  lists: TaskList[];
  users: TaskAssignee[];
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  togglePending?: boolean;
  onDelete: (task: Task) => void;
}) {
  const list = getTaskList(task, lists);
  const assignee = getTaskAssignee(task, users);
  const isCompleted = task.status === 'completed';

  return (
    <SwipeAction
      rightActions={[
        { key: 'edit', text: '编辑', color: 'primary', onClick: () => onEdit(task) },
        { key: 'delete', text: '删除', color: 'danger', onClick: () => onDelete(task) },
      ]}
    >
      <Card className="mobile-card" onClick={() => onOpen(task)}>
        <div className="mobile-task-item">
          <Checkbox
            checked={isCompleted}
            disabled={togglePending}
            onClick={(event: MouseEvent) => event.stopPropagation()}
            onChange={() => onToggleComplete(task)}
          />
          <div className="mobile-task-main">
            <p className={`mobile-task-title${isCompleted ? ' completed' : ''}`}>{task.title}</p>
            <div className="mobile-meta">
              {list ? <span>{list.name}</span> : null}
              {assignee ? <span>负责人：{getUserName(assignee)}</span> : null}
              {task.dueAt ? <span>截止：{formatDateTime(task.dueAt)}</span> : null}
              {task.remindAt ? <span>提醒：{formatDateTime(task.remindAt)}</span> : null}
              {task.recurrenceType !== 'none' ? (
                <span>{formatTaskRecurrence(task.recurrenceType, task.recurrenceInterval)}</span>
              ) : null}
            </div>
            <div className="mobile-chip-row mt-2">
              {task.important ? <Tag color="danger">重要</Tag> : null}
              {task.urgent ? <Tag color="warning">紧急</Tag> : null}
              {task.taskType === 'anniversary' ? <Tag color="primary">纪念日</Tag> : null}
              {task.tags?.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </SwipeAction>
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
    const start = month.startOf('month');
    const end = month.endOf('month');
    const list: string[] = [];
    for (let day = start; !day.isAfter(end, 'day'); day = day.add(1, 'day')) {
      list.push(day.format('YYYY-MM-DD'));
    }
    return list;
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
    <div className="mobile-section">
      <Card className="mobile-card">
        <div className="mb-3 flex items-center justify-between">
          <Button size="small" onClick={() => onMonthChange(month.subtract(1, 'month'))}>
            上月
          </Button>
          <strong>{month.format('YYYY年MM月')}</strong>
          <Button size="small" onClick={() => onMonthChange(month.add(1, 'month'))}>
            下月
          </Button>
        </div>
        <div className="mobile-calendar-grid">
          {days.map((day) => {
            const count = tasksByDay.get(day)?.length ?? 0;
            return (
              <button
                key={day}
                className={`mobile-calendar-day${selectedDay === day ? ' active' : ''}`}
                type="button"
                onClick={() => onDayChange(day)}
              >
                {dayjs(day).date()}
                {count > 0 ? <span className="mobile-calendar-count">{count} 项</span> : null}
              </button>
            );
          })}
        </div>
      </Card>
      <TaskListView
        tasks={selectedTasks}
        lists={lists}
        users={users}
        loading={loading}
        emptyText="当天暂无任务"
        onOpen={onOpen}
        onEdit={onEdit}
        onToggleComplete={onToggleComplete}
        togglePendingTaskId={togglePendingTaskId}
        onDelete={onDelete}
      />
    </div>
  );
}

function MatrixTaskView(props: {
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
  const [quadrant, setQuadrant] = useState<MatrixQuadrant>('important-urgent');
  const tasksByQuadrant = useMemo(() => {
    const map = new Map<MatrixQuadrant, Task[]>();
    quadrantOptions.forEach((option) => map.set(option.value, []));
    props.tasks.forEach((task) => {
      const key = getTaskQuadrant(task);
      map.set(key, [...(map.get(key) ?? []), task]);
    });
    return map;
  }, [props.tasks]);
  const filtered = tasksByQuadrant.get(quadrant) ?? [];

  return (
    <div className="mobile-section">
      <Card className="mobile-card">
        <div className="mobile-matrix-grid">
          {quadrantOptions.map((option) => {
            const quadrantTasks = tasksByQuadrant.get(option.value) ?? [];
            const active = quadrant === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={`mobile-matrix-cell${active ? ' active' : ''}`}
                onClick={() => setQuadrant(option.value)}
              >
                <span className="mobile-matrix-title">{option.label}</span>
                <span className="mobile-matrix-hint">{option.hint}</span>
                <strong>{quadrantTasks.length}</strong>
                <span className="mobile-matrix-preview">
                  {quadrantTasks[0]?.title ?? '暂无任务'}
                </span>
              </button>
            );
          })}
        </div>
      </Card>
      <TaskListView {...props} tasks={filtered} emptyText="该象限暂无任务" />
    </div>
  );
}

function getTaskQuadrant(task: Task): MatrixQuadrant {
  if (task.important && task.urgent) return 'important-urgent';
  if (task.important) return 'important';
  if (task.urgent) return 'urgent';
  return 'normal';
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

  useEffect(() => {
    if (!open) return;
    setDraft(task ? draftFromTask(task) : buildEmptyDraft(defaultListId));
  }, [defaultListId, open, task]);

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

  return (
    <Popup visible={open} onMaskClick={onClose} bodyStyle={{ borderRadius: '8px 8px 0 0' }}>
      <div className="mobile-popup-body mobile-editor-popup">
        <div className="mobile-popup-header">
          <strong>{task ? '编辑任务' : '新建任务'}</strong>
        </div>
        <div className="mobile-field mobile-field-card">
          <label>标题</label>
          <Input
            value={draft.title}
            placeholder="任务标题"
            onChange={(title: string) => updateDraft({ title })}
          />
        </div>
        <div className="mobile-field mobile-field-card">
          <label>描述</label>
          <TextArea
            value={draft.description}
            rows={3}
            placeholder="补充说明"
            onChange={(description: string) => updateDraft({ description })}
          />
        </div>
        <div className="mobile-field mobile-field-card">
          <label>清单</label>
          <Selector
            options={lists.map((list) => ({ label: list.name, value: list.id }))}
            value={draft.listId ? [draft.listId] : []}
            onChange={(items: Array<string | number>) =>
              updateDraft({ listId: Number(items[0]) || undefined })
            }
          />
        </div>
        <div className="mobile-field mobile-field-card">
          <label>负责人</label>
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
        </div>
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
        <MobileDateField
          label="截止时间"
          value={draft.dueAt}
          onChange={(dueAt) => updateDraft({ dueAt })}
        />
        <MobileDateField
          label="提醒时间"
          value={draft.remindAt}
          onChange={(remindAt) => updateDraft({ remindAt })}
        />
        <div className="mobile-field mobile-field-card">
          <label>重复规则</label>
          <Selector
            options={recurrenceOptions}
            value={[draft.recurrenceType]}
            onChange={(items: Array<string | number>) =>
              updateDraft({ recurrenceType: (items[0] as TaskRecurrenceType) || 'none' })
            }
          />
        </div>
        {draft.recurrenceType !== 'none' && draft.recurrenceType !== 'weekdays' ? (
          <div className="mobile-field mobile-field-card">
            <label>重复间隔</label>
            <Input
              type="number"
              value={draft.recurrenceInterval}
              placeholder="留空为 1"
              onChange={(recurrenceInterval: string) => updateDraft({ recurrenceInterval })}
            />
          </div>
        ) : null}
        <div className="mobile-field mobile-field-card">
          <label>标签</label>
          <Input
            value={draft.tags}
            placeholder="用逗号分隔"
            onChange={(tags: string) => updateDraft({ tags })}
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
        <List className="mobile-form-list">
          <List.Item
            extra={
              <Switch
                checked={draft.important}
                onChange={(important: boolean) => updateDraft({ important })}
              />
            }
          >
            重要
          </List.Item>
          <List.Item
            extra={
              <Switch
                checked={draft.urgent}
                onChange={(urgent: boolean) => updateDraft({ urgent })}
              />
            }
          >
            紧急
          </List.Item>
        </List>
        <div className="mobile-popup-actions">
          <Button size="small" fill="outline" onClick={onClose}>
            取消
          </Button>
          <Button size="small" color="primary" loading={submitting} onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
    </Popup>
  );
}

function MobileDateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: Date;
  onChange: (value?: Date) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mobile-field mobile-field-card">
      <label>{label}</label>
      <div className="mobile-date-row">
        <Button block fill="outline" onClick={() => setVisible(true)}>
          {value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '选择时间'}
        </Button>
        {value ? (
          <Button fill="none" onClick={() => onChange(undefined)}>
            清除
          </Button>
        ) : null}
      </div>
      <DatePicker
        visible={visible}
        value={value ?? new Date()}
        precision="minute"
        onClose={() => setVisible(false)}
        onConfirm={(nextValue: Date) => onChange(nextValue)}
      />
    </div>
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
    <Popup visible={open} onMaskClick={onClose} bodyStyle={{ borderRadius: '8px 8px 0 0' }}>
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
    <Popup visible={open} onMaskClick={onClose} bodyStyle={{ borderRadius: '8px 8px 0 0' }}>
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
