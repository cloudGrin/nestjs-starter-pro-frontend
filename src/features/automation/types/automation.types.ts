export type AutomationTaskLastStatus = 'never' | 'running' | 'success' | 'failed' | 'skipped';
export type AutomationTaskLogStatus = 'success' | 'failed' | 'skipped';
export type AutomationTaskTriggerType = 'schedule' | 'manual' | 'system';

export interface AutomationTaskConfig {
  id: number;
  taskKey: string;
  enabled: boolean;
  cronExpression: string;
  params?: Record<string, unknown> | null;
  isRunning: boolean;
  lastStatus: AutomationTaskLastStatus;
  lastStartedAt?: string | null;
  lastFinishedAt?: string | null;
  lastDurationMs?: number | null;
  lastMessage?: string | null;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationTask {
  key: string;
  name: string;
  description?: string;
  defaultCron: string;
  config: AutomationTaskConfig | null;
}

export interface AutomationTaskLog {
  id: number;
  taskKey: string;
  triggerType: AutomationTaskTriggerType;
  status: AutomationTaskLogStatus;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  paramsSnapshot?: Record<string, unknown> | null;
  resultMessage?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAutomationTaskConfigDto {
  enabled?: boolean;
  cronExpression?: string;
  params?: Record<string, unknown>;
}

export interface QueryAutomationTaskLogsDto {
  page?: number;
  limit?: number;
  status?: AutomationTaskLogStatus;
  triggerType?: AutomationTaskTriggerType;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface AutomationTaskLogListResponse {
  items: AutomationTaskLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
