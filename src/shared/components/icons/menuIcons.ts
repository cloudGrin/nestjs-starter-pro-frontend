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

export function getMenuIcon(iconName?: string | null): MenuIconComponent | null {
  if (!iconName) {
    return null;
  }

  return menuIconMap[iconName as keyof typeof menuIconMap] ?? null;
}
