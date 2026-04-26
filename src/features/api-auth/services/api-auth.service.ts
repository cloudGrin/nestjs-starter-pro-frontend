/**
 * API认证服务
 */
import { request } from '@/shared/utils/request';
import type {
  ApiApp,
  ApiAppListResponse,
  ApiKey,
  CreateApiAppDto,
  UpdateApiAppDto,
  CreateApiKeyDto,
  QueryApiAppDto,
  CreateApiKeyResponse,
} from '../types/api-auth.types';

export const apiAuthService = {
  /**
   * 获取API应用列表
   */
  getApiApps: (params: QueryApiAppDto) =>
    request.get<ApiAppListResponse>('/api-apps', { params }),

  /**
   * 创建API应用
   */
  createApiApp: (data: CreateApiAppDto) =>
    request.post<ApiApp>('/api-apps', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '创建API应用成功',
        },
      },
    }),

  /**
   * 更新API应用
   */
  updateApiApp: (appId: number, data: UpdateApiAppDto) =>
    request.put<ApiApp>(`/api-apps/${appId}`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '更新API应用成功',
        },
      },
    }),

  /**
   * 停用API应用
   */
  deleteApiApp: (appId: number) =>
    request.delete(`/api-apps/${appId}`, {
      requestOptions: {
        confirmConfig: {
          message: '停用应用后，所有相关的API密钥将立即失效。确定要停用吗？',
          title: '停用API应用',
        },
        messageConfig: {
          successMessage: 'API应用已停用',
        },
      },
    }),

  /**
   * 获取应用的密钥列表
   */
  getApiKeys: (appId: number) => request.get<ApiKey[]>(`/api-apps/${appId}/keys`),

  /**
   * 生成API密钥
   */
  createApiKey: (appId: number, data: CreateApiKeyDto) =>
    request.post<CreateApiKeyResponse>(`/api-apps/${appId}/keys`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: 'API密钥生成成功，请立即复制并安全保存',
        },
      },
    }),

  /**
   * 撤销API密钥
   */
  revokeApiKey: (keyId: number) =>
    request.delete(`/api-apps/keys/${keyId}`, {
      requestOptions: {
        confirmConfig: {
          message: '撤销后密钥将立即失效，使用该密钥的所有请求都将被拒绝。确定要撤销吗？',
          title: '撤销API密钥',
        },
        messageConfig: {
          successMessage: 'API密钥已撤销',
        },
      },
    }),

};
