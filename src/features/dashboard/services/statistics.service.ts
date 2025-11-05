import { request } from '@/shared/utils/request';
import type {
  UserGrowthQuery,
  UserGrowthResponse,
  RoleDistributionResponse,
  DashboardOverviewResponse,
} from '../types/statistics.types';

/**
 * 统计数据服务
 */
export const statisticsService = {
  /**
   * 获取用户增长统计
   * @param params 查询参数
   * @returns 用户增长数据
   */
  getUserGrowth: (params: UserGrowthQuery = {}) =>
    request.get<UserGrowthResponse>('/statistics/user-growth', { params }),

  /**
   * 获取角色分布统计
   * @returns 角色分布数据
   */
  getRoleDistribution: () =>
    request.get<RoleDistributionResponse>('/statistics/role-distribution'),

  /**
   * 获取Dashboard总览数据
   * 一次性获取所有Dashboard统计数据
   * @returns Dashboard总览数据
   */
  getDashboardOverview: () =>
    request.get<DashboardOverviewResponse>('/statistics/overview'),
};
