import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Image,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageWrap } from '@/shared/components';
import { formatDate } from '@/shared/utils';
import { useFamilyChatMessages, useFamilyPosts } from '../hooks/useFamily';
import type {
  FamilyChatMessage,
  FamilyMedia,
  FamilyPost,
  FamilyUserSummary,
} from '../types/family.types';

const { Paragraph, Text } = Typography;

const DEFAULT_POST_PAGE_SIZE = 50;
const DEFAULT_CHAT_PAGE_SIZE = 100;

type ActiveTab = 'posts' | 'chat';
type DetailState =
  | { type: 'post'; item: FamilyPost }
  | { type: 'chat'; item: FamilyChatMessage }
  | null;

function displayName(user?: FamilyUserSummary | null) {
  return user?.nickname || user?.realName || user?.username || '-';
}

function summarize(content?: string | null) {
  const text = content?.trim();
  if (!text) return '仅媒体内容';
  return text.length > 40 ? `${text.slice(0, 40)}...` : text;
}

function mediaCountText(count: number) {
  return `${count} 个媒体`;
}

function commentCountText(count: number) {
  return `${count} 条评论`;
}

function likeCountText(count: number) {
  return `${count} 个赞`;
}

function renderMedia(media: FamilyMedia[]) {
  if (media.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无媒体" />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {media.map((item) => (
        <div
          key={item.id}
          className="overflow-hidden rounded border border-slate-200 dark:border-slate-700"
        >
          {item.mediaType === 'image' ? (
            <Image
              alt={item.originalName || '家庭媒体'}
              src={item.displayUrl}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <video className="aspect-video w-full bg-black" controls src={item.displayUrl} />
          )}
          {item.originalName ? (
            <div className="truncate px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
              {item.originalName}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function FamilyContentPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('posts');
  const [detail, setDetail] = useState<DetailState>(null);
  const [postPagination, setPostPagination] = useState({
    current: 1,
    pageSize: DEFAULT_POST_PAGE_SIZE,
  });
  const [chatPagination, setChatPagination] = useState({
    current: 1,
    pageSize: DEFAULT_CHAT_PAGE_SIZE,
  });
  const postListParams = useMemo(
    () => ({ page: postPagination.current, limit: postPagination.pageSize }),
    [postPagination]
  );
  const chatListParams = useMemo(
    () => ({ page: chatPagination.current, limit: chatPagination.pageSize }),
    [chatPagination]
  );
  const postsQuery = useFamilyPosts(postListParams);
  const chatQuery = useFamilyChatMessages(chatListParams);

  const handlePostPageChange = (current: number, pageSize: number) => {
    setPostPagination({ current, pageSize });
  };

  const handleChatPageChange = (current: number, pageSize: number) => {
    setChatPagination({ current, pageSize });
  };

  const postColumns: ColumnsType<FamilyPost> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '作者',
      dataIndex: 'author',
      width: 140,
      render: (_, record) => displayName(record.author),
    },
    {
      title: '内容',
      dataIndex: 'content',
      ellipsis: true,
      render: (content) => summarize(content),
    },
    {
      title: '媒体',
      dataIndex: 'media',
      width: 110,
      render: (_, record) => mediaCountText(record.media.length),
    },
    {
      title: '评论',
      dataIndex: 'comments',
      width: 110,
      render: (_, record) => commentCountText(record.comments.length),
    },
    {
      title: '点赞',
      dataIndex: 'likeCount',
      width: 110,
      render: (count: number) => likeCountText(count),
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (value: string) => formatDate.full(value),
    },
    {
      title: '操作',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setDetail({ type: 'post', item: record })}
        >
          详情
        </Button>
      ),
    },
  ];

  const chatColumns: ColumnsType<FamilyChatMessage> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '发送者',
      dataIndex: 'sender',
      width: 140,
      render: (_, record) => displayName(record.sender),
    },
    {
      title: '内容',
      dataIndex: 'content',
      ellipsis: true,
      render: (content) => summarize(content),
    },
    {
      title: '媒体',
      dataIndex: 'media',
      width: 110,
      render: (_, record) => mediaCountText(record.media.length),
    },
    {
      title: '发送时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (value: string) => formatDate.full(value),
    },
    {
      title: '操作',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setDetail({ type: 'chat', item: record })}
        >
          详情
        </Button>
      ),
    },
  ];

  const items = [
    {
      key: 'posts',
      label: '家庭圈',
      children: (
        <Table
          rowKey="id"
          dataSource={postsQuery.data?.items ?? []}
          columns={postColumns}
          loading={postsQuery.isLoading}
          scroll={{ x: 980 }}
          pagination={{
            current: postPagination.current,
            pageSize: postPagination.pageSize,
            total: postsQuery.data?.meta.totalItems ?? 0,
            showSizeChanger: true,
            onChange: handlePostPageChange,
          }}
        />
      ),
    },
    {
      key: 'chat',
      label: '群聊',
      children: (
        <Table
          rowKey="id"
          dataSource={chatQuery.data?.items ?? []}
          columns={chatColumns}
          loading={chatQuery.isLoading}
          scroll={{ x: 720 }}
          pagination={{
            current: chatPagination.current,
            pageSize: chatPagination.pageSize,
            total: chatQuery.data?.meta.totalItems ?? 0,
            showSizeChanger: true,
            onChange: handleChatPageChange,
          }}
        />
      ),
    },
  ];

  const currentRefetch = activeTab === 'posts' ? postsQuery.refetch : chatQuery.refetch;
  const currentLoading =
    activeTab === 'posts'
      ? postsQuery.isFetching || postsQuery.isLoading
      : chatQuery.isFetching || chatQuery.isLoading;

  return (
    <PageWrap
      title="家庭内容"
      titleRight={
        <Button icon={<ReloadOutlined />} loading={currentLoading} onClick={() => currentRefetch()}>
          刷新
        </Button>
      }
    >
      <Card>
        <Tabs
          activeKey={activeTab}
          items={items}
          onChange={(key) => setActiveTab(key as ActiveTab)}
        />
      </Card>

      <Drawer
        width={640}
        title={detail?.type === 'post' ? '家庭圈详情' : '群聊详情'}
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
      >
        {detail?.type === 'post' ? <PostDetail item={detail.item} /> : null}
        {detail?.type === 'chat' ? <ChatDetail item={detail.item} /> : null}
      </Drawer>
    </PageWrap>
  );
}

function PostDetail({ item }: { item: FamilyPost }) {
  const likedUsers = item.likedUsers?.map(displayName).filter(Boolean).join('、') || '-';

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Descriptions
        column={1}
        size="small"
        items={[
          { key: 'author', label: '作者', children: displayName(item.author) },
          { key: 'createdAt', label: '发布时间', children: formatDate.full(item.createdAt) },
          { key: 'likes', label: '点赞用户', children: likedUsers },
        ]}
      />
      <section>
        <Text strong>内容</Text>
        <Paragraph className="mt-2 whitespace-pre-wrap">
          {item.content?.trim() || '仅媒体内容'}
        </Paragraph>
      </section>
      <section>
        <Text strong>媒体</Text>
        <div className="mt-2">{renderMedia(item.media)}</div>
      </section>
      <section>
        <Text strong>评论</Text>
        <Space direction="vertical" className="mt-2 w-full">
          {item.comments.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无评论" />
          ) : (
            item.comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded border border-slate-200 p-3 dark:border-slate-700"
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <Text strong>{displayName(comment.author)}</Text>
                  <Text type="secondary">{formatDate.full(comment.createdAt)}</Text>
                </div>
                <Paragraph className="mb-0 whitespace-pre-wrap">{comment.content}</Paragraph>
              </div>
            ))
          )}
        </Space>
      </section>
    </Space>
  );
}

function ChatDetail({ item }: { item: FamilyChatMessage }) {
  return (
    <Space direction="vertical" size="large" className="w-full">
      <Descriptions
        column={1}
        size="small"
        items={[
          { key: 'sender', label: '发送者', children: displayName(item.sender) },
          { key: 'createdAt', label: '发送时间', children: formatDate.full(item.createdAt) },
          {
            key: 'mediaCount',
            label: '媒体',
            children: <Tag>{mediaCountText(item.media.length)}</Tag>,
          },
        ]}
      />
      <section>
        <Text strong>内容</Text>
        <Paragraph className="mt-2 whitespace-pre-wrap">
          {item.content?.trim() || '仅媒体内容'}
        </Paragraph>
      </section>
      <section>
        <Text strong>媒体</Text>
        <div className="mt-2">{renderMedia(item.media)}</div>
      </section>
    </Space>
  );
}
