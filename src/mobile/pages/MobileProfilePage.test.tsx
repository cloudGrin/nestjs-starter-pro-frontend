import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { uploadFile } from '@/features/file/services/file.service';
import { UserStatus, type User } from '@/shared/types/user.types';
import { MobileProfilePage } from './MobileProfilePage';

vi.mock('@/features/auth/services/auth.service', () => ({
  authService: {
    updateProfile: vi.fn(),
  },
}));

vi.mock('@/features/file/services/file.service', () => ({
  uploadFile: vi.fn(),
}));

const user: User = {
  id: 1,
  username: 'dad',
  email: 'dad@example.com',
  nickname: '爸爸',
  avatar: 'https://example.com/old.png',
  status: UserStatus.ACTIVE,
  roles: [],
  createdAt: '2026-05-04T00:00:00.000Z',
  updatedAt: '2026-05-04T00:00:00.000Z',
};

function renderPage() {
  return render(
    <MemoryRouter>
      <MobileProfilePage />
    </MemoryRouter>
  );
}

describe('MobileProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      token: 'token',
      refreshToken: 'refresh',
      user,
    });
    vi.mocked(uploadFile).mockResolvedValue({
      id: 9,
      originalName: 'avatar.jpg',
      filename: 'avatar.jpg',
      path: 'avatar.jpg',
      url: 'https://example.com/new.png',
      mimeType: 'image/jpeg',
      size: 123,
      category: 'image',
      storage: 'local',
      module: 'user-avatar',
      isPublic: true,
      uploaderId: 1,
      createdAt: '2026-05-04T00:00:00.000Z',
      updatedAt: '2026-05-04T00:00:00.000Z',
    });
    vi.mocked(authService.updateProfile).mockResolvedValue({
      ...user,
      avatar: 'https://example.com/new.png',
    });
  });

  it('uploads a new avatar and updates the current profile', async () => {
    const { container } = renderPage();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });

    await waitFor(() =>
      expect(uploadFile).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({
          module: 'user-avatar',
          isPublic: true,
        })
      )
    );
    expect(authService.updateProfile).toHaveBeenCalledWith({
      avatar: 'https://example.com/new.png',
    });
    expect(await screen.findByAltText('爸爸')).toHaveAttribute(
      'src',
      'https://example.com/new.png'
    );
  });
});
