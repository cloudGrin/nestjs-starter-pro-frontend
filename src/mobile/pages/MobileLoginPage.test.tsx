import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from 'antd-mobile';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { UserStatus, type User } from '@/shared/types/user.types';
import { clearMobilePersistedQueryCache } from '../pwa/queryPersistence';
import { MobileLoginPage } from './MobileLoginPage';

vi.mock('../pwa/queryPersistence', () => ({
  clearMobilePersistedQueryCache: vi.fn(),
}));

const user: User = {
  id: 1,
  username: 'dad',
  email: 'dad@example.com',
  nickname: '爸爸',
  status: UserStatus.ACTIVE,
  roles: [],
  createdAt: '2026-05-10T00:00:00.000Z',
  updatedAt: '2026-05-10T00:00:00.000Z',
};

function CurrentPath() {
  const location = useLocation();

  return <div data-testid="current-path">{location.pathname}</div>;
}

function renderPage(initialEntry: string | { pathname: string; state?: unknown } = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/login"
          element={
            <>
              <MobileLoginPage />
              <CurrentPath />
            </>
          }
        />
        <Route path="*" element={<CurrentPath />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('MobileLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Toast.clear();
    useAuthStore.setState({
      token: null,
      refreshToken: null,
      user: null,
      login: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('uses mobile-friendly autocomplete attributes for credentials', () => {
    renderPage();

    expect(screen.getByPlaceholderText('用户名、邮箱或手机号')).toHaveAttribute(
      'autocomplete',
      'username'
    );
    expect(screen.getByPlaceholderText('请输入密码')).toHaveAttribute(
      'autocomplete',
      'current-password'
    );
  });

  it('renders the dedicated mobile login surface and first-deploy hint', () => {
    const { container } = renderPage();

    expect(container.querySelector('.mobile-login-page')).toBeInTheDocument();
    expect(container.querySelector('.mobile-login-panel')).toBeInTheDocument();
    expect(screen.getByText('首次部署后请使用后端日志中的初始管理员密码登录')).toBeInTheDocument();
  });

  it('trims account, clears persisted mobile caches, and returns to requested page after login', async () => {
    const event = userEvent.setup();
    const login = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ login });
    renderPage({ pathname: '/login', state: { from: '/tasks' } });

    await event.type(screen.getByPlaceholderText('用户名、邮箱或手机号'), '  dad  ');
    await event.type(screen.getByPlaceholderText('请输入密码'), 'secret');
    await event.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('dad', 'secret');
      expect(clearMobilePersistedQueryCache).toHaveBeenCalled();
      expect(screen.getByTestId('current-path')).toHaveTextContent('/tasks');
    });
  });

  it('returns to the mobile family page by default after login', async () => {
    const event = userEvent.setup();
    renderPage();

    await event.type(screen.getByPlaceholderText('用户名、邮箱或手机号'), 'dad');
    await event.type(screen.getByPlaceholderText('请输入密码'), 'secret');
    await event.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(screen.getByTestId('current-path')).toHaveTextContent('/family');
    });
  });

  it('keeps the user on login page and shows toast when login fails', async () => {
    const event = userEvent.setup();
    const login = vi.fn().mockRejectedValue(new Error('bad credentials'));
    const toast = vi.spyOn(Toast, 'show');
    useAuthStore.setState({ login });
    renderPage({ pathname: '/login', state: { from: '/tasks' } });

    await event.type(screen.getByPlaceholderText('用户名、邮箱或手机号'), 'dad');
    await event.type(screen.getByPlaceholderText('请输入密码'), 'wrong');
    await event.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        icon: 'fail',
        content: '登录失败',
        position: 'center',
      });
      expect(screen.getByTestId('current-path')).toHaveTextContent('/login');
    });
  });

  it('redirects authenticated users away from login page', async () => {
    useAuthStore.setState({
      token: 'token',
      refreshToken: 'refresh',
      user,
    });
    renderPage({ pathname: '/login', state: { from: '/tasks' } });

    await waitFor(() => {
      expect(screen.getByTestId('current-path')).toHaveTextContent('/tasks');
    });
  });
});
