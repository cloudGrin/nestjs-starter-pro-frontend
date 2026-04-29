import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

function PagingTasksConsumer() {
  const [page, setPage] = useState(1);
  const query = useTasks({ view: 'calendar', page, limit: 100 });

  return (
    <>
      <div data-testid="task-titles">
        {query.data?.items.map((task: { title: string }) => task.title).join(',') ?? 'empty'}
      </div>
      <button type="button" onClick={() => setPage(2)}>
        next
      </button>
    </>
  );
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

  it('keeps previous task page data while the next page is loading', async () => {
    serviceMocks.getTasks.mockImplementation((params) => {
      if (params.page === 1) {
        return Promise.resolve({
          items: [{ id: 1, title: '第一页任务' }],
          total: 2,
          page: 1,
          pageSize: 100,
        });
      }

      return new Promise(() => undefined);
    });

    renderWithQueryClient(<PagingTasksConsumer />);

    expect(await screen.findByText('第一页任务')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'next' }));

    expect(screen.getByTestId('task-titles')).toHaveTextContent('第一页任务');
    await waitFor(() =>
      expect(serviceMocks.getTasks).toHaveBeenLastCalledWith({
        view: 'calendar',
        page: 2,
        limit: 100,
      })
    );
  });
});
