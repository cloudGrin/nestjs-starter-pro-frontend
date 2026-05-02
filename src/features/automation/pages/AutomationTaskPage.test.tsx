import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AutomationTaskPage } from './AutomationTaskPage';
import {
  clearMockUser,
  mockUsers,
  renderWithProviders,
  setMockUser,
  userEvent,
  waitFor,
} from '@/test/test-utils';

const hookMocks = vi.hoisted(() => ({
  useAutomationTasks: vi.fn(),
  useUpdateAutomationTaskConfig: vi.fn(),
  useRunAutomationTask: vi.fn(),
  useAutomationTaskLogs: vi.fn(),
}));

vi.mock('../hooks/useAutomationTasks', () => hookMocks);
vi.mock('@/shared/hooks/useBreadcrumb', () => ({
  useBreadcrumb: () => [],
}));

describe('AutomationTaskPage', () => {
  let getComputedStyleSpy: ReturnType<typeof vi.spyOn>;
  const updateMutate = vi.fn();
  const runMutate = vi.fn();

  beforeEach(() => {
    getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          getPropertyValue: () => '',
        }) as CSSStyleDeclaration
    );
    updateMutate.mockReset();
    runMutate.mockReset();
    setMockUser(mockUsers.superAdmin);
    hookMocks.useAutomationTasks.mockReturnValue({
      data: [
        {
          key: 'cleanupExpiredRefreshTokens',
          name: '清理过期刷新令牌',
          description: '删除已经过期的 refresh token 记录',
          defaultCron: '0 3 * * *',
          config: {
            id: 1,
            taskKey: 'cleanupExpiredRefreshTokens',
            enabled: true,
            cronExpression: '0 3 * * *',
            params: {},
            isRunning: false,
            lastStatus: 'success',
            lastStartedAt: '2026-05-01T00:00:00.000Z',
            lastFinishedAt: '2026-05-01T00:00:01.000Z',
            lastDurationMs: 1000,
            lastMessage: '清理 0 条过期刷新令牌',
            createdAt: '2026-05-01T00:00:00.000Z',
            updatedAt: '2026-05-01T00:00:01.000Z',
          },
        },
      ],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });
    hookMocks.useUpdateAutomationTaskConfig.mockReturnValue({
      mutate: updateMutate,
      isPending: false,
    });
    hookMocks.useRunAutomationTask.mockReturnValue({
      mutate: runMutate,
      isPending: false,
    });
    hookMocks.useAutomationTaskLogs.mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 },
      isLoading: false,
    });
  });

  afterEach(() => {
    clearMockUser();
    getComputedStyleSpy.mockRestore();
  });

  it('renders automation tasks and status', () => {
    renderWithProviders(
      <MemoryRouter>
        <AutomationTaskPage />
      </MemoryRouter>
    );

    expect(screen.getByText('自动化任务')).toBeInTheDocument();
    expect(screen.getByText('清理过期刷新令牌')).toBeInTheDocument();
    expect(screen.getByText('cleanupExpiredRefreshTokens')).toBeInTheDocument();
    expect(screen.getByText('成功')).toBeInTheDocument();
    expect(screen.getByText('清理 0 条过期刷新令牌')).toBeInTheDocument();
  });

  it('shows running when a task is still running even if the last trigger was skipped', () => {
    hookMocks.useAutomationTasks.mockReturnValue({
      data: [
        {
          key: 'sendTaskReminders',
          name: '发送任务提醒',
          defaultCron: '*/1 * * * *',
          config: {
            id: 2,
            taskKey: 'sendTaskReminders',
            enabled: true,
            cronExpression: '*/1 * * * *',
            params: {},
            isRunning: true,
            lastStatus: 'skipped',
            lastStartedAt: '2026-05-01T00:00:00.000Z',
            lastFinishedAt: null,
            lastDurationMs: null,
            lastMessage: '任务正在运行，本次触发已跳过',
            createdAt: '2026-05-01T00:00:00.000Z',
            updatedAt: '2026-05-01T00:00:01.000Z',
          },
        },
      ],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <MemoryRouter>
        <AutomationTaskPage />
      </MemoryRouter>
    );

    expect(screen.getByText('运行中')).toBeInTheDocument();
    expect(screen.queryByText('跳过')).not.toBeInTheDocument();
  });

  it('rejects invalid JSON params before saving config', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MemoryRouter>
        <AutomationTaskPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /编辑/ }));
    fireEvent.change(screen.getByPlaceholderText('请输入 JSON 对象参数'), {
      target: { value: '{bad json' },
    });
    await user.click(screen.getByRole('button', { name: /保\s*存/ }));

    await waitFor(() => {
      expect(screen.getByText('参数必须是合法的 JSON 对象')).toBeInTheDocument();
    });
    expect(updateMutate).not.toHaveBeenCalled();
  });

  it('runs a task manually and leaves result messaging to status handling', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MemoryRouter>
        <AutomationTaskPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /执行/ }));

    expect(runMutate).toHaveBeenCalledWith('cleanupExpiredRefreshTokens', expect.any(Object));
  });
});
