import { App } from 'antd';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { MenuListPage } from './MenuListPage';
import {
  createMockUser,
  renderWithProviders,
  setMockUser,
  screen,
  userEvent,
} from '@/test/test-utils';
import { MenuType, type MenuTreeNode } from '../types/menu.types';

const menuHookMocks = vi.hoisted(() => ({
  useMenuTree: vi.fn(),
  useCreateMenu: vi.fn(),
  useUpdateMenu: vi.fn(),
  useDeleteMenu: vi.fn(),
  useMoveMenu: vi.fn(),
  useUserMenus: vi.fn(),
}));

vi.mock('../hooks/useMenus', () => menuHookMocks);

const menuTree: MenuTreeNode[] = [
  {
    id: 1,
    name: '系统管理',
    path: '/system',
    type: MenuType.DIRECTORY,
    icon: 'SettingOutlined',
    parentId: null,
    sort: 0,
    isActive: true,
    isVisible: true,
    isExternal: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    children: [],
  },
];

function mockMutation() {
  return {
    mutate: vi.fn(),
    isPending: false,
  };
}

function renderPage() {
  return renderWithProviders(
    <App>
      <MemoryRouter>
        <MenuListPage />
      </MemoryRouter>
    </App>
  );
}

describe('MenuListPage', () => {
  let getComputedStyleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          getPropertyValue: () => '',
        }) as CSSStyleDeclaration
    );
    setMockUser(
      createMockUser({
        permissions: ['menu:create', 'menu:update', 'menu:delete'],
      })
    );

    menuHookMocks.useMenuTree.mockReturnValue({
      data: menuTree,
      isLoading: false,
      refetch: vi.fn(),
    });
    menuHookMocks.useUserMenus.mockReturnValue({
      data: menuTree,
      isLoading: false,
    });
    menuHookMocks.useCreateMenu.mockReturnValue(mockMutation());
    menuHookMocks.useUpdateMenu.mockReturnValue(mockMutation());
    menuHookMocks.useDeleteMenu.mockReturnValue(mockMutation());
    menuHookMocks.useMoveMenu.mockReturnValue(mockMutation());
  });

  afterEach(() => {
    getComputedStyleSpy.mockRestore();
  });

  it('places the top-level create action in the page header and keeps it functional', async () => {
    renderPage();

    const createButton = screen.getByRole('button', { name: /创建顶级菜单/ });

    expect(createButton.closest('.page-wrap-header')).not.toBeNull();

    await userEvent.click(createButton);

    expect(screen.getByText('创建菜单')).toBeInTheDocument();
  });
});
