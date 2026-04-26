/**
 * 表格操作列组件
 *
 * 用途：
 * 1. 统一的表格操作按钮样式
 * 2. 权限控制
 * 3. 超过3个按钮自动折叠到下拉菜单
 *
 * @example
 * <TableActions
 *   actions={[
 *     { label: '编辑', onClick: handleEdit },
 *     { label: '删除', onClick: handleDelete, danger: true, permission: 'user:delete' },
 *   ]}
 * />
 */
import { Button, Dropdown, Space, Tooltip } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { usePermission } from '@/shared/hooks';
import type { NonEmptyArray } from '@/shared/hooks/usePermission';
import type { MenuProps } from 'antd';
import { cn } from '@/shared/utils/cn';

/** 基础操作属性 */
interface BaseAction {
  /** 所需权限（可选） */
  permission?: string | string[];
  /** Tooltip提示文本 */
  tooltip?: string;
}

interface ButtonAction extends BaseAction {
  type?: 'button';
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

interface TableActionsProps {
  /** 操作列表 */
  actions: ButtonAction[];
  /** 最多显示几个按钮（超过的折叠到下拉菜单） */
  maxVisible?: number;
}

export function TableActions({ actions, maxVisible = 3 }: TableActionsProps) {
  const { hasPermission } = usePermission();

  /**
   * 检查是否有权限访问某个操作
   */
  const checkPermission = (action: ButtonAction): boolean => {
    if (!action.permission) return true;
    const permissions: string[] = Array.isArray(action.permission)
      ? action.permission
      : [action.permission];
    if (permissions.length === 0) return false;
    return hasPermission(permissions as NonEmptyArray<string>);
  };

  /**
   * 渲染单个操作
   */
  const renderAction = (action: ButtonAction, index: number): React.ReactNode => {
    const button = (
      <Button
        type="text"
        size="small"
        danger={action.danger}
        disabled={action.disabled}
        loading={action.loading}
        icon={action.icon}
        onClick={action.onClick}
        className={cn(
          'h-7 min-w-[56px] rounded-md px-2 text-xs font-medium',
          action.danger
            ? 'text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700'
            : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300'
        )}
      >
        {action.label}
      </Button>
    );

    // 始终使用Tooltip（提升可访问性）
    return (
      <Tooltip key={`button-${index}`} title={action.tooltip || action.label}>
        {button}
      </Tooltip>
    );
  };

  // 过滤有权限的操作
  const visibleActions = actions.filter(checkPermission);

  if (visibleActions.length === 0) {
    return <span className="text-gray-400">-</span>;
  }

  if (visibleActions.length <= maxVisible) {
    return (
      <Space size="small">
        {visibleActions.map((action, index) => renderAction(action, index))}
      </Space>
    );
  }

  // 如果按钮数量 > maxVisible，前面显示按钮，后面折叠到下拉菜单
  const buttonActions = visibleActions.slice(0, maxVisible - 1);
  const dropdownActions = visibleActions.slice(maxVisible - 1);

  const menuItems: MenuProps['items'] = dropdownActions.map((action, index) => ({
    key: index,
    label: action.label,
    icon: action.icon,
    danger: action.danger,
    disabled: action.disabled,
    onClick: action.onClick,
  }));

  return (
    <Space size="small">
      {buttonActions.map((action, index) => renderAction(action, index))}

      <Dropdown
        menu={{
          items: menuItems,
          className: 'min-w-[120px]',
        }}
        placement="bottomRight"
        trigger={['click']}
      >
        <Tooltip title="更多操作">
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            className={cn(
              'h-7 rounded-md px-2',
              'hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800'
            )}
          />
        </Tooltip>
      </Dropdown>
    </Space>
  );
}
