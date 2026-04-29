import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { TaskListManageModal } from './TaskListManageModal';
import { renderWithProviders, userEvent } from '@/test/test-utils';

const taskListHookMocks = vi.hoisted(() => ({
  useCreateTaskList: vi.fn(),
  useUpdateTaskList: vi.fn(),
  useDeleteTaskList: vi.fn(),
}));

vi.mock('../hooks/useTasks', () => taskListHookMocks);

function mockMutation() {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  };
}

describe('TaskListManageModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('getComputedStyle', () => ({
      getPropertyValue: () => '',
    }));

    taskListHookMocks.useCreateTaskList.mockReturnValue(mockMutation());
    taskListHookMocks.useUpdateTaskList.mockReturnValue(mockMutation());
    taskListHookMocks.useDeleteTaskList.mockReturnValue(mockMutation());
  });

  it('submits null when clearing an existing list color', async () => {
    const updateMutation = mockMutation();
    taskListHookMocks.useUpdateTaskList.mockReturnValue(updateMutation);

    renderWithProviders(
      <TaskListManageModal
        open
        lists={[
          {
            id: 3,
            name: '家庭计划',
            scope: 'family',
            color: '#4f46e5',
            sort: 0,
            isArchived: false,
          },
        ]}
        loading={false}
        onCancel={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /编辑/ }));
    await userEvent.clear(screen.getByPlaceholderText('#4f46e5'));
    await userEvent.click(screen.getByRole('button', { name: /保存清单/ }));

    await waitFor(() => expect(updateMutation.mutateAsync).toHaveBeenCalled());
    expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
      id: 3,
      data: expect.objectContaining({
        color: null,
      }),
    });
  });
});
