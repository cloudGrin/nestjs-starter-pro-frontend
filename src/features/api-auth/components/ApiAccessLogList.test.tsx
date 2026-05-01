import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { ApiAccessLogList } from './ApiAccessLogList';
import { renderWithProviders, userEvent, waitFor } from '@/test/test-utils';

const hookMocks = vi.hoisted(() => ({
  useApiAccessLogs: vi.fn(),
}));

vi.mock('../hooks/useApiApps', () => hookMocks);

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');

  return {
    ...actual,
    Select: ({
      value,
      options = [],
      placeholder,
      onChange,
    }: {
      value?: number;
      options?: Array<{ label: string; value: number }>;
      placeholder?: string;
      onChange?: (value?: number) => void;
    }) => (
      <select
        aria-label={placeholder}
        value={value ?? ''}
        onChange={(event) =>
          onChange?.(event.target.value ? Number(event.target.value) : undefined)
        }
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
    Input: ({
      value,
      placeholder,
      onChange,
      onPressEnter,
    }: {
      value?: string;
      placeholder?: string;
      onChange?: React.ChangeEventHandler<HTMLInputElement>;
      onPressEnter?: () => void;
    }) => (
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={onChange}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onPressEnter?.();
          }
        }}
      />
    ),
    InputNumber: ({
      value,
      placeholder,
      onChange,
      onPressEnter,
    }: {
      value?: number;
      placeholder?: string;
      onChange?: (value: number | null) => void;
      onPressEnter?: () => void;
    }) => (
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(event) =>
          onChange?.(event.target.value ? Number(event.target.value) : null)
        }
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onPressEnter?.();
          }
        }}
      />
    ),
  };
});

describe('ApiAccessLogList', () => {
  let getComputedStyleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          getPropertyValue: () => '',
        }) as CSSStyleDeclaration
    );
  });

  afterEach(() => {
    getComputedStyleSpy.mockRestore();
  });

  it('renders detailed access logs and filter controls', () => {
    hookMocks.useApiAccessLogs.mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            appId: 12,
            keyId: 7,
            keyName: 'Production Key',
            keyPrefix: 'sk_live',
            keySuffix: 'abcd',
            method: 'GET',
            path: '/api/v1/open/users?page=1',
            statusCode: 403,
            durationMs: 18,
            ip: '127.0.0.1',
            userAgent: 'curl/8.0',
            createdAt: '2026-05-01T08:00:00.000Z',
            updatedAt: '2026-05-01T08:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
      isLoading: false,
    });

    renderWithProviders(
      <ApiAccessLogList
        appId={12}
        keys={[
          {
            id: 7,
            name: 'Production Key',
            displayKey: 'sk_live_****...abcd',
            prefix: 'sk_live',
            suffix: 'abcd',
            appId: 12,
            isActive: true,
            usageCount: 1,
            createdAt: '2026-05-01T00:00:00.000Z',
            updatedAt: '2026-05-01T00:00:00.000Z',
          },
        ]}
      />
    );

    expect(screen.getByText('详细访问日志')).toBeInTheDocument();
    expect(screen.getByText('按密钥筛选')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('按路径筛选')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('状态码')).toBeInTheDocument();
    expect(screen.getByText('/api/v1/open/users?page=1')).toBeInTheDocument();
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(hookMocks.useApiAccessLogs).toHaveBeenCalledWith(12, {
      page: 1,
      limit: 10,
    });
  });

  it('passes key, path, and status code filters to the query hook', async () => {
    const user = userEvent.setup();
    hookMocks.useApiAccessLogs.mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 },
      isLoading: false,
    });

    renderWithProviders(
      <ApiAccessLogList
        appId={12}
        keys={[
          {
            id: 7,
            name: 'Production Key',
            displayKey: 'sk_live_****...abcd',
            prefix: 'sk_live',
            suffix: 'abcd',
            appId: 12,
            isActive: true,
            usageCount: 1,
            createdAt: '2026-05-01T00:00:00.000Z',
            updatedAt: '2026-05-01T00:00:00.000Z',
          },
        ]}
      />
    );

    await user.selectOptions(screen.getByLabelText('按密钥筛选'), '7');
    await user.type(screen.getByLabelText('按路径筛选'), '/open/users');
    await user.type(screen.getByLabelText('状态码'), '403');
    await user.click(screen.getByRole('button', { name: /筛选/ }));

    await waitFor(() => {
      expect(hookMocks.useApiAccessLogs).toHaveBeenLastCalledWith(12, {
        page: 1,
        limit: 10,
        keyId: 7,
        path: '/open/users',
        statusCode: 403,
      });
    });
  });
});
