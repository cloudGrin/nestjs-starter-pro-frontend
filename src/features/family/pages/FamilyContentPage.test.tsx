import { isValidElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { FamilyContentPage } from './FamilyContentPage';

const hookMocks = vi.hoisted(() => ({
  useFamilyPosts: vi.fn(),
  useFamilyChatMessages: vi.fn(),
  useDeleteFamilyPost: vi.fn(),
  useDeleteFamilyChatMessage: vi.fn(),
  postsResult: {
    data: {
      items: [
        {
          id: 11,
          content: '周末家庭聚餐',
          authorId: 2,
          author: { id: 2, username: 'chen', nickname: '陈陈' },
          media: [
            {
              id: 101,
              fileId: 501,
              mediaType: 'image',
              sort: 0,
              displayUrl: '/media/family-dinner.jpg',
              expiresAt: '2026-05-10T10:00:00.000Z',
            },
          ],
          comments: [
            {
              id: 21,
              postId: 11,
              content: '看起来很好吃',
              authorId: 3,
              author: { id: 3, username: 'lin', nickname: '林林' },
              createdAt: '2026-05-10T08:10:00.000Z',
              updatedAt: '2026-05-10T08:10:00.000Z',
            },
          ],
          likeCount: 2,
          likedByMe: false,
          likedUsers: [
            { id: 4, username: 'wang', nickname: '王王' },
            { id: 5, username: 'li', nickname: '李李' },
          ],
          createdAt: '2026-05-10T08:00:00.000Z',
          updatedAt: '2026-05-10T08:00:00.000Z',
        },
      ],
      meta: { totalItems: 1 },
    },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  },
  chatResult: {
    data: {
      items: [
        {
          id: 31,
          content: '晚点回家',
          senderId: 6,
          sender: { id: 6, username: 'zhao', nickname: '赵赵' },
          media: [],
          createdAt: '2026-05-10T09:00:00.000Z',
          updatedAt: '2026-05-10T09:00:00.000Z',
        },
      ],
      meta: { totalItems: 1 },
    },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  },
  deletePostResult: {
    mutate: vi.fn(),
    isPending: false,
  },
  deleteChatMessageResult: {
    mutate: vi.fn(),
    isPending: false,
  },
}));

vi.mock('@/features/family/hooks/useFamily', () => ({
  useFamilyPosts: hookMocks.useFamilyPosts,
  useFamilyChatMessages: hookMocks.useFamilyChatMessages,
  useDeleteFamilyPost: hookMocks.useDeleteFamilyPost,
  useDeleteFamilyChatMessage: hookMocks.useDeleteFamilyChatMessage,
}));

vi.mock('@/shared/components', () => ({
  PageWrap: ({
    title,
    titleRight,
    children,
  }: {
    title?: ReactNode;
    titleRight?: ReactNode;
    children?: ReactNode;
  }) => (
    <main>
      <h1>{title}</h1>
      {titleRight}
      {children}
    </main>
  ),
}));

vi.mock('antd', () => {
  const renderValue = (value: unknown): ReactNode => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (isValidElement(value)) return value;
    return JSON.stringify(value);
  };

  return {
    Button: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
    Card: ({ children }: { children?: ReactNode }) => <section>{children}</section>,
    Descriptions: ({
      items,
    }: {
      items: Array<{ key: string; label: string; children: ReactNode }>;
    }) => (
      <dl>
        {items.map((item) => (
          <div key={item.key}>
            <dt>{item.label}</dt>
            <dd>{item.children}</dd>
          </div>
        ))}
      </dl>
    ),
    Drawer: ({
      children,
      open,
      title,
    }: {
      children?: ReactNode;
      open?: boolean;
      title?: ReactNode;
    }) =>
      open ? (
        <aside>
          <h2>{title}</h2>
          {children}
        </aside>
      ) : null,
    Empty: ({ description }: { description?: ReactNode }) => <div>{description}</div>,
    Image: ({ src, alt }: { src?: string; alt?: string }) => <img alt={alt || ''} src={src} />,
    Modal: {
      confirm: vi.fn((options: { onOk?: () => void }) => options.onOk?.()),
    },
    Space: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Table: ({
      columns,
      dataSource,
      loading,
      pagination,
    }: {
      columns: any[];
      dataSource: Array<Record<string, any>>;
      loading?: boolean;
      pagination?:
        | false
        | {
            current?: number;
            pageSize?: number;
            onChange?: (page: number, pageSize: number) => void;
          };
    }) => (
      <div>
        {loading ? <span>加载中</span> : null}
        {dataSource.map((record) => (
          <article key={record.id} data-testid={`row-${record.id}`}>
            {columns.map((column) => {
              const rawValue = Array.isArray(column.dataIndex)
                ? column.dataIndex.reduce((value, key) => value?.[key], record)
                : column.dataIndex
                  ? record[column.dataIndex]
                  : undefined;
              const value = column.render ? column.render(rawValue, record) : rawValue;
              return <span key={column.key || column.dataIndex}>{renderValue(value)}</span>;
            })}
          </article>
        ))}
        {pagination ? (
          <button type="button" onClick={() => pagination.onChange?.(2, pagination.pageSize ?? 10)}>
            第 2 页
          </button>
        ) : null}
      </div>
    ),
    Tabs: ({
      activeKey,
      items,
      onChange,
    }: {
      activeKey?: string;
      items: Array<{ key: string; label: ReactNode; children: ReactNode }>;
      onChange?: (key: string) => void;
    }) => (
      <div>
        <div>
          {items.map((item) => (
            <button key={item.key} type="button" onClick={() => onChange?.(item.key)}>
              {item.label}
            </button>
          ))}
        </div>
        {items.find((item) => item.key === activeKey)?.children}
      </div>
    ),
    Tag: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
    Typography: {
      Paragraph: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
      Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
    },
  };
});

describe('FamilyContentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookMocks.postsResult.data.meta.totalItems = 1;
    hookMocks.chatResult.data.meta.totalItems = 1;
    hookMocks.postsResult.isFetching = false;
    hookMocks.chatResult.isFetching = false;
    hookMocks.useFamilyPosts.mockReturnValue(hookMocks.postsResult);
    hookMocks.useFamilyChatMessages.mockReturnValue(hookMocks.chatResult);
    hookMocks.deletePostResult.isPending = false;
    hookMocks.deleteChatMessageResult.isPending = false;
    hookMocks.useDeleteFamilyPost.mockReturnValue(hookMocks.deletePostResult);
    hookMocks.useDeleteFamilyChatMessage.mockReturnValue(hookMocks.deleteChatMessageResult);
  });

  it('renders family post rows and opens the post detail drawer', () => {
    render(<FamilyContentPage />);

    expect(screen.getByRole('heading', { name: '家庭内容' })).toBeInTheDocument();
    expect(screen.getByText('周末家庭聚餐')).toBeInTheDocument();
    expect(screen.getByText('陈陈')).toBeInTheDocument();
    expect(screen.getByText('1 个媒体')).toBeInTheDocument();
    expect(screen.getByText('1 条评论')).toBeInTheDocument();
    expect(screen.getByText('2 个赞')).toBeInTheDocument();

    fireEvent.click(within(screen.getByTestId('row-11')).getByRole('button', { name: '详情' }));

    expect(screen.getByRole('heading', { name: '家庭圈详情' })).toBeInTheDocument();
    expect(screen.getByText('看起来很好吃')).toBeInTheDocument();
    expect(screen.getByText('王王、李李')).toBeInTheDocument();
  });

  it('renders family chat rows and opens the message detail drawer', () => {
    render(<FamilyContentPage />);

    fireEvent.click(screen.getByRole('button', { name: '群聊' }));

    expect(screen.getByText('晚点回家')).toBeInTheDocument();
    expect(screen.getByText('赵赵')).toBeInTheDocument();

    fireEvent.click(within(screen.getByTestId('row-31')).getByRole('button', { name: '详情' }));

    expect(screen.getByRole('heading', { name: '群聊详情' })).toBeInTheDocument();
    expect(screen.getAllByText('晚点回家').length).toBeGreaterThan(1);
  });

  it('deletes family posts from the management table', () => {
    render(<FamilyContentPage />);

    fireEvent.click(within(screen.getByTestId('row-11')).getByRole('button', { name: '删除' }));

    expect(hookMocks.deletePostResult.mutate).toHaveBeenCalledWith(11, expect.any(Object));
  });

  it('deletes chat messages from the management table', () => {
    render(<FamilyContentPage />);
    fireEvent.click(screen.getByRole('button', { name: '群聊' }));

    fireEvent.click(within(screen.getByTestId('row-31')).getByRole('button', { name: '删除' }));

    expect(hookMocks.deleteChatMessageResult.mutate).toHaveBeenCalledWith(31, expect.any(Object));
  });

  it('requests family post pages through table pagination', () => {
    hookMocks.postsResult.data.meta.totalItems = 75;

    render(<FamilyContentPage />);

    expect(hookMocks.useFamilyPosts).toHaveBeenLastCalledWith({ page: 1, limit: 50 });
    fireEvent.click(screen.getByRole('button', { name: '第 2 页' }));

    expect(hookMocks.useFamilyPosts).toHaveBeenLastCalledWith({ page: 2, limit: 50 });
  });

  it('requests chat message pages through table pagination', () => {
    hookMocks.chatResult.data.meta.totalItems = 150;

    render(<FamilyContentPage />);
    fireEvent.click(screen.getByRole('button', { name: '群聊' }));

    expect(hookMocks.useFamilyChatMessages).toHaveBeenLastCalledWith({ page: 1, limit: 100 });
    fireEvent.click(screen.getByRole('button', { name: '第 2 页' }));

    expect(hookMocks.useFamilyChatMessages).toHaveBeenLastCalledWith({ page: 2, limit: 100 });
  });

  it('keeps the post table loading while fetching a new page', () => {
    hookMocks.postsResult.isFetching = true;

    render(<FamilyContentPage />);

    expect(screen.getByText('加载中')).toBeInTheDocument();
  });

  it('keeps the chat table loading while fetching a new page', () => {
    hookMocks.chatResult.isFetching = true;

    render(<FamilyContentPage />);
    fireEvent.click(screen.getByRole('button', { name: '群聊' }));

    expect(screen.getByText('加载中')).toBeInTheDocument();
  });
});
