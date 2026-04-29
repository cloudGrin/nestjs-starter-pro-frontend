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

  it('does not reset edited values when task lists refresh while the modal stays open', async () => {
    const onSubmit = vi.fn();
    const { rerender } = renderWithProviders(
      <TaskFormModal
        open
        task={null}
        lists={[{ id: 1, name: '家庭计划', scope: 'family', sort: 0, isArchived: false }]}
        users={[]}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await userEvent.type(
      screen.getByPlaceholderText('例如：给家里买菜、准备周会、结婚纪念日'),
      '用户正在输入'
    );

    rerender(
      <TaskFormModal
        open
        task={null}
        lists={[
          { id: 1, name: '家庭计划', scope: 'family', sort: 0, isArchived: false },
          { id: 2, name: '新清单', scope: 'family', sort: 1, isArchived: false },
        ]}
        users={[]}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByDisplayValue('用户正在输入')).toBeInTheDocument();
  });

  it('uses the first active list when task lists load after the create modal opens', async () => {
    const onSubmit = vi.fn();
    const { rerender } = renderWithProviders(
      <TaskFormModal
        open
        task={null}
        lists={[]}
        users={[]}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    rerender(
      <TaskFormModal
        open
        task={null}
        lists={[{ id: 2, name: '家庭计划', scope: 'family', sort: 0, isArchived: false }]}
        users={[]}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await userEvent.type(
      screen.getByPlaceholderText('例如：给家里买菜、准备周会、结婚纪念日'),
      '列表稍后加载的任务'
    );
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        listId: 2,
      })
    );
  });

  it('requires moving a task out of an archived list before saving', async () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <TaskFormModal
        open
        task={{
          ...task,
          listId: 3,
          list: { id: 3, name: '已归档', scope: 'family', sort: 0, isArchived: true },
        }}
        lists={[
          { id: 3, name: '已归档', scope: 'family', sort: 0, isArchived: true },
          { id: 4, name: '可用清单', scope: 'family', sort: 1, isArchived: false },
        ]}
        users={[{ id: 2, username: 'family-user', nickname: 'Family' }]}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect((await screen.findAllByText('当前任务所属清单已归档，请迁移到可用清单')).length).toBeGreaterThan(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects blank task titles before submitting', async () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <TaskFormModal
        open
        task={null}
        lists={[{ id: 1, name: '家庭计划', scope: 'family', sort: 0, isArchived: false }]}
        users={[]}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await userEvent.type(
      screen.getByPlaceholderText('例如：给家里买菜、准备周会、结婚纪念日'),
      '   '
    );
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(await screen.findByText('任务标题不能为空')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('requires an external channel when external reminders are enabled', async () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <TaskFormModal
        open
        task={null}
        lists={[{ id: 1, name: '家庭计划', scope: 'family', sort: 0, isArchived: false }]}
        users={[]}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await userEvent.type(
      screen.getByPlaceholderText('例如：给家里买菜、准备周会、结婚纪念日'),
      '外部提醒任务'
    );
    await userEvent.click(screen.getByRole('switch', { name: '外部提醒' }));
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(await screen.findByText('外部提醒需要选择 Bark 或飞书')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('requires a due date for recurring tasks', async () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <TaskFormModal
        open
        task={null}
        lists={[{ id: 1, name: '家庭计划', scope: 'family', sort: 0, isArchived: false }]}
        users={[]}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await userEvent.type(
      screen.getByPlaceholderText('例如：给家里买菜、准备周会、结婚纪念日'),
      '重复任务'
    );
    await userEvent.click(screen.getByLabelText('重复规则'));
    await userEvent.click(await screen.findByText('每天'));
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(await screen.findByText('重复任务必须设置截止时间')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('requires a date for anniversary tasks', async () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <TaskFormModal
        open
        task={null}
        lists={[{ id: 1, name: '家庭计划', scope: 'family', sort: 0, isArchived: false }]}
        users={[]}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await userEvent.type(
      screen.getByPlaceholderText('例如：给家里买菜、准备周会、结婚纪念日'),
      '纪念日'
    );
    await userEvent.click(screen.getByLabelText('类型'));
    await userEvent.click(await screen.findByText('纪念日'));
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(await screen.findByText('纪念日必须设置日期')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects reminders scheduled after the due date', async () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <TaskFormModal
        open
        task={{
          ...task,
          dueAt: '2026-05-01T09:00:00.000Z',
          remindAt: '2026-05-01T10:00:00.000Z',
        }}
        lists={[{ id: 1, name: '家庭计划', scope: 'family', sort: 0, isArchived: false }]}
        users={[{ id: 2, username: 'family-user', nickname: 'Family' }]}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(await screen.findAllByText('提醒时间不能晚于截止时间')).not.toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
