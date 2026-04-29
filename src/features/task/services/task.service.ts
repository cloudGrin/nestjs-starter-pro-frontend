import { request } from '@/shared/utils/request';
import type {
  CreateTaskDto,
  CreateTaskListDto,
  PaginatedResult,
  QueryTasksParams,
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
    request.get<PaginatedResult<Task>>('/tasks', {
      params: toRequestParams(params),
    }),

  getTask: (id: number) => request.get<Task>(`/tasks/${id}`),

  getTaskAssignees: () => request.get<TaskAssignee[]>('/tasks/assignees'),

  createTask: (data: CreateTaskDto) =>
    request.post<Task>('/tasks', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '创建任务成功',
        },
      },
    }),

  updateTask: (id: number, data: UpdateTaskDto) =>
    request.put<Task>(`/tasks/${id}`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '更新任务成功',
        },
      },
    }),

  completeTask: (id: number) =>
    request.patch<Task>(`/tasks/${id}/complete`, undefined, {
      requestOptions: {
        messageConfig: {
          successMessage: '任务状态已更新',
        },
      },
    }),

  reopenTask: (id: number) =>
    request.patch<Task>(`/tasks/${id}/reopen`, undefined, {
      requestOptions: {
        messageConfig: {
          successMessage: '任务已重开',
        },
      },
    }),

  deleteTask: (id: number) =>
    request.delete<void>(`/tasks/${id}`, {
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
};
