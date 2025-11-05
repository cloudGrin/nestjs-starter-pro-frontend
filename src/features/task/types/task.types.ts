/**
 * 任务调度模块类型定义
 */

/**
 * 任务状态（与后端数据库enum一致）
 */
export type TaskStatus = 'enabled' | 'disabled';

/**
 * 任务执行状态
 */
export type TaskExecutionStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT';

/**
 * 任务定义实体
 */
export interface TaskDefinition {
  id: number;
  name: string;
  code: string;
  cron: string;
  handler: string;
  description?: string;
  status: TaskStatus;
  timeout: number;
  retryCount: number;
  retryInterval: number;
  lastExecutedAt?: string;
  nextExecutionTime?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 任务执行日志
 */
export interface TaskExecutionLog {
  id: number;
  taskId: number;
  taskName?: string;
  status: TaskExecutionStatus;
  startTime: string;
  endTime?: string;
  duration?: number;
  output?: string;
  error?: string;
  retryCount?: number;
  createdAt: string;
}

/**
 * 创建任务DTO
 */
export interface CreateTaskDto {
  name: string;
  code: string;
  cron: string;
  handler: string;
  description?: string;
  status?: TaskStatus;
  timeout?: number;
  retryCount?: number;
  retryInterval?: number;
}

/**
 * 更新任务DTO
 */
export interface UpdateTaskDto {
  name?: string;
  cron?: string;
  handler?: string;
  description?: string;
  timeout?: number;
  retryCount?: number;
  retryInterval?: number;
}

/**
 * 查询任务DTO
 */
export interface QueryTaskDto {
  page?: number;
  limit?: number; // 后端期望limit，不是pageSize
  status?: TaskStatus;
  name?: string;
  code?: string;
}

/**
 * 任务列表响应
 */
export interface TaskListResponse {
  items: TaskDefinition[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 更新任务状态DTO
 */
export interface UpdateTaskStatusDto {
  status: TaskStatus;
}

/**
 * 手动触发任务DTO
 */
export interface TriggerTaskDto {
  params?: Record<string, any>;
}

/**
 * Cron表达式常用示例
 */
export const CRON_EXAMPLES = [
  { label: '每分钟', value: '0 * * * * *' },
  { label: '每5分钟', value: '0 */5 * * * *' },
  { label: '每30分钟', value: '0 */30 * * * *' },
  { label: '每小时', value: '0 0 * * * *' },
  { label: '每天凌晨2点', value: '0 0 2 * * *' },
  { label: '每天中午12点', value: '0 0 12 * * *' },
  { label: '每周一上午9点', value: '0 0 9 * * 1' },
  { label: '每月1号凌晨', value: '0 0 0 1 * *' },
  { label: '工作日每小时(9-18点)', value: '0 0 9-18 * * 1-5' },
] as const;

/**
 * 任务状态映射
 */
export const TASK_STATUS_MAP: Record<TaskStatus, { text: string; color: string }> = {
  enabled: { text: '启用', color: 'success' },
  disabled: { text: '禁用', color: 'default' },
};

/**
 * 任务执行状态映射
 */
export const TASK_EXECUTION_STATUS_MAP: Record<
  TaskExecutionStatus,
  { text: string; color: string }
> = {
  PENDING: { text: '待执行', color: 'default' },
  RUNNING: { text: '执行中', color: 'processing' },
  SUCCESS: { text: '成功', color: 'success' },
  FAILED: { text: '失败', color: 'error' },
  TIMEOUT: { text: '超时', color: 'warning' },
};
