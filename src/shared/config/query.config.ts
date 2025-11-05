import { QueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

/**
 * TanStack Query 配置
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 默认缓存时间：5分钟
      staleTime: 5 * 60 * 1000,
      // 缓存过期时间：10分钟
      gcTime: 10 * 60 * 1000,
      // 智能重试策略：只在网络错误和临时错误时重试
      retry: (failureCount, error) => {
        const axiosError = error as AxiosError;
        const status = axiosError?.response?.status;

        // 不重试的情况（客户端错误、业务错误）
        if (status && status >= 400 && status < 500) {
          // 400: 参数错误
          // 401: 未授权（由axios拦截器处理Token刷新）
          // 403: 权限不足
          // 404: 资源不存在
          // 409: 资源冲突
          return false;
        }

        // 重试的情况（网络错误、服务器临时错误）
        // - 无响应（网络错误）
        // - 500: 服务器内部错误
        // - 502: 网关错误
        // - 503: 服务不可用
        // - 504: 网关超时
        // 最多重试1次
        return failureCount < 1;
      },
      // 重新聚焦时自动刷新
      refetchOnWindowFocus: false,
      // 网络重连时自动刷新
      refetchOnReconnect: true,
    },
    mutations: {
      // 失败重试次数（mutations不重试）
      retry: 0,
    },
  },
});
