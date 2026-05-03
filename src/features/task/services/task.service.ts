import { appConfig } from '@/shared/config/app.config';
import { request } from '@/shared/utils/request';
import type {
  CreateTaskDto,
  CreateTaskListDto,
  PaginatedResult,
  QueryTasksParams,
  SnoozeTaskReminderDto,
  Task,
  TaskAssignee,
  TaskList,
  UpdateTaskDto,
  UpdateTaskListDto,
} from '../types/task.types';

function toRequestParams(params: QueryTasksParams) {
  return {
    ...params,
    tags: params.tags?.length ? params.tags.join(',') : undefined,
  };
}

const BASE_URL = '/tasks';

export const taskService = {
  getTaskLists: () => request.get<TaskList[]>('/task-lists'),

  createTaskList: (data: CreateTaskListDto) =>
    request.post<TaskList>('/task-lists', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '创建任务清单成功',
        },
      },
    }),

  updateTaskList: (id: number, data: UpdateTaskListDto) =>
    request.put<TaskList>(`/task-lists/${id}`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '更新任务清单成功',
        },
      },
    }),

  deleteTaskList: (id: number) =>
    request.delete<void>(`/task-lists/${id}`, {
      requestOptions: {
        confirmConfig: {
          title: '删除任务清单',
          message: '删除前请确认清单内没有任务。确定要删除这个清单吗？',
        },
        messageConfig: {
          successMessage: '任务清单已删除',
        },
      },
    }),

  getTasks: (params: QueryTasksParams) =>
    request.get<PaginatedResult<Task>>(BASE_URL, {
      params: toRequestParams(params),
    }),

  getTask: (id: number) => request.get<Task>(`${BASE_URL}/${id}`),

  getTaskAssignees: () => request.get<TaskAssignee[]>(`${BASE_URL}/assignees`),

  createTask: (data: CreateTaskDto) =>
    request.post<Task>(BASE_URL, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '创建任务成功',
        },
      },
    }),

  updateTask: (id: number, data: UpdateTaskDto) =>
    request.put<Task>(`${BASE_URL}/${id}`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '更新任务成功',
        },
      },
    }),

  completeTask: (id: number) =>
    request.patch<Task>(`${BASE_URL}/${id}/complete`, undefined, {
      requestOptions: {
        messageConfig: {
          successMessage: '任务状态已更新',
        },
      },
    }),

  reopenTask: (id: number) =>
    request.patch<Task>(`${BASE_URL}/${id}/reopen`, undefined, {
      requestOptions: {
        messageConfig: {
          successMessage: '任务已重开',
        },
      },
    }),

  snoozeTaskReminder: (id: number, data: SnoozeTaskReminderDto) =>
    request.post<Task>(`${BASE_URL}/${id}/reminder/snooze`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '已稍后提醒',
        },
      },
    }),

  deleteTask: (id: number) =>
    request.delete<void>(`${BASE_URL}/${id}`, {
      requestOptions: {
        confirmConfig: {
          title: '删除任务',
          message: '删除后不可恢复，确定要删除这个任务吗？',
        },
        messageConfig: {
          successMessage: '任务已删除',
        },
      },
    }),

  getAttachmentDownloadUrl: (taskId: number, fileId: number) => {
    const base = appConfig.apiBaseUrl.endsWith('/')
      ? appConfig.apiBaseUrl.slice(0, -1)
      : appConfig.apiBaseUrl;
    return `${base}${BASE_URL}/${taskId}/attachments/${fileId}/download`;
  },
};
