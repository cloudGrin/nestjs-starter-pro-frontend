/**
 * 图标选择器组件
 */

import { Select } from 'antd';
import { menuIconMap } from '@/shared/components/icons/menuIcons';

interface IconSelectorProps {
  value?: string | null;
  onChange?: (value?: string) => void;
  placeholder?: string;
}

export function IconSelector({
  value,
  onChange,
  placeholder = '搜索或选择图标',
}: IconSelectorProps) {
  const options = Object.entries(menuIconMap).map(([name, IconComponent]) => ({
    value: name,
    label: (
      <span className="flex items-center gap-2">
        <IconComponent />
        <span>{name}</span>
      </span>
    ),
  }));

  return (
    <Select
      value={value}
      onChange={(nextValue) => onChange?.(nextValue)}
      placeholder={placeholder}
      allowClear
      showSearch
      optionFilterProp="value"
      options={options}
      style={{ width: '100%' }}
    />
  );
}
