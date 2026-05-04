import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Empty, PullToRefresh, TextArea, Toast } from 'antd-mobile';
import {
  CameraOutlined,
  CloseCircleFilled,
  HeartFilled,
  HeartOutlined,
  MessageOutlined,
  PictureOutlined,
  PlayCircleFilled,
  SendOutlined,
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
  FamilyUserSummary,
} from '@/features/family/types/family.types';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { MobileModuleHeader } from '../components/MobileModuleHeader';

type FamilyTab = 'circle' | 'chat';

interface DraftMediaItem {
  fileId: number;
  name: string;
  target: FamilyMediaTarget;
  mediaType?: FamilyMedia['mediaType'];
  previewUrl?: string;
}

function parseFamilyTab(value: string | null): FamilyTab {
  return value === 'chat' ? 'chat' : 'circle';
}

function displayName(user?: FamilyUserSummary) {
  return user?.realName || user?.nickname || user?.username || '家人';
}

function avatarInitial(user?: FamilyUserSummary) {
  return displayName(user).slice(0, 1).toUpperCase();
}

function formatTime(value: string) {
  return dayjs(value).format('MM-DD HH:mm');
}

function isVideo(media: FamilyMedia) {
  return media.mediaType === 'video' || media.mimeType?.startsWith('video/');
}

function getPreviewUrl(file: File) {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return undefined;
  }

  try {
    return URL.createObjectURL(file);
  } catch {
    return undefined;
  }
}

function revokeDraftPreview(item: DraftMediaItem) {
  if (item.previewUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(item.previewUrl);
  }
}

function FamilyAvatar({ user, small = false }: { user?: FamilyUserSummary; small?: boolean }) {
  const name = displayName(user);
  const className = small ? 'mobile-family-avatar small' : 'mobile-family-avatar';

  if (user?.avatar) {
    return <img className={className} src={user.avatar} alt={name} />;
  }

  return <span className={className}>{avatarInitial(user)}</span>;
}

function MediaGrid({ media, compact = false }: { media: FamilyMedia[]; compact?: boolean }) {
  if (!media?.length) {
    return null;
  }

  const visibleMedia = compact ? media.slice(0, 2) : media.slice(0, 9);
  const remainingCount = media.length - visibleMedia.length;
  const className = [
    'mobile-family-media-grid',
    media.length === 1 ? 'single' : '',
    compact ? 'compact' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      {visibleMedia.map((item, index) => (
        <div className="mobile-family-media-item" key={item.id}>
          {isVideo(item) ? (
            <>
              <video src={item.displayUrl} controls playsInline preload="metadata" />
              <span className="mobile-family-video-mark">
                <PlayCircleFilled />
              </span>
            </>
          ) : (
            <img src={item.displayUrl} alt="家庭图片" loading="lazy" />
          )}
          {remainingCount > 0 && index === visibleMedia.length - 1 ? (
            <span className="mobile-family-media-more">+{remainingCount}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function DraftMediaGrid({
  items,
  uploading,
  onAdd,
  onRemove,
}: {
  items: DraftMediaItem[];
  uploading: boolean;
  onAdd: () => void;
  onRemove: (fileId: number) => void;
}) {
  return (
    <div className="mobile-family-compose-grid">
      {items.map((item) => (
        <div className="mobile-family-draft-tile" key={`${item.target}-${item.fileId}`}>
          {item.previewUrl && item.mediaType === 'video' ? (
            <video src={item.previewUrl} muted playsInline preload="metadata" />
          ) : item.previewUrl ? (
            <img src={item.previewUrl} alt={item.name} />
          ) : (
            <span className="mobile-family-draft-file">{item.name}</span>
          )}
          <button type="button" onClick={() => onRemove(item.fileId)}>
            <CloseCircleFilled />
          </button>
          <span>{item.name}</span>
        </div>
      ))}
      {items.length < 9 ? (
        <Button className="mobile-family-add-media-tile" loading={uploading} onClick={onAdd}>
          <CameraOutlined />
          <span>添加图片/视频</span>
        </Button>
      ) : null}
    </div>
  );
}

function DraftMediaList({ items }: { items: DraftMediaItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mobile-family-draft-media">
      {items.map((item) => (
        <span key={`${item.target}-${item.fileId}`}>{item.name}</span>
      ))}
    </div>
  );
}

function LikedUserStack({ users = [] }: { users?: FamilyUserSummary[] }) {
  if (users.length === 0) {
    return null;
  }

  const visibleUsers = users.slice(0, 6);
  const remainingCount = users.length - visibleUsers.length;

  return (
    <div className="mobile-family-liked-users">
      {visibleUsers.map((user) => (
        <FamilyAvatar key={user.id} user={user} small />
      ))}
      {remainingCount > 0 ? <span>+{remainingCount}</span> : null}
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
  const currentUser = useAuthStore((state) => state.user);

  const postsQuery = useFamilyPosts({ page: 1, limit: 30 });
  const chatQuery = useFamilyChatMessages({ page: 1, limit: 100 });
  const createPost = useCreateFamilyPost();
  const createComment = useCreateFamilyComment();
  const likePost = useLikeFamilyPost();
  const unlikePost = useUnlikeFamilyPost();
  const createChatMessage = useCreateFamilyChatMessage();
  const { refetch: refetchPosts } = postsQuery;
  const { refetch: refetchChatMessages } = chatQuery;
  const posts = useMemo(() => postsQuery.data?.items ?? [], [postsQuery.data?.items]);
  const messages = useMemo(() => chatQuery.data?.items ?? [], [chatQuery.data?.items]);
  const heroUsers = useMemo(() => {
    const users = [
      currentUser,
      ...posts.map((item) => item.author),
      ...messages.map((item) => item.sender),
    ];
    const seen = new Set<number>();
    return users
      .filter((user): user is FamilyUserSummary => Boolean(user?.id))
      .filter((user) => {
        if (seen.has(user.id)) return false;
        seen.add(user.id);
        return true;
      })
      .slice(0, 4);
  }, [currentUser, messages, posts]);

  useEffect(() => {
    return connectFamilySocket(token, {
      onPostCreated: () => void refetchPosts(),
      onPostCommentCreated: () => void refetchPosts(),
      onPostLikeChanged: () => void refetchPosts(),
      onChatMessageCreated: () => void refetchChatMessages(),
      onNotificationCreated: () => undefined,
    });
  }, [refetchChatMessages, refetchPosts, token]);

  const switchTab = (tab: FamilyTab) => {
    setSearchParams(tab === 'chat' ? { tab } : {});
  };

  const removeDraftMedia = (target: FamilyMediaTarget, fileId: number) => {
    const update = (current: DraftMediaItem[]) => {
      current.filter((item) => item.fileId === fileId).forEach(revokeDraftPreview);
      return current.filter((item) => item.fileId !== fileId);
    };

    if (target === 'circle') {
      setPostMedia(update);
    } else {
      setChatMedia(update);
    }
  };

  const uploadFiles = async (files: FileList | null | undefined, target: FamilyMediaTarget) => {
    const currentCount = target === 'circle' ? postMedia.length : chatMedia.length;
    const remainingSlots = Math.max(0, 9 - currentCount);
    const selected = Array.from(files ?? []).slice(0, remainingSlots);
    if (selected.length === 0) return;

    setUploadingTarget(target);
    try {
      const draftItems: DraftMediaItem[] = [];
      for (const file of selected) {
        const uploadedFile = await familyService.uploadFamilyMedia(file, target);
        draftItems.push({
          fileId: uploadedFile.id,
          name: uploadedFile.originalName || uploadedFile.filename || `文件 ${uploadedFile.id}`,
          target,
          mediaType: file.type.startsWith('video/') ? 'video' : 'image',
          previewUrl: getPreviewUrl(file),
        });
      }
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
    postMedia.forEach(revokeDraftPreview);
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
    chatMedia.forEach(revokeDraftPreview);
    setChatText('');
    setChatMedia([]);
  };

  return (
    <div className="mobile-page mobile-family-page">
      <section className="mobile-family-hero">
        <MobileModuleHeader
          title="家庭"
          subtitle={activeTab === 'circle' ? '珍藏生活的每个瞬间' : '不错过每一条消息'}
          actions={
            <Button
              className="mobile-family-view-switch"
              fill="none"
              size="small"
              onClick={() => switchTab(activeTab === 'circle' ? 'chat' : 'circle')}
            >
              {activeTab === 'circle' ? <MessageOutlined /> : <PictureOutlined />}
              {activeTab === 'circle' ? '群聊' : '家庭圈'}
            </Button>
          }
        />
        <div className="mobile-family-hero-panel">
          <div>
            <span>{dayjs().format('MM月DD日')}</span>
            <strong>
              {activeTab === 'circle' ? `${posts.length} 条动态` : `${messages.length} 条消息`}
            </strong>
          </div>
          <div className="mobile-family-hero-avatars">
            {heroUsers.length > 0 ? (
              heroUsers.map((user) => <FamilyAvatar key={user.id} user={user} small />)
            ) : (
              <FamilyAvatar small />
            )}
          </div>
        </div>
      </section>

      {activeTab === 'circle' ? (
        <PullToRefresh onRefresh={async () => void (await postsQuery.refetch())}>
          <section className="mobile-family-section">
            <Card className="mobile-card mobile-family-composer">
              <div className="mobile-family-composer-title">
                <span>
                  <CameraOutlined />
                </span>
                <strong>今天想分享什么</strong>
              </div>
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
              <DraftMediaGrid
                items={postMedia}
                uploading={uploadingTarget === 'circle'}
                onAdd={() => postInputRef.current?.click()}
                onRemove={(fileId) => removeDraftMedia('circle', fileId)}
              />
              <TextArea
                value={postText}
                placeholder="这一刻的想法..."
                rows={1}
                autoSize={{ minRows: 1, maxRows: 4 }}
                maxLength={5000}
                onChange={setPostText}
              />
              <div className="mobile-family-composer-actions">
                <span>最多 9 张图片/视频</span>
                <Button
                  className="mobile-family-primary-button"
                  color="primary"
                  size="small"
                  loading={createPost.isPending}
                  onClick={submitPost}
                >
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
                messages.map((message) => (
                  <ChatMessageBubble
                    key={message.id}
                    message={message}
                    mine={message.senderId === currentUser?.id}
                  />
                ))
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
            <Button
              className="mobile-family-primary-button"
              color="primary"
              loading={createChatMessage.isPending}
              onClick={submitChatMessage}
            >
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
        <div className="mobile-family-author-main">
          <FamilyAvatar user={post.author} />
          <div>
            <strong>{displayName(post.author)}</strong>
            <span>{formatTime(post.createdAt)}</span>
          </div>
        </div>
        <span className="mobile-family-post-mark">家庭圈</span>
      </div>
      {post.content ? <p className="mobile-family-content">{post.content}</p> : null}
      <MediaGrid media={post.media} />
      <LikedUserStack users={post.likedUsers} />
      <div className="mobile-family-post-actions">
        <Button size="small" fill="none" onClick={onToggleLike}>
          {post.likedByMe ? <HeartFilled /> : <HeartOutlined />}{' '}
          {post.likedByMe ? '已喜欢' : '喜欢'}
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

function ChatMessageBubble({
  message,
  mine = false,
}: {
  message: FamilyChatMessage;
  mine?: boolean;
}) {
  return (
    <div className={mine ? 'mobile-family-chat-message mine' : 'mobile-family-chat-message'}>
      {!mine ? <FamilyAvatar user={message.sender} small /> : null}
      <div className="mobile-family-chat-body">
        <div className="mobile-family-chat-meta">
          <strong>{displayName(message.sender)}</strong>
          <span>{formatTime(message.createdAt)}</span>
        </div>
        <div className="mobile-family-chat-bubble">
          {message.content ? <p>{message.content}</p> : null}
          <MediaGrid media={message.media} compact />
        </div>
      </div>
      {mine ? <FamilyAvatar user={message.sender} small /> : null}
    </div>
  );
}
