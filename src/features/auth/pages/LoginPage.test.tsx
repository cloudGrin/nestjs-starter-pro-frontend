import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../stores/authStore';
import { UserStatus, type User } from '@/shared/types/user.types';
import { render, screen, waitFor, userEvent } from '@/test/test-utils';
import { LoginPage } from './LoginPage';

const user: User = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  nickname: '管理员',
  status: UserStatus.ACTIVE,
  roles: [],
  createdAt: '2026-05-10T00:00:00.000Z',
  updatedAt: '2026-05-10T00:00:00.000Z',
};

function CurrentPath() {
  const location = useLocation();

  return <div data-testid="current-path">{location.pathname}</div>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route
          path="/login"
          element={
            <>
              <LoginPage />
              <CurrentPath />
            </>
          }
        />
        <Route path="*" element={<CurrentPath />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      token: null,
      refreshToken: null,
      user: null,
      login: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('renders the single-column desktop login surface without the old left introduction', () => {
    const { container } = renderPage();

    expect(container.querySelector('.pc-login-page')).toBeInTheDocument();
    expect(container.querySelector('.pc-login-panel')).toBeInTheDocument();
    expect(screen.getByText('首次部署后请使用后端日志中的初始管理员密码登录')).toBeInTheDocument();
    expect(screen.queryByText('个人数据后台')).not.toBeInTheDocument();
    expect(screen.queryByText('RBAC')).not.toBeInTheDocument();
    expect(screen.queryByText('API Key')).not.toBeInTheDocument();
    expect(screen.queryByText('Files')).not.toBeInTheDocument();
  });

  it('uses browser credential autocomplete attributes', () => {
    renderPage();

    expect(screen.getByPlaceholderText('用户名或邮箱')).toHaveAttribute('autocomplete', 'username');
    expect(screen.getByPlaceholderText('密码')).toHaveAttribute('autocomplete', 'current-password');
  });

  it('trims account and redirects to root after successful login', async () => {
    const event = userEvent.setup();
    const login = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ login });
    renderPage();

    await event.type(screen.getByPlaceholderText('用户名或邮箱'), '  admin  ');
    await event.type(screen.getByPlaceholderText('密码'), 'secret');
    await event.click(screen.getByRole('button', { name: /登\s*录/ }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('admin', 'secret');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/');
    });
  });

  it('keeps the user on login page when login fails', async () => {
    const event = userEvent.setup();
    const login = vi.fn().mockRejectedValue(new Error('bad credentials'));
    useAuthStore.setState({ login });
    renderPage();

    await event.type(screen.getByPlaceholderText('用户名或邮箱'), 'admin');
    await event.type(screen.getByPlaceholderText('密码'), 'wrong');
    await event.click(screen.getByRole('button', { name: /登\s*录/ }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('admin', 'wrong');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/login');
      expect(screen.getByRole('button', { name: /登\s*录/ })).not.toBeDisabled();
    });
  });

  it('redirects authenticated users away from the login page', async () => {
    useAuthStore.setState({
      token: 'token',
      refreshToken: 'refresh',
      user,
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('current-path')).toHaveTextContent('/');
    });
  });
});
