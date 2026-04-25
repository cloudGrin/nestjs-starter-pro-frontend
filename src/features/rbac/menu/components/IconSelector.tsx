/**
 * 图标选择器组件（简化版）
 * 输入Ant Design图标名称，右侧预览
 */

import { useState, useEffect } from 'react';
import { Input } from 'antd';
import { QuestionOutlined } from '@ant-design/icons';
import { getMenuIcon } from '@/shared/components/icons/menuIcons';

interface IconSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function IconSelector({
  value,
  onChange,
  placeholder = '输入图标名称，如 UserOutlined',
}: IconSelectorProps) {
  const [iconName, setIconName] = useState(value || '');

  useEffect(() => {
    setIconName(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setIconName(name);
    onChange?.(name);
  };

  // 动态获取图标组件
  const IconComponent = getMenuIcon(iconName);

  return (
    <Input
      value={iconName}
      onChange={handleChange}
      placeholder={placeholder}
      addonAfter={
        IconComponent ? (
          <IconComponent style={{ fontSize: 16 }} />
        ) : (
          <QuestionOutlined style={{ fontSize: 16, color: '#ccc' }} />
        )
      }
    />
  );
}
