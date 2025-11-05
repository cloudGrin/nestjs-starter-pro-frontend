/**
 * 任务调度 Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  QueryTaskDto,
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  TriggerTaskDto,
} from '../types/task.types';
import * as taskService from '../services/task.service';

const TASK_QUERY_KEY = 'tasks';

/**
 * 获取任务列表
 */
export const useTasks = (params: QueryTaskDto) => {
  return useQuery({
    queryKey: [TASK_QUERY_KEY, 'list', params],
    queryFn: () => taskService.getTasks(params),
  });
};

/**
 * 获取任务详情
 */
export const useTask = (id: number) => {
  return useQuery({
    queryKey: [TASK_QUERY_KEY, 'detail', id],
    queryFn: () => taskService.getTaskById(id),
    enabled: !!id,
  });
};

/**
 * 创建任务
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASK_QUERY_KEY, 'list'] });
    },
  });
};

/**
 * 更新任务
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskDto }) =>
      taskService.updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TASK_QUERY_KEY, 'list'] });
      queryClient.invalidateQueries({ queryKey: [TASK_QUERY_KEY, 'detail', variables.id] });
    },
  });
};

/**
 * 删除任务
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASK_QUERY_KEY, 'list'] });
    },
  });
};

/**
 * 更新任务状态
 */
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskStatusDto }) =>
      taskService.updateTaskStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TASK_QUERY_KEY, 'list'] });
      queryClient.invalidateQueries({ queryKey: [TASK_QUERY_KEY, 'detail', variables.id] });
    },
  });
};

/**
 * 手动触发任务
 */
export const useTriggerTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: TriggerTaskDto }) =>
      taskService.triggerTask(id, data),
    onSuccess: (_, variables) => {
      // 触发后刷新任务详情和日志
      queryClient.invalidateQueries({ queryKey: [TASK_QUERY_KEY, 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: [TASK_QUERY_KEY, 'logs', variables.id] });
    },
  });
};

/**
 * 获取任务执行日志
 */
export const useTaskLogs = (taskId: number) => {
  return useQuery({
    queryKey: [TASK_QUERY_KEY, 'logs', taskId],
    queryFn: () => taskService.getTaskLogs(taskId),
    enabled: !!taskId,
    refetchInterval: 5000, // 每5秒轮询一次
  });
};
