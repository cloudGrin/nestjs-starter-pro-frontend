import { useQuery } from '@tanstack/react-query';
import { statisticsService } from '../services/statistics.service';
import type { UserGrowthQuery } from '../types/statistics.types';

/**
 * 获取用户增长统计
 * @param params 查询参数
 */
export function useUserGrowth(params: UserGrowthQuery = {}) {
  return useQuery({
    queryKey: ['statistics', 'user-growth', params],
    queryFn: () => statisticsService.getUserGrowth(params),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });
}

/**
 * 获取角色分布统计
 */
export function useRoleDistribution() {
  return useQuery({
    queryKey: ['statistics', 'role-distribution'],
    queryFn: () => statisticsService.getRoleDistribution(),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });
}

/**
 * 获取Dashboard总览数据
 * 推荐使用此Hook代替单独调用useUserGrowth和useRoleDistribution
 * 可减少HTTP请求次数
 */
export function useDashboardOverview() {
  return useQuery({
    queryKey: ['statistics', 'overview'],
    queryFn: () => statisticsService.getDashboardOverview(),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });
}
