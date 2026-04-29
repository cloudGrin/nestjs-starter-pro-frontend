import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { TaskFormModal } from './TaskFormModal';
import { renderWithProviders, userEvent } from '@/test/test-utils';
import type { Task } from '../types/task.types';

const task: Task = {
  id: 9,
  title: '整理家庭账单',
  description: '旧描述',
  listId: 1,
  assigneeId: 2,
  status: 'pending',
  taskType: 'task',
  dueAt: '2026-05-01T10:00:00.000Z',
  remindAt: '2026-05-01T09:00:00.000Z',
  important: false,
  urgent: false,
  tags: ['home'],
  recurrenceType: 'none',
  recurrenceInterval: null,
  reminderChannels: ['internal'],
  sendExternalReminder: false,
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

describe('TaskFormModal', () => {
  beforeEach(() => {
    vi.stubGlobal('getComputedStyle', () => ({
      getPropertyValue: () => '',
    }));
  });

  it('submits null for nullable fields cleared while editing', async () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <TaskFormModal
        open
        task={task}
        lists={[{ id: 1, name: '家庭计划', scope: 'family', sort: 0, isArchived: false }]}
        users={[{ id: 2, username: 'family-user', nickname: 'Family' }]}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const description = screen.getByPlaceholderText('补充任务说明');
    await userEvent.clear(description);
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        description: null,
      })
    );
  });

  it('clears stale recurrence interval when switching to weekdays', async () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <TaskFormModal
        open
        task={{
          ...task,
          recurrenceType: 'custom',
          recurrenceInterval: 30,
        }}
        lists={[{ id: 1, name: '家庭计划', scope: 'family', sort: 0, isArchived: false }]}
        users={[{ id: 2, username: 'family-user', nickname: 'Family' }]}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await userEvent.click(screen.getByLabelText('重复规则'));
    await userEvent.click(await screen.findByText('工作日'));
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        recurrenceType: 'weekdays',
        recurrenceInterval: null,
      })
    );
  });

  it('keeps recurrence interval for repeat rules supported by the backend', async () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <TaskFormModal
        open
        task={{
          ...task,
          recurrenceType: 'custom',
          recurrenceInterval: 30,
        }}
        lists={[{ id: 1, name: '家庭计划', scope: 'family', sort: 0, isArchived: false }]}
        users={[{ id: 2, username: 'family-user', nickname: 'Family' }]}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await userEvent.click(screen.getByLabelText('重复规则'));
    await userEvent.click(await screen.findByText('每天'));
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        recurrenceType: 'daily',
        recurrenceInterval: 30,
      })
    );
  });
});
