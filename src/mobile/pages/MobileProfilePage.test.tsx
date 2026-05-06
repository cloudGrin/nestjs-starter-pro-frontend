import { MemoryRouter } from 'react-router-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { uploadFile } from '@/features/file/services/file.service';
import { UserStatus, type User } from '@/shared/types/user.types';
import { renderWithProviders } from '@/test/test-utils';
import { MobileProfilePage } from './MobileProfilePage';

vi.mock('@/features/auth/services/auth.service', () => ({
  authService: {
    updateProfile: vi.fn(),
  },
}));

vi.mock('@/features/file/services/file.service', () => ({
  uploadFile: vi.fn(),
}));

vi.mock('@/features/family/hooks/useFamily', () => ({
  useFamilyState: () => ({
    data: {
      unreadPosts: 0,
      unreadChatMessages: 0,
    },
  }),
}));

const user: User = {
  id: 1,
  username: 'dad',
  email: 'dad@example.com',
  realName: '老爸',
  nickname: '爸爸',
  avatar: 'https://example.com/old.png',
  status: UserStatus.ACTIVE,
  roles: [],
  createdAt: '2026-05-04T00:00:00.000Z',
  updatedAt: '2026-05-04T00:00:00.000Z',
};

function renderPage() {
  return renderWithProviders(
    <MemoryRouter>
      <MobileProfilePage />
    </MemoryRouter>
  );
}

describe('MobileProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:avatar-preview'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        naturalWidth = 800;
        naturalHeight = 600;

        set src(_value: string) {
          queueMicrotask(() => this.onload?.());
        }
      }
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback, type) => {
      callback(new Blob(['cropped-avatar'], { type: type || 'image/jpeg' }));
    });
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

  it('saves updated real name and nickname to the current profile', async () => {
    const event = userEvent.setup();
    renderPage();
    vi.mocked(authService.updateProfile).mockResolvedValue({
      ...user,
      realName: '妈妈',
      nickname: '妈咪',
    });

    await event.clear(screen.getByLabelText('姓名'));
    await event.type(screen.getByLabelText('姓名'), '妈妈');
    await event.clear(screen.getByLabelText('昵称'));
    await event.type(screen.getByLabelText('昵称'), '妈咪');
    await event.click(screen.getByRole('button', { name: '保存资料' }));

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalledWith({
        realName: '妈妈',
        nickname: '妈咪',
      });
    });
    expect(await screen.findByText('妈妈')).toBeInTheDocument();
  });

  it('submits null when optional profile names are cleared', async () => {
    const event = userEvent.setup();
    renderPage();

    await event.clear(screen.getByLabelText('姓名'));
    await event.clear(screen.getByLabelText('昵称'));
    await event.click(screen.getByRole('button', { name: '保存资料' }));

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalledWith({
        realName: null,
        nickname: null,
      });
    });
  });

  it('opens the crop sheet before uploading a selected avatar image', async () => {
    const { container } = renderPage();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });

    expect(await screen.findByText('裁剪头像')).toBeInTheDocument();
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it('uploads the cropped avatar and updates the current profile', async () => {
    const { container } = renderPage();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });

    fireEvent.click(await screen.findByRole('button', { name: '保存头像' }));

    await waitFor(() =>
      expect(uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'avatar-avatar.jpg',
          type: 'image/jpeg',
        }),
        expect.objectContaining({
          module: 'user-avatar',
          isPublic: true,
        })
      )
    );
    expect(authService.updateProfile).toHaveBeenCalledWith({
      avatar: 'https://example.com/new.png',
    });
    expect(await screen.findByAltText('老爸')).toHaveAttribute(
      'src',
      'https://example.com/new.png'
    );
  });

  it('does not upload when avatar cropping is cancelled', async () => {
    const { container } = renderPage();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });

    fireEvent.click(await screen.findByRole('button', { name: '取消' }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: '保存头像' })).not.toBeInTheDocument()
    );
    expect(uploadFile).not.toHaveBeenCalled();
    expect(authService.updateProfile).not.toHaveBeenCalled();
  });
});
