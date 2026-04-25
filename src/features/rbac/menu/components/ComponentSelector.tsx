/**
 * 组件选择器
 *
 * 用途：菜单管理页面选择页面组件
 * 特点：自动扫描所有页面组件（无需手动注册）
 */

import { Select } from 'antd';
import { getComponentNames } from '@/app/componentRegistry';

interface ComponentSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

/**
 * 组件选择器组件
 *
 * @example
 * <ComponentSelector
 *   value="UserListPage"
 *   onChange={setComponent}
 * />
 */
export function ComponentSelector({ value, onChange, disabled }: ComponentSelectorProps) {
  // 获取所有已注册的组件名称
  const componentNames = getComponentNames();

  // 转换为 Select 选项格式
  const options = componentNames.map((name) => ({
    label: name,
    value: name,
  }));

  return (
    <Select
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={options}
      placeholder="选择页面组件（自动扫描所有页面组件）"
      showSearch
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      style={{ width: '100%' }}
    />
  );
}
