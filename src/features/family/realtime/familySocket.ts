import { io, type Socket } from 'socket.io-client';
import { appConfig } from '@/shared/config/app.config';

export interface FamilySocketHandlers {
  onPostCreated?: () => void;
  onPostCommentCreated?: () => void;
  onPostLikeChanged?: () => void;
  onChatMessageCreated?: () => void;
  onNotificationCreated?: () => void;
}

function resolveSocketBaseUrl() {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    return new URL(appConfig.apiBaseUrl, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
}

export function connectFamilySocket(token: string | null, handlers: FamilySocketHandlers) {
  if (!token || typeof window === 'undefined') {
    return () => undefined;
  }

  const socket: Socket = io(`${resolveSocketBaseUrl()}/family`, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('family:post-created', () => handlers.onPostCreated?.());
  socket.on('family:post-comment-created', () => handlers.onPostCommentCreated?.());
  socket.on('family:post-like-changed', () => handlers.onPostLikeChanged?.());
  socket.on('family:chat-message-created', () => handlers.onChatMessageCreated?.());
  socket.on('family:notification-created', () => handlers.onNotificationCreated?.());

  return () => {
    socket.disconnect();
  };
}
