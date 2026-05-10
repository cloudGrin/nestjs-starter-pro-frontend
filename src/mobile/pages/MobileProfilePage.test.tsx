import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from 'antd-mobile';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { uploadFile } from '@/features/file/services/file.service';
import { UserStatus, type User } from '@/shared/types/user.types';
import { createTestQueryClient } from '@/test/test-utils';
import { clearMobilePersistedQueryCache } from '../pwa/queryPersistence';
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

vi.mock('@/features/notification/hooks/useNotifications', () => ({
  useUnreadNotifications: () => ({ data: [] }),
}));

vi.mock('../pwa/queryPersistence', () => ({
  clearMobilePersistedQueryCache: vi.fn(),
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

let canvasContext: {
  drawImage: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
  scale: ReturnType<typeof vi.fn>;
  rotate: ReturnType<typeof vi.fn>;
  imageSmoothingEnabled: boolean;
  imageSmoothingQuality: ImageSmoothingQuality;
};

function renderPage() {
  const queryClient = createTestQueryClient();

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MobileProfilePage />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  };
}

function firePointerEvent(
  target: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  options: { pointerId: number; clientX: number; clientY: number }
) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, options);
  fireEvent(target, event);
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

describe('MobileProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Toast.clear();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:avatar-preview'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      if (this instanceof HTMLElement && this.classList.contains('mobile-avatar-crop-frame')) {
        return {
          width: 240,
          height: 240,
          top: 0,
          right: 240,
          bottom: 240,
          left: 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
      }

      return {
        width: 0,
        height: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      };
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
    canvasContext = {
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      canvasContext as unknown as CanvasRenderingContext2D
    );
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

    expect(screen.queryByLabelText('姓名')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '更换头像' })).not.toBeInTheDocument();
    expect(document.querySelector('.mobile-profile-name')).toHaveTextContent('爸爸');
    await event.click(screen.getByRole('button', { name: /编辑资料/ }));
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
    expect(await screen.findByText('妈咪')).toBeInTheDocument();
  });

  it('submits null when optional profile names are cleared', async () => {
    const event = userEvent.setup();
    renderPage();

    await event.click(screen.getByRole('button', { name: /编辑资料/ }));
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

  it('clears mobile query caches when logging out', async () => {
    const event = userEvent.setup();
    useAuthStore.setState({
      logout: vi.fn().mockResolvedValue(undefined),
    });
    const { queryClient } = renderPage();
    const clearQueryCache = vi.spyOn(queryClient, 'clear');

    await event.click(screen.getByRole('button', { name: '退出登录' }));

    await waitFor(() => {
      expect(clearQueryCache).toHaveBeenCalled();
      expect(clearMobilePersistedQueryCache).toHaveBeenCalled();
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

  it('accepts selected avatar images when mobile browsers omit the file MIME type', async () => {
    const { container } = renderPage();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(['avatar'], 'avatar.heic', { type: '' })] },
    });

    expect(await screen.findByText('裁剪头像')).toBeInTheDocument();
  });

  it('keeps unsaved profile edits when avatar cropping is cancelled from the edit sheet', async () => {
    const event = userEvent.setup();
    const { container } = renderPage();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await event.click(screen.getByRole('button', { name: /编辑资料/ }));
    await event.clear(screen.getByLabelText('姓名'));
    await event.type(screen.getByLabelText('姓名'), '还没保存的姓名');

    fireEvent.change(input, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });
    await screen.findByText('裁剪头像');
    const cancelButtons = screen.getAllByRole('button', { name: '取消' });
    fireEvent.click(cancelButtons[cancelButtons.length - 1]);

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: '保存头像' })).not.toBeInTheDocument()
    );
    expect(screen.getByLabelText('姓名')).toHaveValue('还没保存的姓名');
  });

  it('keeps the avatar crop popup above the profile edit popup after reopening it', async () => {
    const event = userEvent.setup();
    const { container } = renderPage();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });
    await screen.findByText('裁剪头像');
    fireEvent.click(screen.getByRole('button', { name: '关闭' }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: '保存头像' })).not.toBeInTheDocument()
    );

    await event.click(screen.getByRole('button', { name: /编辑资料/ }));
    fireEvent.change(input, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });
    await screen.findByText('裁剪头像');

    const cropPopup = document.querySelector('.mobile-avatar-crop-sheet')?.closest('.adm-popup');

    expect(cropPopup).toBeInstanceOf(HTMLElement);
    expect((cropPopup as HTMLElement).style.getPropertyValue('--z-index')).toBe('1200');
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
    expect(await screen.findByAltText('爸爸')).toHaveAttribute(
      'src',
      'https://example.com/new.png'
    );
  });

  it('keeps unsaved profile edits when the avatar is saved from the edit sheet', async () => {
    const event = userEvent.setup();
    const { container } = renderPage();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    vi.mocked(authService.updateProfile).mockResolvedValue({
      ...user,
      realName: '服务端姓名',
      avatar: 'https://example.com/new.png',
    });

    await event.click(screen.getByRole('button', { name: /编辑资料/ }));
    await event.clear(screen.getByLabelText('姓名'));
    await event.type(screen.getByLabelText('姓名'), '还没保存的姓名');

    fireEvent.change(input, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });
    fireEvent.click(await screen.findByRole('button', { name: '保存头像' }));

    await waitFor(() =>
      expect(authService.updateProfile).toHaveBeenCalledWith({
        avatar: 'https://example.com/new.png',
      })
    );
    expect(screen.getByLabelText('姓名')).toHaveValue('还没保存的姓名');
  });

  it('uses the measured crop frame size when saving the avatar', async () => {
    const { container } = renderPage();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });

    fireEvent.click(await screen.findByRole('button', { name: '保存头像' }));

    await waitFor(() => expect(uploadFile).toHaveBeenCalled());
    expect(canvasContext.scale).toHaveBeenCalledWith(512 / 240, 512 / 240);
  });

  it('does not close the crop sheet when the popup mask is tapped', async () => {
    const { container } = renderPage();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });
    await screen.findByText('裁剪头像');

    const mask = await waitFor(() => {
      const element = document.querySelector('.adm-popup .adm-mask');
      expect(element).toBeInTheDocument();
      return element;
    });
    fireEvent.click(mask!);

    expect(screen.getByRole('button', { name: '保存头像' })).toBeInTheDocument();
  });

  it('locks crop controls while the avatar is uploading', async () => {
    const uploadDeferred = createDeferred<Awaited<ReturnType<typeof uploadFile>>>();
    vi.mocked(uploadFile).mockReturnValue(uploadDeferred.promise);
    const { container } = renderPage();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });
    fireEvent.click(await screen.findByRole('button', { name: '保存头像' }));

    await waitFor(() => expect(uploadFile).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: '关闭' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '重置' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /左旋/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /右旋/ })).toBeDisabled();
    expect(screen.getByLabelText('缩放')).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '关闭' }));

    expect(screen.getByText('裁剪头像')).toBeInTheDocument();
    uploadDeferred.resolve(undefined as unknown as Awaited<ReturnType<typeof uploadFile>>);
  });

  it('locks the profile edit sheet while profile changes are saving', async () => {
    const event = userEvent.setup();
    const saveDeferred = createDeferred<Awaited<ReturnType<typeof authService.updateProfile>>>();
    vi.mocked(authService.updateProfile).mockReturnValue(saveDeferred.promise);
    renderPage();

    await event.click(screen.getByRole('button', { name: /编辑资料/ }));
    await event.click(screen.getByRole('button', { name: '保存资料' }));

    await waitFor(() => expect(authService.updateProfile).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: '关闭' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '关闭' }));

    expect(screen.getByLabelText('姓名')).toBeInTheDocument();
    saveDeferred.resolve(user);
  });

  it('supports pinch zooming the crop preview', async () => {
    const { container } = renderPage();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });
    await screen.findByText('裁剪头像');

    const frame = document.querySelector('.mobile-avatar-crop-frame') as HTMLElement;
    firePointerEvent(frame, 'pointerdown', { pointerId: 1, clientX: 90, clientY: 120 });
    firePointerEvent(frame, 'pointerdown', { pointerId: 2, clientX: 150, clientY: 120 });
    firePointerEvent(frame, 'pointermove', { pointerId: 2, clientX: 210, clientY: 120 });

    await waitFor(() =>
      expect(Number((screen.getByLabelText('缩放') as HTMLInputElement).value)).toBeGreaterThan(1)
    );
  });

  it('rotates the cropped avatar before saving', async () => {
    const { container } = renderPage();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });

    fireEvent.click(await screen.findByRole('button', { name: /右旋/ }));
    fireEvent.click(screen.getByRole('button', { name: '保存头像' }));

    await waitFor(() => expect(uploadFile).toHaveBeenCalled());
    expect(canvasContext.rotate).toHaveBeenCalledWith(Math.PI / 2);
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
