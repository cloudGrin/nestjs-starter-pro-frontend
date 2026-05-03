import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Empty, PullToRefresh, Selector, TextArea, Toast } from 'antd-mobile';
import {
  HeartFilled,
  HeartOutlined,
  MessageOutlined,
  PictureOutlined,
  SendOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import {
  useCreateFamilyChatMessage,
  useCreateFamilyComment,
  useCreateFamilyPost,
  useFamilyChatMessages,
  useFamilyPosts,
  useLikeFamilyPost,
  useUnlikeFamilyPost,
} from '@/features/family/hooks/useFamily';
import { connectFamilySocket } from '@/features/family/realtime/familySocket';
import { familyService } from '@/features/family/services/family.service';
import type {
  FamilyChatMessage,
  FamilyMedia,
  FamilyMediaTarget,
  FamilyPost,
  FamilyUploadedMedia,
  FamilyUserSummary,
} from '@/features/family/types/family.types';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { MobileModuleHeader } from '../components/MobileModuleHeader';

type FamilyTab = 'circle' | 'chat';

interface DraftMediaItem {
  fileId: number;
  name: string;
  target: FamilyMediaTarget;
}

function parseFamilyTab(value: string | null): FamilyTab {
  return value === 'chat' ? 'chat' : 'circle';
}

function displayName(user?: FamilyUserSummary) {
  return user?.realName || user?.nickname || user?.username || '家人';
}

function formatTime(value: string) {
  return dayjs(value).format('MM-DD HH:mm');
}

function isVideo(media: FamilyMedia) {
  return media.mediaType === 'video' || media.mimeType?.startsWith('video/');
}

function MediaGrid({ media }: { media: FamilyMedia[] }) {
  if (!media?.length) {
    return null;
  }

  return (
    <div className="mobile-family-media-grid">
      {media.map((item) =>
        isVideo(item) ? (
          <video key={item.id} src={item.displayUrl} controls playsInline preload="metadata" />
        ) : (
          <img key={item.id} src={item.displayUrl} alt="家庭图片" loading="lazy" />
        )
      )}
    </div>
  );
}

function DraftMediaList({ items }: { items: DraftMediaItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mobile-family-draft-media">
      {items.map((item) => (
        <span key={`${item.target}-${item.fileId}`}>
          {item.name}
        </span>
      ))}
    </div>
  );
}

export function MobileFamilyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseFamilyTab(searchParams.get('tab'));
  const [postText, setPostText] = useState('');
  const [chatText, setChatText] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [postMedia, setPostMedia] = useState<DraftMediaItem[]>([]);
  const [chatMedia, setChatMedia] = useState<DraftMediaItem[]>([]);
  const [uploadingTarget, setUploadingTarget] = useState<FamilyMediaTarget | null>(null);
  const postInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const token = useAuthStore((state) => state.token);

  const postsQuery = useFamilyPosts({ page: 1, limit: 30 });
  const chatQuery = useFamilyChatMessages({ page: 1, limit: 100 });
  const createPost = useCreateFamilyPost();
  const createComment = useCreateFamilyComment();
  const likePost = useLikeFamilyPost();
  const unlikePost = useUnlikeFamilyPost();
  const createChatMessage = useCreateFamilyChatMessage();
  const { refetch: refetchPosts } = postsQuery;
  const { refetch: refetchChatMessages } = chatQuery;
  const posts = postsQuery.data?.items ?? [];
  const messages = chatQuery.data?.items ?? [];

  useEffect(() => {
    return connectFamilySocket(token, {
      onPostCreated: () => void refetchPosts(),
      onPostCommentCreated: () => void refetchPosts(),
      onPostLikeChanged: () => void refetchPosts(),
      onChatMessageCreated: () => void refetchChatMessages(),
      onNotificationCreated: () => undefined,
    });
  }, [refetchChatMessages, refetchPosts, token]);

  const tabOptions = useMemo(
    () => [
      { label: '家庭圈', value: 'circle' },
      { label: '群聊', value: 'chat' },
    ],
    []
  );

  const switchTab = (tab: FamilyTab) => {
    setSearchParams(tab === 'chat' ? { tab } : {});
  };

  const uploadFiles = async (files: FileList | null | undefined, target: FamilyMediaTarget) => {
    const currentCount = target === 'circle' ? postMedia.length : chatMedia.length;
    const remainingSlots = Math.max(0, 9 - currentCount);
    const selected = Array.from(files ?? []).slice(0, remainingSlots);
    if (selected.length === 0) return;

    setUploadingTarget(target);
    try {
      const uploaded: FamilyUploadedMedia[] = [];
      for (const file of selected) {
        uploaded.push(await familyService.uploadFamilyMedia(file, target));
      }
      const draftItems = uploaded.map((file) => ({
        fileId: file.id,
        name: file.originalName || file.filename || `文件 ${file.id}`,
        target,
      }));
      if (target === 'circle') {
        setPostMedia((current) => [...current, ...draftItems].slice(0, 9));
      } else {
        setChatMedia((current) => [...current, ...draftItems].slice(0, 9));
      }
    } catch {
      Toast.show({ icon: 'fail', content: '媒体上传失败', position: 'center' });
    } finally {
      setUploadingTarget(null);
    }
  };

  const submitPost = async () => {
    const content = postText.trim();
    const mediaFileIds = postMedia.map((item) => item.fileId);
    if (!content && mediaFileIds.length === 0) {
      Toast.show({ content: '写点内容或添加图片/视频', position: 'center' });
      return;
    }

    await createPost.mutateAsync({ content, mediaFileIds });
    setPostText('');
    setPostMedia([]);
  };

  const submitComment = async (postId: number) => {
    const content = commentDrafts[postId]?.trim();
    if (!content) return;

    await createComment.mutateAsync({ postId, content });
    setCommentDrafts((current) => ({ ...current, [postId]: '' }));
  };

  const submitChatMessage = async () => {
    const content = chatText.trim();
    const mediaFileIds = chatMedia.map((item) => item.fileId);
    if (!content && mediaFileIds.length === 0) {
      Toast.show({ content: '写点内容或添加图片/视频', position: 'center' });
      return;
    }

    await createChatMessage.mutateAsync({ content, mediaFileIds });
    setChatText('');
    setChatMedia([]);
  };

  return (
    <div className="mobile-page mobile-family-page">
      <MobileModuleHeader title="家庭" subtitle="家庭圈和群聊" />

      <Selector
        className="mobile-family-tabs"
        options={tabOptions}
        value={[activeTab]}
        onChange={(items: Array<string | number>) => switchTab((items[0] as FamilyTab) || 'circle')}
      />

      {activeTab === 'circle' ? (
        <PullToRefresh onRefresh={async () => void (await postsQuery.refetch())}>
          <section className="mobile-family-section">
            <Card className="mobile-card mobile-family-composer">
              <TextArea
                value={postText}
                placeholder="记录家庭里的新鲜事"
                rows={3}
                maxLength={5000}
                onChange={setPostText}
              />
              <DraftMediaList items={postMedia} />
              <div className="mobile-family-composer-actions">
                <input
                  ref={postInputRef}
                  type="file"
                  hidden
                  multiple
                  accept="image/*,video/*"
                  onChange={(event) => {
                    void uploadFiles(event.currentTarget.files, 'circle');
                    event.currentTarget.value = '';
                  }}
                />
                <Button
                  size="small"
                  onClick={() => postInputRef.current?.click()}
                  loading={uploadingTarget === 'circle'}
                >
                  <UploadOutlined /> 图片/视频
                </Button>
                <Button color="primary" size="small" loading={createPost.isPending} onClick={submitPost}>
                  发布
                </Button>
              </div>
            </Card>

            {posts.length === 0 ? (
              <Empty description={postsQuery.isLoading ? '加载中...' : '还没有家庭动态'} />
            ) : (
              posts.map((item) => (
                <FamilyPostCard
                  key={item.id}
                  post={item}
                  commentDraft={commentDrafts[item.id] ?? ''}
                  onCommentDraftChange={(value) =>
                    setCommentDrafts((current) => ({ ...current, [item.id]: value }))
                  }
                  onSubmitComment={() => void submitComment(item.id)}
                  onToggleLike={() =>
                    item.likedByMe ? unlikePost.mutate(item.id) : likePost.mutate(item.id)
                  }
                />
              ))
            )}
          </section>
        </PullToRefresh>
      ) : (
        <section className="mobile-family-chat-panel">
          <PullToRefresh onRefresh={async () => void (await chatQuery.refetch())}>
            <div className="mobile-family-chat-list">
              {messages.length === 0 ? (
                <Empty description={chatQuery.isLoading ? '加载中...' : '还没有群聊消息'} />
              ) : (
                messages.map((message) => <ChatMessageBubble key={message.id} message={message} />)
              )}
            </div>
          </PullToRefresh>

          <div className="mobile-family-chat-input">
            <input
              ref={chatInputRef}
              type="file"
              hidden
              multiple
              accept="image/*,video/*"
              onChange={(event) => {
                void uploadFiles(event.currentTarget.files, 'chat');
                event.currentTarget.value = '';
              }}
            />
            <Button
              className="mobile-family-icon-button"
              fill="none"
              onClick={() => chatInputRef.current?.click()}
              loading={uploadingTarget === 'chat'}
            >
              <PictureOutlined />
            </Button>
            <div className="mobile-family-chat-text">
              <TextArea
                value={chatText}
                placeholder="给家里人发消息"
                rows={1}
                autoSize={{ minRows: 1, maxRows: 4 }}
                onChange={setChatText}
              />
              <DraftMediaList items={chatMedia} />
            </div>
            <Button color="primary" loading={createChatMessage.isPending} onClick={submitChatMessage}>
              <SendOutlined /> 发送
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function FamilyPostCard({
  post,
  commentDraft,
  onCommentDraftChange,
  onSubmitComment,
  onToggleLike,
}: {
  post: FamilyPost;
  commentDraft: string;
  onCommentDraftChange: (value: string) => void;
  onSubmitComment: () => void;
  onToggleLike: () => void;
}) {
  return (
    <Card className="mobile-card mobile-family-post-card">
      <div className="mobile-family-author">
        <strong>{displayName(post.author)}</strong>
        <span>{formatTime(post.createdAt)}</span>
      </div>
      {post.content ? <p className="mobile-family-content">{post.content}</p> : null}
      <MediaGrid media={post.media} />
      <div className="mobile-family-post-actions">
        <Button size="small" fill="none" onClick={onToggleLike}>
          {post.likedByMe ? <HeartFilled /> : <HeartOutlined />} {post.likeCount}
        </Button>
        <span>
          <MessageOutlined /> {post.comments.length}
        </span>
      </div>
      {post.comments.length > 0 ? (
        <div className="mobile-family-comments">
          {post.comments.map((comment) => (
            <div key={comment.id}>
              <strong>{displayName(comment.author)}</strong>
              <span>{comment.content}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mobile-family-comment-input">
        <TextArea
          value={commentDraft}
          placeholder="写评论"
          rows={1}
          autoSize={{ minRows: 1, maxRows: 3 }}
          onChange={onCommentDraftChange}
        />
        <Button size="small" onClick={onSubmitComment}>
          评论
        </Button>
      </div>
    </Card>
  );
}

function ChatMessageBubble({ message }: { message: FamilyChatMessage }) {
  return (
    <div className="mobile-family-chat-message">
      <div className="mobile-family-chat-meta">
        <strong>{displayName(message.sender)}</strong>
        <span>{formatTime(message.createdAt)}</span>
      </div>
      <div className="mobile-family-chat-bubble">
        {message.content ? <p>{message.content}</p> : null}
        <MediaGrid media={message.media} />
      </div>
    </div>
  );
}
