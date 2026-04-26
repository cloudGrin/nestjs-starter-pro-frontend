import type { ComponentType, CSSProperties } from 'react';
import {
  ApiOutlined,
  AppstoreOutlined,
  BellOutlined,
  CloudUploadOutlined,
  ControlOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FileZipOutlined,
  FolderOutlined,
  HomeOutlined,
  KeyOutlined,
  LockOutlined,
  MenuOutlined,
  NotificationOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

export type MenuIconComponent = ComponentType<{
  className?: string;
  style?: CSSProperties;
}>;

export const menuIconMap = {
  ApiOutlined,
  AppstoreOutlined,
  BellOutlined,
  CloudUploadOutlined,
  ControlOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FileZipOutlined,
  FolderOutlined,
  HomeOutlined,
  KeyOutlined,
  LockOutlined,
  MenuOutlined,
  NotificationOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
  VideoCameraOutlined,
} satisfies Record<string, MenuIconComponent>;

const menuIconAliases: Record<string, keyof typeof menuIconMap> = {
  api: 'ApiOutlined',
  dashboard: 'DashboardOutlined',
  file: 'FileOutlined',
  folder: 'FolderOutlined',
  home: 'HomeOutlined',
  key: 'KeyOutlined',
  lock: 'LockOutlined',
  menu: 'MenuOutlined',
  notification: 'NotificationOutlined',
  read: 'ReadOutlined',
  safety: 'SafetyCertificateOutlined',
  setting: 'SettingOutlined',
  team: 'TeamOutlined',
  tool: 'ToolOutlined',
  user: 'UserOutlined',
};

export function getMenuIcon(iconName?: string | null): MenuIconComponent | null {
  if (!iconName) {
    return null;
  }

  const directMatch = menuIconMap[iconName as keyof typeof menuIconMap];
  if (directMatch) {
    return directMatch;
  }

  const alias = menuIconAliases[iconName.toLowerCase()];
  return alias ? menuIconMap[alias] : null;
}
