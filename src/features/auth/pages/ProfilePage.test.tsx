import { App } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor, screen, renderWithProviders, userEvent, setMockUser } from '@/test/test-utils';
import { ProfilePage } from './ProfilePage';
import { authService } from '../services/auth.service';
import type { User } from '@/shared/types/user.types';

vi.mock('../services/auth.service', () => ({
  authService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}));

vi.mock('@/shared/hooks/useBreadcrumb', () => ({
  useBreadcrumb: () => [],
}));

const profile = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  realName: '系统管理员',
  nickname: 'Home Admin',
  phone: '+8613800138000',
  gender: 'male',
  birthday: '1990-01-01',
  address: 'Shanghai',
  bio: 'Personal admin',
  avatar: 'https://example.com/avatar.png',
  status: 'active',
  roles: [],
  createdAt: '2026-04-27T00:00:00.000Z',
  updatedAt: '2026-04-27T00:00:00.000Z',
} satisfies User;

function renderProfilePage() {
  return renderWithProviders(
    <App>
      <MemoryRouter initialEntries={['/profile']}>
        <ProfilePage />
      </MemoryRouter>
    </App>
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockUser(profile);
    vi.mocked(authService.getProfile).mockResolvedValue(profile);
    vi.mocked(authService.updateProfile).mockResolvedValue(profile);
  });

  it('重置资料表单时恢复后端加载的资料', async () => {
    const user = userEvent.setup();

    renderProfilePage();

    const nicknameInput = await screen.findByDisplayValue('Home Admin');
    await user.clear(nicknameInput);
    await user.type(nicknameInput, 'Changed');

    await user.click(screen.getByRole('button', { name: /重\s*置/ }));

    expect(screen.getByDisplayValue('Home Admin')).toBeInTheDocument();
  });

  it('清空可选资料字段时提交 null 以便后端清空旧值', async () => {
    const user = userEvent.setup();

    renderProfilePage();

    const addressInput = await screen.findByDisplayValue('Shanghai');
    await user.clear(addressInput);
    await user.click(screen.getByRole('button', { name: '保存资料' }));

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ address: null })
      );
    });
  });
});
