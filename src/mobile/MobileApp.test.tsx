import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { MobileProtectedRoute } from './MobileApp';

vi.mock('./MobileShell', () => ({
  MobileShell: () => null,
}));

vi.mock('./pages/MobileFamilyPage', () => ({
  MobileFamilyChatPage: () => null,
  MobileFamilyComposePage: () => null,
  MobileFamilyPage: () => null,
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
});
