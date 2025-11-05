import { PageWrap } from '@/shared/components';
import {
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { StatCard } from '../components/StatCard';
import { QuickActions } from '../components/QuickActions';
import { RecentActivities } from '../components/RecentActivities';
import { UserGrowthChart } from '../components/UserGrowthChart';
import { RoleDistributionChart } from '../components/RoleDistributionChart';
import { useUsers } from '@/features/rbac/user/hooks/useUsers';
import { useRoles } from '@/features/rbac/role/hooks/useRoles';
import { useMenus } from '@/features/rbac/menu/hooks/useMenus';

/**
 * Dashboard主页面
 * 显示系统概览信息、统计数据、快捷操作和最近活动
 */
export function DashboardPage() {
  // 获取统计数据
  const { data: usersData, isLoading: usersLoading } = useUsers({
    page: 1,
    limit: 1,
  });

  const { data: rolesData, isLoading: rolesLoading } = useRoles({
    page: 1,
    limit: 1,
  });

  const { data: menusData, isLoading: menusLoading } = useMenus();

  return (
    <PageWrap title="仪表盘">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="用户总数"
          value={usersData?.total || 0}
          icon={<UserOutlined />}
          color="#69b1ff"
          loading={usersLoading}
          suffix="个"
        />
        <StatCard
          title="角色总数"
          value={rolesData?.total || 0}
          icon={<TeamOutlined />}
          color="#95de64"
          loading={rolesLoading}
          suffix="个"
        />
        <StatCard
          title="菜单总数"
          value={menusData?.length || 0}
          icon={<MenuOutlined />}
          color="#ffd666"
          loading={menusLoading}
          suffix="个"
        />
        <StatCard
          title="未读通知"
          value={0}
          icon={<BellOutlined />}
          color="#ff85c0"
          suffix="条"
        />
      </div>

      {/* 快捷操作 */}
      <QuickActions />

      {/* 数据可视化图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <UserGrowthChart />
        <RoleDistributionChart />
      </div>

      {/* 最近活动 */}
      <RecentActivities />
    </PageWrap>
  );
}
