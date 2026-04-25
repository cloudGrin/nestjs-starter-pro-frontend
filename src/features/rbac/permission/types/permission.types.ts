/**
 * 权限管理模块类型定义
 * 对应后端: home-admin/src/modules/permission
 */

/**
 * 权限类型枚举
 */
export const PermissionType = {
  API: 'api', // API接口权限
  FEATURE: 'feature', // 功能权限
} as const;

export type PermissionType = (typeof PermissionType)[keyof typeof PermissionType];

/**
 * HTTP元数据
 */
export interface HttpMeta {
  method: string; // GET, POST, PUT, DELETE, PATCH
  path: string; // /api/users/:id
}

/**
 * 权限扩展配置
 */
export interface PermissionExtra {
  tags?: string[]; // 标签
  deprecated?: boolean; // 是否废弃
  replaceBy?: string; // 被哪个权限替代
  [key: string]: unknown;
}

/**
 * 权限实体
 */
export interface Permission {
  id: number; // 权限ID (自增主键)
  code: string; // 权限编码 (唯一标识) 格式: {module}:{resource}:{action}
  name: string; // 权限名称
  type: PermissionType; // 权限类型
  module: string; // 所属模块
  httpMeta?: HttpMeta[]; // HTTP元数据
  sort: number; // 排序值
  isActive: boolean; // 是否启用
  isSystem: boolean; // 是否为系统内置 (不可删除)
  description?: string; // 权限描述
  extra?: PermissionExtra; // 扩展配置
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}

/**
 * 权限树节点（按模块分组）
 * 后端返回的简单结构
 */
export interface PermissionTreeNode {
  module: string; // 模块代码，如 'user'
  name: string; // 模块名称，如 '用户管理'
  permissions: Permission[]; // 该模块下的所有权限
}

/**
 * 查询权限参数
 * 注意：后端使用limit而不是pageSize
 */
export interface QueryPermissionDto {
  page?: number; // 页码
  limit?: number; // 每页数量 (后端参数名为limit)
  code?: string; // 权限编码 (模糊搜索)
  name?: string; // 权限名称 (模糊搜索)
  type?: PermissionType; // 权限类型
  module?: string; // 所属模块
  isActive?: boolean; // 是否启用
  isSystem?: boolean; // 是否为系统内置
}

/**
 * 权限列表响应
 */
export interface PermissionListResponse {
  items: Permission[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 创建权限参数
 */
export interface CreatePermissionDto {
  code: string; // 权限编码
  name: string; // 权限名称
  type: PermissionType; // 权限类型
  module: string; // 所属模块
  httpMeta?: HttpMeta[]; // HTTP元数据
  sort?: number; // 排序值
  isActive?: boolean; // 是否启用
  isSystem?: boolean; // 是否为系统内置
  description?: string; // 权限描述
  extra?: PermissionExtra; // 扩展配置
}

/**
 * 更新权限参数
 */
export interface UpdatePermissionDto {
  code?: string;
  name?: string;
  type?: PermissionType;
  module?: string;
  httpMeta?: HttpMeta[];
  sort?: number;
  isActive?: boolean;
  isSystem?: boolean;
  description?: string;
  extra?: PermissionExtra;
}
