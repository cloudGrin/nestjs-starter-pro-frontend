import {
  MemoryRouter,
  Route,
  RouterProvider,
  Routes,
  createMemoryRouter,
  useLocation,
} from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { MobileProtectedRoute } from './MobileApp';
import { mobileRoutes } from './mobileRoutes';

vi.mock('./pages/MobileFamilyPage', () => ({
  MobileFamilyChatPage: () => <div data-testid="family-chat-page" />,
  MobileFamilyComposePage: () => <div data-testid="family-compose-page" />,
  MobileFamilyPage: () => <div data-testid="family-page" />,
}));

vi.mock('./pages/MobileLoginPage', () => ({
  MobileLoginPage: () => <div data-testid="mobile-login-page" />,
}));

function LoginState() {
  const location = useLocation();
  const state = location.state as { from?: string } | null;

  return <div data-testid="login-from">{state?.from}</div>;
}

describe('MobileProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      token: null,
      refreshToken: null,
      user: null,
    });
  });

  it('preserves query and hash when redirecting unauthenticated users to login', async () => {
    render(
      <MemoryRouter initialEntries={['/tasks?view=today#section']}>
        <Routes>
          <Route path="/tasks" element={<MobileProtectedRoute />} />
          <Route path="/login" element={<LoginState />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-from')).toHaveTextContent('/tasks?view=today#section');
    });
  });

  it('allows unauthenticated users to open the family preview route', async () => {
    const router = createMemoryRouter(mobileRoutes, { initialEntries: ['/family'] });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId('family-page')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('login-from')).not.toBeInTheDocument();
  });
});
