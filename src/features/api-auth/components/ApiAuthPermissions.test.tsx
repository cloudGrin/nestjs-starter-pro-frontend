import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { ApiAppList } from './ApiAppList';
import { ApiKeyList } from './ApiKeyList';
import { clearMockUser, createMockUser, renderWithProviders, setMockUser } from '@/test/test-utils';

const hookMocks = vi.hoisted(() => ({
  useApiApps: vi.fn(),
  useCreateApiApp: vi.fn(),
  useUpdateApiApp: vi.fn(),
  useDeleteApiApp: vi.fn(),
  useApiKeys: vi.fn(),
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

    hookMocks.useApiKeys.mockReturnValue({ data: [], isLoading: false });
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
});
