import dayjs, { type Dayjs } from 'dayjs';
import type { Task } from '../types/task.types';

export interface AnniversaryDisplay {
  hasDate: boolean;
  nextDate?: Dayjs;
  nextDateLabel: string;
  sourceDateLabel: string;
  countdownText: string;
  daysUntil: number | null;
  yearsText: string;
}

const NO_DATE_LABEL = '未设置日期';

export function getAnniversaryDisplay(task: Task, now: Dayjs = dayjs()): AnniversaryDisplay {
  if (!task.dueAt) {
    return {
      hasDate: false,
      nextDateLabel: NO_DATE_LABEL,
      sourceDateLabel: NO_DATE_LABEL,
      countdownText: NO_DATE_LABEL,
      daysUntil: null,
      yearsText: NO_DATE_LABEL,
    };
  }

  const sourceDate = dayjs(task.dueAt);
  if (!sourceDate.isValid()) {
    return {
      hasDate: false,
      nextDateLabel: NO_DATE_LABEL,
      sourceDateLabel: NO_DATE_LABEL,
      countdownText: NO_DATE_LABEL,
      daysUntil: null,
      yearsText: NO_DATE_LABEL,
    };
  }

  const today = now.startOf('day');
  let nextDate = sourceDate.year(today.year()).startOf('day');
  if (nextDate.isBefore(today, 'day')) {
    nextDate = nextDate.add(1, 'year');
  }

  const daysUntil = nextDate.diff(today, 'day');
  const countdownText = daysUntil === 0 ? '今天' : `还有 ${daysUntil} 天`;
  const years = Math.max(nextDate.year() - sourceDate.year(), 0);

  return {
    hasDate: true,
    nextDate,
    nextDateLabel: nextDate.format('YYYY-MM-DD'),
    sourceDateLabel: sourceDate.format('YYYY-MM-DD'),
    countdownText,
    daysUntil,
    yearsText: `${years} 周年`,
  };
}

export function sortAnniversaryTasks(tasks: Task[], now: Dayjs = dayjs()) {
  return [...tasks].sort((left, right) => {
    const leftDisplay = getAnniversaryDisplay(left, now);
    const rightDisplay = getAnniversaryDisplay(right, now);
    const leftValue = leftDisplay.nextDate?.valueOf() ?? Number.MAX_SAFE_INTEGER;
    const rightValue = rightDisplay.nextDate?.valueOf() ?? Number.MAX_SAFE_INTEGER;

    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }

    return left.title.localeCompare(right.title, 'zh-Hans-CN') || left.id - right.id;
  });
}
