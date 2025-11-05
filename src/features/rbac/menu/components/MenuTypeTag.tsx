/**
 * 菜单类型标签组件
 */

import { Tag } from 'antd';
import { FolderOutlined, FileOutlined } from '@ant-design/icons';
import { MenuType } from '../types/menu.types';

interface MenuTypeTagProps {
  type: MenuType;
}

const TYPE_CONFIG = {
  [MenuType.DIRECTORY]: {
    color: 'blue',
    icon: <FolderOutlined />,
    text: '目录',
  },
  [MenuType.MENU]: {
    color: 'green',
    icon: <FileOutlined />,
    text: '菜单',
  },
};

export function MenuTypeTag({ type }: MenuTypeTagProps) {
  const config = TYPE_CONFIG[type];

  return (
    <Tag color={config.color} icon={config.icon}>
      {config.text}
    </Tag>
  );
}
