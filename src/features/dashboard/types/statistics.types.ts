/**
 * 统计数据类型定义
 */

/**
 * 用户增长数据点
 */
export interface UserGrowthDataPoint {
  date: string;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
}

/**
 * 用户增长响应
 */
export interface UserGrowthResponse {
  data: UserGrowthDataPoint[];
  totalUsers: number;
  growth: number;
  growthRate: number;
}

/**
 * 用户增长查询参数
 */
export interface UserGrowthQuery {
  days?: number;
}

/**
 * 角色分布数据点
 */
export interface RoleDistributionDataPoint {
  roleCode: string;
  roleName: string;
  userCount: number;
  percentage: number;
}

/**
 * 角色分布响应
 */
export interface RoleDistributionResponse {
  data: RoleDistributionDataPoint[];
  totalUsers: number;
}

/**
 * Dashboard总览响应
 */
export interface DashboardOverviewResponse {
  userGrowth: UserGrowthResponse;
  roleDistribution: RoleDistributionResponse;
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalRoles: number;
    totalMenus: number;
  };
}
