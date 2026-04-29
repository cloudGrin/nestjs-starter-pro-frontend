import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { TaskCalendarView } from './TaskCalendarView';
import { createMockUser, renderWithProviders, setMockUser } from '@/test/test-utils';
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
        startDate="2026-05-01T00:00:00.000Z"
        endDate="2026-05-31T23:59:59.999Z"
        onEdit={vi.fn()}
        onComplete={vi.fn()}
        onReopen={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('2026-05-10')).toBeInTheDocument();
    expect(screen.queryByText('2026-06-05')).not.toBeInTheDocument();
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
        startDate="2026-05-01T00:00:00.000Z"
        endDate="2026-05-31T23:59:59.999Z"
        onEdit={vi.fn()}
        onComplete={vi.fn()}
        onReopen={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('加载中')).toBeInTheDocument();
  });
});
