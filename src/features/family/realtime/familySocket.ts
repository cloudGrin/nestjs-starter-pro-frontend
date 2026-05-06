import { io, type Socket } from 'socket.io-client';
import { appConfig } from '@/shared/config/app.config';
import type { FamilyChatMessageCreatedEvent, FamilyPostCreatedEvent } from '../types/family.types';

export interface FamilySocketHandlers {
  onPostCreated?: (event: FamilyPostCreatedEvent) => void;
  onPostCommentCreated?: (event: unknown) => void;
  onPostLikeChanged?: (event: unknown) => void;
  onChatMessageCreated?: (event: FamilyChatMessageCreatedEvent) => void;
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

  socket.on('family:post-created', (event) => handlers.onPostCreated?.(event));
  socket.on('family:post-comment-created', (event) => handlers.onPostCommentCreated?.(event));
  socket.on('family:post-like-changed', (event) => handlers.onPostLikeChanged?.(event));
  socket.on('family:chat-message-created', (event) => handlers.onChatMessageCreated?.(event));
  socket.on('family:notification-created', () => handlers.onNotificationCreated?.());

  return () => {
    socket.disconnect();
  };
}
