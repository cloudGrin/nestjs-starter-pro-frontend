import type {
  TaskRecurrenceType,
  TaskReminderChannel,
} from '@/features/task/types/task.types';

export const mobileTaskRecurrenceLabels: Record<TaskRecurrenceType, string> = {
  none: '不重复',
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
  yearly: '每年',
  weekdays: '工作日',
  custom: '自定义间隔',
};

export const mobileTaskReminderChannelLabels: Record<TaskReminderChannel, string> = {
  internal: '站内',
  bark: 'Bark',
  feishu: '飞书',
};

const recurrenceIntervalUnits: Partial<Record<TaskRecurrenceType, string>> = {
  daily: '天',
  weekly: '周',
  monthly: '月',
  yearly: '年',
  custom: '天',
};

export function formatTaskRecurrence(type: TaskRecurrenceType, interval?: number | null) {
  const label = mobileTaskRecurrenceLabels[type] ?? type;
  if (!interval || type === 'none' || type === 'weekdays') {
    return label;
  }
  return `每 ${interval} ${recurrenceIntervalUnits[type] ?? '次'}`;
}

export function formatTaskReminderChannels(channels?: TaskReminderChannel[] | null) {
  const normalized: TaskReminderChannel[] = channels?.length ? channels : ['internal'];
  return normalized.map((channel) => mobileTaskReminderChannelLabels[channel] ?? channel).join('、');
}
