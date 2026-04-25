import { Card } from 'antd';
import {
  UserAddOutlined,
  TeamOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '@/shared/components';
import { useThemeStore } from '@/shared/stores';
import { cn } from '@/shared/utils/cn';

interface QuickAction {
  label: string;
  path: string;
  icon: React.ReactNode;
  permission?: string;
  color: string;
}

/**
 * 快捷操作组件（已适配深色模式）
 * 提供常用功能的快速入口
 */
export function QuickActions() {
  const navigate = useNavigate();
  const { mode: themeMode } = useThemeStore();

  const actions: QuickAction[] = [
    {
      label: '创建用户',
      path: '/system/users',
      icon: <UserAddOutlined />,
      permission: 'user:create',
      color: '#69b1ff',
    },
    {
      label: '创建角色',
      path: '/system/roles',
      icon: <TeamOutlined />,
      permission: 'role:create',
      color: '#95de64',
    },
    {
      label: '创建菜单',
      path: '/system/menus',
      icon: <MenuOutlined />,
      permission: 'menu:create',
      color: '#ffd666',
    },
    {
      label: '权限管理',
      path: '/system/permissions',
      icon: <SafetyCertificateOutlined />,
      permission: 'permission:read',
      color: '#b37feb',
    },
  ];

  return (
    <Card title="快捷操作" className="mt-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => {
          const content = (
            <div
              onClick={() => navigate(action.path)}
              className={cn(
                'h-20 border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-md transition-all',
                themeMode === 'dark'
                  ? 'bg-slate-800/40 hover:bg-slate-800/60' // 深色模式：半透明
                  : 'bg-white hover:bg-gray-50'
              )}
              style={{ borderColor: action.color }}
            >
              <span className="text-2xl" style={{ color: action.color }}>
                {action.icon}
              </span>
              <span
                className={cn(
                  'text-base font-medium',
                  themeMode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                )}
              >
                {action.label}
              </span>
            </div>
          );

          return action.permission ? (
            <PermissionGuard key={action.path} permissions={[action.permission]}>
              {content}
            </PermissionGuard>
          ) : (
            <div key={action.path}>{content}</div>
          );
        })}
      </div>
    </Card>
  );
}
