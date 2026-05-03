import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskMatrixView } from './TaskMatrixView';
import { createMockUser, renderWithProviders, setMockUser } from '@/test/test-utils';
import type { PaginatedResult, Task } from '../types/task.types';

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 31,
    title: '矩阵任务',
    listId: 1,
    status: 'pending',
    taskType: 'task',
    dueAt: null,
    remindAt: null,
    important: false,
    urgent: false,
    recurrenceType: 'none',
    continuousReminderEnabled: true,
    continuousReminderIntervalMinutes: 30,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
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

function createDataTransfer() {
  const store = new Map<string, string>();

  return {
    effectAllowed: '',
    dropEffect: '',
    setData: vi.fn((type: string, value: string) => store.set(type, value)),
    getData: vi.fn((type: string) => store.get(type) ?? ''),
  };
}

describe('TaskMatrixView', () => {
  it('moves a task to the dropped quadrant urgency and importance', () => {
    setMockUser(
      createMockUser({
        permissions: ['task:update'],
      })
    );
    const task = createTask({ important: false, urgent: false });
    const onMove = vi.fn();
    const dataTransfer = createDataTransfer();

    renderWithProviders(
      <TaskMatrixView
        data={createData([task])}
        onEdit={vi.fn()}
        onComplete={vi.fn()}
        onReopen={vi.fn()}
        onDelete={vi.fn()}
        onMove={onMove}
      />
    );

    fireEvent.dragStart(screen.getByTestId('task-matrix-card-31'), { dataTransfer });
    fireEvent.dragOver(screen.getByTestId('task-matrix-quadrant-important-urgent'), {
      dataTransfer,
    });
    fireEvent.drop(screen.getByTestId('task-matrix-quadrant-important-urgent'), {
      dataTransfer,
    });

    expect(onMove).toHaveBeenCalledWith(task, { important: true, urgent: true });
  });
});
