/**
 * API认证模块类型定义
 */

/**
 * API应用
 */
export interface ApiApp {
  id: number;
  name: string;
  description?: string;
  ownerId?: number;
  scopes?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * API密钥
 */
export interface ApiKey {
  id: number;
  name: string;
  key?: string; // 完整密钥（仅创建时返回一次）
  displayKey: string; // 脱敏显示的密钥
  prefix: string;
  suffix: string;
  scopes?: string[];
  appId: number;
  isActive: boolean;
  lastUsedAt?: string;
  usageCount: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 开放 API 权限范围
 */
export interface ApiScopeDefinition {
  code: string;
  label: string;
  description: string;
}

export interface ApiEndpointDefinition {
  scope: string;
  method: string;
  path: string;
  summary: string;
  description?: string;
}

export interface ApiScopeGroup {
  key: string;
  title: string;
  scopes: ApiScopeDefinition[];
  endpoints: ApiEndpointDefinition[];
}

/**
 * API 访问日志
 */
export interface ApiAccessLog {
  id: number;
  appId: number;
  keyId?: number;
  keyName?: string;
  keyPrefix?: string;
  keySuffix?: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建API应用DTO
 */
export interface CreateApiAppDto {
  name: string;
  description?: string;
  scopes?: string[];
}

/**
 * 更新API应用DTO
 */
export interface UpdateApiAppDto {
  name?: string;
  description?: string;
  scopes?: string[];
}

/**
 * 创建API密钥DTO
 */
export interface CreateApiKeyDto {
  name: string;
  environment: 'production' | 'test';
  scopes?: string[];
  expiresAt?: string;
}

/**
 * 查询API应用DTO
 */
export interface QueryApiAppDto {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

/**
 * 查询 API 访问日志 DTO
 */
export interface QueryApiAccessLogDto {
  keyId?: number;
  path?: string;
  statusCode?: number;
  page?: number;
  limit?: number;
}

/**
 * API应用列表响应
 */
export interface ApiAppListResponse {
  items: ApiApp[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * API 访问日志列表响应
 */
export interface ApiAccessLogListResponse {
  items: ApiAccessLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 创建密钥响应
 */
export interface CreateApiKeyResponse {
  id: number;
  name: string;
  key: string; // 完整密钥，仅此一次显示
  prefix: string;
  suffix: string;
  scopes?: string[];
  expiresAt?: string;
  createdAt: string;
  message: string;
}
