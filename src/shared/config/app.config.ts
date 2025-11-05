/**
 * 应用配置
 */
export const appConfig = {
  // 应用标题
  title: import.meta.env.VITE_APP_TITLE || 'NestJS Starter Pro',

  // API 基础 URL
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',

  // 是否启用 Mock
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',

  // Token 存储键名
  tokenKey: 'auth-token',
  refreshTokenKey: 'auth-refresh-token',

  // 默认分页大小
  defaultPageSize: 10,

  // 请求超时时间（毫秒）
  requestTimeout: 30000,

  // Token 过期前多久刷新（毫秒）
  tokenRefreshBeforeExpire: 5 * 60 * 1000, // 5分钟
};
