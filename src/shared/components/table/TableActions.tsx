/**
 * 表格操作列组件（企业级设计）
 *
 * 用途：
 * 1. 统一的表格操作按钮样式（现代化hover效果）
 * 2. 权限控制
 * 3. 超过3个按钮自动折叠到下拉菜单
 * 4. 支持多种操作类型：按钮、开关、分隔线
 * 5. 微交互：hover放大、危险操作红色突出
 *
 * @example
 * // 基础按钮用法（向后兼容）
 * <TableActions
 *   actions={[
 *     { label: '编辑', onClick: handleEdit },
 *     { label: '删除', onClick: handleDelete, danger: true, permission: 'user:delete' },
 *   ]}
 * />
 *
 * @example
 * // 带类型的高级用法
 * <TableActions
 *   actions={[
 *     { type: 'switch', checked: true, onChange: handleToggle, tooltip: '启用/禁用', permission: 'user:update' },
 *     { type: 'divider' },
 *     { type: 'button', label: '编辑', icon: <EditOutlined />, onClick: handleEdit },
 *     { type: 'button', label: '删除', onClick: handleDelete, danger: true },
 *   ]}
 * />
 */
import { Button, Dropdown, Space, Switch, Divider, Tooltip } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { usePermission } from '@/shared/hooks';
import type { MenuProps } from 'antd';
import { cn } from '@/shared/utils/cn';

/** 基础操作属性 */
interface BaseAction {
  /** 所需权限（可选） */
  permission?: string | string[];
  /** Tooltip提示文本 */
  tooltip?: string;
}

/** 按钮操作 */
interface ButtonAction extends BaseAction {
  /** 操作类型 */
  type?: 'button';
  /** 按钮文字 */
  label: string;
  /** 点击回调 */
  onClick: () => void;
  /** 是否为危险操作 */
  danger?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 加载状态 */
  loading?: boolean;
  /** 图标 */
  icon?: React.ReactNode;
}

/** 开关操作 */
interface SwitchAction extends BaseAction {
  /** 操作类型 */
  type: 'switch';
  /** 开关状态 */
  checked: boolean;
  /** 状态变化回调 */
  onChange: (checked: boolean) => void;
  /** 加载状态 */
  loading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
}

/** 分隔线 */
interface DividerAction {
  /** 操作类型 */
  type: 'divider';
}

/** 操作类型联合 */
type Action = ButtonAction | SwitchAction | DividerAction;

interface TableActionsProps {
  /** 操作列表 */
  actions: Action[];
  /** 最多显示几个按钮（超过的折叠到下拉菜单） */
  maxVisible?: number;
}

export function TableActions({ actions, maxVisible = 3 }: TableActionsProps) {
  const { hasPermission } = usePermission();

  /**
   * 检查是否有权限访问某个操作
   */
  const checkPermission = (action: Action): boolean => {
    if (action.type === 'divider') return true;
    if (!action.permission) return true;
    const permissions = Array.isArray(action.permission)
      ? action.permission
      : [action.permission];
    return hasPermission(permissions);
  };

  /**
   * 渲染单个操作
   */
  const renderAction = (action: Action, index: number): React.ReactNode => {
    // 渲染分隔线
    if (action.type === 'divider') {
      return <Divider key={`divider-${index}`} type="vertical" className="my-0" />;
    }

    // 渲染开关
    if (action.type === 'switch') {
      const switchElement = (
        <Switch
          checked={action.checked}
          onChange={action.onChange}
          loading={action.loading}
          disabled={action.disabled}
          size="small"
        />
      );

      return action.tooltip ? (
        <Tooltip key={`switch-${index}`} title={action.tooltip}>
          {switchElement}
        </Tooltip>
      ) : (
        <span key={`switch-${index}`}>{switchElement}</span>
      );
    }

    // 渲染按钮（默认类型，企业级设计）
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
          'px-2 py-0.5 h-auto min-w-[60px]',
          'transition-all duration-200 ease-in-out',
          'hover:scale-105',
          action.danger
            ? 'text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200'
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
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

  // 将操作分为两类：固定显示的（switch、divider）和可折叠的（button）
  const fixedActions = visibleActions.filter(
    (action) => action.type === 'switch' || action.type === 'divider'
  );
  const collapsibleActions = visibleActions.filter(
    (action) => !action.type || action.type === 'button'
  ) as ButtonAction[];

  // 如果可折叠的按钮数量 <= maxVisible，全部显示
  if (collapsibleActions.length <= maxVisible) {
    return (
      <Space size="small">
        {fixedActions.map((action, index) => renderAction(action, index))}
        {collapsibleActions.map((action, index) => renderAction(action, index + fixedActions.length))}
      </Space>
    );
  }

  // 如果可折叠的按钮数量 > maxVisible，前面显示按钮，后面折叠到下拉菜单
  const buttonActions = collapsibleActions.slice(0, maxVisible - 1);
  const dropdownActions = collapsibleActions.slice(maxVisible - 1);

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
      {fixedActions.map((action, index) => renderAction(action, index))}
      {buttonActions.map((action, index) => renderAction(action, index + fixedActions.length))}

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
              'px-2 py-0.5 h-auto',
              'hover:bg-gray-100 hover:scale-105',
              'transition-all duration-200'
            )}
          />
        </Tooltip>
      </Dropdown>
    </Space>
  );
}
