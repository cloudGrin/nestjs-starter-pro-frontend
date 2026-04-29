export type TaskStatus = 'pending' | 'completed';

export type TaskType = 'task' | 'anniversary';

export type TaskRecurrenceType =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'weekdays'
  | 'custom';

export type TaskListScope = 'personal' | 'family';

export type TaskView = 'list' | 'today' | 'calendar' | 'matrix' | 'anniversary';

export type TaskReminderChannel = 'internal' | 'bark' | 'feishu';

export type TaskSortField = 'createdAt' | 'updatedAt' | 'dueAt' | 'remindAt' | 'completedAt' | 'title';

export type TaskSortOrder = 'ASC' | 'DESC';

export type TaskActionType = 'complete' | 'reopen' | 'delete';

export interface TaskActionPending {
  type: TaskActionType;
  taskId?: number;
}

export interface TaskList {
  id: number;
  name: string;
  scope: TaskListScope;
  color?: string | null;
  sort: number;
  isArchived: boolean;
  ownerId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskAssignee {
  id: number;
  username: string;
  nickname?: string | null;
  realName?: string | null;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  listId: number;
  list?: TaskList;
  creatorId?: number | null;
  assigneeId?: number | null;
  assignee?: TaskAssignee | null;
  status: TaskStatus;
  taskType: TaskType;
  dueAt?: string | null;
  remindAt?: string | null;
  remindedAt?: string | null;
  completedAt?: string | null;
  important: boolean;
  urgent: boolean;
  tags?: string[] | null;
  recurrenceType: TaskRecurrenceType;
  recurrenceInterval?: number | null;
  reminderChannels?: TaskReminderChannel[] | null;
  sendExternalReminder: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface QueryTasksParams {
  view?: TaskView;
  page?: number;
  limit?: number;
  taskId?: number;
  listId?: number;
  assigneeId?: number;
  status?: TaskStatus;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  tags?: string[];
  sort?: TaskSortField;
  order?: TaskSortOrder;
}

export interface CreateTaskDto {
  title: string;
  description?: string | null;
  listId: number;
  assigneeId?: number | null;
  taskType?: TaskType;
  dueAt?: string | null;
  remindAt?: string | null;
  important?: boolean;
  urgent?: boolean;
  tags?: string[];
  recurrenceType?: TaskRecurrenceType;
  recurrenceInterval?: number | null;
  reminderChannels?: TaskReminderChannel[];
  sendExternalReminder?: boolean;
}

export type UpdateTaskDto = Partial<CreateTaskDto>;

export interface CreateTaskListDto {
  name: string;
  scope?: TaskListScope;
  color?: string;
  sort?: number;
  isArchived?: boolean;
}

export interface UpdateTaskListDto extends Partial<Omit<CreateTaskListDto, 'color'>> {
  color?: string | null;
}
