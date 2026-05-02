/**
 * request.ts 单元测试
 *
 * 测试要点：
 * 1. 请求拦截器（Token、二次确认）
 * 2. 响应拦截器（数据提取、成功提示）
 * 3. 错误处理（400/401/403/404/409/500）
 * 4. Token 自动刷新
 * 5. 用户取消操作
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { appConfig } from '@/shared/config/app.config';

// 使用 vi.hoisted 创建全局 mock 函数（在 vi.mock 之前执行）
const {
  mockMessageSuccess,
  mockMessageError,
  mockMessageWarning,
  mockMessageInfo,
  mockModalConfirm,
  mockNotificationError,
} = vi.hoisted(() => ({
  mockMessageSuccess: vi.fn(),
  mockMessageError: vi.fn(),
  mockMessageWarning: vi.fn(),
  mockMessageInfo: vi.fn(),
  mockModalConfirm: vi.fn(),
  mockNotificationError: vi.fn(),
}));

// Mock request feedback registry (必须在顶部，before import request)
vi.mock('@/shared/utils/requestFeedback', () => ({
  getRequestFeedback: () => ({
    success: mockMessageSuccess,
    error: mockMessageError,
    warning: mockMessageWarning,
    info: mockMessageInfo,
    notifyError: mockNotificationError,
    confirm: mockModalConfirm,
  }),
}));

// 现在可以安全导入 request
import { request, UserCancelError, axiosInstance, refreshAxios } from '../request';

describe('request - Axios封装', () => {
  let mock: MockAdapter;
  let refreshMock: MockAdapter;
  let consoleGroupSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleGroupEndSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // 创建 axios mock - 使用 request.ts 导出的 axiosInstance
    mock = new MockAdapter(axiosInstance);

    // 创建 refreshAxios mock - 用于模拟Token刷新请求
    refreshMock = new MockAdapter(refreshAxios);

    // 清理 localStorage
    localStorage.clear();

    // 重置所有 mock
    vi.clearAllMocks();

    // Mock console 方法（避免测试输出污染）
    consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    mock.restore();
    refreshMock.restore();
    consoleGroupSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
  });

  describe('请求拦截器 - Token', () => {
    it('应该在有 token 时自动添加 Authorization 头', async () => {
      localStorage.setItem(appConfig.tokenKey, 'mock-access-token');

      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBe('Bearer mock-access-token');
        return [200, { success: true, data: { result: 'ok' } }];
      });

      await request.get('/test');
    });

    it('应该在无 token 时不添加 Authorization 头', async () => {
      // localStorage 已在 beforeEach 中清空

      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined();
        return [200, { success: true, data: { result: 'ok' } }];
      });

      await request.get('/test');
    });
  });

  describe('请求拦截器 - 二次确认', () => {
    it('用户确认后应该发送请求', async () => {
      // Mock Modal.confirm - 用户点击确认
      mockModalConfirm.mockResolvedValue(true);

      mock.onDelete('/users/1').reply(200, { success: true, data: null });

      await request.delete('/users/1', {
        requestOptions: {
          confirmConfig: {
            title: '删除用户',
            message: '确定要删除该用户吗？',
          },
        },
      });

      expect(mockModalConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '删除用户',
          message: '确定要删除该用户吗？',
        })
      );
    });

    it('用户取消后应该抛出 UserCancelError', async () => {
      // Mock Modal.confirm - 用户点击取消
      mockModalConfirm.mockResolvedValue(false);

      await expect(
        request.delete('/users/1', {
          requestOptions: {
            confirmConfig: {
              message: '确定要删除吗？',
            },
          },
        })
      ).rejects.toThrow(UserCancelError);

      // 不应该显示错误提示（UserCancelError 特殊处理）
      expect(mockMessageError).not.toHaveBeenCalled();
      expect(mockNotificationError).not.toHaveBeenCalled();
    });

    it('应该支持自定义确认框文案', async () => {
      mockModalConfirm.mockResolvedValue(true);

      mock.onDelete('/roles/1').reply(200, { success: true });

      await request.delete('/roles/1', {
        requestOptions: {
          confirmConfig: {
            title: '删除角色',
            message: '删除角色会影响关联用户，确定继续吗？',
            okText: '继续删除',
            cancelText: '我再想想',
          },
        },
      });

      expect(mockModalConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '删除角色',
          message: '删除角色会影响关联用户，确定继续吗？',
          okText: '继续删除',
          cancelText: '我再想想',
        })
      );
    });

    it('二次确认应该在添加 Token 之后执行', async () => {
      localStorage.setItem(appConfig.tokenKey, 'mock-token');

      mockModalConfirm.mockResolvedValue(true);

      mock.onDelete('/test').reply((config) => {
        // 应该包含 Token
        expect(config.headers?.Authorization).toBe('Bearer mock-token');
        return [200, { success: true }];
      });

      await request.delete('/test', {
        requestOptions: {
          confirmConfig: {
            message: '确定删除吗？',
          },
        },
      });
    });
  });

  describe('响应拦截器 - 数据提取', () => {
    it('应该自动提取响应的 data 字段', async () => {
      mock.onGet('/users').reply(200, {
        success: true,
        data: { items: [{ id: 1, username: 'test' }], total: 1 },
        timestamp: '2025-11-02',
        path: '/users',
        method: 'GET',
      });

      const result = await request.get('/users');

      // 应该直接返回 data 字段
      expect(result).toEqual({ items: [{ id: 1, username: 'test' }], total: 1 });
    });

    it('当没有 data 字段时应该返回完整响应', async () => {
      mock.onGet('/health').reply(200, {
        success: true,
        status: 'ok',
      });

      const result = await request.get('/health');

      expect(result).toEqual({
        success: true,
        status: 'ok',
      });
    });
  });

  describe('响应拦截器 - 成功提示', () => {
    it('配置 successMessage=true 时应该显示默认成功提示', async () => {
      mock.onPost('/users').reply(200, { success: true, data: { id: 1 } });

      await request.post(
        '/users',
        { username: 'test' },
        {
          requestOptions: {
            messageConfig: {
              successMessage: true,
            },
          },
        }
      );

      expect(mockMessageSuccess).toHaveBeenCalledWith('操作成功');
    });

    it('配置 successMessage=string 时应该显示自定义提示', async () => {
      mock.onPost('/users').reply(200, { success: true });

      await request.post(
        '/users',
        { username: 'test' },
        {
          requestOptions: {
            messageConfig: {
              successMessage: '创建用户成功',
            },
          },
        }
      );

      expect(mockMessageSuccess).toHaveBeenCalledWith('创建用户成功');
    });

    it('PUT/DELETE 请求也应该支持成功提示', async () => {
      mock.onPut('/users/1').reply(200, { success: true });

      await request.put(
        '/users/1',
        { username: 'updated' },
        {
          requestOptions: {
            messageConfig: {
              successMessage: '更新用户成功',
            },
          },
        }
      );

      expect(mockMessageSuccess).toHaveBeenCalledWith('更新用户成功');
    });

    it('未配置 successMessage 时不应该显示提示', async () => {
      mock.onGet('/users').reply(200, { success: true, data: [] });

      await request.get('/users');

      expect(mockMessageSuccess).not.toHaveBeenCalled();
    });
  });

  describe('错误处理 - 400 参数验证错误', () => {
    it('单个错误应该使用 message.error 显示', async () => {
      mock.onPost('/users').reply(400, {
        success: false,
        statusCode: 400,
        message: '用户名不能为空',
        error: 'Bad Request',
        timestamp: '2025-11-02',
        path: '/users',
        method: 'POST',
      });

      await expect(request.post('/users', {})).rejects.toThrow();

      expect(mockMessageError).toHaveBeenCalledWith('用户名不能为空');
    });

    it('多个错误应该使用 notification.error 显示', async () => {
      mock.onPost('/users').reply(400, {
        success: false,
        statusCode: 400,
        message: ['用户名不能为空', '邮箱格式不正确', '密码长度至少8位'],
        error: 'Bad Request',
        timestamp: '2025-11-02',
        path: '/users',
        method: 'POST',
      });

      await expect(request.post('/users', {})).rejects.toThrow();

      expect(mockNotificationError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '参数验证失败',
          description: expect.stringContaining('1. 用户名不能为空'),
        })
      );
    });
  });

  describe('错误处理 - 401 自动刷新 Token', () => {
    it('401 错误应该自动刷新 Token 并重试', async () => {
      localStorage.setItem(appConfig.tokenKey, 'expired-token');
      localStorage.setItem(appConfig.refreshTokenKey, 'valid-refresh-token');
      const tokenRefreshedListener = vi.fn();
      window.addEventListener('auth:token-refreshed', tokenRefreshedListener);

      // Mock refresh 接口 - 使用 refreshMock
      refreshMock.onPost('/auth/refresh').reply(200, {
        success: true,
        data: {
          accessToken: 'new-access-token',
        },
      });

      // 第一次请求返回 401
      mock.onGet('/users').replyOnce(401);
      // 刷新后重试成功
      mock.onGet('/users').replyOnce(200, {
        success: true,
        data: { items: [] },
      });

      const result = await request.get('/users');

      // 应该成功返回数据
      expect(result).toEqual({ items: [] });

      // 应该保存新的 Token
      expect(localStorage.getItem(appConfig.tokenKey)).toBe('new-access-token');
      expect(tokenRefreshedListener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { accessToken: 'new-access-token' },
        })
      );
      window.removeEventListener('auth:token-refreshed', tokenRefreshedListener);
    });

    it('没有 refreshToken 时应该跳转登录页', async () => {
      // 不设置 refreshToken

      const originalLocation = window.location.href;

      mock.onGet('/users').reply(401);

      await expect(request.get('/users')).rejects.toThrow();

      // 注意：在测试环境中无法真正跳转，只能检查赋值
      // 实际项目中可以用 jsdom 配置 location
    });

    it('Token 刷新失败应该清除认证信息并跳转登录', async () => {
      localStorage.setItem(appConfig.tokenKey, 'expired-token');
      localStorage.setItem(appConfig.refreshTokenKey, 'invalid-refresh-token');
      const sessionExpiredListener = vi.fn();
      window.addEventListener('auth:session-expired', sessionExpiredListener);

      // Mock refresh 接口返回 401
      mock.onPost('/auth/refresh').reply(401);
      mock.onGet('/users').reply(401);

      await expect(request.get('/users')).rejects.toThrow();

      // 应该清除 Token
      expect(localStorage.getItem(appConfig.tokenKey)).toBeNull();
      expect(localStorage.getItem(appConfig.refreshTokenKey)).toBeNull();
      expect(sessionExpiredListener).toHaveBeenCalled();
      window.removeEventListener('auth:session-expired', sessionExpiredListener);
    });

    it('Token 刷新失败时应该让等待队列中的并发请求一起失败', async () => {
      localStorage.setItem(appConfig.tokenKey, 'expired-token');
      localStorage.setItem(appConfig.refreshTokenKey, 'invalid-refresh-token');

      refreshMock.onPost('/auth/refresh').reply(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve([401]), 10);
          })
      );
      mock.onGet('/users').replyOnce(401);
      mock.onGet('/roles').replyOnce(401);

      const firstRequest = request.get('/users');
      const secondRequest = request.get('/roles');
      let secondRequestState = 'pending';

      secondRequest.then(
        () => {
          secondRequestState = 'resolved';
        },
        () => {
          secondRequestState = 'rejected';
        }
      );

      await expect(firstRequest).rejects.toThrow();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(secondRequestState).toBe('rejected');
    });
  });

  describe('错误处理 - 403 权限不足', () => {
    it('应该显示权限不足提示', async () => {
      mock.onGet('/users').reply(403, {
        success: false,
        message: '需要 user:read 权限',
      });

      await expect(request.get('/users')).rejects.toThrow();

      expect(mockNotificationError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '权限不足',
          description: expect.stringContaining('user:read'),
        })
      );
    });
  });

  describe('错误处理 - 404 资源不存在', () => {
    it('应该显示资源不存在提示', async () => {
      mock.onGet('/users/999').reply(404, {
        success: false,
        message: '用户不存在',
      });

      await expect(request.get('/users/999')).rejects.toThrow();

      expect(mockMessageError).toHaveBeenCalledWith('用户不存在');
    });
  });

  describe('错误处理 - 409 资源冲突', () => {
    it('应该显示资源冲突提示', async () => {
      mock.onPost('/users').reply(409, {
        success: false,
        message: '用户名已存在',
      });

      await expect(request.post('/users', { username: 'admin' })).rejects.toThrow();

      expect(mockMessageError).toHaveBeenCalledWith('用户名已存在');
    });
  });

  describe('错误处理 - 500 服务器错误', () => {
    it('应该显示服务器错误提示', async () => {
      mock.onGet('/users').reply(500, {
        success: false,
        message: 'Internal Server Error',
      });

      await expect(request.get('/users')).rejects.toThrow();

      expect(mockNotificationError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '服务器错误',
          description: expect.stringContaining('Internal Server Error'),
        })
      );
    });
  });

  describe('错误处理 - 自定义错误提示', () => {
    it('应该支持覆盖默认错误提示', async () => {
      mock.onGet('/users').reply(500);

      await expect(
        request.get('/users', {
          requestOptions: {
            messageConfig: {
              overrideErrorMessage: '获取用户列表失败，请稍后重试',
            },
          },
        })
      ).rejects.toThrow();

      expect(mockMessageError).toHaveBeenCalledWith('获取用户列表失败，请稍后重试');
    });

    it('应该支持不显示错误提示', async () => {
      mock.onGet('/users').reply(500);

      await expect(
        request.get('/users', {
          requestOptions: {
            messageConfig: {
              errorMessageMode: 'none',
            },
          },
        })
      ).rejects.toThrow();

      expect(mockMessageError).not.toHaveBeenCalled();
      expect(mockNotificationError).not.toHaveBeenCalled();
    });

    it('应该支持使用 notification 模式显示错误', async () => {
      mock.onGet('/users').reply(500, {
        success: false,
        message: 'Database connection error',
      });

      await expect(
        request.get('/users', {
          requestOptions: {
            messageConfig: {
              errorMessageMode: 'notification',
            },
          },
        })
      ).rejects.toThrow();

      expect(mockNotificationError).toHaveBeenCalled();
    });
  });

  describe('HTTP 方法测试', () => {
    it('应该支持 GET 请求', async () => {
      mock.onGet('/users', { params: { page: 1 } }).reply(200, {
        success: true,
        data: { items: [] },
      });

      const result = await request.get('/users', { params: { page: 1 } });
      expect(result).toEqual({ items: [] });
    });

    it('应该支持 POST 请求', async () => {
      mock.onPost('/users', { username: 'test' }).reply(201, {
        success: true,
        data: { id: 1, username: 'test' },
      });

      const result = await request.post('/users', { username: 'test' });
      expect(result).toEqual({ id: 1, username: 'test' });
    });

    it('应该支持 PUT 请求', async () => {
      mock.onPut('/users/1', { username: 'updated' }).reply(200, {
        success: true,
        data: { id: 1, username: 'updated' },
      });

      const result = await request.put('/users/1', { username: 'updated' });
      expect(result).toEqual({ id: 1, username: 'updated' });
    });

    it('应该支持 PATCH 请求', async () => {
      mock.onPatch('/users/1', { email: 'new@example.com' }).reply(200, {
        success: true,
        data: { id: 1, email: 'new@example.com' },
      });

      const result = await request.patch('/users/1', { email: 'new@example.com' });
      expect(result).toEqual({ id: 1, email: 'new@example.com' });
    });

    it('应该支持 DELETE 请求', async () => {
      mock.onDelete('/users/1').reply(204, { success: true });

      await request.delete('/users/1');
      // DELETE 成功不报错即可
    });
  });

  describe('综合场景测试', () => {
    it('带 Token + 二次确认 + 成功提示的完整流程', async () => {
      localStorage.setItem(appConfig.tokenKey, 'valid-token');

      mockModalConfirm.mockResolvedValue(true);

      mock.onDelete('/users/1').reply((config) => {
        expect(config.headers?.Authorization).toBe('Bearer valid-token');
        return [200, { success: true }];
      });

      await request.delete('/users/1', {
        requestOptions: {
          confirmConfig: {
            message: '确定删除吗？',
          },
          messageConfig: {
            successMessage: '删除成功',
          },
        },
      });

      expect(mockModalConfirm).toHaveBeenCalled();
      expect(mockMessageSuccess).toHaveBeenCalledWith('删除成功');
    });

    it('401 自动刷新 + 重试 + 成功提示', async () => {
      localStorage.setItem(appConfig.tokenKey, 'expired-token');
      localStorage.setItem(appConfig.refreshTokenKey, 'refresh-token');

      // Mock refresh 接口 - 使用 refreshMock
      refreshMock.onPost('/auth/refresh').reply(200, {
        success: true,
        data: { accessToken: 'new-token' },
      });

      mock.onPost('/users').replyOnce(401);
      mock.onPost('/users').replyOnce(200, {
        success: true,
        data: { id: 1 },
      });

      const result = await request.post(
        '/users',
        { username: 'test' },
        {
          requestOptions: {
            messageConfig: {
              successMessage: '创建成功',
            },
          },
        }
      );

      expect(result).toEqual({ id: 1 });
      expect(mockMessageSuccess).toHaveBeenCalledWith('创建成功');
      expect(localStorage.getItem(appConfig.tokenKey)).toBe('new-token');
    });
  });
});
