/**
 * 任务调度服务
 */

import { request } from '@/shared/utils/request';
import type {
  TaskDefinition,
  CreateTaskDto,
  UpdateTaskDto,
  QueryTaskDto,
  TaskListResponse,
  UpdateTaskStatusDto,
  TriggerTaskDto,
  TaskExecutionLog,
} from '../types/task.types';

const BASE_URL = '/tasks';

/**
 * 创建任务
 */
export const createTask = async (data: CreateTaskDto): Promise<TaskDefinition> => {
  return await request.post<TaskDefinition>(BASE_URL, data, {
    requestOptions: {
      messageConfig: {
        successMessage: '创建任务成功',
      },
    },
  });
};

/**
 * 获取任务列表
 */
export const getTasks = async (params: QueryTaskDto): Promise<TaskListResponse> => {
  return await request.get<TaskListResponse>(BASE_URL, { params });
};

/**
 * 获取任务详情
 */
export const getTaskById = async (id: number): Promise<TaskDefinition> => {
  return await request.get<TaskDefinition>(`${BASE_URL}/${id}`);
};

/**
 * 更新任务
 */
export const updateTask = async (id: number, data: UpdateTaskDto): Promise<TaskDefinition> => {
  return await request.put<TaskDefinition>(`${BASE_URL}/${id}`, data, {
    requestOptions: {
      messageConfig: {
        successMessage: '更新任务成功',
      },
    },
  });
};

/**
 * 删除任务
 */
export const deleteTask = async (id: number): Promise<void> => {
  await request.delete(`${BASE_URL}/${id}`, {
    requestOptions: {
      confirmConfig: {
        message: '确定要删除该任务吗？删除后将无法恢复。',
        title: '删除任务',
      },
      messageConfig: {
        successMessage: '删除任务成功',
      },
    },
  });
};

/**
 * 启用/禁用任务
 */
export const updateTaskStatus = async (
  id: number,
  data: UpdateTaskStatusDto
): Promise<TaskDefinition> => {
  return await request.patch<TaskDefinition>(`${BASE_URL}/${id}/status`, data, {
    requestOptions: {
      messageConfig: {
        successMessage: data.status === 'enabled' ? '任务已启用' : '任务已禁用',
      },
    },
  });
};

/**
 * 手动触发任务
 */
export const triggerTask = async (id: number, data?: TriggerTaskDto): Promise<void> => {
  await request.post(`${BASE_URL}/${id}/trigger`, data, {
    requestOptions: {
      messageConfig: {
        successMessage: '任务已触发执行',
      },
    },
  });
};

/**
 * 获取任务执行日志
 */
export const getTaskLogs = async (taskId: number): Promise<TaskExecutionLog[]> => {
  return await request.get<TaskExecutionLog[]>(`${BASE_URL}/${taskId}/logs`);
};
