import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type TouchEvent,
  type FocusEvent,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, Empty, PullToRefresh, TextArea, Toast } from 'antd-mobile';
import {
  CloseCircleFilled,
  DeleteOutlined,
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
  useFamilyState,
  useLikeFamilyPost,
  useUnlikeFamilyPost,
} from '@/features/family/hooks/useFamily';
import { connectFamilySocket } from '@/features/family/realtime/familySocket';
import { familyService } from '@/features/family/services/family.service';
import type {
  FamilyChatMessage,
  FamilyChatMessageCreatedEvent,
  FamilyPaginationResult,
  FamilyMedia,
  FamilyMediaTarget,
  FamilyPostComment,
  FamilyPostCreatedEvent,
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

const FAMILY_POST_LIST_PARAMS = { page: 1, limit: 30 };
const FAMILY_CHAT_LIST_PARAMS = { page: 1, limit: 100 };
const CHAT_BOTTOM_THRESHOLD_PX = 80;

type FamilyAvatarSize = 'regular' | 'small' | 'mini';

interface CommentTarget {
  postId: number;
  parentCommentId?: number;
  replyToName?: string;
}

function sameCommentTarget(left?: CommentTarget | null, right?: CommentTarget | null) {
  return (
    Boolean(left && right) &&
    left?.postId === right?.postId &&
    left?.parentCommentId === right?.parentCommentId &&
    left?.replyToName === right?.replyToName
  );
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

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function formatUnreadBadge(count?: number | null) {
  if (!count || count <= 0) return null;
  return count > 99 ? '99+' : String(count);
}

function getLatestPostId(posts: FamilyPost[]) {
  return posts.reduce<number | null>((latest, item) => Math.max(latest ?? 0, item.id), null);
}

function getLatestMessageId(messages: FamilyChatMessage[]) {
  return messages.reduce<number | null>((latest, item) => Math.max(latest ?? 0, item.id), null);
}

function mergeFamilyPostResults(
  current: FamilyPaginationResult<FamilyPost> | undefined,
  incoming: FamilyPaginationResult<FamilyPost>
): FamilyPaginationResult<FamilyPost> {
  if (!current) return incoming;

  const seen = new Set<number>();
  const items = [...incoming.items, ...current.items].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  return {
    ...current,
    items,
    meta: {
      ...current.meta,
      totalItems: Math.max(current.meta.totalItems, items.length),
      itemCount: items.length,
    },
  };
}

function mergeFamilyChatMessageResults(
  current: FamilyPaginationResult<FamilyChatMessage> | undefined,
  incoming: FamilyPaginationResult<FamilyChatMessage>
): FamilyPaginationResult<FamilyChatMessage> {
  if (!current) return incoming;

  const messagesById = new Map<number, FamilyChatMessage>();
  [...current.items, ...incoming.items].forEach((item) => {
    messagesById.set(item.id, item);
  });
  const items = Array.from(messagesById.values()).sort((left, right) => left.id - right.id);

  return {
    ...current,
    items,
    meta: {
      ...current.meta,
      totalItems: Math.max(current.meta.totalItems, items.length),
      itemCount: items.length,
    },
  };
}

function formatNewPostPrompt(events: FamilyPostCreatedEvent[]) {
  if (events.length === 0) return '';
  if (events.length === 1) {
    return `${displayName(events[0].author)}有新的动态`;
  }

  const names = Array.from(new Set(events.map((event) => displayName(event.author)))).slice(0, 2);
  return `${names.join('、')}${events.length > names.length ? '等' : ''}有 ${
    events.length
  } 条新动态`;
}

function isNearScrollBottom(element: HTMLElement | null) {
  if (!element) return true;
  return (
    element.scrollHeight - element.scrollTop - element.clientHeight <= CHAT_BOTTOM_THRESHOLD_PX
  );
}

function isVideo(media: Pick<FamilyMedia, 'mediaType' | 'mimeType'>) {
  return media.mediaType === 'video' || media.mimeType?.startsWith('video/');
}

function isVideoFile(file: File) {
  return file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi|wmv)$/i.test(file.name);
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
  onPostCreated,
  onChatMessageCreated,
}: {
  refetchPosts?: () => void | Promise<unknown>;
  refetchChatMessages?: () => void | Promise<unknown>;
  onPostCreated?: (event: FamilyPostCreatedEvent) => void;
  onChatMessageCreated?: (event: FamilyChatMessageCreatedEvent) => void;
}) {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    const refreshPosts = () => {
      void queryClient.invalidateQueries({ queryKey: familyQueryKeys.posts() });
      void refetchPosts?.();
    };

    return connectFamilySocket(token, {
      onPostCreated: (event) => {
        void queryClient.invalidateQueries({
          queryKey: familyQueryKeys.posts(),
          refetchType: 'inactive',
        });
        void queryClient.invalidateQueries({ queryKey: familyQueryKeys.state() });
        onPostCreated?.(event);
      },
      onPostCommentCreated: refreshPosts,
      onPostLikeChanged: refreshPosts,
      onChatMessageCreated: (event) => {
        void queryClient.invalidateQueries({
          queryKey: familyQueryKeys.chatMessages(),
          refetchType: 'inactive',
        });
        void queryClient.invalidateQueries({ queryKey: familyQueryKeys.state() });
        if (onChatMessageCreated) {
          onChatMessageCreated(event);
        } else {
          void refetchChatMessages?.();
        }
      },
      onNotificationCreated: () => undefined,
    });
  }, [onChatMessageCreated, onPostCreated, queryClient, refetchChatMessages, refetchPosts, token]);
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
          mediaType: isVideoFile(file) ? 'video' : 'image',
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

function FamilyIconButton({
  label,
  className,
  onClick,
  children,
  badge,
}: {
  label: string;
  className?: string;
  onClick: () => void;
  children: ReactNode;
  badge?: string | null;
}) {
  return (
    <button
      className={joinClassNames('mobile-family-icon-button', className)}
      type="button"
      onClick={onClick}
    >
      {children}
      {badge ? <span className="mobile-family-icon-badge">{badge}</span> : null}
      <span className="mobile-family-sr">{label}</span>
    </button>
  );
}

function FamilyTopBar({
  title,
  className,
  left,
  right,
}: {
  title: string;
  className?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className={joinClassNames('mobile-family-top-bar', className)}>
      <div className="mobile-family-top-bar-slot start">{left}</div>
      <h1 className="mobile-family-top-bar-title">{title}</h1>
      <div className="mobile-family-top-bar-slot end">{right}</div>
    </header>
  );
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
    !compact && media.length === 4 ? 'quad' : '',
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
  const className = items.length
    ? 'mobile-family-compose-grid has-items'
    : 'mobile-family-compose-grid empty';

  return (
    <div className={className}>
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
          <span className="mobile-family-add-media-icon">
            <PlusOutlined />
          </span>
          <strong>照片/视频</strong>
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
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'previous' | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setCurrentIndex(index ?? 0);
    setTransitionDirection(null);
    setDragOffset(0);
    setIsDragging(false);
  }, [index]);

  if (index === null || items.length === 0) {
    return null;
  }

  const safeIndex = Math.min(currentIndex, items.length - 1);
  const item = items[safeIndex];
  const canGoPrevious = safeIndex > 0;
  const canGoNext = safeIndex < items.length - 1;
  const showPrevious = () => {
    setIsDragging(false);
    setDragOffset(0);
    setTransitionDirection('previous');
    setCurrentIndex((current) => Math.max(0, current - 1));
  };
  const showNext = () => {
    setIsDragging(false);
    setDragOffset(0);
    setTransitionDirection('next');
    setCurrentIndex((current) => Math.min(items.length - 1, current + 1));
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
    setTransitionDirection(null);
    setDragOffset(0);
    setIsDragging(true);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    const touch = event.touches[0];
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 6 || Math.abs(deltaX) < Math.abs(deltaY) * 0.75) return;

    if (event.cancelable) {
      event.preventDefault();
    }

    const isEdgeDrag = (deltaX > 0 && !canGoPrevious) || (deltaX < 0 && !canGoNext);
    setDragOffset(isEdgeDrag ? deltaX * 0.28 : deltaX);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    const touch = event.changedTouches[0];
    swipeStartRef.current = null;
    setIsDragging(false);
    if (!start || !touch) {
      setDragOffset(0);
      return;
    }

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
      setDragOffset(0);
      return;
    }

    if (deltaX < 0 && canGoNext) {
      showNext();
      return;
    }
    if (deltaX > 0 && canGoPrevious) {
      showPrevious();
      return;
    }
    setDragOffset(0);
  };

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
  const frameDragStyle =
    dragOffset === 0
      ? undefined
      : {
          opacity: Math.max(0.72, 1 - Math.abs(dragOffset) / 520),
          transform: `translateX(${dragOffset}px) scale(${Math.max(
            0.96,
            1 - Math.abs(dragOffset) / 2200
          )})`,
        };

  return (
    <div
      className="mobile-family-preview"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
        <div
          className={[
            'mobile-family-preview-media-frame',
            transitionDirection,
            isDragging ? 'dragging' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          key={item.id}
          style={frameDragStyle}
        >
          {item.mediaType === 'video' ? (
            <video src={item.url} controls playsInline />
          ) : (
            <img src={item.url} alt={item.name || '家庭图片'} />
          )}
        </div>
      </div>
      {canGoPrevious ? (
        <button
          className="mobile-family-preview-arrow previous"
          type="button"
          onClick={showPrevious}
        >
          <LeftOutlined />
          <span className="mobile-family-sr">上一张</span>
        </button>
      ) : null}
      {canGoNext ? (
        <button className="mobile-family-preview-arrow next" type="button" onClick={showNext}>
          <LeftOutlined />
          <span className="mobile-family-sr">下一张</span>
        </button>
      ) : null}
      {items.length > 1 ? (
        <div className="mobile-family-preview-dots">
          {items.map((previewItem, dotIndex) => (
            <span
              className={
                dotIndex === safeIndex
                  ? 'mobile-family-preview-dot active'
                  : 'mobile-family-preview-dot'
              }
              key={previewItem.id}
            />
          ))}
        </div>
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
  onCommentBlur,
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
  onCommentBlur: (event: FocusEvent<HTMLDivElement>) => void;
  onCommentDraftChange: (value: string) => void;
  onReplyComment: (comment: FamilyPostComment) => void;
  onSubmitComment: () => void;
  onToggleComment: () => void;
}) {
  const hasMedia = post.media.length > 0;
  const comments = post.comments ?? [];
  const reactions = (
    <div className="mobile-family-feed-reactions">
      <div className="mobile-family-like-cluster">
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
        <LikedUserStack users={post.likedUsers} />
      </div>
      <button className="mobile-family-comment-action" type="button" onClick={onToggleComment}>
        <MessageFilled />
        <span className="mobile-family-sr">评论</span>
      </button>
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
      {post.content ? <div className="mobile-family-feed-content">{post.content}</div> : null}
      <MediaGrid media={post.media} onPreview={onPreview} />
      {reactions}
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
        <div className="mobile-family-inline-comment" ref={commentInputRef} onBlur={onCommentBlur}>
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
  const queryClient = useQueryClient();
  const postsQuery = useFamilyPosts(FAMILY_POST_LIST_PARAMS);
  const { data: familyReadState, markPostsReadAsync } = useFamilyState();
  const createComment = useCreateFamilyComment();
  const likePost = useLikeFamilyPost();
  const unlikePost = useUnlikeFamilyPost();
  const currentUser = useAuthStore((state) => state.user);
  const posts = useMemo(() => postsQuery.data?.items ?? [], [postsQuery.data?.items]);
  const latestPostId = useMemo(() => getLatestPostId(posts), [posts]);
  const postListQueryKey = familyQueryKeys.postList(FAMILY_POST_LIST_PARAMS);
  const [previewPost, setPreviewPost] = useState<FamilyPost | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [moduleMenuOpen, setModuleMenuOpen] = useState(false);
  const [commentTarget, setCommentTarget] = useState<CommentTarget | null>(null);
  const [commentDraftTarget, setCommentDraftTarget] = useState<CommentTarget | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [optimisticLikes, setOptimisticLikes] = useState<Record<number, boolean>>({});
  const [pendingPostEvents, setPendingPostEvents] = useState<FamilyPostCreatedEvent[]>([]);
  const [loadingPendingPosts, setLoadingPendingPosts] = useState(false);
  const commentInputRef = useRef<HTMLDivElement>(null);
  const pendingPostPrompt = formatNewPostPrompt(pendingPostEvents);
  const chatUnreadBadge = formatUnreadBadge(familyReadState?.unreadChatMessages);

  const handlePostCreated = useCallback(
    (event: FamilyPostCreatedEvent) => {
      if (event.authorId === currentUser?.id) return;

      setPendingPostEvents((current) => {
        if (current.some((item) => item.postId === event.postId)) return current;
        return [event, ...current];
      });
    },
    [currentUser?.id]
  );

  useFamilyRealtime({ refetchPosts: postsQuery.refetch, onPostCreated: handlePostCreated });

  useEffect(() => {
    if (!latestPostId) return;
    void markPostsReadAsync(latestPostId);
  }, [latestPostId, markPostsReadAsync]);

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

  const refreshFamilyPosts = async () => {
    const result = await postsQuery.refetch();
    const refreshedLatestPostId = getLatestPostId(result.data?.items ?? []);
    setPendingPostEvents([]);
    if (refreshedLatestPostId) {
      await markPostsReadAsync(refreshedLatestPostId);
    }
  };

  const loadPendingPosts = async () => {
    if (loadingPendingPosts) return;
    setLoadingPendingPosts(true);
    try {
      const result = await familyService.getPosts({
        ...FAMILY_POST_LIST_PARAMS,
        ...(latestPostId ? { afterId: latestPostId } : {}),
      });
      queryClient.setQueryData<FamilyPaginationResult<FamilyPost>>(postListQueryKey, (current) =>
        mergeFamilyPostResults(current, result)
      );
      const loadedLatestPostId = getLatestPostId(result.items) ?? latestPostId;
      setPendingPostEvents([]);
      if (loadedLatestPostId) {
        await markPostsReadAsync(loadedLatestPostId);
      }
    } catch {
      Toast.show({ icon: 'fail', content: '新动态加载失败', position: 'center' });
    } finally {
      setLoadingPendingPosts(false);
    }
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
    const nextTarget = { postId };
    setCommentTarget((current) => {
      if (sameCommentTarget(current, nextTarget)) {
        return null;
      }
      if (!sameCommentTarget(commentDraftTarget, nextTarget)) {
        setCommentDraft('');
      }
      setCommentDraftTarget(nextTarget);
      return nextTarget;
    });
  };

  const replyToComment = (postId: number, comment: FamilyPostComment) => {
    const nextTarget = {
      postId,
      parentCommentId: comment.id,
      replyToName: displayName(comment.author),
    };
    if (!sameCommentTarget(commentDraftTarget, nextTarget)) {
      setCommentDraft('');
    }
    setCommentDraftTarget(nextTarget);
    setCommentTarget(nextTarget);
  };

  const handleCommentDraftChange = (value: string) => {
    if (commentTarget) {
      setCommentDraftTarget(commentTarget);
    }
    setCommentDraft(value);
  };

  const closeCommentOnBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocused = event.relatedTarget;
    if (nextFocused && event.currentTarget.contains(nextFocused as Node)) return;
    setCommentTarget(null);
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
      setCommentDraftTarget(null);
      setCommentTarget(null);
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
      <FamilyTopBar
        className="mobile-family-home-header"
        title="家庭圈"
        left={
          <FamilyIconButton
            className="mobile-family-menu-button"
            label="菜单"
            onClick={() => setModuleMenuOpen(true)}
          >
            <MenuOutlined />
          </FamilyIconButton>
        }
        right={
          <FamilyIconButton
            className="mobile-family-logo-button"
            label="家庭群聊"
            onClick={() => navigate('/family/chat')}
            badge={chatUnreadBadge}
          >
            <MessageFilled />
          </FamilyIconButton>
        }
      />

      <PullToRefresh onRefresh={refreshFamilyPosts}>
        <section className="mobile-family-feed">
          {pendingPostEvents.length > 0 ? (
            <button
              className="mobile-family-new-post-prompt"
              type="button"
              onClick={() => void loadPendingPosts()}
            >
              {loadingPendingPosts ? '正在加载新动态...' : pendingPostPrompt}
            </button>
          ) : null}
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
                onCommentBlur={closeCommentOnBlur}
                onCommentDraftChange={handleCommentDraftChange}
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
      <FamilyTopBar
        className="mobile-family-compose-header"
        title="发布动态"
        left={
          <button
            className="mobile-family-text-button"
            type="button"
            onClick={() => navigate('/family')}
          >
            取消
          </button>
        }
        right={
          <Button
            className="mobile-family-publish-button"
            loading={uploading || createPost.isPending}
            onClick={submitPost}
          >
            发布
          </Button>
        }
      />
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
      <main className="mobile-family-compose-body">
        <section className="mobile-family-compose-panel">
          <DraftMediaGrid
            items={draft.items}
            onAdd={() => inputRef.current?.click()}
            onRemove={draft.removeItem}
            onPreview={setPreviewIndex}
          />
          <div className="mobile-family-compose-caption">
            <TextArea
              value={content}
              placeholder="配一句话..."
              rows={2}
              autoSize={{ minRows: 2, maxRows: 6 }}
              maxLength={5000}
              onChange={setContent}
            />
          </div>
        </section>
      </main>
      <MediaPreviewOverlay
        items={previewItems}
        index={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onDelete={draft.removeItem}
      />
    </div>
  );
}

function ChatMessageMediaBubble({
  media,
  index,
  onPreview,
}: {
  media: FamilyMedia;
  index: number;
  onPreview: (index: number) => void;
}) {
  const video = isVideo(media);

  if (video) {
    return (
      <div className="mobile-family-chat-media-bubble video">
        <video src={media.displayUrl} controls playsInline preload="metadata" />
      </div>
    );
  }

  return (
    <button
      className="mobile-family-chat-media-bubble image"
      type="button"
      onClick={() => onPreview(index)}
    >
      <img src={media.displayUrl} alt="家庭图片" loading="lazy" />
    </button>
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
  const hasContent = Boolean(message.content);

  return (
    <div className={mine ? 'mobile-family-chat-message mine' : 'mobile-family-chat-message'}>
      {!mine ? <FamilyAvatar user={message.sender} size="small" /> : null}
      <div className="mobile-family-chat-body">
        {hasContent ? (
          <div className="mobile-family-chat-bubble">
            <p>{message.content}</p>
          </div>
        ) : null}
        {message.media.map((item, index) => (
          <ChatMessageMediaBubble
            key={item.id}
            media={item}
            index={index}
            onPreview={setPreviewIndex}
          />
        ))}
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
    <FamilyTopBar
      className="mobile-family-chat-header"
      title="家庭群聊"
      left={
        <FamilyIconButton className="mobile-family-chat-back" label="返回家庭圈" onClick={onBack}>
          <LeftOutlined />
        </FamilyIconButton>
      }
    />
  );
}

export function MobileFamilyChatPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const chatListRef = useRef<HTMLElement>(null);
  const currentUser = useAuthStore((state) => state.user);
  const chatQuery = useFamilyChatMessages(FAMILY_CHAT_LIST_PARAMS);
  const { markChatReadAsync } = useFamilyState();
  const createChatMessage = useCreateFamilyChatMessage();
  const draft = useDraftMedia();
  const [messageText, setMessageText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [attachmentPanelOpen, setAttachmentPanelOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [pendingChatMessageIds, setPendingChatMessageIds] = useState<number[]>([]);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const latestMessageIdRef = useRef<number | null>(null);

  const messages = useMemo(
    () =>
      [...(chatQuery.data?.items ?? [])].sort(
        (left, right) => dayjs(left.createdAt).valueOf() - dayjs(right.createdAt).valueOf()
      ),
    [chatQuery.data?.items]
  );
  const latestMessageTime = messages.at(-1)?.createdAt;
  const latestMessageId = useMemo(() => getLatestMessageId(messages), [messages]);
  const messageDay = latestMessageTime ? formatChatDivider(latestMessageTime) : null;
  const canSend = messageText.trim().length > 0 || draft.items.length > 0;
  const previewItems = draft.items.map((item) => ({
    id: item.id,
    url: item.previewUrl || '',
    name: item.name,
    mediaType: item.mediaType,
  }));

  useEffect(() => {
    latestMessageIdRef.current = latestMessageId;
  }, [latestMessageId]);

  const scrollChatToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const list = chatListRef.current;
    if (!list || typeof list.scrollTo !== 'function') return;
    list.scrollTo({ top: list.scrollHeight, behavior });
  }, []);

  const fetchChatMessagesAfter = useCallback(
    async (afterId: number | null) => {
      const result = await familyService.getChatMessages({
        ...FAMILY_CHAT_LIST_PARAMS,
        ...(afterId ? { afterId } : {}),
      });
      queryClient.setQueryData<FamilyPaginationResult<FamilyChatMessage>>(
        familyQueryKeys.chatMessageList(FAMILY_CHAT_LIST_PARAMS),
        (current) => mergeFamilyChatMessageResults(current, result)
      );
      return result.items;
    },
    [queryClient]
  );

  const handleChatMessageCreated = useCallback(
    (event: FamilyChatMessageCreatedEvent) => {
      const shouldStickToBottom =
        isNearScrollBottom(chatListRef.current) || event.senderId === currentUser?.id;
      if (!shouldStickToBottom) {
        setPendingChatMessageIds((current) =>
          current.includes(event.messageId) ? current : [...current, event.messageId]
        );
      }

      void (async () => {
        try {
          const items = await fetchChatMessagesAfter(latestMessageIdRef.current);
          const loadedLatestMessageId = getLatestMessageId(items) ?? event.messageId;
          if (shouldStickToBottom) {
            setPendingChatMessageIds([]);
            setShouldScrollToBottom(true);
            await markChatReadAsync(loadedLatestMessageId);
          }
        } catch {
          Toast.show({ icon: 'fail', content: '新消息加载失败', position: 'center' });
        }
      })();
    },
    [currentUser?.id, fetchChatMessagesAfter, markChatReadAsync]
  );

  useFamilyRealtime({
    onChatMessageCreated: handleChatMessageCreated,
  });

  useEffect(() => {
    if (!latestMessageId || !shouldScrollToBottom) return undefined;

    const scroll = () => {
      scrollChatToBottom('smooth');
      setShouldScrollToBottom(false);
    };

    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
      scroll();
      return undefined;
    }

    const frame = window.requestAnimationFrame(scroll);
    return () => window.cancelAnimationFrame(frame);
  }, [latestMessageId, scrollChatToBottom, shouldScrollToBottom]);

  useEffect(() => {
    if (!latestMessageId || pendingChatMessageIds.length > 0) return;
    void markChatReadAsync(latestMessageId);
  }, [latestMessageId, markChatReadAsync, pendingChatMessageIds.length]);

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
      setShouldScrollToBottom(true);
    } catch {
      Toast.show({ icon: 'fail', content: '消息发送失败', position: 'center' });
    } finally {
      setUploading(false);
    }
  };

  const refreshChatMessages = async () => {
    const result = await chatQuery.refetch();
    const refreshedLatestMessageId = getLatestMessageId(result.data?.items ?? []);
    setPendingChatMessageIds([]);
    setShouldScrollToBottom(true);
    if (refreshedLatestMessageId) {
      await markChatReadAsync(refreshedLatestMessageId);
    }
  };

  const handleChatScroll = () => {
    if (pendingChatMessageIds.length === 0 || !isNearScrollBottom(chatListRef.current)) return;
    setPendingChatMessageIds([]);
    if (latestMessageIdRef.current) {
      void markChatReadAsync(latestMessageIdRef.current);
    }
  };

  const openPendingChatMessages = () => {
    setPendingChatMessageIds([]);
    setShouldScrollToBottom(true);
    if (latestMessageIdRef.current) {
      void markChatReadAsync(latestMessageIdRef.current);
    }
  };

  return (
    <div className="mobile-family-chat-page wechat-warm">
      <FamilyChatHeader onBack={() => navigate('/family')} />
      <PullToRefresh onRefresh={refreshChatMessages}>
        <section
          className="mobile-family-chat-list warm"
          ref={chatListRef}
          onScroll={handleChatScroll}
        >
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
      {pendingChatMessageIds.length > 0 ? (
        <button
          className="mobile-family-chat-new-message"
          type="button"
          onClick={openPendingChatMessages}
        >
          {pendingChatMessageIds.length} 条新消息
        </button>
      ) : null}
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
