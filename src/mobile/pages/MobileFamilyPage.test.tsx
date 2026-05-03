import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileFamilyPage } from './MobileFamilyPage';
import type {
  FamilyChatMessage,
  FamilyPost,
} from '@/features/family/types/family.types';

const familyHooks = vi.hoisted(() => ({
  familyQueryKeys: {
    all: ['family'],
    posts: () => ['family', 'posts'],
    chatMessages: () => ['family', 'chat-messages'],
  },
  useFamilyPosts: vi.fn(),
  useCreateFamilyPost: vi.fn(),
  useCreateFamilyComment: vi.fn(),
  useLikeFamilyPost: vi.fn(),
  useUnlikeFamilyPost: vi.fn(),
  useFamilyChatMessages: vi.fn(),
  useCreateFamilyChatMessage: vi.fn(),
}));

const socketMocks = vi.hoisted(() => ({
  connectFamilySocket: vi.fn(() => () => undefined),
}));

const familyServiceMocks = vi.hoisted(() => ({
  familyService: {
    uploadFamilyMedia: vi.fn(),
  },
}));

vi.mock('@/features/family/hooks/useFamily', () => familyHooks);
vi.mock('@/features/family/realtime/familySocket', () => socketMocks);
vi.mock('@/features/family/services/family.service', () => familyServiceMocks);

const refetch = vi.fn().mockResolvedValue(undefined);
const createPost = vi.fn().mockResolvedValue(undefined);
const createComment = vi.fn().mockResolvedValue(undefined);
const likePost = vi.fn();
const unlikePost = vi.fn();
const createMessage = vi.fn().mockResolvedValue(undefined);

const post: FamilyPost = {
  id: 1,
  content: '宝宝今天会走路了',
  authorId: 2,
  author: { id: 2, username: 'dad', nickname: '爸爸' },
  media: [
    {
      id: 7,
      fileId: 17,
      mediaType: 'image',
      sort: 0,
      mimeType: 'image/jpeg',
      displayUrl: '/api/v1/files/17/access?token=webp',
      expiresAt: '2026-05-04T00:00:00.000Z',
    },
  ],
  comments: [
    {
      id: 3,
      postId: 1,
      content: '太棒了',
      authorId: 4,
      author: { id: 4, username: 'mom', nickname: '妈妈' },
      createdAt: '2026-05-04T08:00:00.000Z',
      updatedAt: '2026-05-04T08:00:00.000Z',
    },
  ],
  likeCount: 2,
  likedByMe: false,
  createdAt: '2026-05-04T07:00:00.000Z',
  updatedAt: '2026-05-04T07:00:00.000Z',
};

const message: FamilyChatMessage = {
  id: 9,
  content: '看这个视频',
  senderId: 2,
  sender: { id: 2, username: 'dad', nickname: '爸爸' },
  media: [
    {
      id: 10,
      fileId: 20,
      mediaType: 'video',
      sort: 0,
      mimeType: 'video/mp4',
      displayUrl: '/api/v1/files/20/access?token=video',
      expiresAt: '2026-05-04T00:00:00.000Z',
    },
  ],
  createdAt: '2026-05-04T09:00:00.000Z',
  updatedAt: '2026-05-04T09:00:00.000Z',
};

function renderPage(path = '/family') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <MobileFamilyPage />
    </MemoryRouter>
  );
}

describe('MobileFamilyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    familyHooks.useFamilyPosts.mockReturnValue({
      data: { items: [post], meta: { totalItems: 1 } },
      isLoading: false,
      refetch,
    });
    familyHooks.useCreateFamilyPost.mockReturnValue({
      mutateAsync: createPost,
      isPending: false,
    });
    familyHooks.useCreateFamilyComment.mockReturnValue({
      mutateAsync: createComment,
      isPending: false,
    });
    familyHooks.useLikeFamilyPost.mockReturnValue({ mutate: likePost });
    familyHooks.useUnlikeFamilyPost.mockReturnValue({ mutate: unlikePost });
    familyHooks.useFamilyChatMessages.mockReturnValue({
      data: { items: [message], meta: { totalItems: 1 } },
      isLoading: false,
      refetch,
    });
    familyHooks.useCreateFamilyChatMessage.mockReturnValue({
      mutateAsync: createMessage,
      isPending: false,
    });
    let uploadId = 100;
    familyServiceMocks.familyService.uploadFamilyMedia.mockImplementation(async (file: File) => ({
      id: uploadId++,
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    }));
  });

  it('shows the family circle with WebP image media and comments', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: '家庭' })).toBeInTheDocument();
    expect(screen.getByText('宝宝今天会走路了')).toBeInTheDocument();
    expect(screen.getByText('太棒了')).toBeInTheDocument();
    expect(screen.getByAltText('家庭图片')).toHaveAttribute(
      'src',
      '/api/v1/files/17/access?token=webp'
    );
  });

  it('publishes text posts and comments', async () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('记录家庭里的新鲜事'), {
      target: { value: '今天一起做饭' },
    });
    fireEvent.click(screen.getByRole('button', { name: '发布' }));

    await waitFor(() =>
      expect(createPost).toHaveBeenCalledWith({ content: '今天一起做饭', mediaFileIds: [] })
    );

    fireEvent.change(screen.getByPlaceholderText('写评论'), {
      target: { value: '我也想吃' },
    });
    fireEvent.click(screen.getByRole('button', { name: '评论' }));

    await waitFor(() =>
      expect(createComment).toHaveBeenCalledWith({ postId: 1, content: '我也想吃' })
    );
  });

  it('switches to family chat and sends text messages with video playback', async () => {
    renderPage('/family?tab=chat');

    expect(screen.getByText('看这个视频')).toBeInTheDocument();
    expect(document.querySelector('video')).toHaveAttribute(
      'src',
      '/api/v1/files/20/access?token=video'
    );

    fireEvent.change(screen.getByPlaceholderText('给家里人发消息'), {
      target: { value: '收到' },
    });
    fireEvent.click(screen.getByRole('button', { name: /发送/ }));

    await waitFor(() =>
      expect(createMessage).toHaveBeenCalledWith({ content: '收到', mediaFileIds: [] })
    );
  });

  it('uploads only the remaining family media slots', async () => {
    const { container } = renderPage();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const makeFiles = (count: number, prefix: string) =>
      Array.from(
        { length: count },
        (_, index) => new File(['x'], `${prefix}-${index}.jpg`, { type: 'image/jpeg' })
      );

    fireEvent.change(input, { target: { files: makeFiles(8, 'existing') } });
    await waitFor(() =>
      expect(familyServiceMocks.familyService.uploadFamilyMedia).toHaveBeenCalledTimes(8)
    );
    expect(await screen.findByText('existing-7.jpg')).toBeInTheDocument();

    fireEvent.change(input, { target: { files: makeFiles(9, 'extra') } });
    expect(await screen.findByText('extra-0.jpg')).toBeInTheDocument();

    expect(familyServiceMocks.familyService.uploadFamilyMedia).toHaveBeenCalledTimes(9);
  });
});
