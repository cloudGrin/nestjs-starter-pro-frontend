import dayjs, { type Dayjs } from 'dayjs';
import type { Task } from '../types/task.types';

export interface TaskCalendarOccurrence {
  key: string;
  task: Task;
  groupDate: string;
  occurrenceDueAt?: string | null;
  occurrenceRemindAt?: string | null;
}

const MAX_OCCURRENCES_PER_TASK = 370;
const MAX_RECURRENCE_SEARCH_STEPS = 4000;

function isDateInRange(date?: string | null, startDate?: string, endDate?: string) {
  if (!date) {
    return false;
  }

  const value = dayjs(date);
  if (startDate && value.isBefore(dayjs(startDate))) {
    return false;
  }

  if (endDate && value.isAfter(dayjs(endDate))) {
    return false;
  }

  return true;
}

export function isRecurringTask(task: Task) {
  return task.recurrenceType !== 'none';
}

function getNextOccurrenceDate(date: Dayjs, task: Task) {
  const interval = Math.max(task.recurrenceInterval ?? 1, 1);

  switch (task.recurrenceType) {
    case 'daily':
      return date.add(interval, 'day');
    case 'weekly':
      return date.add(interval, 'week');
    case 'monthly':
      return date.add(interval, 'month');
    case 'yearly':
      return date.add(interval, 'year');
    case 'weekdays': {
      let next = date.add(1, 'day');
      while ([0, 6].includes(next.day())) {
        next = next.add(1, 'day');
      }
      return next;
    }
    case 'custom':
      return date.add(interval, 'day');
    case 'none':
    default:
      return date;
  }
}

function getRecurringOccurrenceDates(
  anchorDate: string | null | undefined,
  task: Task,
  startDate?: string,
  endDate?: string
) {
  if (!isRecurringTask(task) || !anchorDate || !startDate || !endDate) {
    return [];
  }

  const start = dayjs(startDate);
  const end = dayjs(endDate);
  let current = dayjs(anchorDate);
  let steps = 0;

  if (!start.isValid() || !end.isValid() || !current.isValid() || current.isAfter(end)) {
    return [];
  }

  while (current.isBefore(start) && steps < MAX_RECURRENCE_SEARCH_STEPS) {
    const next = getNextOccurrenceDate(current, task);
    if (!next.isValid() || !next.isAfter(current)) {
      return [];
    }
    current = next;
    steps += 1;
  }

  const dates: Dayjs[] = [];
  while (
    !current.isAfter(end) &&
    dates.length < MAX_OCCURRENCES_PER_TASK &&
    steps < MAX_RECURRENCE_SEARCH_STEPS
  ) {
    dates.push(current);
    const next = getNextOccurrenceDate(current, task);
    if (!next.isValid() || !next.isAfter(current)) {
      break;
    }
    current = next;
    steps += 1;
  }

  return dates;
}

function getReminderForDueOccurrence(task: Task, dueOccurrence: Dayjs) {
  if (!task.dueAt || !task.remindAt) {
    return task.remindAt;
  }

  const offsetMs = dayjs(task.dueAt).diff(dayjs(task.remindAt));
  return dueOccurrence.subtract(offsetMs, 'millisecond').toISOString();
}

function getGroupDate(task: Task, startDate?: string, endDate?: string) {
  const dueAtInRange = isDateInRange(task.dueAt, startDate, endDate);
  const remindAtInRange = isDateInRange(task.remindAt, startDate, endDate);

  if (dueAtInRange) {
    return task.dueAt;
  }

  if (remindAtInRange) {
    return task.remindAt;
  }

  return task.dueAt ?? task.remindAt;
}

export function getCalendarOccurrencesForTask(
  task: Task,
  startDate?: string,
  endDate?: string
): TaskCalendarOccurrence[] {
  if (isRecurringTask(task) && startDate && endDate) {
    const dueOccurrences = getRecurringOccurrenceDates(task.dueAt, task, startDate, endDate);
    if (dueOccurrences.length > 0) {
      return dueOccurrences.map((date) => ({
        key: `${task.id}:due:${date.toISOString()}`,
        task,
        groupDate: date.format('YYYY-MM-DD'),
        occurrenceDueAt: date.toISOString(),
        occurrenceRemindAt: getReminderForDueOccurrence(task, date),
      }));
    }

    const remindOccurrences = getRecurringOccurrenceDates(task.remindAt, task, startDate, endDate);
    if (remindOccurrences.length > 0) {
      return remindOccurrences.map((date) => ({
        key: `${task.id}:remind:${date.toISOString()}`,
        task,
        groupDate: date.format('YYYY-MM-DD'),
        occurrenceDueAt: task.dueAt,
        occurrenceRemindAt: date.toISOString(),
      }));
    }
  }

  const date = getGroupDate(task, startDate, endDate);
  const groupDate = date ? dayjs(date).format('YYYY-MM-DD') : '未设置日期';
  return [
    {
      key: `${task.id}:direct:${date ?? 'none'}`,
      task,
      groupDate,
      occurrenceDueAt: task.dueAt,
      occurrenceRemindAt: task.remindAt,
    },
  ];
}

export function groupTasksByCalendarDate(
  tasks: Task[],
  startDate?: string,
  endDate?: string
) {
  const groups = new Map<string, TaskCalendarOccurrence[]>();

  for (const task of tasks) {
    for (const item of getCalendarOccurrencesForTask(task, startDate, endDate)) {
      groups.set(item.groupDate, [...(groups.get(item.groupDate) ?? []), item]);
    }
  }

  return groups;
}

export function getCalendarOccurrenceTime(item: TaskCalendarOccurrence) {
  return item.occurrenceDueAt ?? item.occurrenceRemindAt ?? item.task.createdAt;
}

export function sortCalendarOccurrences(items: TaskCalendarOccurrence[]) {
  return [...items].sort(
    (left, right) =>
      dayjs(getCalendarOccurrenceTime(left)).valueOf() -
      dayjs(getCalendarOccurrenceTime(right)).valueOf()
  );
}
