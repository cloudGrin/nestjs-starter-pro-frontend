/**
 * WebSocket 连接管理
 * 使用 Socket.IO 连接后端通知推送
 *
 * 功能：
 * - 心跳检测（每25秒）
 * - 自动重连（最多5次）
 * - 连接状态提示
 * - Token认证
 */

import { io, Socket } from 'socket.io-client';
import { message } from 'antd';
import { useAuthStore } from '@/features/auth/stores/authStore';

let socket: Socket | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let reconnectAttempts = 0;
let isFirstConnection = true; // 首次连接不显示提示

function debugSocket(...args: unknown[]) {
  if (import.meta.env.DEV) {
    console.debug(...args);
  }
}

/**
 * 连接 WebSocket
 */
export function connectSocket(): Socket {
  if (socket?.connected) {
    debugSocket('[WebSocket] Already connected');
    return socket;
  }

  const token = useAuthStore.getState().token;
  if (!token) {
    throw new Error('No authentication token found');
  }

  const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

  debugSocket(`[WebSocket] Connecting to ${socketUrl}/notifications...`);

  socket = io(`${socketUrl}/notifications`, {
    auth: {
      token, // 后端会验证这个token
    },
    transports: ['websocket'], // 优先使用WebSocket
    reconnection: true, // 自动重连
    reconnectionAttempts: 5, // 最多重连5次
    reconnectionDelay: 1000, // 重连延迟1秒
    reconnectionDelayMax: 5000, // 最大延迟5秒
    timeout: 10000, // 连接超时10秒
  });

  // ============ 连接事件 ============

  /**
   * 连接成功
   */
  socket.on('connect', () => {
    debugSocket('[WebSocket] Connected to notification server');
    reconnectAttempts = 0; // 重置重连计数

    // 首次连接不显示提示，重连成功才显示
    if (!isFirstConnection) {
      message.success('通知推送已恢复', 2);
    }
    isFirstConnection = false;

    // 启动心跳检测
    startHeartbeat();
  });

  /**
   * 连接失败
   */
  socket.on('connect_error', (error) => {
    debugSocket('[WebSocket] Connection error:', error.message);
    reconnectAttempts++;

    // 首次连接失败或重连失败时提示
    if (reconnectAttempts === 1) {
      message.warning('通知推送连接失败，正在重连...', 3);
    } else if (reconnectAttempts >= 5) {
      message.error('通知推送连接失败，请检查网络或刷新页面', 5);
    }
  });

  /**
   * 断开连接
   */
  socket.on('disconnect', (reason) => {
    debugSocket('[WebSocket] Disconnected:', reason);
    stopHeartbeat();

    // 区分主动断开和异常断开
    if (reason === 'io server disconnect') {
      // 服务器主动断开（如Token过期、被踢下线）
      message.error('通知推送已断开，请重新登录', 5);
    } else if (reason === 'io client disconnect') {
      // 客户端主动断开（正常登出）
      debugSocket('[WebSocket] Client disconnected normally');
    } else {
      // 网络异常等其他原因
      message.warning('通知推送已断开，正在重连...', 3);
    }
  });

  /**
   * 重连尝试
   */
  socket.io.on('reconnect_attempt', (attempt) => {
    debugSocket(`[WebSocket] Reconnecting... (${attempt}/5)`);
  });

  /**
   * 重连失败
   */
  socket.io.on('reconnect_failed', () => {
    debugSocket('[WebSocket] Reconnection failed after 5 attempts');
    message.error('通知推送重连失败，请刷新页面', 0); // 不自动关闭
  });

  /**
   * 认证失败
   */
  socket.on('error', (error) => {
    debugSocket('[WebSocket] Error:', error);
    message.error('通知推送认证失败，请重新登录', 5);
  });

  // ============ 业务事件 ============

  /**
   * Pong 响应（心跳回应）
   */
  socket.on('pong', () => {
    debugSocket('[WebSocket] Heartbeat received');
  });

  return socket;
}

/**
 * 断开 WebSocket
 */
export function disconnectSocket(): void {
  if (socket) {
    stopHeartbeat();
    socket.disconnect();
    socket = null;
    isFirstConnection = true; // 重置首次连接标志
    debugSocket('[WebSocket] Disconnected by client');
  }
}

/**
 * 获取当前 Socket 实例
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * 启动心跳检测
 * 每25秒发送一次 ping，保持连接活跃
 */
function startHeartbeat(): void {
  stopHeartbeat(); // 先清除旧的心跳

  heartbeatInterval = setInterval(() => {
    if (socket?.connected) {
      debugSocket('[WebSocket] Sending heartbeat...');
      socket.emit('ping');
    }
  }, 25000); // 25秒

  debugSocket('[WebSocket] Heartbeat started (every 25s)');
}

/**
 * 停止心跳检测
 */
function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
    debugSocket('[WebSocket] Heartbeat stopped');
  }
}
