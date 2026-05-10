import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { TaskAnniversaryView } from './TaskAnniversaryView';
import { createMockUser, renderWithProviders, setMockUser } from '@/test/test-utils';
import type { PaginatedResult, Task } from '../types/task.types';

function createAnniversary(overrides: Partial<Task> = {}): Task {
  return {
    id: 77,
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

function createData(items: Task[]): PaginatedResult<Task> {
  return {
    items,
    total: items.length,
    page: 1,
    pageSize: 100,
  };
}

describe('TaskAnniversaryView', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-10T12:00:00.000Z'));
    setMockUser(
      createMockUser({
        permissions: ['task:read', 'task:update', 'task:delete', 'task:complete'],
      })
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders anniversaries as countdown cards with the next occurrence date', () => {
    renderWithProviders(
      <TaskAnniversaryView
        data={createData([createAnniversary()])}
        loading={false}
        onEdit={vi.fn()}
        onComplete={vi.fn()}
        onReopen={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByTestId('task-anniversary-view')).toBeInTheDocument();
    expect(screen.getByTestId('task-anniversary-card-77')).toBeInTheDocument();
    expect(screen.getByText('结婚纪念日')).toBeInTheDocument();
    expect(screen.getByText('还有 10 天')).toBeInTheDocument();
    expect(screen.getByText('2026-05-20')).toBeInTheDocument();
    expect(screen.getByText('原始日期 2020-05-20')).toBeInTheDocument();
    expect(screen.getByText('6 周年')).toBeInTheDocument();
  });
});
