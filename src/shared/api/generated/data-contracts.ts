/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface LoginDto {
  /**
   * 用户名或邮箱
   * @example "admin"
   */
  account: string;
  /**
   * 密码
   * @example "P@ssw0rd123"
   */
  password: string;
  /**
   * 验证码ID
   * @example "login:1700000000000:abc123"
   */
  captchaId?: string;
  /**
   * 验证码内容
   * @example "a1b2"
   */
  captchaCode?: string;
}

export interface RegisterDto {
  /**
   * 用户名
   * @minLength 3
   * @maxLength 50
   * @example "johndoe"
   */
  username: string;
  /**
   * 邮箱
   * @example "john@example.com"
   */
  email: string;
  /**
   * 密码
   * @minLength 6
   * @maxLength 50
   * @example "P@ssw0rd123"
   */
  password: string;
  /**
   * 真实姓名
   * @example "John Doe"
   */
  realName?: string;
}

export interface RefreshTokenDto {
  /**
   * 刷新Token
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  refreshToken: string;
}

export type UserEntity = object;

export interface CreateUserDto {
  /**
   * 用户名
   * @minLength 3
   * @maxLength 50
   * @example "johndoe"
   */
  username: string;
  /**
   * 邮箱
   * @example "john@example.com"
   */
  email: string;
  /**
   * 密码
   * @minLength 6
   * @maxLength 50
   * @example "P@ssw0rd123"
   */
  password: string;
  /**
   * 真实姓名
   * @example "John Doe"
   */
  realName?: string;
  /**
   * 昵称
   * @example "Johnny"
   */
  nickname?: string;
  /**
   * 手机号
   * @example "+8613800138000"
   */
  phone?: string;
  /**
   * 性别
   * @example "male"
   */
  gender?: "male" | "female" | "unknown";
  /**
   * 生日
   * @example "1990-01-01"
   */
  birthday?: string;
  /**
   * 地址
   * @example "Beijing, China"
   */
  address?: string;
  /**
   * 个人简介
   * @example "Software developer with 10 years experience"
   */
  bio?: string;
  /**
   * 头像URL
   * @example "https://example.com/avatar.jpg"
   */
  avatar?: string;
  /**
   * 状态
   * @default "active"
   */
  status?: "active" | "inactive" | "disabled" | "locked";
  /**
   * 角色ID列表
   * @example [1,2]
   */
  roleIds?: number[];
}

export interface UpdateUserDto {
  /**
   * 邮箱
   * @example "john@example.com"
   */
  email?: string;
  /**
   * 真实姓名
   * @example "John Doe"
   */
  realName?: string;
  /**
   * 昵称
   * @example "Johnny"
   */
  nickname?: string;
  /**
   * 手机号
   * @example "+8613800138000"
   */
  phone?: string;
  /**
   * 性别
   * @example "male"
   */
  gender?: "male" | "female" | "unknown";
  /**
   * 生日
   * @example "1990-01-01"
   */
  birthday?: string;
  /**
   * 地址
   * @example "Beijing, China"
   */
  address?: string;
  /**
   * 个人简介
   * @example "Software developer with 10 years experience"
   */
  bio?: string;
  /**
   * 头像URL
   * @example "https://example.com/avatar.jpg"
   */
  avatar?: string;
  /**
   * 状态
   * @default "active"
   */
  status?: "active" | "inactive" | "disabled" | "locked";
  /**
   * 角色ID列表
   * @example [1,2]
   */
  roleIds?: number[];
}

export interface ChangePasswordDto {
  /**
   * 当前密码
   * @example "OldP@ssw0rd"
   */
  oldPassword: string;
  /**
   * 新密码
   * @minLength 6
   * @maxLength 50
   * @example "NewP@ssw0rd123"
   */
  newPassword: string;
  /**
   * 确认新密码
   * @example "NewP@ssw0rd123"
   */
  confirmPassword: string;
}

export interface ResetPasswordDto {
  /**
   * 新密码
   * @minLength 6
   * @maxLength 50
   * @example "NewP@ssw0rd123"
   */
  password: string;
}

export type RoleEntity = object;

export interface CreateRoleDto {
  /**
   * 角色编码
   * @minLength 2
   * @maxLength 50
   * @example "admin"
   */
  code: string;
  /**
   * 角色名称
   * @maxLength 100
   * @example "管理员"
   */
  name: string;
  /**
   * 角色描述
   * @example "系统管理员角色"
   */
  description?: string;
  /**
   * 排序
   * @default 0
   * @example 0
   */
  sort?: number;
  /**
   * 是否启用
   * @default true
   * @example true
   */
  isActive?: boolean;
  /**
   * 权限ID列表
   * @example [1,2,3]
   */
  permissionIds?: number[];
}

export interface AssignMenusDto {
  /**
   * 菜单ID列表
   * @example [1,2,3,4,5]
   */
  menuIds: number[];
}

export type MenuEntity = object;

export interface RevokeMenusDto {
  /**
   * 要移除的菜单ID列表
   * @example [1,2,3]
   */
  menuIds: number[];
}

export interface CreateMenuDto {
  /**
   * 菜单名称
   * @example "用户管理"
   */
  name: string;
  /**
   * 菜单路径
   * @example "/system/users"
   */
  path?: string;
  /**
   * 菜单类型
   * @example "menu"
   */
  type: "directory" | "menu";
  /**
   * 菜单图标
   * @example "UserOutlined"
   */
  icon?: string;
  /**
   * 组件路径
   * @example "@/pages/system/users/index"
   */
  component?: string;
  /** 父菜单ID */
  parentId?: number;
  /**
   * 排序值
   * @default 0
   */
  sort?: number;
  /**
   * 是否显示
   * @default true
   */
  isVisible?: boolean;
  /**
   * 是否启用
   * @default true
   */
  isActive?: boolean;
  /**
   * 是否外链
   * @default false
   */
  isExternal?: boolean;
  /**
   * 是否缓存
   * @default false
   */
  isCache?: boolean;
  /** 菜单显示条件（需要的权限） */
  displayCondition?: object;
  /** 路由元数据 */
  meta?: object;
  /** 备注 */
  remark?: string;
}

export interface UpdateMenuDto {
  /**
   * 菜单名称
   * @example "用户管理"
   */
  name?: string;
  /**
   * 菜单路径
   * @example "/system/users"
   */
  path?: string;
  /**
   * 菜单类型
   * @example "menu"
   */
  type?: "directory" | "menu";
  /**
   * 菜单图标
   * @example "UserOutlined"
   */
  icon?: string;
  /**
   * 组件路径
   * @example "@/pages/system/users/index"
   */
  component?: string;
  /** 父菜单ID */
  parentId?: number;
  /**
   * 排序值
   * @default 0
   */
  sort?: number;
  /**
   * 是否显示
   * @default true
   */
  isVisible?: boolean;
  /**
   * 是否启用
   * @default true
   */
  isActive?: boolean;
  /**
   * 是否外链
   * @default false
   */
  isExternal?: boolean;
  /**
   * 是否缓存
   * @default false
   */
  isCache?: boolean;
  /** 菜单显示条件（需要的权限） */
  displayCondition?: object;
  /** 路由元数据 */
  meta?: object;
  /** 备注 */
  remark?: string;
}

export interface BatchUpdateMenuStatusDto {
  /**
   * 菜单ID列表
   * @example [1,2,3,4]
   */
  menuIds: number[];
  /**
   * 是否启用
   * @example true
   */
  isActive: boolean;
}

export interface MoveMenuDto {
  /**
   * 目标父菜单ID（null表示移动到根级）
   * @example 5
   */
  targetParentId?: number | null;
}

export type DictTypeEntity = object;

export interface CreateDictTypeDto {
  /**
   * 字典类型编码
   * @example "user_status"
   */
  code: string;
  /**
   * 字典类型名称
   * @example "用户状态"
   */
  name: string;
  /**
   * 描述
   * @example "用户账号状态管理"
   */
  description?: string;
  /**
   * 字典来源
   * @default "custom"
   */
  source?: "platform" | "custom";
  /**
   * 是否启用
   * @default true
   */
  isEnabled?: boolean;
  /**
   * 排序
   * @default 0
   */
  sort?: number;
  /**
   * 扩展配置
   * @example {"syncFrom":"external_api"}
   */
  config?: object;
}

export interface UpdateDictTypeDto {
  /**
   * 字典类型编码
   * @example "user_status"
   */
  code?: string;
  /**
   * 字典类型名称
   * @example "用户状态"
   */
  name?: string;
  /**
   * 描述
   * @example "用户账号状态管理"
   */
  description?: string;
  /**
   * 字典来源
   * @default "custom"
   */
  source?: "platform" | "custom";
  /**
   * 是否启用
   * @default true
   */
  isEnabled?: boolean;
  /**
   * 排序
   * @default 0
   */
  sort?: number;
  /**
   * 扩展配置
   * @example {"syncFrom":"external_api"}
   */
  config?: object;
}

export type DictItemEntity = object;

export interface CreateDictItemDto {
  /**
   * 字典类型ID
   * @example 1
   */
  dictTypeId: number;
  /**
   * 字典项标签
   * @example "正常"
   */
  label: string;
  /**
   * 字典项标签（英文）
   * @example "Active"
   */
  labelEn?: string;
  /**
   * 字典项值
   * @example "active"
   */
  value: string;
  /**
   * 标签颜色
   * @example "#52c41a"
   */
  color?: string;
  /**
   * 图标
   * @example "check-circle"
   */
  icon?: string;
  /**
   * 描述
   * @example "用户状态正常"
   */
  description?: string;
  /**
   * 状态
   * @default "enabled"
   */
  status?: "enabled" | "disabled";
  /**
   * 是否默认值
   * @default false
   */
  isDefault?: boolean;
  /**
   * 排序
   * @default 0
   */
  sort?: number;
  /**
   * 扩展数据
   * @example {"key":"value"}
   */
  extra?: object;
}

export interface BatchCreateDictItemDto {
  /**
   * 字典类型ID
   * @example 1
   */
  dictTypeId: number;
  /** 字典项列表 */
  items: CreateDictItemDto[];
}

export interface UpdateDictItemDto {
  /**
   * 字典类型ID
   * @example 1
   */
  dictTypeId?: number;
  /**
   * 字典项标签
   * @example "正常"
   */
  label?: string;
  /**
   * 字典项标签（英文）
   * @example "Active"
   */
  labelEn?: string;
  /**
   * 字典项值
   * @example "active"
   */
  value?: string;
  /**
   * 标签颜色
   * @example "#52c41a"
   */
  color?: string;
  /**
   * 图标
   * @example "check-circle"
   */
  icon?: string;
  /**
   * 描述
   * @example "用户状态正常"
   */
  description?: string;
  /**
   * 状态
   * @default "enabled"
   */
  status?: "enabled" | "disabled";
  /**
   * 是否默认值
   * @default false
   */
  isDefault?: boolean;
  /**
   * 排序
   * @default 0
   */
  sort?: number;
  /**
   * 扩展数据
   * @example {"key":"value"}
   */
  extra?: object;
}

export type SystemConfigEntity = object;

export interface CreateSystemConfigDto {
  /**
   * 配置键名
   * @example "site_name"
   */
  configKey: string;
  /**
   * 配置名称
   * @example "站点名称"
   */
  configName: string;
  /**
   * 配置值
   * @example "home Admin"
   */
  configValue?: string;
  /**
   * 配置类型
   * @default "text"
   */
  configType?: "text" | "number" | "boolean" | "json" | "array";
  /**
   * 配置分组
   * @default "other"
   */
  configGroup?: "system" | "business" | "security" | "third_party" | "other";
  /**
   * 配置描述
   * @example "系统站点名称配置"
   */
  description?: string;
  /**
   * 默认值
   * @example "Default Site"
   */
  defaultValue?: string;
  /**
   * 是否启用
   * @default true
   */
  isEnabled?: boolean;
  /**
   * 排序
   * @default 0
   */
  sort?: number;
  /**
   * 扩展属性
   * @example {"validation":"string"}
   */
  extra?: object;
}

export interface BatchUpdateConfigDto {
  /**
   * 配置项列表
   * @example {"site_name":"My Site","site_description":"Welcome to my site"}
   */
  configs: Record<string, any>;
}

export interface UpdateSystemConfigDto {
  /**
   * 配置键名
   * @example "site_name"
   */
  configKey?: string;
  /**
   * 配置名称
   * @example "站点名称"
   */
  configName?: string;
  /**
   * 配置值
   * @example "home Admin"
   */
  configValue?: string;
  /**
   * 配置类型
   * @default "text"
   */
  configType?: "text" | "number" | "boolean" | "json" | "array";
  /**
   * 配置分组
   * @default "other"
   */
  configGroup?: "system" | "business" | "security" | "third_party" | "other";
  /**
   * 配置描述
   * @example "系统站点名称配置"
   */
  description?: string;
  /**
   * 默认值
   * @example "Default Site"
   */
  defaultValue?: string;
  /**
   * 是否启用
   * @default true
   */
  isEnabled?: boolean;
  /**
   * 排序
   * @default 0
   */
  sort?: number;
  /**
   * 扩展属性
   * @example {"validation":"string"}
   */
  extra?: object;
}

export interface UpdateConfigValueDto {
  /** 配置值 */
  configValue: string;
}

export type FileEntity = object;

export type NotificationEntity = object;

export interface CreateNotificationDto {
  /**
   * 通知标题
   * @maxLength 150
   */
  title: string;
  /** 通知内容（支持HTML） */
  content: string;
  /**
   * 通知类型
   * @default "system"
   */
  type?: "system" | "message" | "reminder";
  /**
   * 通知优先级
   * @default "normal"
   */
  priority?: "low" | "normal" | "high" | "urgent";
  /** 接收用户ID列表（为空时，如果 isBroadcast=true 将通知所有用户） */
  recipientIds?: number[];
  /**
   * 是否广播给所有用户（仅管理员）
   * @default false
   */
  isBroadcast?: boolean;
  /**
   * 发送渠道列表（默认仅站内通知）
   * @default ["internal"]
   */
  channels?: ("internal" | "bark" | "feishu" | "sms")[];
  /**
   * 用户离线时是否触发外部渠道推送
   * @default false
   */
  sendExternalWhenOffline?: boolean;
  /** 额外的元数据（如跳转链接、参数等） */
  metadata?: object;
  /**
   * 过期时间（ISO8601格式）
   * @example "2025-12-31T23:59:59.999Z"
   */
  expireAt?: string;
}

export type TaskDefinitionEntity = object;

export interface CreateTaskDto {
  /**
   * 任务编码
   * @maxLength 100
   */
  code: string;
  /**
   * 任务名称
   * @maxLength 150
   */
  name: string;
  /** 任务描述 */
  description?: string;
  /**
   * 任务类型
   * @default "cron"
   */
  type: "cron" | "interval" | "timeout";
  /** Cron 表达式或间隔配置 */
  schedule?: string;
  /** 执行参数 */
  payload?: object;
  /**
   * 处理器名称
   * @maxLength 100
   */
  handler?: string;
  /**
   * 是否允许手动触发
   * @default false
   */
  allowManual?: boolean;
}

export interface UpdateTaskDto {
  /**
   * 任务编码
   * @maxLength 100
   */
  code?: string;
  /**
   * 任务名称
   * @maxLength 150
   */
  name?: string;
  /** 任务描述 */
  description?: string;
  /**
   * 任务类型
   * @default "cron"
   */
  type?: "cron" | "interval" | "timeout";
  /** Cron 表达式或间隔配置 */
  schedule?: string;
  /** 执行参数 */
  payload?: object;
  /**
   * 处理器名称
   * @maxLength 100
   */
  handler?: string;
  /**
   * 是否允许手动触发
   * @default false
   */
  allowManual?: boolean;
}

export interface UpdateTaskStatusDto {
  /** 任务状态 */
  status: "enabled" | "disabled";
}

export interface TriggerTaskDto {
  /** 执行参数覆盖 */
  payload?: object;
}

export type TaskLogEntity = object;

export interface CreateApiAppDto {
  /**
   * 应用名称
   * @example "My E-commerce Platform"
   */
  name: string;
  /**
   * 应用描述
   * @example "第三方电商平台集成"
   */
  description?: string;
  /**
   * 回调URL
   * @example "https://example.com/callback"
   */
  callbackUrl?: string;
  /**
   * Webhook URL
   * @example "https://example.com/webhook"
   */
  webhookUrl?: string;
  /**
   * API权限范围
   * @example ["read:users","read:orders","write:orders"]
   */
  scopes?: string[];
  /**
   * IP白名单
   * @example ["192.168.1.1","10.0.0.0/24"]
   */
  ipWhitelist?: string[];
  /**
   * 每小时API调用限制
   * @default 1000
   * @example 1000
   */
  rateLimitPerHour?: number;
  /**
   * 每日API调用限制
   * @default 10000
   * @example 10000
   */
  rateLimitPerDay?: number;
  /**
   * 所有者用户ID
   * @example 1
   */
  ownerId?: number;
}

export interface CreateApiKeyDto {
  /**
   * 所属应用ID（从路径参数自动填充）
   * @example 1
   */
  appId?: number;
  /**
   * 密钥名称
   * @example "Production Key"
   */
  name: string;
  /**
   * 环境类型
   * @example "production"
   */
  environment: "production" | "test";
  /**
   * 自定义权限范围（覆盖应用级别）
   * @example ["read:users","read:orders"]
   */
  scopes?: string[];
  /**
   * 过期时间
   * @format date-time
   * @example "2025-12-31T23:59:59Z"
   */
  expiresAt?: string;
}

export type PermissionEntity = object;

export interface CreatePermissionDto {
  /**
   * 权限编码（唯一）
   * @example "user:create"
   */
  code: string;
  /**
   * 权限名称
   * @example "创建用户"
   */
  name: string;
  /**
   * 权限类型
   * @example "api"
   */
  type: "api" | "feature";
  /**
   * 所属模块
   * @example "user"
   */
  module: string;
  /** HTTP元数据 */
  httpMeta?: object[];
  /**
   * 排序值
   * @default 0
   */
  sort?: number;
  /** 权限描述 */
  description?: string;
  /** 扩展配置 */
  extra?: object;
}

export interface UpdatePermissionDto {
  /**
   * 权限编码（唯一）
   * @example "user:create"
   */
  code?: string;
  /**
   * 权限名称
   * @example "创建用户"
   */
  name?: string;
  /**
   * 权限类型
   * @example "api"
   */
  type?: "api" | "feature";
  /**
   * 所属模块
   * @example "user"
   */
  module?: string;
  /** HTTP元数据 */
  httpMeta?: object[];
  /**
   * 排序值
   * @default 0
   */
  sort?: number;
  /** 权限描述 */
  description?: string;
  /** 扩展配置 */
  extra?: object;
}
