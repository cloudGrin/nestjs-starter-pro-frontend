import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/task.service';
import type {
  CreateTaskDto,
  CreateTaskListDto,
  QueryTasksParams,
  UpdateTaskDto,
  UpdateTaskListDto,
} from '../types/task.types';

export const taskQueryKeys = {
  all: ['tasks'] as const,
  lists: () => ['task-lists'] as const,
  assignees: () => ['tasks', 'assignees'] as const,
  list: (params: QueryTasksParams) => ['tasks', params] as const,
  detail: (id: number) => ['tasks', 'detail', id] as const,
};

export function useTaskLists() {
  return useQuery({
    queryKey: taskQueryKeys.lists(),
    queryFn: () => taskService.getTaskLists(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTaskList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskListDto) => taskService.createTaskList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.lists() });
    },
  });
}

export function useUpdateTaskList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskListDto }) =>
      taskService.updateTaskList(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    },
  });
}

export function useDeleteTaskList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => taskService.deleteTaskList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    },
  });
}

export function useTasks(params: QueryTasksParams) {
  return useQuery({
    queryKey: taskQueryKeys.list(params),
    queryFn: () => taskService.getTasks(params),
    staleTime: 60 * 1000,
  });
}

export function useTask(id: number | null, enabled = true) {
  return useQuery({
    queryKey: id === null ? ['tasks', 'detail', null] : taskQueryKeys.detail(id),
    queryFn: () => taskService.getTask(id as number),
    enabled: enabled && id !== null,
  });
}

export function useTaskAssignees() {
  return useQuery({
    queryKey: taskQueryKeys.assignees(),
    queryFn: () => taskService.getTaskAssignees(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskDto }) =>
      taskService.updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(variables.id) });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => taskService.completeTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(id) });
    },
  });
}

export function useReopenTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => taskService.reopenTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(id) });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    },
  });
}
