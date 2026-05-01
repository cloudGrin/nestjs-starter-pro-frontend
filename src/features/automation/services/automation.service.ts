import { request } from '@/shared/utils/request';
import type {
  AutomationTask,
  AutomationTaskLog,
  AutomationTaskLogListResponse,
  QueryAutomationTaskLogsDto,
  UpdateAutomationTaskConfigDto,
} from '../types/automation.types';

export const automationService = {
  getTasks: () => request.get<AutomationTask[]>('/automation/tasks'),

  updateConfig: (taskKey: string, data: UpdateAutomationTaskConfigDto) =>
    request.put<AutomationTask['config']>(`/automation/tasks/${taskKey}/config`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '自动化任务配置已保存',
        },
      },
    }),

  runTask: (taskKey: string) =>
    request.post<AutomationTaskLog>(`/automation/tasks/${taskKey}/run`, undefined, {
      requestOptions: {
        messageConfig: {
          successMessage: false,
        },
      },
    }),

  getLogs: (taskKey: string, params: QueryAutomationTaskLogsDto) =>
    request.get<AutomationTaskLogListResponse>(`/automation/tasks/${taskKey}/logs`, { params }),
};
