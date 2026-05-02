import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { automationService } from '../services/automation.service';
import type {
  QueryAutomationTaskLogsDto,
  UpdateAutomationTaskConfigDto,
} from '../types/automation.types';

export function useAutomationTasks() {
  return useQuery({
    queryKey: ['automation-tasks'],
    queryFn: () => automationService.getTasks(),
    staleTime: 30 * 1000,
  });
}

export function useUpdateAutomationTaskConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskKey, data }: { taskKey: string; data: UpdateAutomationTaskConfigDto }) =>
      automationService.updateConfig(taskKey, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['automation-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['automation-task-logs', variables.taskKey] });
    },
  });
}

export function useRunAutomationTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskKey: string) => automationService.runTask(taskKey),
    onSuccess: (_, taskKey) => {
      queryClient.invalidateQueries({ queryKey: ['automation-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['automation-task-logs', taskKey] });
    },
  });
}

export function useAutomationTaskLogs(
  taskKey: string | null,
  params: QueryAutomationTaskLogsDto,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['automation-task-logs', taskKey, params],
    queryFn: () => automationService.getLogs(taskKey as string, params),
    enabled: Boolean(taskKey) && (options?.enabled ?? true),
    staleTime: 10 * 1000,
  });
}
