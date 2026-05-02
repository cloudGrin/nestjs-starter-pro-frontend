import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { appConfig } from '../config/app.config';
import { getRequestFeedback } from './requestFeedback';

/**
 * 后端统一响应格式
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
  error?: string;
  timestamp?: string;
  path?: string;
  method?: string;
}

interface PaginationMeta {
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
  totalPages?: number;
}

/**
 * 请求配置选项（扩展 axios）
 */
export interface RequestOptions {
  /** 二次确认配置 */
  confirmConfig?: {
    /** 确认提示内容 */
    message: string;
    /** 确认标题 */
    title?: string;
    /** 确认按钮文字 */
    okText?: string;
    /** 取消按钮文字 */
    cancelText?: string;
  };
  /** 消息提示配置 */
  messageConfig?: {
    /** 成功提示（false = 不显示，true = 默认提示，string = 自定义提示） */
    successMessage?: boolean | string;
    /** 错误提示模式 */
    errorMessageMode?: 'message' | 'notification' | 'none';
    /** 自定义错误提示 */
    overrideErrorMessage?: string;
  };
}

/**
 * 用户取消操作错误
 */
export class UserCancelError extends Error {
  constructor() {
    super('用户取消操作');
    this.name = 'UserCancelError';
  }
}

function unwrapApiData(responseData: unknown): unknown {
  const normalizePagination = (data: unknown) => {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const paginationData = data as {
      items?: unknown;
      meta?: PaginationMeta;
      total?: unknown;
      page?: unknown;
      pageSize?: unknown;
      totalPages?: unknown;
    };

    if (
      Array.isArray(paginationData.items) &&
      paginationData.meta &&
      typeof paginationData.meta === 'object'
    ) {
      const { totalItems, currentPage, itemsPerPage, totalPages } = paginationData.meta;

      if (
        typeof totalItems === 'number' &&
        typeof currentPage === 'number' &&
        typeof itemsPerPage === 'number'
      ) {
        return {
          ...paginationData,
          total: totalItems,
          page: currentPage,
          pageSize: itemsPerPage,
          totalPages: typeof totalPages === 'number' ? totalPages : paginationData.totalPages,
        };
      }
    }

    return data;
  };

  if (
    responseData &&
    typeof responseData === 'object' &&
    Object.prototype.hasOwnProperty.call(responseData, 'data')
  ) {
    return normalizePagination((responseData as { data: unknown }).data);
  }

  return normalizePagination(responseData);
}

// 扩展 axios 类型
declare module 'axios' {
  export interface AxiosRequestConfig {
    requestOptions?: RequestOptions;
  }
}

/**
 * 错误响应格式（参数验证错误）
 */
interface ValidationErrorResponse {
  success: false;
  statusCode: 400;
  message: string | string[]; // 可能是单个错误或错误数组
  error: string;
  timestamp: string;
  path: string;
  method: string;
}

/**
 * 处理API错误，提供详细的错误提示
 */
function handleApiError(error: AxiosError<ApiResponse>, requestOptions?: RequestOptions) {
  const isDev = import.meta.env.DEV;
  const status = error.response?.status;
  const data = error.response?.data;
  const config = error.config;

  // 获取消息配置
  const messageConfig = requestOptions?.messageConfig;
  const errorMode = messageConfig?.errorMessageMode || 'message';
  const feedback = getRequestFeedback();

  // 如果配置了 none，则不显示错误提示
  if (errorMode === 'none') {
    return;
  }

  // 开发环境：打印详细错误信息
  if (isDev) {
    console.group('🚨 API Error');
    console.error('Status:', status);
    console.error('URL:', `${config?.method?.toUpperCase()} ${config?.url}`);
    console.error('Response:', data);
    console.error('Error:', error);
    console.groupEnd();
  }

  // 自定义错误提示优先
  if (messageConfig?.overrideErrorMessage) {
    if (errorMode === 'notification') {
      feedback.notifyError({
        message: '操作失败',
        description: messageConfig.overrideErrorMessage,
      });
    } else {
      feedback.error(messageConfig.overrideErrorMessage);
    }
    return;
  }

  // 网络错误（无响应）
  if (!error.response) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      feedback.notifyError({
        message: '网络连接失败',
        description: '无法连接到服务器，请检查网络连接或后端服务是否启动',
        duration: 8,
      });
      if (isDev) {
        console.error('提示：请确认后端服务已启动（默认端口3000）');
      }
    } else if (error.code === 'ECONNABORTED') {
      feedback.notifyError({
        message: '请求超时',
        description: '服务器响应超时，请稍后重试',
        duration: 6,
      });
    } else {
      // 其他网络错误
      feedback.notifyError({
        message: '请求失败',
        description: error.message || '未知错误',
        duration: 6,
      });
    }
    return;
  }

  // 根据状态码提供不同的错误提示
  switch (status) {
    case 400: {
      // 参数验证错误
      const validationData = data as unknown as ValidationErrorResponse;
      const messages = validationData?.message;

      if (Array.isArray(messages)) {
        // 多个验证错误 - 拼接成字符串显示
        const errorList = messages.map((msg, index) => `${index + 1}. ${msg}`).join('\n');
        feedback.notifyError({
          message: '参数验证失败',
          description: errorList,
          duration: 8,
          style: { whiteSpace: 'pre-line' }, // 保留换行
        });
      } else {
        // 单个错误
        feedback.error(messages || '请求参数错误');
      }

      // 开发环境：额外提示检查字段名
      if (isDev && messages) {
        console.warn(
          '提示：请检查请求参数字段名是否与后端API一致（参考 Swagger 文档或 api-docs.json）'
        );
      }
      break;
    }

    case 403: {
      // 权限不足
      const requiredPermissions = data?.message;
      feedback.notifyError({
        message: '权限不足',
        description: requiredPermissions || '您没有访问此资源的权限',
        duration: 6,
      });

      // 开发环境：提示权限代码
      if (isDev && requiredPermissions) {
        console.warn('所需权限:', requiredPermissions);
        console.warn('请检查后端菜单权限配置，或联系管理员分配权限');
      }
      break;
    }

    case 404: {
      // 资源不存在
      feedback.error(data?.message || '请求的资源不存在');
      break;
    }

    case 409: {
      // 资源冲突（如：用户名已存在）
      feedback.error(data?.message || '资源已存在或冲突');
      break;
    }

    case 500: {
      // 服务器内部错误
      feedback.notifyError({
        message: '服务器错误',
        description: data?.message || '服务器内部错误，请稍后重试',
        duration: 6,
      });

      // 开发环境：提示查看后端日志
      if (isDev) {
        console.error('提示：请查看后端控制台日志以获取详细错误信息');
      }
      break;
    }

    default: {
      // 其他错误
      const errorMessage = data?.message || error.message || '请求失败';
      if (errorMode === 'notification') {
        feedback.notifyError({
          message: '请求失败',
          description: errorMessage,
        });
      } else {
        feedback.error(errorMessage);
      }
    }
  }
}

/**
 * 创建 Axios 实例
 * 导出供测试使用
 */
export const axiosInstance = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 创建专门用于刷新Token的axios实例
 * 不带拦截器，避免循环触发401处理
 * 导出供测试使用
 */
export const refreshAxios = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器：添加 Token、二次确认
 */
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 1. 先添加 Token（放在confirmConfig之前）
    const token = localStorage.getItem(appConfig.tokenKey);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. 二次确认（删除操作等）
    const confirmConfig = config.requestOptions?.confirmConfig;
    if (confirmConfig) {
      return new Promise((resolve, reject) => {
        getRequestFeedback()
          .confirm(confirmConfig)
          .then((confirmed) => {
            if (!confirmed) {
              reject(new UserCancelError());
              return;
            }
            // 用户确认，继续请求（此时config已包含Token）
            resolve(config);
          })
          .catch(reject);
      });
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * RefreshToken 并发控制
 */
let isRefreshing = false;
let refreshSubscribers: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/**
 * 添加到刷新队列
 */
function subscribeTokenRefresh(resolve: (token: string) => void, reject: (error: unknown) => void) {
  refreshSubscribers.push({ resolve, reject });
}

/**
 * 通知所有等待的请求
 */
function onRefreshed(token: string) {
  refreshSubscribers.forEach((subscriber) => subscriber.resolve(token));
  refreshSubscribers = [];
}

function onRefreshFailed(error: unknown) {
  refreshSubscribers.forEach((subscriber) => subscriber.reject(error));
  refreshSubscribers = [];
}

function dispatchAuthEvent<T>(name: string, detail?: T) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function expireSession() {
  localStorage.removeItem(appConfig.tokenKey);
  localStorage.removeItem(appConfig.refreshTokenKey);
  dispatchAuthEvent('auth:session-expired');
  window.location.href = window.location.pathname.startsWith('/m') ? '/m/login' : '/login';
}

/**
 * 响应拦截器：处理成功提示、错误和 Token 刷新
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // 获取请求配置
    const requestOptions = response.config.requestOptions;
    const messageConfig = requestOptions?.messageConfig;

    // 显示成功提示
    if (messageConfig?.successMessage) {
      const successMsg =
        messageConfig.successMessage === true ? '操作成功' : messageConfig.successMessage;
      getRequestFeedback().success(successMsg);
    }

    return unwrapApiData(response.data) as AxiosResponse;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Token 过期，尝试刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      // ⚠️ 特殊处理：登录接口的401是"账号密码错误"，不应该触发跳转
      const isLoginRequest = originalRequest.url?.includes('/auth/login');
      const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');

      if (isLoginRequest || isRefreshRequest) {
        // 登录接口的401：直接抛出错误，由handleApiError处理
        // 刷新Token接口的401：不跳转，由catch块处理
        handleApiError(error as AxiosError<ApiResponse>, originalRequest.requestOptions);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // 如果正在刷新，将请求加入队列
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          }, reject);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(appConfig.refreshTokenKey);

      if (refreshToken) {
        try {
          // 调用刷新 Token 接口（使用专门的refreshAxios避免循环）
          const response = await refreshAxios.post('/auth/refresh', {
            refreshToken,
          });

          const { accessToken, refreshToken: nextRefreshToken } = unwrapApiData(response.data) as {
            accessToken: string;
            refreshToken?: string;
          };

          // 保存新的 Token
          localStorage.setItem(appConfig.tokenKey, accessToken);
          if (nextRefreshToken) {
            localStorage.setItem(appConfig.refreshTokenKey, nextRefreshToken);
          }
          dispatchAuthEvent('auth:token-refreshed', {
            accessToken,
            refreshToken: nextRefreshToken,
          });

          // 更新原请求的 Token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // 通知所有等待的请求
          onRefreshed(accessToken);

          // 重试原请求
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          expireSession();
          onRefreshFailed(refreshError);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // 没有 refreshToken，直接跳转登录
        isRefreshing = false;
        onRefreshFailed(error);
        expireSession();
        return Promise.reject(error);
      }
    }

    // 用户取消操作，不显示错误提示
    if (error instanceof UserCancelError) {
      return Promise.reject(error);
    }

    // 处理其他错误
    handleApiError(error as AxiosError<ApiResponse>, originalRequest.requestOptions);

    return Promise.reject(error);
  }
);

/**
 * 类型安全的request包装器
 * 响应拦截器已经提取了data字段，所以直接返回T类型
 */
export const request = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<T>(url, config) as unknown as Promise<T>,

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(url, data, config) as unknown as Promise<T>,

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance.put<T>(url, data, config) as unknown as Promise<T>,

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance.patch<T>(url, data, config) as unknown as Promise<T>,

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T>(url, config) as unknown as Promise<T>,
};
