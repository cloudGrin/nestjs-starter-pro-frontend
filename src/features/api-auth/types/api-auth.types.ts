/**
 * API认证模块类型定义
 */

/**
 * API应用
 */
export interface ApiApp {
  id: number;
  name: string;
  appId: string;
  description?: string;
  ownerId: number;
  scopes: string[];
  rateLimit: number;
  rateLimitPeriod: number;
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
  scopes: string[];
  appId: number;
  isActive: boolean;
  lastUsedAt?: string;
  usageCount: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * API使用统计
 */
export interface ApiStatistics {
  appId: number;
  period: 'hour' | 'day' | 'month';
  totalCalls: number;
  successCalls: number;
  errorCalls: number;
  avgResponseTime: number;
  data: ApiStatisticsDataPoint[];
}

/**
 * API统计数据点
 */
export interface ApiStatisticsDataPoint {
  date: string;
  calls: number;
  success: number;
  error: number;
}

/**
 * 创建API应用DTO
 */
export interface CreateApiAppDto {
  name: string;
  description?: string;
  scopes: string[];
  rateLimit?: number;
  rateLimitPeriod?: number;
}

/**
 * 更新API应用DTO
 */
export interface UpdateApiAppDto {
  name?: string;
  description?: string;
  scopes?: string[];
  rateLimit?: number;
  rateLimitPeriod?: number;
  isActive?: boolean;
}

/**
 * 创建API密钥DTO
 */
export interface CreateApiKeyDto {
  name: string;
  scopes?: string[];
  expiresAt?: string;
}

/**
 * 查询API应用DTO
 */
export interface QueryApiAppDto {
  page?: number;
  limit?: number;
  name?: string;
  isActive?: boolean;
}

/**
 * 查询API统计DTO
 */
export interface QueryStatisticsDto {
  period: 'hour' | 'day' | 'month';
  startDate?: string;
  endDate?: string;
}

/**
 * API应用列表响应
 */
export interface ApiAppListResponse {
  items: ApiApp[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * API密钥列表响应
 */
export interface ApiKeyListResponse {
  items: ApiKey[];
  total: number;
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
  scopes: string[];
  expiresAt?: string;
  createdAt: string;
  message: string;
}
