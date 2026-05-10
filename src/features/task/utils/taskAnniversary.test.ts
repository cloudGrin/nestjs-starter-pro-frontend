import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { getAnniversaryDisplay } from './taskAnniversary';
import type { Task } from '../types/task.types';

function createAnniversary(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: '结婚纪念日',
    listId: 1,
    status: 'pending',
    taskType: 'anniversary',
    dueAt: '2020-05-20T00:00:00.000Z',
    remindAt: null,
    important: false,
    urgent: false,
    recurrenceType: 'yearly',
    continuousReminderEnabled: false,
    continuousReminderIntervalMinutes: 30,
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('task anniversary display', () => {
  it('shows the upcoming anniversary date and countdown for the current year', () => {
    const display = getAnniversaryDisplay(createAnniversary(), dayjs('2026-05-10T12:00:00.000Z'));

    expect(display.hasDate).toBe(true);
    expect(display.nextDateLabel).toBe('2026-05-20');
    expect(display.sourceDateLabel).toBe('2020-05-20');
    expect(display.countdownText).toBe('还有 10 天');
    expect(display.daysUntil).toBe(10);
    expect(display.yearsText).toBe('6 周年');
  });

  it('uses next year when this year anniversary has already passed', () => {
    const display = getAnniversaryDisplay(
      createAnniversary({ dueAt: '2020-01-02T00:00:00.000Z' }),
      dayjs('2026-05-10T12:00:00.000Z')
    );

    expect(display.nextDateLabel).toBe('2027-01-02');
    expect(display.countdownText).toBe('还有 237 天');
    expect(display.yearsText).toBe('7 周年');
  });

  it('marks an anniversary happening today', () => {
    const display = getAnniversaryDisplay(createAnniversary(), dayjs('2026-05-20T12:00:00.000Z'));

    expect(display.nextDateLabel).toBe('2026-05-20');
    expect(display.countdownText).toBe('今天');
    expect(display.daysUntil).toBe(0);
  });

  it('returns fallback labels when the anniversary has no date', () => {
    const display = getAnniversaryDisplay(
      createAnniversary({ dueAt: null }),
      dayjs('2026-05-10T12:00:00.000Z')
    );

    expect(display.hasDate).toBe(false);
    expect(display.nextDateLabel).toBe('未设置日期');
    expect(display.sourceDateLabel).toBe('未设置日期');
    expect(display.countdownText).toBe('未设置日期');
    expect(display.daysUntil).toBeNull();
    expect(display.yearsText).toBe('未设置日期');
  });
});
