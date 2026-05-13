import { readFileSync } from 'node:fs';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog, Toast } from 'antd-mobile';
import {
  MobileFamilyChatPage,
  MobileFamilyComposePage,
  MobileFamilyPage,
} from './MobileFamilyPage';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { appConfig } from '@/shared/config/app.config';
import type { FamilyChatMessage, FamilyPost } from '@/features/family/types/family.types';
import { requestMobileAppReload, setMobileAppReloadBlocked } from '@/mobile/pwa/appUpdate';

const familyHooks = vi.hoisted(() => ({
  familyQueryKeys: {
    all: ['family'],
    posts: () => ['family', 'posts'],
    postList: (params: unknown) => ['family', 'posts', params],
    chatMessages: () => ['family', 'chat-messages'],
    chatMessageList: (params: unknown) => ['family', 'chat-messages', params],
    state: () => ['family', 'state'],
    postPreview: () => ['family', 'posts', 'preview'],
    babyPreview: () => ['family', 'baby', 'preview'],
  },
  useFamilyPosts: vi.fn(),
  useBabyOverview: vi.fn(),
  useFamilyState: vi.fn(),
  useCreateFamilyPost: vi.fn(),
  useCreateFamilyComment: vi.fn(),
  useDeleteFamilyPost: vi.fn(),
  useDeleteFamilyComment: vi.fn(),
  useLikeFamilyPost: vi.fn(),
  useUnlikeFamilyPost: vi.fn(),
  useFamilyChatMessages: vi.fn(),
  useCreateFamilyChatMessage: vi.fn(),
  useCreateBabyBirthdayContribution: vi.fn(),
}));

const socketMocks = vi.hoisted(() => ({
  connectFamilySocket: vi.fn(() => () => undefined),
}));

const queryClientMocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  setQueryData: vi.fn(),
}));

const familyServiceMocks = vi.hoisted(() => ({
  familyService: {
    getPosts: vi.fn(),
    getChatMessages: vi.fn(),
    getPublicPreviewPosts: vi.fn(),
    getPublicBabyOverview: vi.fn(),
    uploadFamilyMedia: vi.fn(),
  },
}));

const mobileUiMocks = vi.hoisted(() => ({
  dialogConfirm: vi.fn((_options?: unknown) => Promise.resolve(false)),
}));

vi.mock('antd-mobile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd-mobile')>();
  return {
    ...actual,
    PullToRefresh: ({
      children,
      onRefresh,
    }: {
      children: ReactNode;
      onRefresh: () => void | Promise<void>;
    }) => (
      <div>
        <button type="button" onClick={() => void onRefresh()}>
          mock pull refresh
        </button>
        {children}
      </div>
    ),
  };
});

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
const babyRefetch = vi.fn().mockResolvedValue(undefined);
const createPost = vi.fn().mockResolvedValue(undefined);
const createComment = vi.fn().mockResolvedValue(undefined);
const deletePost = vi.fn().mockResolvedValue(undefined);
const deleteComment = vi.fn().mockResolvedValue(undefined);
const likePost = vi.fn();
const unlikePost = vi.fn();
const createMessage = vi.fn().mockResolvedValue(undefined);
const markPostsReadAsync = vi.fn().mockResolvedValue(undefined);
const markChatReadAsync = vi.fn().mockResolvedValue(undefined);

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
        <Route path="/login" element={<LoginState />} />
      </Routes>
    </MemoryRouter>
  );
}

function LoginState() {
  const location = useLocation();
  const state = location.state as { from?: string } | null;

  return <div data-testid="login-from">{state?.from}</div>;
}

function readMobileCss() {
  return readFileSync('src/mobile/styles.css', 'utf8');
}

function cssRule(selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return readMobileCss().match(new RegExp(`${escapedSelector} \\{[\\s\\S]*?\\n\\}`))?.[0] ?? '';
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

function createSizedFile(name: string, type: string, size: number) {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { configurable: true, value: size });
  return file;
}

function mockVideoMetadata(duration: number) {
  const originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
    const element = originalCreateElement(tagName, options);
    if (tagName.toLowerCase() === 'video') {
      Object.defineProperty(element, 'duration', { configurable: true, value: duration });
      Object.defineProperty(element, 'videoWidth', { configurable: true, value: 1280 });
      Object.defineProperty(element, 'videoHeight', { configurable: true, value: 720 });
      element.load = vi.fn(() => {
        setTimeout(() => element.dispatchEvent(new Event('loadedmetadata')), 0);
      });
    }
    return element;
  });
}

describe('MobileFamilyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appConfig.familyMediaUploadMode = 'oss';
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn((file: File) => `blob:${file.name}:${file.size}`),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    vi.stubGlobal('createImageBitmap', undefined);
    setMobileAppReloadBlocked(false);
    mobileUiMocks.dialogConfirm.mockResolvedValue(false);
    vi.spyOn(Dialog, 'confirm').mockImplementation(mobileUiMocks.dialogConfirm);
    vi.spyOn(Toast, 'show').mockImplementation(() => undefined as never);
    refetch.mockResolvedValue({ data: { items: [post], meta: { totalItems: 1 } } });
    babyRefetch.mockResolvedValue(undefined);
    familyHooks.useFamilyPosts.mockReturnValue({
      data: { items: [post], meta: { totalItems: 1 } },
      isLoading: false,
      refetch,
    });
    familyHooks.useBabyOverview.mockReturnValue({
      data: { profile: null, latestGrowthRecord: null, growthRecords: [], birthdays: [] },
      isLoading: false,
      refetch: babyRefetch,
    });
    familyHooks.useFamilyState.mockReturnValue({
      data: {
        unreadPosts: 0,
        unreadChatMessages: 0,
        latestPostId: 1,
        latestChatMessageId: 9,
        lastReadPostId: 1,
        lastReadChatMessageId: 9,
      },
      markPostsReadAsync,
      markChatReadAsync,
    });
    familyHooks.useCreateFamilyPost.mockReturnValue({
      mutateAsync: createPost,
      isPending: false,
    });
    familyHooks.useCreateFamilyComment.mockReturnValue({
      mutateAsync: createComment,
      isPending: false,
    });
    familyHooks.useDeleteFamilyPost.mockReturnValue({
      mutateAsync: deletePost,
      isPending: false,
    });
    familyHooks.useDeleteFamilyComment.mockReturnValue({
      mutateAsync: deleteComment,
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
    familyHooks.useCreateBabyBirthdayContribution.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    queryClientMocks.setQueryData.mockImplementation((_key, updater) => {
      if (typeof updater === 'function') {
        return updater({ items: [post], meta: { totalItems: 1 } });
      }
      return updater;
    });
    familyServiceMocks.familyService.getPosts.mockResolvedValue({
      items: [{ ...post, id: 2, content: '新动态' }],
      meta: { totalItems: 1 },
    });
    familyServiceMocks.familyService.getChatMessages.mockResolvedValue({
      items: [{ ...message, id: 10, content: '新消息' }],
      meta: { totalItems: 1 },
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
    familyHooks.useBabyOverview.mockReturnValue({
      data: {
        profile: {
          id: 1,
          nickname: '小葡萄',
          birthDate: '2026-02-01',
          avatarUrl: null,
        },
        latestGrowthRecord: {
          id: 12,
          measuredAt: '2026-05-01',
          heightCm: 61.5,
          weightKg: 6.8,
          remark: null,
        },
        growthRecords: [],
        birthdays: [],
      },
      isLoading: false,
      refetch: babyRefetch,
    });

    renderPage();

    expect(screen.getByRole('button', { name: /菜单/ })).toBeInTheDocument();
    expect(screen.getByText('家庭圈')).toBeInTheDocument();
    expect(document.querySelector('.mobile-family-home-header')).toHaveClass(
      'mobile-family-top-bar'
    );
    expect(screen.getByRole('button', { name: /发布家庭圈/ })).toBeInTheDocument();
    expect(screen.queryByText('首页')).not.toBeInTheDocument();
    expect(screen.queryByText('我的')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /家庭群聊/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /更多/ })).toHaveClass(
      'mobile-baby-summary-card',
      'compact'
    );
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

  it('shows public baby summary and the first five family posts to guests', () => {
    const previewPosts = Array.from({ length: 5 }, (_, index) => ({
      ...post,
      id: index + 1,
      content: `公开预览动态 ${index + 1}`,
      authorId: index + 20,
    }));
    useAuthStore.setState({ token: null, refreshToken: null, user: null });
    familyHooks.useBabyOverview.mockReturnValue({
      data: {
        profile: {
          id: 1,
          nickname: '小葡萄',
          birthDate: '2026-02-01',
          avatarUrl: null,
        },
        latestGrowthRecord: {
          id: 12,
          measuredAt: '2026-05-01',
          heightCm: 61.5,
          weightKg: 6.8,
          remark: null,
        },
        growthRecords: [],
        birthdays: [],
      },
      isLoading: false,
      refetch: babyRefetch,
    });
    familyHooks.useFamilyPosts.mockReturnValue({
      data: { items: previewPosts, meta: { totalItems: 6 } },
      isLoading: false,
      refetch,
    });

    renderPage('/family');

    expect(screen.getByText('小葡萄')).toBeInTheDocument();
    expect(screen.getByText('公开预览动态 1')).toBeInTheDocument();
    expect(screen.getByText('公开预览动态 5')).toBeInTheDocument();
    expect(screen.queryByText('公开预览动态 6')).not.toBeInTheDocument();
    expect(screen.getByText('登录后继续查看更多家庭动态')).toBeInTheDocument();
    expect(markPostsReadAsync).not.toHaveBeenCalled();
  });

  it('redirects guest family actions to mobile login with the intended destination', () => {
    useAuthStore.setState({ token: null, refreshToken: null, user: null });

    const view = renderPage('/family');
    fireEvent.click(screen.getByRole('button', { name: /家庭群聊/ }));
    expect(screen.getByTestId('login-from')).toHaveTextContent('/family/chat');
    view.unmount();

    renderPage('/family');
    fireEvent.click(screen.getByRole('button', { name: /发布家庭圈/ }));
    expect(screen.getByTestId('login-from')).toHaveTextContent('/family/compose');
  });

  it('redirects guest baby summary and feed interactions to login', () => {
    useAuthStore.setState({ token: null, refreshToken: null, user: null });
    familyHooks.useBabyOverview.mockReturnValue({
      data: {
        profile: {
          id: 1,
          nickname: '小葡萄',
          birthDate: '2026-02-01',
          avatarUrl: null,
        },
        latestGrowthRecord: null,
        growthRecords: [],
        birthdays: [],
      },
      isLoading: false,
      refetch: babyRefetch,
    });

    const view = renderPage('/family');
    fireEvent.click(screen.getByRole('button', { name: /更多/ }));
    expect(screen.getByTestId('login-from')).toHaveTextContent('/family/baby');
    view.unmount();

    renderPage('/family');
    fireEvent.click(screen.getByRole('button', { name: /点赞/ }));
    expect(screen.getByTestId('login-from')).toHaveTextContent('/family');
    expect(likePost).not.toHaveBeenCalled();
  });

  it('refreshes the baby summary card together with the family feed', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'mock pull refresh' }));

    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(babyRefetch).toHaveBeenCalled();
  });

  it('prefers nicknames over real names in family user display', () => {
    familyHooks.useFamilyPosts.mockReturnValue({
      data: {
        items: [
          {
            ...post,
            author: {
              ...post.author!,
              realName: '王文瀚',
            },
          },
        ],
        meta: { totalItems: 1 },
      },
      isLoading: false,
      refetch,
    });

    renderPage();

    expect(document.querySelector('.mobile-family-feed-author-main strong')).toHaveTextContent(
      '爸爸'
    );
    expect(screen.queryByText('王文瀚')).not.toBeInTheDocument();
  });

  it('updates the feed like button immediately', () => {
    renderPage();

    const likeButton = screen.getByRole('button', { name: /点赞/ });
    fireEvent.click(likeButton);

    expect(likePost).toHaveBeenCalledWith(1, expect.any(Object));
    expect(likeButton).toHaveClass('active');
  });

  it('uses the family-only top bar on home, compose, and chat routes', () => {
    const home = renderPage('/family');
    expect(document.querySelector('.mobile-family-home-header')).toHaveClass(
      'mobile-family-top-bar'
    );
    home.unmount();

    const compose = renderPage('/family/compose');
    expect(screen.getByRole('heading', { name: '发布动态' })).toBeInTheDocument();
    expect(document.querySelector('.mobile-family-compose-header')).toHaveClass(
      'mobile-family-top-bar'
    );
    expect(screen.getByRole('button', { name: '发布' })).not.toHaveClass('adm-button-primary');
    compose.unmount();

    renderPage('/family/chat');
    expect(document.querySelector('.mobile-family-chat-header')).toHaveClass(
      'mobile-family-top-bar'
    );
  });

  it('keeps media post actions below content instead of overlapping images', () => {
    renderPage();

    const card = screen.getByText('宝宝今天会走路了').closest('article');
    expect(card).toHaveClass('has-media');

    const mediaGrid = card?.querySelector('.mobile-family-media-grid');
    const content = card?.querySelector('.mobile-family-feed-content');
    const reactions = card?.querySelector('.mobile-family-feed-reactions');

    expect(mediaGrid).toBeTruthy();
    expect(content).toBeTruthy();
    expect(reactions).toBeTruthy();
    expect(
      Boolean(content!.compareDocumentPosition(reactions!) & Node.DOCUMENT_POSITION_FOLLOWING)
    ).toBe(true);

    const css = readMobileCss();
    const hasMediaReactionsBlock =
      css.match(
        /\.mobile-family-feed-card\.has-media \.mobile-family-feed-reactions \{[\s\S]*?\n\}/
      )?.[0] ?? '';
    expect(hasMediaReactionsBlock).not.toContain('margin-top: -');
  });

  it('uses the same reaction button UI for text and media posts', () => {
    const css = readMobileCss();

    expect(css).not.toContain('.mobile-family-feed-card.text-only .mobile-family-feed-reactions');
    expect(css).not.toContain('.mobile-family-feed-card.text-only .mobile-family-like-action');
    expect(css).not.toContain('.mobile-family-feed-card.text-only .mobile-family-comment-action');
  });

  it('places the like button before liked users and keeps comment on the right', () => {
    renderPage();

    const css = readMobileCss();
    const card = screen.getByText('宝宝今天会走路了').closest('article');
    const reactions = card?.querySelector('.mobile-family-feed-reactions');
    const likeCluster = card?.querySelector('.mobile-family-like-cluster');
    const likeAction = card?.querySelector('.mobile-family-like-action');
    const likedUsers = card?.querySelector('.mobile-family-liked-users');
    const commentAction = card?.querySelector('.mobile-family-comment-action');

    expect(reactions?.firstElementChild).toBe(likeCluster);
    expect(likeCluster?.firstElementChild).toBe(likeAction);
    expect(
      Boolean(likeAction!.compareDocumentPosition(likedUsers!) & Node.DOCUMENT_POSITION_FOLLOWING)
    ).toBe(true);
    expect(reactions?.lastElementChild).toBe(commentAction);
    expect(commentAction?.querySelector('.mobile-family-action-label')).not.toBeInTheDocument();
    expect(commentAction?.querySelector('.mobile-family-sr')).toHaveTextContent('评论');

    expect(cssRule('.mobile-family-like-cluster')).toContain('display: inline-flex;');
    expect(cssRule('.mobile-family-comment-action')).toContain('width: 40px;');
    expect(cssRule('.mobile-family-comment-action')).toContain('border-radius: 50%;');
    expect(css).not.toContain('.mobile-family-comment-action .mobile-family-action-label');
    expect(css).not.toContain('min-width: 58px;');
  });

  it('switches to the next image in feed media preview', () => {
    const multiImagePost: FamilyPost = {
      ...post,
      media: [0, 1, 2].map((index) => ({
        ...post.media[0],
        id: 70 + index,
        fileId: 170 + index,
        sort: index,
        displayUrl: `/api/v1/files/${170 + index}/access?token=image-${index}`,
      })),
    };
    familyHooks.useFamilyPosts.mockReturnValue({
      data: { items: [multiImagePost], meta: { totalItems: 1 } },
      isLoading: false,
      refetch,
    });

    renderPage();

    fireEvent.click(screen.getAllByAltText('家庭图片')[0].closest('button')!);
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(document.querySelector('.mobile-family-preview-media img')).toHaveAttribute(
      'src',
      '/api/v1/files/170/access?token=image-0'
    );

    fireEvent.click(screen.getByRole('button', { name: /下一张/ }));

    expect(screen.getByText('2/3')).toBeInTheDocument();
    expect(document.querySelector('.mobile-family-preview-media img')).toHaveAttribute(
      'src',
      '/api/v1/files/171/access?token=image-1'
    );
    expect(document.querySelectorAll('.mobile-family-preview-dot')).toHaveLength(3);
    expect(document.querySelectorAll('.mobile-family-preview-dot')[1]).toHaveClass('active');

    fireEvent.touchStart(document.querySelector('.mobile-family-preview')!, {
      touches: [{ clientX: 260, clientY: 180 }],
    });
    fireEvent.touchEnd(document.querySelector('.mobile-family-preview')!, {
      changedTouches: [{ clientX: 40, clientY: 188 }],
    });

    expect(screen.getByText('3/3')).toBeInTheDocument();
    expect(document.querySelector('.mobile-family-preview-media img')).toHaveAttribute(
      'src',
      '/api/v1/files/172/access?token=image-2'
    );
    expect(document.querySelectorAll('.mobile-family-preview-dot')[2]).toHaveClass('active');
    expect(cssRule('.mobile-family-preview-arrow')).toContain('z-index: 1;');
    expect(cssRule('.mobile-family-preview-dots')).toContain(
      'bottom: calc(24px + env(safe-area-inset-bottom));'
    );
  });

  it('keeps family headers vertically aligned through the shared top bar', () => {
    const topBar = cssRule('.mobile-family-top-bar');

    expect(topBar).toContain('grid-template-columns: 54px minmax(0, 1fr) 54px;');
    expect(topBar).toContain('min-height: 88px;');
    expect(topBar).toContain('padding: calc(14px + env(safe-area-inset-top)) 18px 18px;');
  });

  it('aligns family home menu and chat back buttons to the same left edge', () => {
    expect(cssRule('.mobile-family-top-bar-slot.start')).toContain('justify-self: start;');
    expect(cssRule('.mobile-family-top-bar-slot.end')).toContain('justify-self: end;');
    expect(cssRule('.mobile-family-icon-button')).toContain('width: 44px;');
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

    const css = readMobileCss();
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
      onPostCreated: (event: unknown) => void;
      onPostCommentCreated: () => void;
      onPostLikeChanged: () => void;
      onChatMessageCreated: (event: unknown) => void;
    };

    act(() => {
      callbacks.onPostCreated({
        postId: 2,
        authorId: 4,
        author: { id: 4, username: 'mom', nickname: '妈妈' },
        createdAt: '2026-05-04T10:00:00.000Z',
      });
      callbacks.onPostCommentCreated();
      callbacks.onPostLikeChanged();
      callbacks.onChatMessageCreated({
        messageId: 10,
        senderId: 4,
        sender: { id: 4, username: 'mom', nickname: '妈妈' },
        createdAt: '2026-05-04T10:00:00.000Z',
      });
    });

    expect(queryClientMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: familyHooks.familyQueryKeys.posts(),
      refetchType: 'inactive',
    });
    expect(queryClientMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: familyHooks.familyQueryKeys.chatMessages(),
      refetchType: 'inactive',
    });
  });

  it('shows a weak prompt for new family posts and loads them on tap', async () => {
    renderPage('/family');

    const callbacks = socketMocks.connectFamilySocket.mock.calls[0]?.[1] as {
      onPostCreated: (event: unknown) => void;
    };
    act(() => {
      callbacks.onPostCreated({
        postId: 2,
        authorId: 4,
        author: { id: 4, username: 'mom', nickname: '妈妈' },
        createdAt: '2026-05-04T10:00:00.000Z',
      });
    });

    fireEvent.click(await screen.findByRole('button', { name: '妈妈有新的动态' }));

    await waitFor(() =>
      expect(familyServiceMocks.familyService.getPosts).toHaveBeenCalledWith({
        page: 1,
        limit: 30,
        afterId: 1,
      })
    );
    await waitFor(() => expect(markPostsReadAsync).toHaveBeenCalledWith(2));
  });

  it('shows the family chat unread badge on the family circle entry', () => {
    familyHooks.useFamilyState.mockReturnValue({
      data: {
        unreadPosts: 0,
        unreadChatMessages: 5,
        latestPostId: 1,
        latestChatMessageId: 9,
        lastReadPostId: 1,
        lastReadChatMessageId: 4,
      },
      markPostsReadAsync,
      markChatReadAsync,
    });

    renderPage('/family');

    expect(document.querySelector('.mobile-family-icon-badge')).toHaveTextContent('5');
  });

  it('keeps selected compose media local until publishing', async () => {
    const { container } = renderPage('/family/compose');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const composePanel = document.querySelector('.mobile-family-compose-panel');
    const composeGrid = document.querySelector('.mobile-family-compose-grid');
    const caption = document.querySelector('.mobile-family-compose-caption');

    expect(screen.getByRole('heading', { name: '发布动态' })).toBeInTheDocument();
    expect(composePanel).toBeInTheDocument();
    expect(composePanel?.firstElementChild).toBe(composeGrid);
    expect(composeGrid).toHaveClass('empty');
    expect(caption).toBeInTheDocument();
    expect(
      Boolean(composeGrid!.compareDocumentPosition(caption!) & Node.DOCUMENT_POSITION_FOLLOWING)
    ).toBe(true);
    expect(cssRule('.mobile-family-compose-panel')).toContain('border-radius: 8px;');
    expect(cssRule('.mobile-family-publish-button')).toContain('--text-color: #ffffff;');
    expect(cssRule('.mobile-family-compose-grid.empty')).toContain('grid-template-columns: 1fr;');
    expect(cssRule('.mobile-family-compose-caption .adm-text-area')).toContain('min-height: 58px;');

    fireEvent.change(screen.getByPlaceholderText('配一句话...'), {
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

  it('compresses large compose images before previewing and uploading', async () => {
    const bitmapClose = vi.fn();
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => ({
        width: 4000,
        height: 3000,
        close: bitmapClose,
      }))
    );
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
      callback: BlobCallback,
      type?: string,
      quality?: unknown
    ) {
      expect(this.width).toBe(1600);
      expect(this.height).toBe(1200);
      expect(type).toBe('image/jpeg');
      expect(quality).toBe(0.86);
      callback(new Blob(['compressed-image'], { type: 'image/jpeg' }));
    });

    const { container } = renderPage('/family/compose');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const largeImage = new File([new Uint8Array(2 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    fireEvent.change(input, { target: { files: [largeImage] } });
    expect(await screen.findByText('large.jpg')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '发布' }));

    await waitFor(() =>
      expect(familyServiceMocks.familyService.uploadFamilyMedia).toHaveBeenCalled()
    );
    const uploadedFile = familyServiceMocks.familyService.uploadFamilyMedia.mock
      .calls[0][0] as File;
    expect(uploadedFile).not.toBe(largeImage);
    expect(uploadedFile.name).toBe('large.jpg');
    expect(uploadedFile.type).toBe('image/jpeg');
    expect(uploadedFile.size).toBeLessThan(largeImage.size);
    expect(bitmapClose).toHaveBeenCalled();
    expect(drawImage).toHaveBeenCalled();
  });

  it('rejects oversized compose videos before they enter the draft', async () => {
    const { container } = renderPage('/family/compose');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const video = createSizedFile('too-large.mp4', 'video/mp4', 200 * 1024 * 1024 + 1);

    fireEvent.change(input, { target: { files: [video] } });

    await waitFor(() =>
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ content: expect.stringContaining('200MB') })
      )
    );
    expect(screen.queryByText('too-large.mp4')).not.toBeInTheDocument();
    expect(familyServiceMocks.familyService.uploadFamilyMedia).not.toHaveBeenCalled();
  });

  it('rejects chat videos that exceed the short-message duration limit', async () => {
    mockVideoMetadata(91);
    const { container } = renderPage('/family/chat');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const video = createSizedFile('too-long.mp4', 'video/mp4', 5 * 1024 * 1024);

    fireEvent.change(input, { target: { files: [video] } });

    await waitFor(() =>
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ content: expect.stringContaining('90秒') })
      )
    );
    expect(screen.queryByText('too-long.mp4')).not.toBeInTheDocument();
    expect(familyServiceMocks.familyService.uploadFamilyMedia).not.toHaveBeenCalled();
  });

  it('rejects family videos in local upload mode before creating draft previews', async () => {
    appConfig.familyMediaUploadMode = 'local';
    const { container } = renderPage('/family/chat');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const video = createSizedFile('local-video.mp4', 'video/mp4', 5 * 1024 * 1024);

    fireEvent.change(input, { target: { files: [video] } });

    await waitFor(() =>
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ content: expect.stringContaining('OSS') })
      )
    );
    expect(screen.queryByText('local-video.mp4')).not.toBeInTheDocument();
    expect(URL.createObjectURL).not.toHaveBeenCalledWith(video);
    expect(familyServiceMocks.familyService.uploadFamilyMedia).not.toHaveBeenCalled();
  });

  it('blocks compose publish while selected images are still processing', async () => {
    const bitmap = createDeferred<{
      width: number;
      height: number;
      close: () => void;
    }>();
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(() => bitmap.promise)
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback: BlobCallback) => {
      callback(new Blob(['compressed-image'], { type: 'image/jpeg' }));
    });

    const { container } = renderPage('/family/compose');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(screen.getByPlaceholderText('配一句话...'), {
      target: { value: '带图发布' },
    });
    fireEvent.change(input, {
      target: {
        files: [new File([new Uint8Array(2 * 1024 * 1024)], 'slow.jpg', { type: 'image/jpeg' })],
      },
    });

    const publishButton = document.querySelector('.mobile-family-publish-button');
    expect(publishButton).toBeDisabled();
    fireEvent.click(publishButton!);
    expect(familyServiceMocks.familyService.uploadFamilyMedia).not.toHaveBeenCalled();
    expect(createPost).not.toHaveBeenCalled();

    await act(async () => {
      bitmap.resolve({ width: 4000, height: 3000, close: vi.fn() });
    });
    expect(await screen.findByText('slow.jpg')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '发布' })).not.toBeDisabled();
  });

  it('blocks chat send while selected images are still processing', async () => {
    const bitmap = createDeferred<{
      width: number;
      height: number;
      close: () => void;
    }>();
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(() => bitmap.promise)
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback: BlobCallback) => {
      callback(new Blob(['compressed-image'], { type: 'image/jpeg' }));
    });

    const { container } = renderPage('/family/chat');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(screen.getByPlaceholderText('给家里人发消息'), {
      target: { value: '等图片处理完' },
    });
    fireEvent.change(input, {
      target: {
        files: [
          new File([new Uint8Array(2 * 1024 * 1024)], 'slow-chat.jpg', {
            type: 'image/jpeg',
          }),
        ],
      },
    });

    const sendButton = document.querySelector('.mobile-family-chat-send');
    expect(sendButton).toBeDisabled();
    fireEvent.click(sendButton!);
    expect(familyServiceMocks.familyService.uploadFamilyMedia).not.toHaveBeenCalled();
    expect(createMessage).not.toHaveBeenCalled();

    await act(async () => {
      bitmap.resolve({ width: 4000, height: 3000, close: vi.fn() });
    });
    await screen.findByLabelText(/移除 slow-chat.jpg/);
    expect(screen.getByRole('button', { name: /发送/ })).not.toBeDisabled();
  });

  it('renders feed images eagerly to avoid iOS lazy loading black tiles', () => {
    renderPage('/family');

    const image = document.querySelector('.mobile-family-media-item img');
    expect(image).toHaveAttribute('src', '/api/v1/files/17/access?token=webp');
    expect(image).not.toHaveAttribute('loading');
    expect(image).toHaveAttribute('decoding', 'async');
  });

  it('does not render broken feed image elements when cached media urls are missing', () => {
    familyHooks.useFamilyPosts.mockReturnValue({
      data: {
        items: [
          {
            ...post,
            media: [
              {
                ...post.media[0],
                displayUrl: undefined as never,
                expiresAt: undefined as never,
              },
            ],
          },
        ],
        meta: { totalItems: 1 },
      },
      isLoading: false,
      refetch,
    });

    renderPage('/family');

    expect(screen.queryByAltText('家庭图片')).not.toBeInTheDocument();
    expect(document.querySelector('.mobile-family-media-item img')).toBeNull();
  });

  it('keeps family dark mode readable across feed comments and chat controls', () => {
    const css = readMobileCss();

    expect(css).toContain('.dark .mobile-family-inline-comment .adm-text-area');
    expect(css).toContain('.dark .mobile-family-feed-comment');
    expect(css).toContain('.dark .mobile-family-chat-text .adm-text-area-element');
    expect(css).toContain('.dark .mobile-family-logo-button');
    expect(css).toContain('.dark .mobile-family-menu-button');
    expect(css).toContain('.dark .mobile-family-chat-back');
    expect(css).toContain('.dark .mobile-family-icon-badge');
    expect(css).toContain('.dark .mobile-task-dock-badge');
    expect(css).toContain(
      '.dark .mobile-family-chat-input.warm .mobile-family-chat-send.adm-button:not(.active)'
    );
    expect(css).toContain('.dark .mobile-family-chat-attachment-action');
    expect(css).toContain('.dark .mobile-family-chat-new-message');
  });

  it('locks compose controls while publish media is uploading', async () => {
    const upload = createDeferred<{ id: number }>();
    familyServiceMocks.familyService.uploadFamilyMedia.mockReturnValue(upload.promise);
    const { container } = renderPage('/family/compose');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(screen.getByPlaceholderText('配一句话...'), {
      target: { value: '正在上传的家庭动态' },
    });
    fireEvent.change(input, {
      target: {
        files: [new File(['x'], 'pending.jpg', { type: 'image/jpeg' })],
      },
    });
    await screen.findByText('pending.jpg');

    fireEvent.click(screen.getByRole('button', { name: '发布' }));

    await waitFor(() =>
      expect(familyServiceMocks.familyService.uploadFamilyMedia).toHaveBeenCalled()
    );
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled();
    expect(screen.getByPlaceholderText('配一句话...')).toBeDisabled();
    expect(input).toBeDisabled();
    expect(document.querySelector('.mobile-family-add-media-tile')).toBeDisabled();
    expect(
      document.querySelector('.mobile-family-draft-tile > button:last-of-type')
    ).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(screen.getByRole('heading', { name: '发布动态' })).toBeInTheDocument();

    upload.resolve({ id: 900 });
    await waitFor(() =>
      expect(createPost).toHaveBeenCalledWith({
        content: '正在上传的家庭动态',
        mediaFileIds: [900],
      })
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

  it('keeps the inline comment active when tapping send blurs the textarea first', async () => {
    renderPage('/family');

    fireEvent.click(screen.getByRole('button', { name: /评论/ }));
    const input = screen.getByPlaceholderText('说点什么吧...') as HTMLTextAreaElement;
    fireEvent.change(input, {
      target: { value: '移动端点发送' },
    });
    const sendButton = screen.getByRole('button', { name: '发送' });

    fireEvent.pointerDown(sendButton);
    fireEvent.blur(input, { relatedTarget: null });

    expect(screen.getByRole('button', { name: '发送' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '发送' }));

    await waitFor(() =>
      expect(createComment).toHaveBeenCalledWith({ postId: 1, content: '移动端点发送' })
    );
  });

  it('closes the comment input on blur and keeps the draft for reopening', async () => {
    renderPage('/family');

    fireEvent.click(screen.getByRole('button', { name: /评论/ }));
    const input = screen.getByPlaceholderText('说点什么吧...') as HTMLTextAreaElement;
    fireEvent.change(input, {
      target: { value: '晚点继续写' },
    });

    fireEvent.blur(input);

    await waitFor(() =>
      expect(screen.queryByPlaceholderText('说点什么吧...')).not.toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: /评论/ }));

    expect(screen.getByPlaceholderText('说点什么吧...')).toHaveValue('晚点继续写');
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

  it('deletes own family posts after confirmation', async () => {
    mobileUiMocks.dialogConfirm.mockImplementation((options: { onConfirm?: () => void }) => {
      options.onConfirm?.();
      return Promise.resolve(true);
    });

    renderPage('/family');

    fireEvent.click(screen.getByRole('button', { name: /删除动态/ }));

    await waitFor(() => expect(deletePost).toHaveBeenCalledWith(1));
    expect(mobileUiMocks.dialogConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '删除后这条动态和下面的评论都会消失，确定删除吗？',
        cancelText: '取消',
        confirmText: '删除',
      })
    );
  });

  it('deletes family comments and replies after confirmation', async () => {
    mobileUiMocks.dialogConfirm.mockImplementation((options: { onConfirm?: () => void }) => {
      options.onConfirm?.();
      return Promise.resolve(true);
    });

    renderPage('/family');

    const commentList = document.querySelector('.mobile-family-comment-list');
    expect(commentList).toBeTruthy();
    const deleteButtons = within(commentList as HTMLElement).getAllByRole('button', {
      name: /删除/,
    });
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[1]);

    await waitFor(() => expect(deleteComment).toHaveBeenCalledWith({ postId: 1, commentId: 4 }));
    expect(mobileUiMocks.dialogConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '确定删除这条评论吗？',
        cancelText: '取消',
        confirmText: '删除',
      })
    );
  });

  it('hides family delete controls for users who cannot delete the content', () => {
    useAuthStore.setState({
      token: 'token',
      user: {
        id: 9,
        username: 'aunt',
        nickname: '姑姑',
        email: 'aunt@example.com',
      } as never,
    });

    renderPage('/family');

    expect(screen.queryByRole('button', { name: /删除动态/ })).not.toBeInTheDocument();
    expect(document.querySelector('.mobile-family-comment-delete')).not.toBeInTheDocument();
  });

  it('opens feed videos through the preview layer instead of playing inside the thumbnail', () => {
    familyHooks.useFamilyPosts.mockReturnValue({
      data: {
        items: [
          {
            ...post,
            media: [
              {
                id: 20,
                fileId: 20,
                mediaType: 'video',
                sort: 0,
                mimeType: 'video/mp4',
                displayUrl: '/api/v1/files/20/access?token=video',
                posterUrl: '/api/v1/files/20/access?token=poster',
                expiresAt: '2026-05-04T00:00:00.000Z',
              },
            ],
          },
        ],
        meta: { totalItems: 1 },
      },
      isLoading: false,
      refetch,
    });
    renderPage('/family');

    expect(document.querySelector('.mobile-family-media-item video')).toBeNull();
    const poster = document.querySelector('.mobile-family-media-item img');
    expect(poster).toHaveAttribute('src', '/api/v1/files/20/access?token=poster');

    fireEvent.click(document.querySelector('.mobile-family-media-item') as HTMLElement);

    const previewVideo = document.querySelector('.mobile-family-preview video');
    expect(previewVideo).toHaveAttribute('controls');
    expect(previewVideo).toHaveAttribute('playsinline');
    expect(previewVideo).toHaveAttribute('webkit-playsinline', 'true');
    expect(previewVideo).toHaveAttribute('x5-playsinline', 'true');
  });

  it('shows the family chat route as a clean message thread and sends text messages', async () => {
    renderPage('/family/chat');

    expect(screen.getByRole('button', { name: /返回家庭圈/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '家庭群聊' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /更多/ })).not.toBeInTheDocument();
    expect(document.querySelector('.mobile-family-chat-page')).toHaveClass('wechat-warm');
    expect(document.querySelector('.mobile-family-chat-logo')).not.toBeInTheDocument();
    expect(screen.getByText('2026/5/4 17:00')).toBeInTheDocument();
    expect(screen.queryByText('发布了一条动态')).not.toBeInTheDocument();
    expect(screen.queryByText('留下了心情')).not.toBeInTheDocument();
    expect(screen.getByText('看这个视频')).toBeInTheDocument();
    const textBubble = screen.getByText('看这个视频').closest('.mobile-family-chat-bubble');
    expect(textBubble?.querySelector('video')).toBeNull();
    const mediaBubble = document.querySelector('.mobile-family-chat-media-bubble.video');
    expect(mediaBubble).toBeTruthy();
    expect(mediaBubble?.tagName).toBe('BUTTON');
    expect(mediaBubble?.querySelector('video')).toBeNull();

    fireEvent.click(mediaBubble as HTMLElement);

    const previewVideo = document.querySelector('.mobile-family-preview video');
    expect(previewVideo).toHaveAttribute('src', '/api/v1/files/20/access?token=video');
    expect(previewVideo).toHaveAttribute('controls');
    expect(previewVideo).toHaveAttribute('playsinline');
    expect(previewVideo).toHaveAttribute('webkit-playsinline', 'true');
    expect(previewVideo).toHaveAttribute('x5-playsinline', 'true');

    fireEvent.change(screen.getByPlaceholderText('给家里人发消息'), {
      target: { value: '收到' },
    });
    fireEvent.click(screen.getByRole('button', { name: /发送/ }));

    await waitFor(() =>
      expect(createMessage).toHaveBeenCalledWith({ content: '收到', mediaFileIds: [] })
    );
  });

  it('shows the first chat time divider from the first message instead of the latest message', () => {
    familyHooks.useFamilyChatMessages.mockReturnValue({
      data: {
        items: [
          { ...message, id: 11, createdAt: '2026-05-05T12:00:00.000Z' },
          { ...message, id: 10, createdAt: '2026-05-04T00:00:00.000Z' },
        ],
        meta: { totalItems: 2 },
      },
      isLoading: false,
      refetch,
    });

    renderPage('/family/chat');

    const dividers = Array.from(
      document.querySelectorAll(
        '.mobile-family-chat-date-divider, .mobile-family-chat-time-divider'
      )
    ).map((element) => element.textContent);
    expect(dividers[0]).toBe('2026/5/4 08:00');
    expect(dividers[0]).not.toBe('2026/5/5 20:00');
  });

  it('keeps new chat messages as a bottom prompt when the user is reading older messages', async () => {
    renderPage('/family/chat');

    markChatReadAsync.mockClear();
    const list = document.querySelector('.mobile-family-chat-list') as HTMLElement;
    Object.defineProperties(list, {
      scrollHeight: { value: 1000, configurable: true },
      clientHeight: { value: 300, configurable: true },
      scrollTop: { value: 0, configurable: true },
    });

    const callbacks = socketMocks.connectFamilySocket.mock.calls[0]?.[1] as {
      onChatMessageCreated: (event: unknown) => void;
    };
    act(() => {
      callbacks.onChatMessageCreated({
        messageId: 10,
        senderId: 4,
        sender: { id: 4, username: 'mom', nickname: '妈妈' },
        createdAt: '2026-05-04T10:00:00.000Z',
      });
    });

    expect(await screen.findByRole('button', { name: '1 条新消息' })).toBeInTheDocument();
    expect(familyServiceMocks.familyService.getChatMessages).toHaveBeenCalledWith({
      page: 1,
      limit: 100,
      afterId: 9,
    });
    expect(markChatReadAsync).not.toHaveBeenCalledWith(10);
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

  it('locks chat draft controls while media is uploading', async () => {
    const upload = createDeferred<{ id: number }>();
    familyServiceMocks.familyService.uploadFamilyMedia.mockReturnValue(upload.promise);
    const { container } = renderPage('/family/chat');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [new File(['x'], 'chat-pending.jpg', { type: 'image/jpeg' })],
      },
    });
    await screen.findByLabelText(/移除 chat-pending.jpg/);
    fireEvent.change(screen.getByPlaceholderText('给家里人发消息'), {
      target: { value: '看图片' },
    });

    fireEvent.click(screen.getByRole('button', { name: /发送/ }));

    await waitFor(() =>
      expect(familyServiceMocks.familyService.uploadFamilyMedia).toHaveBeenCalled()
    );
    expect(screen.getByPlaceholderText('给家里人发消息')).toBeDisabled();
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: /添加图片或视频/ })).toBeDisabled();
    expect(screen.getByLabelText(/移除 chat-pending.jpg/)).toBeDisabled();

    upload.resolve({ id: 901 });
    await waitFor(() =>
      expect(createMessage).toHaveBeenCalledWith({ content: '看图片', mediaFileIds: [901] })
    );
  });

  it('defers mobile app reload while chat has an unsent text draft', async () => {
    renderPage('/family/chat');
    fireEvent.change(screen.getByPlaceholderText('给家里人发消息'), {
      target: { value: '先别刷新' },
    });

    const reload = vi.fn();
    requestMobileAppReload(reload);

    expect(reload).not.toHaveBeenCalled();
    expect(mobileUiMocks.dialogConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '新版本已就绪',
        content: expect.stringContaining('未发送的群聊内容'),
        cancelText: '稍后',
        confirmText: '仍然刷新',
      })
    );
  });

  it('defers mobile app reload while chat has selected media draft', async () => {
    const { container } = renderPage('/family/chat');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, {
      target: {
        files: [new File(['x'], 'draft.jpg', { type: 'image/jpeg' })],
      },
    });
    await screen.findByLabelText(/移除 draft.jpg/);

    const reload = vi.fn();
    requestMobileAppReload(reload);

    expect(reload).not.toHaveBeenCalled();
    expect(mobileUiMocks.dialogConfirm).toHaveBeenCalledTimes(1);
  });

  it('runs deferred mobile app reload when user confirms despite chat draft', async () => {
    mobileUiMocks.dialogConfirm.mockImplementation((options: { onConfirm?: () => void }) => {
      options.onConfirm?.();
      return Promise.resolve(true);
    });
    renderPage('/family/chat');
    fireEvent.change(screen.getByPlaceholderText('给家里人发消息'), {
      target: { value: '仍然刷新' },
    });

    const reload = vi.fn();
    requestMobileAppReload(reload);

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('allows mobile app reload after chat draft is sent and cleared', async () => {
    renderPage('/family/chat');
    fireEvent.change(screen.getByPlaceholderText('给家里人发消息'), {
      target: { value: '发送后刷新' },
    });
    fireEvent.click(screen.getByRole('button', { name: /发送/ }));

    await waitFor(() =>
      expect(createMessage).toHaveBeenCalledWith({ content: '发送后刷新', mediaFileIds: [] })
    );
    await waitFor(() => expect(screen.getByPlaceholderText('给家里人发消息')).toHaveValue(''));

    const reload = vi.fn();
    requestMobileAppReload(reload);

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
