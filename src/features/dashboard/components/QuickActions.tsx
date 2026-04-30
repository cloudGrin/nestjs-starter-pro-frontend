import { Card } from 'antd';
import {
  UserAddOutlined,
  TeamOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '@/shared/components';

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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const content = (
            <button
              type="button"
              onClick={() => navigate(action.path)}
              className="flex h-24 w-full items-center gap-3 rounded-lg border bg-white px-4 text-left hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
              style={{ borderColor: `${action.color}66` }}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                style={{ backgroundColor: `${action.color}18`, color: action.color }}
              >
                {action.icon}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {action.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                  快速进入
                </span>
              </span>
            </button>
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
