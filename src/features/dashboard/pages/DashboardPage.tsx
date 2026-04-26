import { PageWrap, PermissionGuard } from '@/shared/components';
import {
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { StatCard } from '../components/StatCard';
import { QuickActions } from '../components/QuickActions';
import { RecentActivities } from '../components/RecentActivities';
import { useUsers } from '@/features/rbac/user/hooks/useUsers';
import { useRoles } from '@/features/rbac/role/hooks/useRoles';
import { useMenus } from '@/features/rbac/menu/hooks/useMenus';
import { useUnreadNotifications } from '@/features/notification/hooks/useNotifications';

function UserTotalCard() {
  const { data: usersData, isLoading: usersLoading } = useUsers({
    page: 1,
    limit: 1,
  });

  return (
    <StatCard
      title="用户总数"
      value={usersData?.total || 0}
      icon={<UserOutlined />}
      color="#69b1ff"
      loading={usersLoading}
      suffix="个"
    />
  );
}

function RoleTotalCard() {
  const { data: rolesData, isLoading: rolesLoading } = useRoles({
    page: 1,
    limit: 1,
  });

  return (
    <StatCard
      title="角色总数"
      value={rolesData?.total || 0}
      icon={<TeamOutlined />}
      color="#95de64"
      loading={rolesLoading}
      suffix="个"
    />
  );
}

function MenuTotalCard() {
  const { data: menusData, isLoading: menusLoading } = useMenus();

  return (
    <StatCard
      title="菜单总数"
      value={menusData?.length || 0}
      icon={<MenuOutlined />}
      color="#ffd666"
      loading={menusLoading}
      suffix="个"
    />
  );
}

function UnreadNotificationCard() {
  const { data: unreadNotifications, isLoading: notificationsLoading } = useUnreadNotifications();

  return (
    <StatCard
      title="未读通知"
      value={unreadNotifications?.length || 0}
      icon={<BellOutlined />}
      color="#ff85c0"
      loading={notificationsLoading}
      suffix="条"
    />
  );
}

/**
 * Dashboard主页面
 * 显示当前用户有权限访问的系统概览信息、快捷操作和最近活动
 */
export function DashboardPage() {
  return (
    <PageWrap title="仪表盘">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PermissionGuard permissions={['user:read']}>
          <UserTotalCard />
        </PermissionGuard>
        <PermissionGuard permissions={['role:read']}>
          <RoleTotalCard />
        </PermissionGuard>
        <PermissionGuard permissions={['menu:read']}>
          <MenuTotalCard />
        </PermissionGuard>
        <PermissionGuard permissions={['notification:read']}>
          <UnreadNotificationCard />
        </PermissionGuard>
      </div>

      {/* 快捷操作 */}
      <QuickActions />

      {/* 最近活动 */}
      <RecentActivities />
    </PageWrap>
  );
}
