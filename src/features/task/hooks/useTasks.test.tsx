import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreateTask, useTasks } from './useTasks';

const serviceMocks = vi.hoisted(() => ({
  getTasks: vi.fn(),
  createTask: vi.fn(),
}));

vi.mock('../services/task.service', () => ({
  taskService: {
    getTasks: serviceMocks.getTasks,
    createTask: serviceMocks.createTask,
  },
}));

function renderWithQueryClient(ui: React.ReactNode, queryClient = new QueryClient()) {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function TasksConsumer() {
  useTasks({ view: 'matrix', page: 1, limit: 20 });
  return null;
}

function CreateTaskConsumer() {
  const mutation = useCreateTask();

  useEffect(() => {
    mutation.mutate({ title: 'Pay bills', listId: 1 });
  }, []);

  return null;
}

describe('task hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMocks.getTasks.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });
    serviceMocks.createTask.mockResolvedValue({ id: 1, title: 'Pay bills', listId: 1 });
  });

  it('queries tasks with the provided params', async () => {
    renderWithQueryClient(<TasksConsumer />);

    await waitFor(() =>
      expect(serviceMocks.getTasks).toHaveBeenCalledWith({ view: 'matrix', page: 1, limit: 20 })
    );
  });

  it('invalidates task queries after creating a task', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderWithQueryClient(<CreateTaskConsumer />, queryClient);

    await waitFor(() =>
      expect(serviceMocks.createTask).toHaveBeenCalledWith({ title: 'Pay bills', listId: 1 })
    );
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['tasks'] }));
  });
});
