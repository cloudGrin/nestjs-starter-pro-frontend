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

import {
  AssignMenusDto,
  BatchCreateDictItemDto,
  BatchUpdateConfigDto,
  BatchUpdateMenuStatusDto,
  ChangePasswordDto,
  CreateApiAppDto,
  CreateApiKeyDto,
  CreateDictItemDto,
  CreateDictTypeDto,
  CreateMenuDto,
  CreateNotificationDto,
  CreatePermissionDto,
  CreateRoleDto,
  CreateSystemConfigDto,
  CreateTaskDto,
  CreateUserDto,
  DictItemEntity,
  DictTypeEntity,
  FileEntity,
  LoginDto,
  MenuEntity,
  MoveMenuDto,
  NotificationEntity,
  PermissionEntity,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  RevokeMenusDto,
  RoleEntity,
  SystemConfigEntity,
  TaskDefinitionEntity,
  TaskLogEntity,
  TriggerTaskDto,
  UpdateConfigValueDto,
  UpdateDictItemDto,
  UpdateDictTypeDto,
  UpdateMenuDto,
  UpdatePermissionDto,
  UpdateSystemConfigDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  UpdateUserDto,
  UserEntity,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Api<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags 认证
   * @name AuthControllerLoginV1
   * @summary 用户登录
   * @request POST:/api/v1/auth/login
   */
  authControllerLoginV1 = (data: LoginDto, params: RequestParams = {}) =>
    this.request<
      any,
      | {
          /** @example false */
          success?: boolean;
          /** @example 400 */
          statusCode?: number;
          /** @example "Bad Request - 参数验证失败" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.848Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.848Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/auth/login`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 认证
   * @name AuthControllerRegisterV1
   * @summary 用户注册
   * @request POST:/api/v1/auth/register
   */
  authControllerRegisterV1 = (data: RegisterDto, params: RequestParams = {}) =>
    this.request<
      any,
      | {
          /** @example false */
          success?: boolean;
          /** @example 400 */
          statusCode?: number;
          /** @example "Bad Request - 参数验证失败" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.848Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.848Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/auth/register`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags 认证
   * @name AuthControllerRefreshTokenV1
   * @summary 刷新令牌
   * @request POST:/api/v1/auth/refresh
   */
  authControllerRefreshTokenV1 = (
    data: RefreshTokenDto,
    params: RequestParams = {},
  ) =>
    this.request<
      any,
      | {
          /** @example false */
          success?: boolean;
          /** @example 400 */
          statusCode?: number;
          /** @example "Bad Request - 参数验证失败" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.848Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.848Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/auth/refresh`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags 认证
   * @name AuthControllerLogoutV1
   * @summary 用户登出
   * @request POST:/api/v1/auth/logout
   * @secure
   */
  authControllerLogoutV1 = (params: RequestParams = {}) =>
    this.request<
      any,
      | {
          /** @example false */
          success?: boolean;
          /** @example 401 */
          statusCode?: number;
          /** @example "Unauthorized - 用户未认证或token已过期" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.848Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 403 */
          statusCode?: number;
          /** @example "Forbidden - 用户无权限访问该资源" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.848Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.848Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/auth/logout`,
      method: "POST",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 认证
   * @name AuthControllerGetProfileV1
   * @summary 获取当前用户信息
   * @request GET:/api/v1/auth/profile
   * @secure
   */
  authControllerGetProfileV1 = (params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: UserEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.848Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      | {
          /** @example false */
          success?: boolean;
          /** @example 401 */
          statusCode?: number;
          /** @example "Unauthorized - 用户未认证或token已过期" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.848Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 403 */
          statusCode?: number;
          /** @example "Forbidden - 用户无权限访问该资源" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.848Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.848Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/auth/profile`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 认证
   * @name AuthControllerCheckAuthV1
   * @summary 检查认证状态
   * @request GET:/api/v1/auth/check
   * @secure
   */
  authControllerCheckAuthV1 = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/auth/check`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 用户管理
   * @name UserControllerCreateV1
   * @summary 创建用户
   * @request POST:/api/v1/users
   * @secure
   */
  userControllerCreateV1 = (data: CreateUserDto, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: UserEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.843Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      | {
          /** @example false */
          success?: boolean;
          /** @example 400 */
          statusCode?: number;
          /** @example "Bad Request - 参数验证失败" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.843Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 401 */
          statusCode?: number;
          /** @example "Unauthorized - 用户未认证" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.843Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 403 */
          statusCode?: number;
          /** @example "Forbidden - 用户无权限" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.843Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 409 */
          statusCode?: number;
          /** @example "Conflict - 资源已存在" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.843Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.843Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/users`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 用户管理
   * @name UserControllerFindAllV1
   * @summary 获取用户列表
   * @request GET:/api/v1/users
   * @secure
   */
  userControllerFindAllV1 = (
    query?: {
      /**
       * 页码
       * @min 1
       * @default 1
       */
      page?: number;
      /**
       * 每页数量
       * @min 1
       * @max 100
       * @default 10
       */
      limit?: number;
      /** 排序字段 */
      sort?: string;
      /**
       * 排序方向
       * @default "ASC"
       */
      order?: "ASC" | "DESC";
      /** 用户名（模糊查询） */
      username?: string;
      /** 邮箱（模糊查询） */
      email?: string;
      /** 手机号（模糊查询） */
      phone?: string;
      /** 真实姓名（模糊查询） */
      realName?: string;
      /** 状态 */
      status?: "active" | "inactive" | "disabled" | "locked";
      /** 性别 */
      gender?: "male" | "female" | "unknown";
      /** 角色ID */
      roleId?: number;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: {
          items?: UserEntity[];
          meta?: {
            /** @example 100 */
            totalItems?: number;
            /** @example 10 */
            itemCount?: number;
            /** @example 10 */
            itemsPerPage?: number;
            /** @example 10 */
            totalPages?: number;
            /** @example 1 */
            currentPage?: number;
          };
        };
        /** @example "2025-10-29T14:44:15.843Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      | {
          /** @example false */
          success?: boolean;
          /** @example 400 */
          statusCode?: number;
          /** @example "Bad Request - 参数验证失败" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.843Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 401 */
          statusCode?: number;
          /** @example "Unauthorized - 用户未认证" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.843Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 403 */
          statusCode?: number;
          /** @example "Forbidden - 用户无权限" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.843Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.843Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/users`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 用户管理
   * @name UserControllerGetProfileV1
   * @summary 获取当前用户信息
   * @request GET:/api/v1/users/profile
   * @secure
   */
  userControllerGetProfileV1 = (params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: UserEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.843Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      | {
          /** @example false */
          success?: boolean;
          /** @example 400 */
          statusCode?: number;
          /** @example "Bad Request - 参数验证失败" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.843Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 401 */
          statusCode?: number;
          /** @example "Unauthorized - 用户未认证或token已过期" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 403 */
          statusCode?: number;
          /** @example "Forbidden - 用户无权限访问该资源" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 404 */
          statusCode?: number;
          /** @example "Not Found - 请求的资源不存在" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/users/profile`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 用户管理
   * @name UserControllerUpdateProfileV1
   * @summary 更新当前用户信息
   * @request PUT:/api/v1/users/profile
   * @secure
   */
  userControllerUpdateProfileV1 = (
    data: UpdateUserDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: UserEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.844Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      | {
          /** @example false */
          success?: boolean;
          /** @example 400 */
          statusCode?: number;
          /** @example "Bad Request - 参数验证失败" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 401 */
          statusCode?: number;
          /** @example "Unauthorized - 用户未认证或token已过期" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 403 */
          statusCode?: number;
          /** @example "Forbidden - 用户无权限访问该资源" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 404 */
          statusCode?: number;
          /** @example "Not Found - 请求的资源不存在" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/users/profile`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 用户管理
   * @name UserControllerChangePasswordV1
   * @summary 修改密码
   * @request PUT:/api/v1/users/password
   * @secure
   */
  userControllerChangePasswordV1 = (
    data: ChangePasswordDto,
    params: RequestParams = {},
  ) =>
    this.request<
      any,
      | {
          /** @example false */
          success?: boolean;
          /** @example 400 */
          statusCode?: number;
          /** @example "Bad Request - 参数验证失败" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 401 */
          statusCode?: number;
          /** @example "Unauthorized - 用户未认证或token已过期" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 403 */
          statusCode?: number;
          /** @example "Forbidden - 用户无权限访问该资源" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 404 */
          statusCode?: number;
          /** @example "Not Found - 请求的资源不存在" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/users/password`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags 用户管理
   * @name UserControllerRemoveManyV1
   * @summary 批量删除用户
   * @request DELETE:/api/v1/users/batch
   * @secure
   */
  userControllerRemoveManyV1 = (data: string[], params: RequestParams = {}) =>
    this.request<
      any,
      | {
          /** @example false */
          success?: boolean;
          /** @example 400 */
          statusCode?: number;
          /** @example "Bad Request - 参数验证失败" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 401 */
          statusCode?: number;
          /** @example "Unauthorized - 用户未认证" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 403 */
          statusCode?: number;
          /** @example "Forbidden - 用户无权限" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 404 */
          statusCode?: number;
          /** @example "Not Found - 部分资源不存在" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/users/batch`,
      method: "DELETE",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags 用户管理
   * @name UserControllerFindOneV1
   * @summary 获取用户详情
   * @request GET:/api/v1/users/{id}
   * @secure
   */
  userControllerFindOneV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: UserEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.844Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      | {
          /** @example false */
          success?: boolean;
          /** @example 401 */
          statusCode?: number;
          /** @example "Unauthorized - 用户未认证" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 403 */
          statusCode?: number;
          /** @example "Forbidden - 用户无权限" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 404 */
          statusCode?: number;
          /** @example "Not Found - 资源不存在" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/users/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 用户管理
   * @name UserControllerUpdateV1
   * @summary 更新用户
   * @request PUT:/api/v1/users/{id}
   * @secure
   */
  userControllerUpdateV1 = (
    id: number,
    data: UpdateUserDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: UserEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.844Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      | {
          /** @example false */
          success?: boolean;
          /** @example 400 */
          statusCode?: number;
          /** @example "Bad Request - 参数验证失败" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 401 */
          statusCode?: number;
          /** @example "Unauthorized - 用户未认证" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 403 */
          statusCode?: number;
          /** @example "Forbidden - 用户无权限" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 404 */
          statusCode?: number;
          /** @example "Not Found - 资源不存在" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/users/${id}`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 用户管理
   * @name UserControllerRemoveV1
   * @summary 删除用户
   * @request DELETE:/api/v1/users/{id}
   * @secure
   */
  userControllerRemoveV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      any,
      | {
          /** @example false */
          success?: boolean;
          /** @example 401 */
          statusCode?: number;
          /** @example "Unauthorized - 用户未认证" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 403 */
          statusCode?: number;
          /** @example "Forbidden - 用户无权限" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 404 */
          statusCode?: number;
          /** @example "Not Found - 资源不存在" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:15.844Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/users/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 用户管理
   * @name UserControllerResetPasswordV1
   * @summary 重置用户密码（管理员）
   * @request PUT:/api/v1/users/{id}/password/reset
   * @secure
   */
  userControllerResetPasswordV1 = (
    id: number,
    data: ResetPasswordDto,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/users/${id}/password/reset`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags 用户管理
   * @name UserControllerEnableV1
   * @summary 启用用户
   * @request PUT:/api/v1/users/{id}/enable
   * @secure
   */
  userControllerEnableV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: UserEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.844Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/users/${id}/enable`,
      method: "PUT",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 用户管理
   * @name UserControllerDisableV1
   * @summary 禁用用户
   * @request PUT:/api/v1/users/{id}/disable
   * @secure
   */
  userControllerDisableV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: UserEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.844Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/users/${id}/disable`,
      method: "PUT",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 用户管理
   * @name UserControllerAssignRolesV1
   * @summary 分配角色
   * @request PUT:/api/v1/users/{id}/roles
   * @secure
   */
  userControllerAssignRolesV1 = (
    id: number,
    data: string[],
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: UserEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.844Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/users/${id}/roles`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 用户管理
   * @name UserControllerGetPermissionsV1
   * @summary 获取用户权限
   * @request GET:/api/v1/users/{id}/permissions
   * @secure
   */
  userControllerGetPermissionsV1 = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/users/${id}/permissions`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 角色管理
   * @name RoleControllerCreateV1
   * @summary 创建角色
   * @request POST:/api/v1/roles
   * @secure
   */
  roleControllerCreateV1 = (data: CreateRoleDto, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: RoleEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.853Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      void
    >({
      path: `/api/v1/roles`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 角色管理
   * @name RoleControllerFindAllV1
   * @summary 获取角色列表
   * @request GET:/api/v1/roles
   * @secure
   */
  roleControllerFindAllV1 = (params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: {
          items?: RoleEntity[];
          meta?: {
            /** @example 100 */
            totalItems?: number;
            /** @example 10 */
            itemCount?: number;
            /** @example 10 */
            itemsPerPage?: number;
            /** @example 10 */
            totalPages?: number;
            /** @example 1 */
            currentPage?: number;
          };
        };
        /** @example "2025-10-29T14:44:15.854Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      void
    >({
      path: `/api/v1/roles`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 角色管理
   * @name RoleControllerFindActiveRolesV1
   * @summary 获取所有活跃角色
   * @request GET:/api/v1/roles/active
   * @secure
   */
  roleControllerFindActiveRolesV1 = (params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: RoleEntity[];
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.854Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      void
    >({
      path: `/api/v1/roles/active`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 角色管理
   * @name RoleControllerFindOneV1
   * @summary 获取角色详情
   * @request GET:/api/v1/roles/{id}
   * @secure
   */
  roleControllerFindOneV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: RoleEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.854Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      void
    >({
      path: `/api/v1/roles/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 角色管理
   * @name RoleControllerUpdateV1
   * @summary 更新角色
   * @request PUT:/api/v1/roles/{id}
   * @secure
   */
  roleControllerUpdateV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: RoleEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.854Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      void
    >({
      path: `/api/v1/roles/${id}`,
      method: "PUT",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 角色管理
   * @name RoleControllerRemoveV1
   * @summary 删除角色
   * @request DELETE:/api/v1/roles/{id}
   * @secure
   */
  roleControllerRemoveV1 = (id: number, params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/api/v1/roles/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 角色管理
   * @name RoleControllerAssignPermissionsV1
   * @summary 分配权限
   * @request PUT:/api/v1/roles/{id}/permissions
   * @secure
   */
  roleControllerAssignPermissionsV1 = (
    id: number,
    data: string[],
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: RoleEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.854Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      void
    >({
      path: `/api/v1/roles/${id}/permissions`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 获取角色的所有有效权限（含权限组中的权限和继承的父角色权限）
   *
   * @tags 角色管理
   * @name RoleControllerGetEffectivePermissionsV1
   * @summary 获取角色的有效权限
   * @request GET:/api/v1/roles/{id}/effective-permissions
   * @secure
   */
  roleControllerGetEffectivePermissionsV1 = (
    id: number,
    params: RequestParams = {},
  ) =>
    this.request<void, void>({
      path: `/api/v1/roles/${id}/effective-permissions`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * @description 检查要分配给用户的多个角色之间是否存在互斥冲突
   *
   * @tags 角色管理
   * @name RoleControllerCheckExclusiveConflictV1
   * @summary 检查角色互斥冲突
   * @request POST:/api/v1/roles/check-exclusive
   * @secure
   */
  roleControllerCheckExclusiveConflictV1 = (params: RequestParams = {}) =>
    this.request<void, void>({
      path: `/api/v1/roles/check-exclusive`,
      method: "POST",
      secure: true,
      ...params,
    });
  /**
   * @description 为角色分配可访问的菜单列表
   *
   * @tags 角色管理
   * @name RoleControllerAssignMenusV1
   * @summary 分配菜单给角色
   * @request POST:/api/v1/roles/{id}/menus
   * @secure
   */
  roleControllerAssignMenusV1 = (
    id: number,
    data: AssignMenusDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: RoleEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.854Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      void
    >({
      path: `/api/v1/roles/${id}/menus`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 查询角色已分配的所有菜单
   *
   * @tags 角色管理
   * @name RoleControllerGetRoleMenusV1
   * @summary 获取角色的菜单列表
   * @request GET:/api/v1/roles/{id}/menus
   * @secure
   */
  roleControllerGetRoleMenusV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: MenuEntity[];
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.854Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      void
    >({
      path: `/api/v1/roles/${id}/menus`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 从角色中移除指定的菜单权限
   *
   * @tags 角色管理
   * @name RoleControllerRevokeMenusV1
   * @summary 移除角色的菜单
   * @request DELETE:/api/v1/roles/{id}/menus
   * @secure
   */
  roleControllerRevokeMenusV1 = (
    id: number,
    data: RevokeMenusDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: RoleEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.854Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      void
    >({
      path: `/api/v1/roles/${id}/menus`,
      method: "DELETE",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 菜单管理
   * @name MenuControllerCreateV1
   * @summary 创建菜单
   * @request POST:/api/v1/menus
   * @secure
   */
  menuControllerCreateV1 = (data: CreateMenuDto, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: MenuEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:16.169Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/menus`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 菜单管理
   * @name MenuControllerFindAllV1
   * @summary 获取菜单列表
   * @request GET:/api/v1/menus
   * @secure
   */
  menuControllerFindAllV1 = (
    query?: {
      /** 菜单名称（模糊搜索） */
      name?: string;
      /** 菜单类型 */
      type?: "directory" | "menu";
      /** 是否启用 */
      isActive?: boolean;
      /** 是否显示 */
      isVisible?: boolean;
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/menus`,
      method: "GET",
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 菜单管理
   * @name MenuControllerGetTreeV1
   * @summary 获取菜单树
   * @request GET:/api/v1/menus/tree
   * @secure
   */
  menuControllerGetTreeV1 = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/menus/tree`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * @description 根据用户角色过滤可访问的菜单，返回树形结构
   *
   * @tags 菜单管理
   * @name MenuControllerGetUserMenusV1
   * @summary 获取当前用户的菜单
   * @request GET:/api/v1/menus/user-menus
   * @secure
   */
  menuControllerGetUserMenusV1 = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/menus/user-menus`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 菜单管理
   * @name MenuControllerValidatePathV1
   * @summary 验证菜单路径是否唯一
   * @request GET:/api/v1/menus/validate-path
   * @secure
   */
  menuControllerValidatePathV1 = (
    query: {
      /** 菜单路径 */
      path: string;
      /** 排除的菜单ID(更新时使用) */
      excludeId?: number;
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/menus/validate-path`,
      method: "GET",
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 菜单管理
   * @name MenuControllerFindOneV1
   * @summary 获取菜单详情
   * @request GET:/api/v1/menus/{id}
   * @secure
   */
  menuControllerFindOneV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: MenuEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:16.169Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/menus/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 菜单管理
   * @name MenuControllerUpdateV1
   * @summary 更新菜单
   * @request PUT:/api/v1/menus/{id}
   * @secure
   */
  menuControllerUpdateV1 = (
    id: number,
    data: UpdateMenuDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: MenuEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:16.169Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/menus/${id}`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 菜单管理
   * @name MenuControllerDeleteV1
   * @summary 删除菜单
   * @request DELETE:/api/v1/menus/{id}
   * @secure
   */
  menuControllerDeleteV1 = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/menus/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 菜单管理
   * @name MenuControllerBatchUpdateStatusV1
   * @summary 批量启用/禁用菜单
   * @request PATCH:/api/v1/menus/batch-status
   * @secure
   */
  menuControllerBatchUpdateStatusV1 = (
    data: BatchUpdateMenuStatusDto,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/menus/batch-status`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags 菜单管理
   * @name MenuControllerMoveMenuV1
   * @summary 移动菜单到新的父节点
   * @request PATCH:/api/v1/menus/{id}/move
   * @secure
   */
  menuControllerMoveMenuV1 = (
    id: number,
    data: MoveMenuDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: MenuEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:16.169Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/menus/${id}/move`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典类型
   * @name DictTypeControllerCreateV1
   * @summary 创建字典类型
   * @request POST:/api/v1/dict-types
   * @secure
   */
  dictTypeControllerCreateV1 = (
    data: CreateDictTypeDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictTypeEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.857Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-types`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典类型
   * @name DictTypeControllerFindAllV1
   * @summary 获取字典类型列表
   * @request GET:/api/v1/dict-types
   * @secure
   */
  dictTypeControllerFindAllV1 = (
    query?: {
      /**
       * 页码
       * @min 1
       * @default 1
       */
      page?: number;
      /**
       * 每页数量
       * @min 1
       * @max 100
       * @default 10
       */
      limit?: number;
      /** 排序字段 */
      sort?: string;
      /**
       * 排序方向
       * @default "ASC"
       */
      order?: "ASC" | "DESC";
      /** 字典类型编码 */
      code?: string;
      /** 字典类型名称 */
      name?: string;
      /** 字典来源 */
      source?: "platform" | "custom";
      /** 是否启用 */
      isEnabled?: boolean;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: {
          items?: DictTypeEntity[];
          meta?: {
            /** @example 100 */
            totalItems?: number;
            /** @example 10 */
            itemCount?: number;
            /** @example 10 */
            itemsPerPage?: number;
            /** @example 10 */
            totalPages?: number;
            /** @example 1 */
            currentPage?: number;
          };
        };
        /** @example "2025-10-29T14:44:15.857Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-types`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典类型
   * @name DictTypeControllerFindEnabledV1
   * @summary 获取所有启用的字典类型
   * @request GET:/api/v1/dict-types/enabled
   * @secure
   */
  dictTypeControllerFindEnabledV1 = (params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictTypeEntity[];
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.857Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-types/enabled`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典类型
   * @name DictTypeControllerFindByCodeV1
   * @summary 根据编码获取字典类型
   * @request GET:/api/v1/dict-types/code/{code}
   * @secure
   */
  dictTypeControllerFindByCodeV1 = (code: string, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictTypeEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.857Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-types/code/${code}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典类型
   * @name DictTypeControllerFindOneV1
   * @summary 获取字典类型详情
   * @request GET:/api/v1/dict-types/{id}
   * @secure
   */
  dictTypeControllerFindOneV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictTypeEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.857Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-types/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典类型
   * @name DictTypeControllerUpdateV1
   * @summary 更新字典类型
   * @request PUT:/api/v1/dict-types/{id}
   * @secure
   */
  dictTypeControllerUpdateV1 = (
    id: number,
    data: UpdateDictTypeDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictTypeEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.857Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-types/${id}`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典类型
   * @name DictTypeControllerDeleteV1
   * @summary 删除字典类型
   * @request DELETE:/api/v1/dict-types/{id}
   * @secure
   */
  dictTypeControllerDeleteV1 = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/dict-types/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典类型
   * @name DictTypeControllerToggleEnabledV1
   * @summary 切换启用状态
   * @request PUT:/api/v1/dict-types/{id}/toggle
   * @secure
   */
  dictTypeControllerToggleEnabledV1 = (
    id: number,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictTypeEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.857Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-types/${id}/toggle`,
      method: "PUT",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典项
   * @name DictItemControllerCreateV1
   * @summary 创建字典项
   * @request POST:/api/v1/dict-items
   * @secure
   */
  dictItemControllerCreateV1 = (
    data: CreateDictItemDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictItemEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.858Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-items`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典项
   * @name DictItemControllerFindAllV1
   * @summary 获取字典项列表
   * @request GET:/api/v1/dict-items
   * @secure
   */
  dictItemControllerFindAllV1 = (
    query?: {
      /**
       * 页码
       * @min 1
       * @default 1
       */
      page?: number;
      /**
       * 每页数量
       * @min 1
       * @max 100
       * @default 10
       */
      limit?: number;
      /** 排序字段 */
      sort?: string;
      /**
       * 排序方向
       * @default "ASC"
       */
      order?: "ASC" | "DESC";
      /** 字典类型ID */
      dictTypeId?: number;
      /** 字典类型编码 */
      dictTypeCode?: string;
      /** 字典项标签 */
      label?: string;
      /** 字典项值 */
      value?: string;
      /** 状态 */
      status?: "enabled" | "disabled";
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: {
          items?: DictItemEntity[];
          meta?: {
            /** @example 100 */
            totalItems?: number;
            /** @example 10 */
            itemCount?: number;
            /** @example 10 */
            itemsPerPage?: number;
            /** @example 10 */
            totalPages?: number;
            /** @example 1 */
            currentPage?: number;
          };
        };
        /** @example "2025-10-29T14:44:15.859Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-items`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典项
   * @name DictItemControllerBatchCreateV1
   * @summary 批量创建字典项
   * @request POST:/api/v1/dict-items/batch
   * @secure
   */
  dictItemControllerBatchCreateV1 = (
    data: BatchCreateDictItemDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictItemEntity[];
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.859Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-items/batch`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典项
   * @name DictItemControllerFindEnabledByTypeIdV1
   * @summary 根据字典类型ID获取启用的字典项
   * @request GET:/api/v1/dict-items/type/{typeId}/enabled
   * @secure
   */
  dictItemControllerFindEnabledByTypeIdV1 = (
    typeId: number,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictItemEntity[];
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.859Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-items/type/${typeId}/enabled`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典项
   * @name DictItemControllerFindEnabledByTypeCodeV1
   * @summary 根据字典类型编码获取启用的字典项
   * @request GET:/api/v1/dict-items/type/code/{typeCode}/enabled
   * @secure
   */
  dictItemControllerFindEnabledByTypeCodeV1 = (
    typeCode: string,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictItemEntity[];
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.859Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-items/type/code/${typeCode}/enabled`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典项
   * @name DictItemControllerFindDefaultByTypeIdV1
   * @summary 获取字典类型的默认值
   * @request GET:/api/v1/dict-items/type/{typeId}/default
   * @secure
   */
  dictItemControllerFindDefaultByTypeIdV1 = (
    typeId: number,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictItemEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.859Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-items/type/${typeId}/default`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典项
   * @name DictItemControllerFindByTypeCodeAndValueV1
   * @summary 根据字典类型编码和值获取字典项
   * @request GET:/api/v1/dict-items/type/code/{typeCode}/value/{value}
   * @secure
   */
  dictItemControllerFindByTypeCodeAndValueV1 = (
    typeCode: string,
    value: string,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictItemEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.859Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-items/type/code/${typeCode}/value/${value}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典项
   * @name DictItemControllerFindOneV1
   * @summary 获取字典项详情
   * @request GET:/api/v1/dict-items/{id}
   * @secure
   */
  dictItemControllerFindOneV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictItemEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.859Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-items/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典项
   * @name DictItemControllerUpdateV1
   * @summary 更新字典项
   * @request PUT:/api/v1/dict-items/{id}
   * @secure
   */
  dictItemControllerUpdateV1 = (
    id: number,
    data: UpdateDictItemDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictItemEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.859Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-items/${id}`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典项
   * @name DictItemControllerDeleteV1
   * @summary 删除字典项
   * @request DELETE:/api/v1/dict-items/{id}
   * @secure
   */
  dictItemControllerDeleteV1 = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/dict-items/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 字典管理-字典项
   * @name DictItemControllerToggleStatusV1
   * @summary 切换启用状态
   * @request PUT:/api/v1/dict-items/{id}/toggle-status
   * @secure
   */
  dictItemControllerToggleStatusV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: DictItemEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.859Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/dict-items/${id}/toggle-status`,
      method: "PUT",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 系统管理-系统配置
   * @name SystemConfigControllerCreateV1
   * @summary 创建配置项
   * @request POST:/api/v1/system-configs
   * @secure
   */
  systemConfigControllerCreateV1 = (
    data: CreateSystemConfigDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: SystemConfigEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.970Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/system-configs`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 系统管理-系统配置
   * @name SystemConfigControllerFindAllV1
   * @summary 获取配置列表
   * @request GET:/api/v1/system-configs
   * @secure
   */
  systemConfigControllerFindAllV1 = (
    query?: {
      /**
       * 页码
       * @min 1
       * @default 1
       */
      page?: number;
      /**
       * 每页数量
       * @min 1
       * @max 100
       * @default 10
       */
      limit?: number;
      /** 排序字段 */
      sort?: string;
      /**
       * 排序方向
       * @default "ASC"
       */
      order?: "ASC" | "DESC";
      /** 配置键名 */
      configKey?: string;
      /** 配置名称 */
      configName?: string;
      /** 配置类型 */
      configType?: "text" | "number" | "boolean" | "json" | "array";
      /** 配置分组 */
      configGroup?:
        | "system"
        | "business"
        | "security"
        | "third_party"
        | "other";
      /** 是否启用 */
      isEnabled?: boolean;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: {
          items?: SystemConfigEntity[];
          meta?: {
            /** @example 100 */
            totalItems?: number;
            /** @example 10 */
            itemCount?: number;
            /** @example 10 */
            itemsPerPage?: number;
            /** @example 10 */
            totalPages?: number;
            /** @example 1 */
            currentPage?: number;
          };
        };
        /** @example "2025-10-29T14:44:15.970Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/system-configs`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 系统管理-系统配置
   * @name SystemConfigControllerBatchUpdateV1
   * @summary 批量更新配置值
   * @request POST:/api/v1/system-configs/batch
   * @secure
   */
  systemConfigControllerBatchUpdateV1 = (
    data: BatchUpdateConfigDto,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/system-configs/batch`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags 系统管理-系统配置
   * @name SystemConfigControllerFindEnabledV1
   * @summary 获取所有启用的配置
   * @request GET:/api/v1/system-configs/enabled
   * @secure
   */
  systemConfigControllerFindEnabledV1 = (params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: SystemConfigEntity[];
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.970Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/system-configs/enabled`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 系统管理-系统配置
   * @name SystemConfigControllerGetConfigMapV1
   * @summary 获取配置映射（键值对）
   * @request GET:/api/v1/system-configs/map
   * @secure
   */
  systemConfigControllerGetConfigMapV1 = (
    query: {
      keys: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/system-configs/map`,
      method: "GET",
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 系统管理-系统配置
   * @name SystemConfigControllerFindByKeyV1
   * @summary 根据键名获取配置
   * @request GET:/api/v1/system-configs/key/{key}
   * @secure
   */
  systemConfigControllerFindByKeyV1 = (
    key: string,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: SystemConfigEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.970Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/system-configs/key/${key}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 系统管理-系统配置
   * @name SystemConfigControllerGetValueV1
   * @summary 获取配置值
   * @request GET:/api/v1/system-configs/value/{key}
   * @secure
   */
  systemConfigControllerGetValueV1 = (
    key: string,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/system-configs/value/${key}`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 系统管理-系统配置
   * @name SystemConfigControllerFindOneV1
   * @summary 获取配置详情
   * @request GET:/api/v1/system-configs/{id}
   * @secure
   */
  systemConfigControllerFindOneV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: SystemConfigEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.970Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/system-configs/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 系统管理-系统配置
   * @name SystemConfigControllerUpdateV1
   * @summary 更新配置项
   * @request PUT:/api/v1/system-configs/{id}
   * @secure
   */
  systemConfigControllerUpdateV1 = (
    id: number,
    data: UpdateSystemConfigDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: SystemConfigEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.970Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/system-configs/${id}`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 系统管理-系统配置
   * @name SystemConfigControllerDeleteV1
   * @summary 删除配置项
   * @request DELETE:/api/v1/system-configs/{id}
   * @secure
   */
  systemConfigControllerDeleteV1 = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/system-configs/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 系统管理-系统配置
   * @name SystemConfigControllerToggleEnabledV1
   * @summary 切换启用状态
   * @request PUT:/api/v1/system-configs/{id}/toggle
   * @secure
   */
  systemConfigControllerToggleEnabledV1 = (
    id: number,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: SystemConfigEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.970Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/system-configs/${id}/toggle`,
      method: "PUT",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 系统管理-系统配置
   * @name SystemConfigControllerSetValueV1
   * @summary 设置配置值
   * @request PUT:/api/v1/system-configs/key/{key}/value
   * @secure
   */
  systemConfigControllerSetValueV1 = (
    key: string,
    data: UpdateConfigValueDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: SystemConfigEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:15.970Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/system-configs/key/${key}/value`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 上传单个文件，默认最大文件大小为100MB。支持常见文件格式。
   *
   * @tags 文件管理
   * @name FileControllerUploadV1
   * @summary 上传文件（直传）
   * @request POST:/api/v1/files/upload
   * @secure
   */
  fileControllerUploadV1 = (
    data: {
      /**
       * 要上传的文件（最大100MB）
       * @format binary
       */
      file: File;
      /**
       * 业务模块标识
       * @example "user-avatar"
       */
      module?: string;
      /**
       * 业务标签，逗号分隔
       * @example "avatar,profile"
       */
      tags?: string;
      /**
       * 是否公开访问
       * @default false
       */
      isPublic?: boolean;
      /**
       * 备注信息
       * @maxLength 500
       */
      remark?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: FileEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:16.083Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      | {
          /** @example false */
          success?: boolean;
          /** @example 400 */
          statusCode?: number;
          /** @example "Bad Request - 文件验证失败" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 401 */
          statusCode?: number;
          /** @example "Unauthorized - 用户未认证" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 403 */
          statusCode?: number;
          /** @example "Forbidden - 用户无权限" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 413 */
          statusCode?: number;
          /** @example "Payload Too Large - 文件大小超出限制" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 415 */
          statusCode?: number;
          /** @example "Unsupported Media Type - 不支持的文件类型" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/files/upload`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    });
  /**
   * @description 用于大文件分片上传，每个分片默认不超过10MB
   *
   * @tags 文件管理
   * @name FileControllerUploadChunkV1
   * @summary 上传文件分片
   * @request POST:/api/v1/files/upload/chunk
   * @secure
   */
  fileControllerUploadChunkV1 = (
    data: {
      /**
       * 分片文件
       * @format binary
       */
      chunk: File;
      /** 上传会话ID */
      uploadId: string;
      /** 当前分片索引（从1开始） */
      chunkIndex: number;
      /** 分片总数 */
      totalChunks: number;
      /** 分片大小（字节） */
      chunkSize: number;
      /** 文件总大小（字节） */
      totalSize: number;
      /** 原始文件名 */
      filename: string;
      /** 文件哈希（可选） */
      hash?: string;
      /** 业务模块标识 */
      module?: string;
      /** 业务标签 */
      tags?: string;
      /** 是否公开访问 */
      isPublic?: boolean;
      /** 备注信息 */
      remark?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      any,
      | {
          /** @example false */
          success?: boolean;
          /** @example 400 */
          statusCode?: number;
          /** @example "Bad Request - 文件验证失败" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 401 */
          statusCode?: number;
          /** @example "Unauthorized - 用户未认证" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 403 */
          statusCode?: number;
          /** @example "Forbidden - 用户无权限" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 413 */
          statusCode?: number;
          /** @example "Payload Too Large - 文件大小超出限制" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 415 */
          statusCode?: number;
          /** @example "Unsupported Media Type - 不支持的文件类型" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/files/upload/chunk`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      ...params,
    });
  /**
   * No description
   *
   * @tags 文件管理
   * @name FileControllerFindAllV1
   * @summary 获取文件列表
   * @request GET:/api/v1/files
   * @secure
   */
  fileControllerFindAllV1 = (
    query?: {
      /**
       * 页码
       * @min 1
       * @default 1
       */
      page?: number;
      /**
       * 每页数量
       * @min 1
       * @max 100
       * @default 10
       */
      limit?: number;
      /** 排序字段 */
      sort?: string;
      /**
       * 排序方向
       * @default "ASC"
       */
      order?: "ASC" | "DESC";
      /** 模糊搜索关键字（原始名或存储名） */
      keyword?: string;
      /** 存储类型过滤 */
      storage?: "local" | "oss" | "minio";
      /** 文件状态过滤 */
      status?: "uploading" | "available" | "processing" | "failed";
      /**
       * 文件类别过滤
       * @example "image"
       */
      category?: string;
      /**
       * 业务模块过滤
       * @example "user-avatar"
       */
      module?: string;
      /** 是否公开访问 */
      isPublic?: boolean;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: {
          items?: FileEntity[];
          meta?: {
            /** @example 100 */
            totalItems?: number;
            /** @example 10 */
            itemCount?: number;
            /** @example 10 */
            itemsPerPage?: number;
            /** @example 10 */
            totalPages?: number;
            /** @example 1 */
            currentPage?: number;
          };
        };
        /** @example "2025-10-29T14:44:16.084Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      | {
          /** @example false */
          success?: boolean;
          /** @example 400 */
          statusCode?: number;
          /** @example "Bad Request - 参数验证失败" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 401 */
          statusCode?: number;
          /** @example "Unauthorized - 用户未认证或token已过期" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 403 */
          statusCode?: number;
          /** @example "Forbidden - 用户无权限访问该资源" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 404 */
          statusCode?: number;
          /** @example "Not Found - 请求的资源不存在" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
      | {
          /** @example false */
          success?: boolean;
          /** @example 500 */
          statusCode?: number;
          /** @example "Internal Server Error - 服务器内部错误" */
          message?: string;
          /** @example "Error Type" */
          error?: string;
          /** @example "2025-10-29T14:44:16.084Z" */
          timestamp?: string;
          /** @example "/api/v1/resource" */
          path?: string;
          /** @example "GET" */
          method?: string;
        }
    >({
      path: `/api/v1/files`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 文件管理
   * @name FileControllerGetProgressV1
   * @summary 查询分片上传进度
   * @request GET:/api/v1/files/upload/{uploadId}/progress
   * @secure
   */
  fileControllerGetProgressV1 = (
    uploadId: string,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/files/upload/${uploadId}/progress`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 文件管理
   * @name FileControllerFindOneV1
   * @summary 获取文件详情
   * @request GET:/api/v1/files/{id}
   * @secure
   */
  fileControllerFindOneV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: FileEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:16.084Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/files/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 文件管理
   * @name FileControllerRemoveV1
   * @summary 删除文件
   * @request DELETE:/api/v1/files/{id}
   * @secure
   */
  fileControllerRemoveV1 = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/files/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 文件管理
   * @name FileControllerGenerateSignedUrlV1
   * @summary 生成文件下载签名 URL
   * @request GET:/api/v1/files/{id}/signed-url
   * @secure
   */
  fileControllerGenerateSignedUrlV1 = (
    id: number,
    query: {
      expiresIn: number;
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/files/${id}/signed-url`,
      method: "GET",
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 文件管理
   * @name FileControllerDownloadV1
   * @summary 下载文件
   * @request GET:/api/v1/files/{id}/download
   * @secure
   */
  fileControllerDownloadV1 = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/files/${id}/download`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 通知管理
   * @name NotificationControllerCreateV1
   * @summary 创建通知（支持广播与多用户）
   * @request POST:/api/v1/notifications
   * @secure
   */
  notificationControllerCreateV1 = (
    data: CreateNotificationDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: NotificationEntity[];
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:16.107Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/notifications`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 通知管理
   * @name NotificationControllerFindAllV1
   * @summary 获取我的通知列表
   * @request GET:/api/v1/notifications
   * @secure
   */
  notificationControllerFindAllV1 = (
    query?: {
      /**
       * 页码
       * @min 1
       * @default 1
       */
      page?: number;
      /**
       * 每页数量
       * @min 1
       * @max 100
       * @default 10
       */
      limit?: number;
      /** 排序字段 */
      sort?: string;
      /**
       * 排序方向
       * @default "ASC"
       */
      order?: "ASC" | "DESC";
      /** 通知状态过滤 */
      status?: "unread" | "read";
      /** 通知类型过滤 */
      type?: "system" | "message" | "reminder";
      /** 标题或内容关键字 */
      keyword?: string;
      /**
       * 开始日期（ISO8601格式）
       * @example "2025-01-01T00:00:00.000Z"
       */
      startDate?: string;
      /**
       * 结束日期（ISO8601格式）
       * @example "2025-12-31T23:59:59.999Z"
       */
      endDate?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: {
          items?: NotificationEntity[];
          meta?: {
            /** @example 100 */
            totalItems?: number;
            /** @example 10 */
            itemCount?: number;
            /** @example 10 */
            itemsPerPage?: number;
            /** @example 10 */
            totalPages?: number;
            /** @example 1 */
            currentPage?: number;
          };
        };
        /** @example "2025-10-29T14:44:16.107Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/notifications`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 通知管理
   * @name NotificationControllerFindUnreadV1
   * @summary 获取我的未读通知
   * @request GET:/api/v1/notifications/unread
   * @secure
   */
  notificationControllerFindUnreadV1 = (params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: NotificationEntity[];
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:16.107Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/notifications/unread`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 通知管理
   * @name NotificationControllerMarkAsReadV1
   * @summary 标记单条通知为已读
   * @request PUT:/api/v1/notifications/{id}/read
   * @secure
   */
  notificationControllerMarkAsReadV1 = (
    id: number,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/notifications/${id}/read`,
      method: "PUT",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 通知管理
   * @name NotificationControllerMarkAllAsReadV1
   * @summary 将所有通知标记为已读
   * @request PUT:/api/v1/notifications/read-all
   * @secure
   */
  notificationControllerMarkAllAsReadV1 = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/notifications/read-all`,
      method: "PUT",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 任务调度
   * @name TaskControllerCreateV1
   * @summary 创建任务
   * @request POST:/api/v1/tasks
   * @secure
   */
  taskControllerCreateV1 = (data: CreateTaskDto, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: TaskDefinitionEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:16.155Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/tasks`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 任务调度
   * @name TaskControllerFindAllV1
   * @summary 任务列表
   * @request GET:/api/v1/tasks
   * @secure
   */
  taskControllerFindAllV1 = (
    query?: {
      /**
       * 页码
       * @min 1
       * @default 1
       */
      page?: number;
      /**
       * 每页数量
       * @min 1
       * @max 100
       * @default 10
       */
      limit?: number;
      /** 排序字段 */
      sort?: string;
      /**
       * 排序方向
       * @default "ASC"
       */
      order?: "ASC" | "DESC";
      /** 任务编码或名称关键词 */
      keyword?: string;
      /** 任务类型 */
      type?: "cron" | "interval" | "timeout";
      /** 任务状态 */
      status?: "enabled" | "disabled";
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: {
          items?: TaskDefinitionEntity[];
          meta?: {
            /** @example 100 */
            totalItems?: number;
            /** @example 10 */
            itemCount?: number;
            /** @example 10 */
            itemsPerPage?: number;
            /** @example 10 */
            totalPages?: number;
            /** @example 1 */
            currentPage?: number;
          };
        };
        /** @example "2025-10-29T14:44:16.155Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/tasks`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 任务调度
   * @name TaskControllerUpdateV1
   * @summary 更新任务
   * @request PUT:/api/v1/tasks/{id}
   * @secure
   */
  taskControllerUpdateV1 = (
    id: number,
    data: UpdateTaskDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: TaskDefinitionEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:16.155Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/tasks/${id}`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 任务调度
   * @name TaskControllerToggleV1
   * @summary 启用/禁用任务
   * @request PATCH:/api/v1/tasks/{id}/status
   * @secure
   */
  taskControllerToggleV1 = (
    id: number,
    data: UpdateTaskStatusDto,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/tasks/${id}/status`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags 任务调度
   * @name TaskControllerTriggerV1
   * @summary 手动触发任务
   * @request POST:/api/v1/tasks/{id}/trigger
   * @secure
   */
  taskControllerTriggerV1 = (
    id: number,
    data: TriggerTaskDto,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/tasks/${id}/trigger`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags 任务调度
   * @name TaskControllerLogsV1
   * @summary 获取任务执行日志
   * @request GET:/api/v1/tasks/{id}/logs
   * @secure
   */
  taskControllerLogsV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: TaskLogEntity[];
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:16.155Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/tasks/${id}/logs`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags API应用管理
   * @name ApiAppControllerCreateAppV1
   * @summary 创建API应用
   * @request POST:/api/v1/v1/api-apps
   * @secure
   */
  apiAppControllerCreateAppV1 = (
    data: CreateApiAppDto,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/v1/api-apps`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags API应用管理
   * @name ApiAppControllerGenerateKeyV1
   * @summary 生成API密钥
   * @request POST:/api/v1/v1/api-apps/{appId}/keys
   * @secure
   */
  apiAppControllerGenerateKeyV1 = (
    appId: number,
    data: CreateApiKeyDto,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/v1/api-apps/${appId}/keys`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags API应用管理
   * @name ApiAppControllerGetAppKeysV1
   * @summary 获取应用的所有密钥
   * @request GET:/api/v1/v1/api-apps/{appId}/keys
   * @secure
   */
  apiAppControllerGetAppKeysV1 = (appId: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/v1/api-apps/${appId}/keys`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags API应用管理
   * @name ApiAppControllerRevokeKeyV1
   * @summary 撤销API密钥
   * @request DELETE:/api/v1/v1/api-apps/keys/{keyId}
   * @secure
   */
  apiAppControllerRevokeKeyV1 = (keyId: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/v1/api-apps/keys/${keyId}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags API应用管理
   * @name ApiAppControllerGetStatisticsV1
   * @summary 获取API使用统计
   * @request GET:/api/v1/v1/api-apps/{appId}/statistics
   * @secure
   */
  apiAppControllerGetStatisticsV1 = (
    appId: number,
    query: {
      period: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/v1/v1/api-apps/${appId}/statistics`,
      method: "GET",
      query: query,
      secure: true,
      ...params,
    });
  /**
   * @description 需要 read:users 权限
   *
   * @tags 开放API
   * @name OpenApiControllerGetUsersV1
   * @summary 获取用户列表
   * @request GET:/api/v1/v1/open/users
   */
  openApiControllerGetUsersV1 = (
    query: {
      page: number;
      pageSize: number;
    },
    params: RequestParams = {},
  ) =>
    this.request<any, any>({
      path: `/api/v1/v1/open/users`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description 需要 read:orders 权限
   *
   * @tags 开放API
   * @name OpenApiControllerGetOrdersV1
   * @summary 获取订单列表
   * @request GET:/api/v1/v1/open/orders
   */
  openApiControllerGetOrdersV1 = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/v1/open/orders`,
      method: "GET",
      ...params,
    });
  /**
   * @description 需要 write:orders 权限
   *
   * @tags 开放API
   * @name OpenApiControllerCreateOrderV1
   * @summary 创建订单
   * @request POST:/api/v1/v1/open/orders
   */
  openApiControllerCreateOrderV1 = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/v1/open/orders`,
      method: "POST",
      ...params,
    });
  /**
   * @description 需要 manage:webhooks 权限
   *
   * @tags 开放API
   * @name OpenApiControllerSubscribeWebhookV1
   * @summary 订阅Webhook事件
   * @request POST:/api/v1/v1/open/webhooks/subscribe
   */
  openApiControllerSubscribeWebhookV1 = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/v1/open/webhooks/subscribe`,
      method: "POST",
      ...params,
    });
  /**
   * @description 获取当前API密钥的使用统计
   *
   * @tags 开放API
   * @name OpenApiControllerGetStatisticsV1
   * @summary 获取API调用统计
   * @request GET:/api/v1/v1/open/statistics
   */
  openApiControllerGetStatisticsV1 = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/v1/open/statistics`,
      method: "GET",
      ...params,
    });
  /**
   * @description 检查服务是否存活，仅检查进程状态，不检查依赖
   *
   * @tags 健康检查
   * @name HealthControllerHealthzV1
   * @summary 健康检查（Liveness Probe）
   * @request GET:/api/v1/healthz
   */
  healthControllerHealthzV1 = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/healthz`,
      method: "GET",
      ...params,
    });
  /**
   * @description 检查服务及其依赖是否就绪，包括数据库、Redis等
   *
   * @tags 健康检查
   * @name HealthControllerReadyzV1
   * @summary 就绪检查（Readiness Probe）
   * @request GET:/api/v1/readyz
   */
  healthControllerReadyzV1 = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/readyz`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags 权限管理
   * @name PermissionControllerCreateV1
   * @summary 创建权限（手动）
   * @request POST:/api/v1/permissions
   * @secure
   */
  permissionControllerCreateV1 = (
    data: CreatePermissionDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: PermissionEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:16.165Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/permissions`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 权限管理
   * @name PermissionControllerFindAllV1
   * @summary 获取权限列表
   * @request GET:/api/v1/permissions
   * @secure
   */
  permissionControllerFindAllV1 = (
    query?: {
      /**
       * 页码
       * @min 1
       * @default 1
       */
      page?: number;
      /**
       * 每页数量
       * @min 1
       * @max 100
       * @default 10
       */
      limit?: number;
      /** 排序字段 */
      sort?: string;
      /**
       * 排序方向
       * @default "ASC"
       */
      order?: "ASC" | "DESC";
      /** 权限编码（模糊搜索） */
      code?: string;
      /** 权限名称（模糊搜索） */
      name?: string;
      /** 权限类型 */
      type?: "api" | "feature";
      /** 所属模块 */
      module?: string;
      /** 是否启用 */
      isActive?: boolean;
      /** 是否为系统内置 */
      isSystem?: boolean;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: {
          items?: PermissionEntity[];
          meta?: {
            /** @example 100 */
            totalItems?: number;
            /** @example 10 */
            itemCount?: number;
            /** @example 10 */
            itemsPerPage?: number;
            /** @example 10 */
            totalPages?: number;
            /** @example 1 */
            currentPage?: number;
          };
        };
        /** @example "2025-10-29T14:44:16.165Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/permissions`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 权限管理
   * @name PermissionControllerGetTreeV1
   * @summary 获取权限树（按模块分组）
   * @request GET:/api/v1/permissions/tree
   * @secure
   */
  permissionControllerGetTreeV1 = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/permissions/tree`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags 权限管理
   * @name PermissionControllerFindOneV1
   * @summary 获取权限详情
   * @request GET:/api/v1/permissions/{id}
   * @secure
   */
  permissionControllerFindOneV1 = (id: number, params: RequestParams = {}) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: PermissionEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:16.165Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/permissions/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 权限管理
   * @name PermissionControllerUpdateV1
   * @summary 更新权限
   * @request PUT:/api/v1/permissions/{id}
   * @secure
   */
  permissionControllerUpdateV1 = (
    id: number,
    data: UpdatePermissionDto,
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** @example true */
        success?: boolean;
        data?: PermissionEntity;
        /** @example "Operation successful" */
        message?: string;
        /** @example "2025-10-29T14:44:16.165Z" */
        timestamp?: string;
        /** @example "/api/v1/resource" */
        path?: string;
        /** @example "GET" */
        method?: string;
      },
      any
    >({
      path: `/api/v1/permissions/${id}`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags 权限管理
   * @name PermissionControllerDeleteV1
   * @summary 删除权限
   * @request DELETE:/api/v1/permissions/{id}
   * @secure
   */
  permissionControllerDeleteV1 = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/permissions/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * @description 扫描所有控制器的 @RequirePermissions 装饰器，自动同步权限点到数据库
   *
   * @tags 权限管理
   * @name PermissionControllerSyncPermissionsV1
   * @summary 手动触发权限扫描同步
   * @request POST:/api/v1/permissions/sync
   * @secure
   */
  permissionControllerSyncPermissionsV1 = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v1/permissions/sync`,
      method: "POST",
      secure: true,
      ...params,
    });
}
