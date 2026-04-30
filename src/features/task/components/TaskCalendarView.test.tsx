import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { TaskCalendarView } from './TaskCalendarView';
import { createMockUser, renderWithProviders, setMockUser, userEvent } from '@/test/test-utils';
import type { Task } from '../types/task.types';

const baseTask: Task = {
  id: 1,
  title: '提前提醒的任务',
  listId: 1,
  status: 'pending',
  taskType: 'task',
  dueAt: '2026-06-05T10:00:00.000Z',
  remindAt: '2026-05-10T09:00:00.000Z',
  important: false,
  urgent: false,
  recurrenceType: 'none',
  sendExternalReminder: false,
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

describe('TaskCalendarView', () => {
  it('groups a task by the reminder date when only the reminder is inside the calendar range', () => {
    setMockUser(
      createMockUser({
        permissions: ['task:read'],
      })
    );

    renderWithProviders(
      <TaskCalendarView
        data={{ items: [baseTask], total: 1, page: 1, pageSize: 100 }}
        loading={false}
        month={dayjs('2026-05-01T00:00:00.000Z')}
        startDate="2026-05-01T00:00:00.000Z"
        endDate="2026-05-31T23:59:59.999Z"
        onMonthChange={vi.fn()}
        onEdit={vi.fn()}
        onComplete={vi.fn()}
        onReopen={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByTestId('task-calendar-layout')).toBeInTheDocument();
    expect(screen.getByTestId('task-calendar-compact-days')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /选择 2026-05-10/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /选择 2026-06-05/ })).not.toBeInTheDocument();
  });

  it('expands recurring tasks into each occurrence inside the calendar range', () => {
    setMockUser(
      createMockUser({
        permissions: ['task:read'],
      })
    );

    renderWithProviders(
      <TaskCalendarView
        data={{
          items: [
            {
              ...baseTask,
              title: '每周缴费',
              dueAt: '2026-04-01T10:00:00.000Z',
              remindAt: null,
              recurrenceType: 'weekly',
              recurrenceInterval: 1,
            },
          ],
          total: 1,
          page: 1,
          pageSize: 100,
        }}
        loading={false}
        month={dayjs('2026-04-01T00:00:00.000Z')}
        startDate="2026-04-01T00:00:00.000Z"
        endDate="2026-04-30T23:59:59.999Z"
        onMonthChange={vi.fn()}
        onEdit={vi.fn()}
        onComplete={vi.fn()}
        onReopen={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /选择 2026-04-01/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /选择 2026-04-08/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /选择 2026-04-15/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /选择 2026-04-22/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /选择 2026-04-29/ })).toBeInTheDocument();
    expect(screen.getAllByText('每周缴费')).toHaveLength(5);
  });

  it('shows selected day task details in a side panel', async () => {
    setMockUser(
      createMockUser({
        permissions: ['task:read', 'task:update'],
      })
    );
    const onEdit = vi.fn();

    renderWithProviders(
      <TaskCalendarView
        data={{ items: [baseTask], total: 1, page: 1, pageSize: 100 }}
        loading={false}
        month={dayjs('2026-05-01T00:00:00.000Z')}
        startDate="2026-05-01T00:00:00.000Z"
        endDate="2026-05-31T23:59:59.999Z"
        onMonthChange={vi.fn()}
        onEdit={onEdit}
        onComplete={vi.fn()}
        onReopen={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /选择 2026-05-10/ }));

    expect(screen.getByTestId('task-calendar-day-detail')).toHaveTextContent('2026-05-10');
    expect(screen.getByTestId('task-calendar-day-detail')).toHaveTextContent('提前提醒的任务');

    await userEvent.click(screen.getByRole('button', { name: /编辑/ }));
    expect(onEdit).toHaveBeenCalledWith(baseTask);
  });

  it('notifies parent when the calendar month changes', async () => {
    setMockUser(
      createMockUser({
        permissions: ['task:read'],
      })
    );
    const onMonthChange = vi.fn();

    renderWithProviders(
      <TaskCalendarView
        data={{ items: [], total: 0, page: 1, pageSize: 100 }}
        loading={false}
        month={dayjs('2026-05-01T00:00:00.000Z')}
        startDate="2026-05-01T00:00:00.000Z"
        endDate="2026-05-31T23:59:59.999Z"
        onMonthChange={onMonthChange}
        onEdit={vi.fn()}
        onComplete={vi.fn()}
        onReopen={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /下个月/ }));

    expect(onMonthChange.mock.calls[0][0].format('YYYY-MM')).toBe('2026-06');
  });

  it('shows a loading placeholder when the first calendar page is loading', () => {
    setMockUser(
      createMockUser({
        permissions: ['task:read'],
      })
    );

    renderWithProviders(
      <TaskCalendarView
        data={{ items: [], total: 0, page: 1, pageSize: 100 }}
        loading
        month={dayjs('2026-05-01T00:00:00.000Z')}
        startDate="2026-05-01T00:00:00.000Z"
        endDate="2026-05-31T23:59:59.999Z"
        onMonthChange={vi.fn()}
        onEdit={vi.fn()}
        onComplete={vi.fn()}
        onReopen={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('加载中')).toBeInTheDocument();
  });
});
