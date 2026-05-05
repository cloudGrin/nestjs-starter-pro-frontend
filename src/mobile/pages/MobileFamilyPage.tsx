import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, Empty, PullToRefresh, TextArea, Toast } from 'antd-mobile';
import {
  CloseCircleFilled,
  DeleteOutlined,
  EllipsisOutlined,
  HeartFilled,
  HeartOutlined,
  LeftOutlined,
  MenuOutlined,
  MessageFilled,
  PlayCircleFilled,
  PlusOutlined,
  SendOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  familyQueryKeys,
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
  FamilyPostComment,
  FamilyPost,
  FamilyUserSummary,
} from '@/features/family/types/family.types';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { MobileModuleMenu } from '../components/MobileModuleHeader';

interface DraftMediaItem {
  id: string;
  file: File;
  name: string;
  mediaType: FamilyMedia['mediaType'];
  previewUrl?: string;
}

interface PreviewMediaItem {
  id: string;
  url: string;
  name?: string;
  mediaType: FamilyMedia['mediaType'];
}

type FamilyAvatarSize = 'regular' | 'small' | 'mini';

interface CommentTarget {
  postId: number;
  parentCommentId?: number;
  replyToName?: string;
}

function displayName(user?: FamilyUserSummary | null) {
  return user?.realName || user?.nickname || user?.username || '家人';
}

function avatarInitial(user?: FamilyUserSummary | null) {
  return displayName(user).slice(0, 1).toUpperCase();
}

function formatFeedDate(value: string) {
  return dayjs(value).format('YYYY-MM-DD');
}

function formatChatTime(value: string) {
  return dayjs(value).format('HH:mm');
}

function formatChatDivider(value: string) {
  return dayjs(value).format('YYYY/M/D HH:mm');
}

function isVideo(media: Pick<FamilyMedia, 'mediaType' | 'mimeType'>) {
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

function toPreviewItems(media: FamilyMedia[]): PreviewMediaItem[] {
  return media.map((item) => ({
    id: String(item.id),
    url: item.displayUrl,
    name: item.originalName,
    mediaType: isVideo(item) ? 'video' : 'image',
  }));
}

function useFamilyRealtime({
  refetchPosts,
  refetchChatMessages,
}: {
  refetchPosts?: () => void | Promise<unknown>;
  refetchChatMessages?: () => void | Promise<unknown>;
}) {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    const refreshPosts = () => {
      void queryClient.invalidateQueries({ queryKey: familyQueryKeys.posts() });
      void refetchPosts?.();
    };
    const refreshChatMessages = () => {
      void queryClient.invalidateQueries({ queryKey: familyQueryKeys.chatMessages() });
      void refetchChatMessages?.();
    };

    return connectFamilySocket(token, {
      onPostCreated: refreshPosts,
      onPostCommentCreated: refreshPosts,
      onPostLikeChanged: refreshPosts,
      onChatMessageCreated: refreshChatMessages,
      onNotificationCreated: () => undefined,
    });
  }, [queryClient, refetchChatMessages, refetchPosts, token]);
}

function useDraftMedia() {
  const [items, setItems] = useState<DraftMediaItem[]>([]);
  const itemsRef = useRef<DraftMediaItem[]>([]);
  const sequenceRef = useRef(0);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach(revokeDraftPreview);
    };
  }, []);

  const addFiles = useCallback((files: FileList | File[] | null | undefined) => {
    setItems((current) => {
      const remainingSlots = Math.max(0, 9 - current.length);
      const selected = Array.from(files ?? []).slice(0, remainingSlots);
      if (selected.length === 0) return current;

      const nextItems = selected.map((file) => {
        sequenceRef.current += 1;
        return {
          id: `${Date.now()}-${sequenceRef.current}-${file.name}`,
          file,
          name: file.name,
          mediaType: file.type.startsWith('video/') ? 'video' : 'image',
          previewUrl: getPreviewUrl(file),
        } satisfies DraftMediaItem;
      });

      return [...current, ...nextItems];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => {
      current.filter((item) => item.id === id).forEach(revokeDraftPreview);
      return current.filter((item) => item.id !== id);
    });
  }, []);

  const clearItems = useCallback(() => {
    setItems((current) => {
      current.forEach(revokeDraftPreview);
      return [];
    });
  }, []);

  return { items, addFiles, removeItem, clearItems };
}

async function uploadDraftMedia(items: DraftMediaItem[], target: FamilyMediaTarget) {
  const uploadedIds: number[] = [];
  for (const item of items) {
    const uploadedFile = await familyService.uploadFamilyMedia(item.file, target);
    uploadedIds.push(uploadedFile.id);
  }

  return uploadedIds;
}

function FamilyAvatar({
  user,
  size = 'regular',
}: {
  user?: FamilyUserSummary | null;
  size?: FamilyAvatarSize;
}) {
  const name = displayName(user);
  const className = ['mobile-family-avatar', size === 'regular' ? '' : size]
    .filter(Boolean)
    .join(' ');

  if (user?.avatar) {
    return <img className={`${className} image`} src={user.avatar} alt={name} />;
  }

  return (
    <span className={`${className} text`}>
      <span className="mobile-family-avatar-letter">{avatarInitial(user)}</span>
    </span>
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
        <FamilyAvatar key={user.id} user={user} size="small" />
      ))}
      {remainingCount > 0 ? (
        <span className="mobile-family-avatar small text">
          <span className="mobile-family-avatar-letter">+{remainingCount}</span>
        </span>
      ) : null}
    </div>
  );
}

function FamilyCommentLine({ comment }: { comment: FamilyPostComment }) {
  const authorName = displayName(comment.author);
  const replyToName = displayName(comment.replyToUser);

  if (comment.parentCommentId) {
    return (
      <>
        <strong>{authorName}</strong>
        <span className="mobile-family-comment-reply-label">回复</span>
        <strong>{replyToName}</strong>
        <span>：{comment.content}</span>
      </>
    );
  }

  return (
    <>
      <strong>{authorName}：</strong>
      <span>{comment.content}</span>
    </>
  );
}

function MediaGrid({
  media,
  compact = false,
  onPreview,
}: {
  media: FamilyMedia[];
  compact?: boolean;
  onPreview?: (index: number) => void;
}) {
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
        <button
          className="mobile-family-media-item"
          key={item.id}
          type="button"
          onClick={() => onPreview?.(index)}
        >
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
        </button>
      ))}
    </div>
  );
}

function DraftMediaGrid({
  items,
  onAdd,
  onRemove,
  onPreview,
}: {
  items: DraftMediaItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onPreview: (index: number) => void;
}) {
  return (
    <div className="mobile-family-compose-grid">
      {items.map((item, index) => (
        <div className="mobile-family-draft-tile" key={item.id}>
          <button type="button" onClick={() => onPreview(index)}>
            {item.previewUrl && item.mediaType === 'video' ? (
              <video src={item.previewUrl} muted playsInline preload="metadata" />
            ) : item.previewUrl ? (
              <img src={item.previewUrl} alt={item.name} />
            ) : (
              <span className="mobile-family-draft-file">{item.name}</span>
            )}
          </button>
          <button type="button" onClick={() => onRemove(item.id)}>
            <CloseCircleFilled />
          </button>
          {item.previewUrl ? <span>{item.name}</span> : null}
        </div>
      ))}
      {items.length < 9 ? (
        <button className="mobile-family-add-media-tile" type="button" onClick={onAdd}>
          <PlusOutlined />
        </button>
      ) : null}
    </div>
  );
}

function ChatDraftMediaStrip({
  items,
  onPreview,
  onRemove,
}: {
  items: DraftMediaItem[];
  onPreview: (index: number) => void;
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mobile-family-chat-draft-strip">
      {items.map((item, index) => (
        <div className="mobile-family-chat-draft-item" key={item.id}>
          <button
            className="mobile-family-chat-draft-preview"
            type="button"
            onClick={() => onPreview(index)}
          >
            {item.previewUrl && item.mediaType === 'video' ? (
              <video src={item.previewUrl} muted playsInline preload="metadata" />
            ) : item.previewUrl ? (
              <img src={item.previewUrl} alt={item.name} />
            ) : (
              <span className="mobile-family-chat-draft-file">{item.name}</span>
            )}
          </button>
          <button
            className="mobile-family-chat-draft-remove"
            type="button"
            aria-label={`移除 ${item.name}`}
            onClick={() => onRemove(item.id)}
          >
            <CloseCircleFilled />
            <span className="mobile-family-sr">移除 {item.name}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

function MediaPreviewOverlay({
  items,
  index,
  onClose,
  onDelete,
}: {
  items: PreviewMediaItem[];
  index: number | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(index ?? 0);

  useEffect(() => {
    setCurrentIndex(index ?? 0);
  }, [index]);

  if (index === null || items.length === 0) {
    return null;
  }

  const safeIndex = Math.min(currentIndex, items.length - 1);
  const item = items[safeIndex];
  const canGoPrevious = safeIndex > 0;
  const canGoNext = safeIndex < items.length - 1;

  const handleDelete = () => {
    void Dialog.confirm({
      content: '确定要删除吗',
      cancelText: '取消',
      confirmText: '删除',
      onConfirm: () => {
        onDelete?.(item.id);
        if (items.length <= 1) {
          onClose();
          return;
        }
        setCurrentIndex((current) => Math.max(0, Math.min(current, items.length - 2)));
      },
    });
  };

  return (
    <div className="mobile-family-preview">
      <div className="mobile-family-preview-header">
        <button type="button" onClick={onClose}>
          <LeftOutlined />
        </button>
        <strong>
          {safeIndex + 1}/{items.length}
        </strong>
        {onDelete ? (
          <button type="button" onClick={handleDelete}>
            <DeleteOutlined />
          </button>
        ) : (
          <span />
        )}
      </div>
      <div className="mobile-family-preview-media">
        {item.mediaType === 'video' ? (
          <video src={item.url} controls playsInline />
        ) : (
          <img src={item.url} alt={item.name || '家庭图片'} />
        )}
      </div>
      {canGoPrevious ? (
        <button
          className="mobile-family-preview-arrow previous"
          type="button"
          onClick={() => setCurrentIndex((current) => current - 1)}
        >
          <LeftOutlined />
        </button>
      ) : null}
      {canGoNext ? (
        <button
          className="mobile-family-preview-arrow next"
          type="button"
          onClick={() => setCurrentIndex((current) => current + 1)}
        >
          <LeftOutlined />
        </button>
      ) : null}
    </div>
  );
}

function FamilyPostCard({
  post,
  onPreview,
  onToggleLike,
  commentDraft,
  commentOpen,
  commentPlaceholder,
  commentSubmitting,
  commentInputRef,
  onCommentDraftChange,
  onReplyComment,
  onSubmitComment,
  onToggleComment,
}: {
  post: FamilyPost;
  onPreview: (index: number) => void;
  onToggleLike: () => void;
  commentDraft: string;
  commentOpen: boolean;
  commentPlaceholder: string;
  commentSubmitting: boolean;
  commentInputRef?: RefObject<HTMLDivElement>;
  onCommentDraftChange: (value: string) => void;
  onReplyComment: (comment: FamilyPostComment) => void;
  onSubmitComment: () => void;
  onToggleComment: () => void;
}) {
  const hasMedia = post.media.length > 0;
  const comments = post.comments ?? [];
  const reactions = (
    <div className="mobile-family-feed-reactions">
      <LikedUserStack users={post.likedUsers} />
      <div className="mobile-family-feed-action-group">
        <button
          className={
            post.likedByMe ? 'mobile-family-like-action active' : 'mobile-family-like-action'
          }
          type="button"
          onClick={onToggleLike}
        >
          {post.likedByMe ? <HeartFilled /> : <HeartOutlined />}
          <span className="mobile-family-sr">点赞</span>
        </button>
        <button className="mobile-family-comment-action" type="button" onClick={onToggleComment}>
          <MessageFilled />
          <span className="mobile-family-action-label">评论</span>
        </button>
      </div>
    </div>
  );

  return (
    <article
      className={
        hasMedia ? 'mobile-family-feed-card has-media' : 'mobile-family-feed-card text-only'
      }
    >
      <div className="mobile-family-feed-author">
        <FamilyAvatar user={post.author} size={hasMedia ? 'regular' : 'small'} />
        <div className="mobile-family-feed-author-main">
          <strong>{displayName(post.author)}</strong>
          <span>{formatFeedDate(post.createdAt)}</span>
        </div>
      </div>
      <MediaGrid media={post.media} onPreview={onPreview} />
      {hasMedia ? reactions : null}
      {post.content ? <div className="mobile-family-feed-content">{post.content}</div> : null}
      {!hasMedia ? reactions : null}
      {comments.length ? (
        <div className="mobile-family-comment-list">
          {comments.map((comment) => (
            <button
              key={comment.id}
              className={
                comment.parentCommentId
                  ? 'mobile-family-feed-comment reply'
                  : 'mobile-family-feed-comment'
              }
              type="button"
              onClick={() => onReplyComment(comment)}
            >
              <FamilyCommentLine comment={comment} />
            </button>
          ))}
        </div>
      ) : null}
      {commentOpen ? (
        <div className="mobile-family-inline-comment" ref={commentInputRef}>
          <TextArea
            value={commentDraft}
            placeholder={commentPlaceholder}
            rows={1}
            autoSize={{ minRows: 1, maxRows: 3 }}
            onChange={onCommentDraftChange}
          />
          <Button size="small" loading={commentSubmitting} onClick={onSubmitComment}>
            发送
          </Button>
        </div>
      ) : null}
    </article>
  );
}

export function MobileFamilyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const postsQuery = useFamilyPosts({ page: 1, limit: 30 });
  const createComment = useCreateFamilyComment();
  const likePost = useLikeFamilyPost();
  const unlikePost = useUnlikeFamilyPost();
  const currentUser = useAuthStore((state) => state.user);
  const posts = useMemo(() => postsQuery.data?.items ?? [], [postsQuery.data?.items]);
  const [previewPost, setPreviewPost] = useState<FamilyPost | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [moduleMenuOpen, setModuleMenuOpen] = useState(false);
  const [commentTarget, setCommentTarget] = useState<CommentTarget | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [optimisticLikes, setOptimisticLikes] = useState<Record<number, boolean>>({});
  const commentInputRef = useRef<HTMLDivElement>(null);

  useFamilyRealtime({ refetchPosts: postsQuery.refetch });

  useEffect(() => {
    if (!commentTarget || typeof window === 'undefined') return undefined;

    const focusInput = () => {
      commentInputRef.current?.querySelector('textarea')?.focus();
    };
    if (typeof window.requestAnimationFrame !== 'function') {
      focusInput();
      return undefined;
    }

    const frame = window.requestAnimationFrame(focusInput);
    return () => window.cancelAnimationFrame(frame);
  }, [commentTarget]);

  if (searchParams.get('tab') === 'chat') {
    return <Navigate to="/family/chat" replace />;
  }

  const openPreview = (post: FamilyPost, index: number) => {
    setPreviewPost(post);
    setPreviewIndex(index);
  };

  const currentFamilyUser = currentUser
    ? ({
        id: currentUser.id,
        username: currentUser.username,
        nickname: currentUser.nickname,
        realName: currentUser.realName,
        avatar: currentUser.avatar,
      } satisfies FamilyUserSummary)
    : null;

  const getDisplayPost = (post: FamilyPost): FamilyPost => {
    const optimisticLikedByMe = optimisticLikes[post.id];
    if (optimisticLikedByMe === undefined) return post;

    const likedUsers = post.likedUsers ?? [];
    const withoutMe = currentUser
      ? likedUsers.filter((user) => user.id !== currentUser.id)
      : likedUsers;

    return {
      ...post,
      likedByMe: optimisticLikedByMe,
      likedUsers:
        optimisticLikedByMe && currentFamilyUser ? [currentFamilyUser, ...withoutMe] : withoutMe,
    };
  };

  const toggleComment = (postId: number) => {
    setCommentTarget((current) => {
      if (current?.postId === postId && !current.parentCommentId) {
        setCommentDraft('');
        return null;
      }
      setCommentDraft('');
      return { postId };
    });
  };

  const replyToComment = (postId: number, comment: FamilyPostComment) => {
    setCommentDraft('');
    setCommentTarget({
      postId,
      parentCommentId: comment.id,
      replyToName: displayName(comment.author),
    });
  };

  const submitComment = async (postId: number) => {
    const content = commentDraft.trim();
    if (!content) return;
    const target = commentTarget?.postId === postId ? commentTarget : null;

    try {
      await createComment.mutateAsync({
        postId,
        content,
        ...(target?.parentCommentId ? { parentCommentId: target.parentCommentId } : {}),
      });
      setCommentDraft('');
      setCommentTarget(null);
      void postsQuery.refetch();
    } catch {
      Toast.show({ icon: 'fail', content: '评论失败', position: 'center' });
    }
  };

  const toggleLike = (post: FamilyPost) => {
    const displayPost = getDisplayPost(post);
    const nextLikedByMe = !displayPost.likedByMe;

    setOptimisticLikes((current) => ({
      ...current,
      [post.id]: nextLikedByMe,
    }));

    const mutation = nextLikedByMe ? likePost : unlikePost;
    mutation.mutate(post.id, {
      onError: () => {
        setOptimisticLikes((current) => {
          const next = { ...current };
          delete next[post.id];
          return next;
        });
      },
    });
  };

  return (
    <div className="mobile-family-page warm">
      <header className="mobile-family-home-header">
        <button
          className="mobile-round-button mobile-family-menu-button"
          type="button"
          onClick={() => setModuleMenuOpen(true)}
        >
          <MenuOutlined />
          <span className="mobile-family-sr">菜单</span>
        </button>
        <h1 className="mobile-family-home-title">家庭圈</h1>
        <button
          className="mobile-family-logo-button"
          type="button"
          onClick={() => navigate('/family/chat')}
        >
          <MessageFilled />
          <span className="mobile-family-sr">家庭群聊</span>
        </button>
      </header>

      <PullToRefresh onRefresh={async () => void (await postsQuery.refetch())}>
        <section className="mobile-family-feed">
          {posts.length === 0 ? (
            <Empty description={postsQuery.isLoading ? '加载中...' : '还没有家庭动态'} />
          ) : (
            posts.map((item) => (
              <FamilyPostCard
                key={item.id}
                post={getDisplayPost(item)}
                onPreview={(index) => openPreview(item, index)}
                onToggleLike={() => toggleLike(item)}
                commentDraft={commentTarget?.postId === item.id ? commentDraft : ''}
                commentOpen={commentTarget?.postId === item.id}
                commentPlaceholder={
                  commentTarget?.postId === item.id && commentTarget.replyToName
                    ? `回复 ${commentTarget.replyToName}`
                    : '说点什么吧...'
                }
                commentSubmitting={createComment.isPending && commentTarget?.postId === item.id}
                commentInputRef={commentTarget?.postId === item.id ? commentInputRef : undefined}
                onCommentDraftChange={setCommentDraft}
                onReplyComment={(comment) => replyToComment(item.id, comment)}
                onSubmitComment={() => void submitComment(item.id)}
                onToggleComment={() => toggleComment(item.id)}
              />
            ))
          )}
        </section>
      </PullToRefresh>

      <MobileModuleMenu open={moduleMenuOpen} onClose={() => setModuleMenuOpen(false)} />
      <button
        className="mobile-family-compose-fab"
        type="button"
        onClick={() => navigate('/family/compose')}
      >
        <PlusOutlined />
        <span className="mobile-family-sr">发布家庭圈</span>
      </button>
      <MediaPreviewOverlay
        items={previewPost ? toPreviewItems(previewPost.media) : []}
        index={previewIndex}
        onClose={() => setPreviewIndex(null)}
      />
    </div>
  );
}

export function MobileFamilyComposePage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreateFamilyPost();
  const draft = useDraftMedia();
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const submitPost = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent && draft.items.length === 0) {
      Toast.show({ content: '写点内容或添加图片/视频', position: 'center' });
      return;
    }

    setUploading(true);
    try {
      const mediaFileIds = await uploadDraftMedia(draft.items, 'circle');
      await createPost.mutateAsync({ content: trimmedContent, mediaFileIds });
      draft.clearItems();
      setContent('');
      navigate('/family');
    } catch {
      Toast.show({ icon: 'fail', content: '发布失败', position: 'center' });
    } finally {
      setUploading(false);
    }
  };

  const previewItems = draft.items.map((item) => ({
    id: item.id,
    url: item.previewUrl || '',
    name: item.name,
    mediaType: item.mediaType,
  }));

  return (
    <div className="mobile-family-compose-page">
      <header className="mobile-family-compose-header">
        <button type="button" onClick={() => navigate('/family')}>
          取消
        </button>
        <Button color="primary" loading={uploading || createPost.isPending} onClick={submitPost}>
          发布
        </Button>
      </header>
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept="image/*,video/*"
        onChange={(event) => {
          draft.addFiles(event.currentTarget.files);
          event.currentTarget.value = '';
        }}
      />
      <DraftMediaGrid
        items={draft.items}
        onAdd={() => inputRef.current?.click()}
        onRemove={draft.removeItem}
        onPreview={setPreviewIndex}
      />
      <TextArea
        value={content}
        placeholder="这一刻的想法..."
        rows={2}
        autoSize={{ minRows: 2, maxRows: 6 }}
        maxLength={5000}
        onChange={setContent}
      />
      <MediaPreviewOverlay
        items={previewItems}
        index={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onDelete={draft.removeItem}
      />
    </div>
  );
}

function ChatMessageBubble({
  message,
  mine = false,
}: {
  message: FamilyChatMessage;
  mine?: boolean;
}) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  return (
    <div className={mine ? 'mobile-family-chat-message mine' : 'mobile-family-chat-message'}>
      {!mine ? <FamilyAvatar user={message.sender} size="small" /> : null}
      <div className="mobile-family-chat-body">
        <div className="mobile-family-chat-bubble">
          {message.content ? <p>{message.content}</p> : null}
          <MediaGrid media={message.media} compact onPreview={setPreviewIndex} />
        </div>
      </div>
      {mine ? <FamilyAvatar user={message.sender} size="small" /> : null}
      <MediaPreviewOverlay
        items={toPreviewItems(message.media)}
        index={previewIndex}
        onClose={() => setPreviewIndex(null)}
      />
    </div>
  );
}

function FamilyChatHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="mobile-family-chat-header">
      <button className="mobile-family-chat-back" type="button" onClick={onBack}>
        <LeftOutlined />
        <span className="mobile-family-sr">返回家庭圈</span>
      </button>
      <h1>家庭群聊</h1>
      <button className="mobile-family-chat-more" type="button">
        <EllipsisOutlined />
        <span className="mobile-family-sr">更多</span>
      </button>
    </header>
  );
}

export function MobileFamilyChatPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const chatListRef = useRef<HTMLElement>(null);
  const currentUser = useAuthStore((state) => state.user);
  const chatQuery = useFamilyChatMessages({ page: 1, limit: 100 });
  const createChatMessage = useCreateFamilyChatMessage();
  const draft = useDraftMedia();
  const [messageText, setMessageText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [attachmentPanelOpen, setAttachmentPanelOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useFamilyRealtime({
    refetchChatMessages: chatQuery.refetch,
  });

  const messages = useMemo(
    () =>
      [...(chatQuery.data?.items ?? [])].sort(
        (left, right) => dayjs(left.createdAt).valueOf() - dayjs(right.createdAt).valueOf()
      ),
    [chatQuery.data?.items]
  );
  const latestMessageTime = messages.at(-1)?.createdAt;
  const messageDay = latestMessageTime ? formatChatDivider(latestMessageTime) : null;
  const canSend = messageText.trim().length > 0 || draft.items.length > 0;
  const previewItems = draft.items.map((item) => ({
    id: item.id,
    url: item.previewUrl || '',
    name: item.name,
    mediaType: item.mediaType,
  }));

  useEffect(() => {
    const list = chatListRef.current;
    if (!list || typeof list.scrollTo !== 'function') return;
    list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [latestMessageTime]);

  const shouldShowTime = (message: FamilyChatMessage, index: number) => {
    if (index === 0) return false;
    const previous = messages[index - 1];
    return dayjs(message.createdAt).diff(previous.createdAt, 'minute') >= 5;
  };

  const submitMessage = async () => {
    const content = messageText.trim();
    if (!content && draft.items.length === 0) {
      Toast.show({ content: '写点内容或添加图片/视频', position: 'center' });
      return;
    }

    setUploading(true);
    try {
      const mediaFileIds = await uploadDraftMedia(draft.items, 'chat');
      await createChatMessage.mutateAsync({ content, mediaFileIds });
      draft.clearItems();
      setMessageText('');
      setAttachmentPanelOpen(false);
      setPreviewIndex(null);
    } catch {
      Toast.show({ icon: 'fail', content: '消息发送失败', position: 'center' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mobile-family-chat-page wechat-warm">
      <FamilyChatHeader onBack={() => navigate('/family')} />
      <PullToRefresh
        onRefresh={async () => {
          await chatQuery.refetch();
        }}
      >
        <section className="mobile-family-chat-list warm" ref={chatListRef}>
          {messages.length === 0 ? (
            <Empty description={chatQuery.isLoading ? '加载中...' : '还没有家庭消息'} />
          ) : (
            <>
              {messageDay ? (
                <div className="mobile-family-chat-date-divider">{messageDay}</div>
              ) : null}
              {messages.map((item, index) => (
                <div className="mobile-family-chat-message-group" key={item.id}>
                  {shouldShowTime(item, index) ? (
                    <div className="mobile-family-chat-time-divider">
                      {formatChatTime(item.createdAt)}
                    </div>
                  ) : null}
                  <ChatMessageBubble message={item} mine={item.senderId === currentUser?.id} />
                </div>
              ))}
            </>
          )}
        </section>
      </PullToRefresh>
      <div className="mobile-family-chat-input warm">
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          accept="image/*,video/*"
          onChange={(event) => {
            draft.addFiles(event.currentTarget.files);
            event.currentTarget.value = '';
          }}
        />
        <div className="mobile-family-chat-input-row">
          <div className="mobile-family-chat-text">
            <TextArea
              value={messageText}
              placeholder="给家里人发消息"
              rows={1}
              autoSize={{ minRows: 1, maxRows: 4 }}
              onChange={setMessageText}
            />
          </div>
          <button
            className={
              attachmentPanelOpen ? 'mobile-family-chat-tool active' : 'mobile-family-chat-tool'
            }
            type="button"
            onClick={() => setAttachmentPanelOpen((open) => !open)}
          >
            <PlusOutlined />
            <span className="mobile-family-sr">添加图片或视频</span>
          </button>
          <Button
            className={canSend ? 'mobile-family-chat-send active' : 'mobile-family-chat-send'}
            loading={uploading || createChatMessage.isPending}
            disabled={!canSend}
            onClick={submitMessage}
          >
            <SendOutlined />
            <span className="mobile-family-sr">发送</span>
          </Button>
        </div>
        <ChatDraftMediaStrip
          items={draft.items}
          onPreview={setPreviewIndex}
          onRemove={draft.removeItem}
        />
        {attachmentPanelOpen ? (
          <div className="mobile-family-chat-attachment-panel">
            <button
              className="mobile-family-chat-attachment-action"
              type="button"
              onClick={() => inputRef.current?.click()}
            >
              <PlusOutlined />
              <span>照片/视频</span>
            </button>
          </div>
        ) : null}
      </div>
      <MediaPreviewOverlay
        items={previewItems}
        index={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onDelete={draft.removeItem}
      />
    </div>
  );
}
