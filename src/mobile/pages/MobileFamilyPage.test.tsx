import { readFileSync } from 'node:fs';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MobileFamilyChatPage,
  MobileFamilyComposePage,
  MobileFamilyPage,
} from './MobileFamilyPage';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { FamilyChatMessage, FamilyPost } from '@/features/family/types/family.types';

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

const queryClientMocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
}));

const familyServiceMocks = vi.hoisted(() => ({
  familyService: {
    uploadFamilyMedia: vi.fn(),
  },
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => queryClientMocks,
  };
});
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
  author: { id: 2, username: 'dad', nickname: '爸爸', avatar: 'https://example.com/dad.png' },
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
      parentCommentId: null,
      replyToUserId: null,
      content: '太棒了',
      authorId: 4,
      author: { id: 4, username: 'mom', nickname: '妈妈' },
      createdAt: '2026-05-04T08:00:00.000Z',
      updatedAt: '2026-05-04T08:00:00.000Z',
    },
    {
      id: 4,
      postId: 1,
      parentCommentId: 3,
      replyToUserId: 4,
      content: '我也觉得',
      authorId: 5,
      author: { id: 5, username: 'grandpa', nickname: '爷爷' },
      replyToUser: { id: 4, username: 'mom', nickname: '妈妈' },
      createdAt: '2026-05-04T08:05:00.000Z',
      updatedAt: '2026-05-04T08:05:00.000Z',
    },
  ],
  likeCount: 2,
  likedByMe: false,
  likedUsers: [
    { id: 4, username: 'mom', nickname: '妈妈', avatar: 'https://example.com/mom.png' },
    { id: 5, username: 'grandpa', nickname: '爷爷' },
  ],
  createdAt: '2026-05-04T07:00:00.000Z',
  updatedAt: '2026-05-04T07:00:00.000Z',
};

const message: FamilyChatMessage = {
  id: 9,
  content: '看这个视频',
  senderId: 4,
  sender: { id: 4, username: 'mom', nickname: '妈妈', avatar: 'https://example.com/mom.png' },
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
      <Routes>
        <Route path="/family" element={<MobileFamilyPage />} />
        <Route path="/family/compose" element={<MobileFamilyComposePage />} />
        <Route path="/family/posts/:id" element={<MobileFamilyPage />} />
        <Route path="/family/chat" element={<MobileFamilyChatPage />} />
      </Routes>
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
    useAuthStore.setState({
      token: 'token',
      user: {
        id: 2,
        username: 'dad',
        nickname: '爸爸',
        email: 'dad@example.com',
      } as never,
    });
  });

  it('shows the warmflow-style family circle home', () => {
    renderPage();

    expect(screen.getByRole('button', { name: /菜单/ })).toBeInTheDocument();
    expect(screen.getByText('家庭圈')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /发布家庭圈/ })).toBeInTheDocument();
    expect(screen.queryByText('首页')).not.toBeInTheDocument();
    expect(screen.queryByText('我的')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /家庭群聊/ })).toBeInTheDocument();
    expect(screen.getByText('宝宝今天会走路了')).toBeInTheDocument();
    expect(screen.getByText('太棒了')).toBeInTheDocument();
    expect(
      screen.getAllByText((_, element) => element?.textContent?.includes('我也觉得') ?? false)
    ).not.toHaveLength(0);
    expect(screen.getByAltText('家庭图片')).toHaveAttribute(
      'src',
      '/api/v1/files/17/access?token=webp'
    );
    expect(screen.getByAltText('妈妈')).toHaveAttribute('src', 'https://example.com/mom.png');
    expect(screen.queryByText('2 人喜欢')).not.toBeInTheDocument();
  });

  it('updates the feed like button immediately', () => {
    renderPage();

    const likeButton = screen.getByRole('button', { name: /点赞/ });
    fireEvent.click(likeButton);

    expect(likePost).toHaveBeenCalledWith(1, expect.any(Object));
    expect(likeButton).toHaveClass('active');
  });

  it('keeps family avatars visually consistent across feed likes and chat messages', () => {
    const { unmount } = renderPage('/family');

    expect(screen.getByAltText('妈妈')).toHaveClass('mobile-family-avatar small image');
    unmount();

    familyHooks.useFamilyChatMessages.mockReturnValue({
      data: {
        items: [
          {
            ...message,
            senderId: 4,
            sender: {
              id: 4,
              username: 'mom',
              nickname: '妈妈',
              avatar: 'https://example.com/mom.png',
            },
          },
        ],
        meta: { totalItems: 1 },
      },
      isLoading: false,
      refetch,
    });
    renderPage('/family/chat');
    expect(screen.getByAltText('妈妈')).toHaveClass('mobile-family-avatar small image');

    const css = readFileSync('src/mobile/styles.css', 'utf8');
    expect(css).not.toContain('.mobile-family-liked-users .mobile-family-avatar');
    expect(css).not.toContain('.mobile-family-feed-author span');
    expect(css).not.toContain('.mobile-family-author-main span');
    expect(css).not.toContain('.mobile-family-chat-meta span');
    expect(css).not.toContain('.mobile-family-hero-avatars .mobile-family-avatar');
    expect(css).not.toContain('.mobile-family-post-card');
    expect(css).not.toContain('.mobile-family-comments');
    expect(css).toContain('.mobile-family-avatar-letter');
    expect(css).toContain('color: #ffffff');

    const source = readFileSync('src/mobile/pages/MobileFamilyPage.tsx', 'utf8');
    const cssClasses = new Set(
      Array.from(css.matchAll(/\.([A-Za-z0-9_-]*mobile-family[A-Za-z0-9_-]*)/g)).map(
        (match) => match[1]
      )
    );
    const usedClasses = new Set(
      Array.from(source.matchAll(/mobile-family[-a-z0-9]+/g)).map((match) => match[0])
    );
    expect(Array.from(cssClasses).filter((className) => !usedClasses.has(className))).toEqual([]);
    expect(Array.from(usedClasses).filter((className) => !cssClasses.has(className))).toEqual([]);
  });

  it('invalidates inactive family caches on realtime events', () => {
    renderPage('/family');

    const callbacks = socketMocks.connectFamilySocket.mock.calls[0]?.[1] as {
      onPostCreated: () => void;
      onPostCommentCreated: () => void;
      onPostLikeChanged: () => void;
      onChatMessageCreated: () => void;
    };

    callbacks.onPostCreated();
    callbacks.onPostCommentCreated();
    callbacks.onPostLikeChanged();
    callbacks.onChatMessageCreated();

    expect(queryClientMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: familyHooks.familyQueryKeys.posts(),
    });
    expect(queryClientMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: familyHooks.familyQueryKeys.chatMessages(),
    });
  });

  it('keeps selected compose media local until publishing', async () => {
    const { container } = renderPage('/family/compose');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(screen.getByPlaceholderText('这一刻的想法...'), {
      target: { value: '今天一起做饭' },
    });
    fireEvent.change(input, {
      target: {
        files: [
          new File(['x'], 'meal-0.jpg', { type: 'image/jpeg' }),
          new File(['x'], 'meal-1.jpg', { type: 'image/jpeg' }),
        ],
      },
    });

    expect(await screen.findByText('meal-0.jpg')).toBeInTheDocument();
    expect(familyServiceMocks.familyService.uploadFamilyMedia).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '发布' }));

    await waitFor(() =>
      expect(familyServiceMocks.familyService.uploadFamilyMedia).toHaveBeenCalledTimes(2)
    );
    await waitFor(() =>
      expect(createPost).toHaveBeenCalledWith({ content: '今天一起做饭', mediaFileIds: [100, 101] })
    );
  });

  it('submits comments from the family feed', async () => {
    renderPage('/family');

    fireEvent.click(screen.getByRole('button', { name: /评论/ }));
    fireEvent.change(screen.getByPlaceholderText('说点什么吧...'), {
      target: { value: '我也想吃' },
    });
    fireEvent.click(screen.getByRole('button', { name: '发送' }));

    await waitFor(() =>
      expect(createComment).toHaveBeenCalledWith({ postId: 1, content: '我也想吃' })
    );
  });

  it('opens reply input from an existing comment', async () => {
    renderPage('/family');

    const commentButton = screen.getByText('太棒了').closest('button');
    expect(commentButton).toBeTruthy();
    fireEvent.click(commentButton!);

    await waitFor(() => expect(screen.getByPlaceholderText('回复 妈妈')).toHaveFocus());
    fireEvent.change(screen.getByPlaceholderText('回复 妈妈'), {
      target: { value: '我们周末再拍' },
    });
    fireEvent.click(screen.getByRole('button', { name: '发送' }));

    await waitFor(() =>
      expect(createComment).toHaveBeenCalledWith({
        postId: 1,
        content: '我们周末再拍',
        parentCommentId: 3,
      })
    );
  });

  it('shows the family chat route as a clean message thread and sends text messages', async () => {
    renderPage('/family/chat');

    expect(screen.getByRole('button', { name: /返回家庭圈/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '家庭群聊' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /更多/ })).toBeInTheDocument();
    expect(document.querySelector('.mobile-family-chat-page')).toHaveClass('wechat-warm');
    expect(document.querySelector('.mobile-family-chat-logo')).not.toBeInTheDocument();
    expect(screen.getByText('2026/5/4 17:00')).toBeInTheDocument();
    expect(screen.queryByText('发布了一条动态')).not.toBeInTheDocument();
    expect(screen.queryByText('留下了心情')).not.toBeInTheDocument();
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

  it('opens the chat attachment panel and keeps media local until sending', async () => {
    renderPage('/family/chat');

    expect(screen.queryByRole('button', { name: /照片\/视频/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /添加图片或视频/ }));
    expect(screen.getByRole('button', { name: /照片\/视频/ })).toBeInTheDocument();
  });

  it('uploads only the remaining chat media slots', async () => {
    const { container } = renderPage('/family/chat');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const makeFiles = (count: number, prefix: string) =>
      Array.from(
        { length: count },
        (_, index) => new File(['x'], `${prefix}-${index}.jpg`, { type: 'image/jpeg' })
      );

    fireEvent.change(input, { target: { files: makeFiles(8, 'existing') } });
    expect((await screen.findAllByLabelText(/移除 existing-7.jpg/)).length).toBeGreaterThan(0);
    expect(familyServiceMocks.familyService.uploadFamilyMedia).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { files: makeFiles(9, 'extra') } });
    expect((await screen.findAllByLabelText(/移除 extra-0.jpg/)).length).toBeGreaterThan(0);
    expect(screen.queryByLabelText(/移除 extra-1.jpg/)).not.toBeInTheDocument();
  });
});
