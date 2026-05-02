import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { ApiAppList } from './ApiAppList';
import { ApiKeyList } from './ApiKeyList';
import {
  clearMockUser,
  createMockUser,
  renderWithProviders,
  setMockUser,
  userEvent,
  waitFor,
} from '@/test/test-utils';

const hookMocks = vi.hoisted(() => ({
  useApiApps: vi.fn(),
  useCreateApiApp: vi.fn(),
  useUpdateApiApp: vi.fn(),
  useDeleteApiApp: vi.fn(),
  useApiScopes: vi.fn(),
  useApiKeys: vi.fn(),
  useApiAccessLogs: vi.fn(),
  useCreateApiKey: vi.fn(),
  useRevokeApiKey: vi.fn(),
}));

vi.mock('../hooks/useApiApps', () => hookMocks);

vi.mock('@/shared/components', async () => {
  const { PermissionGuard } = await vi.importActual<
    typeof import('@/shared/components/auth/PermissionGuard')
  >('@/shared/components/auth/PermissionGuard');

  return {
    PermissionGuard,
    PageWrap: ({ titleRight, children }: { titleRight?: ReactNode; children: ReactNode }) => (
      <div>
        <div>{titleRight}</div>
        {children}
      </div>
    ),
    TableActions: () => <div data-testid="table-actions" />,
    StatusBadge: ({ text }: { text: string }) => <span>{text}</span>,
  };
});

describe('API Auth permission actions', () => {
  let getComputedStyleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    clearMockUser();
    getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          getPropertyValue: () => '',
        }) as CSSStyleDeclaration
    );

    hookMocks.useApiApps.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
    });
    hookMocks.useCreateApiApp.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    hookMocks.useUpdateApiApp.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    hookMocks.useDeleteApiApp.mockReturnValue({ mutate: vi.fn() });
    hookMocks.useApiScopes.mockReturnValue({
      data: [
        {
          key: 'open-user',
          title: '用户公开资料',
          scopes: [
            {
              code: 'read:users',
              label: '读取用户公开资料',
              description: '获取用户公开资料列表',
            },
          ],
          endpoints: [],
        },
      ],
      isLoading: false,
    });

    hookMocks.useApiKeys.mockReturnValue({ data: [], isLoading: false });
    hookMocks.useApiAccessLogs.mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 },
      isLoading: false,
    });
    hookMocks.useCreateApiKey.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    hookMocks.useRevokeApiKey.mockReturnValue({ mutate: vi.fn() });
  });

  afterEach(() => {
    getComputedStyleSpy.mockRestore();
  });

  it('无 api-app:create 权限时隐藏创建应用按钮', () => {
    setMockUser(createMockUser({ permissions: [] }));

    renderWithProviders(<ApiAppList />);

    expect(screen.queryByRole('button', { name: /创建应用/ })).not.toBeInTheDocument();
  });

  it('有 api-app:create 权限时显示创建应用按钮', () => {
    setMockUser(createMockUser({ permissions: ['api-app:create'] }));

    renderWithProviders(<ApiAppList />);

    expect(screen.getByRole('button', { name: /创建应用/ })).toBeInTheDocument();
  });

  it('创建应用时权限范围可留空', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({});
    hookMocks.useCreateApiApp.mockReturnValue({ mutateAsync, isPending: false });
    setMockUser(createMockUser({ permissions: ['api-app:create'] }));

    renderWithProviders(<ApiAppList />);

    await user.click(screen.getByRole('button', { name: /创建应用/ }));
    await user.type(
      screen.getByPlaceholderText('请输入应用名称，如：家庭财务小程序'),
      'Personal App'
    );
    await user.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        name: 'Personal App',
        description: '',
        scopes: [],
      });
    });
  });

  it('无 api-app:key:create 权限时隐藏生成密钥按钮', () => {
    setMockUser(createMockUser({ permissions: [] }));

    renderWithProviders(<ApiKeyList appId={1} />);

    expect(screen.queryByRole('button', { name: /生成密钥/ })).not.toBeInTheDocument();
  });

  it('有 api-app:key:create 权限时显示生成密钥按钮', () => {
    setMockUser(createMockUser({ permissions: ['api-app:key:create'] }));

    renderWithProviders(<ApiKeyList appId={1} />);

    expect(screen.getByRole('button', { name: /生成密钥/ })).toBeInTheDocument();
  });

  it('密钥未覆盖 scopes 时按继承应用权限渲染', () => {
    setMockUser(createMockUser({ permissions: ['api-app:key:read'] }));
    hookMocks.useApiKeys.mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Default Key',
          displayKey: 'sk_live_****...abcd',
          prefix: 'sk_live',
          suffix: 'abcd',
          scopes: undefined,
          appId: 1,
          isActive: true,
          usageCount: 0,
          createdAt: '2026-04-27T00:00:00.000Z',
          updatedAt: '2026-04-27T00:00:00.000Z',
        },
      ],
      isLoading: false,
    });

    renderWithProviders(<ApiKeyList appId={1} />);

    expect(screen.getByText('继承应用权限')).toBeInTheDocument();
  });
});
