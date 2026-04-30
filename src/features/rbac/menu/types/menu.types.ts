/**
 * 菜单管理模块类型定义
 */

/**
 * 菜单类型枚举
 * 注意：与后端保持一致，使用小写
 */
export const MenuType = {
  DIRECTORY: 'directory', // 目录（有子菜单，不对应路由）
  MENU: 'menu', // 菜单（对应具体页面）
} as const;

export type MenuType = (typeof MenuType)[keyof typeof MenuType];

/**
 * 菜单实体
 */
export interface Menu {
  id: number;
  name: string;
  path?: string;
  type: MenuType;
  icon?: string; // Ant Design图标名称（如 'UserOutlined'）
  component?: string; // 组件名或约定别名（如 'UserListPage' 或 'system/users'）
  parentId?: number | null;
  sort: number;
  isActive: boolean;
  isVisible: boolean; // 是否在菜单中显示
  isExternal: boolean; // 是否外部链接
  isCache: boolean; // 是否缓存组件
  meta?: Record<string, unknown>; // 路由元数据
  remark?: string; // 备注
  createdAt: string;
  updatedAt: string;
}

/**
 * 菜单树节点（包含子菜单）
 */
export interface MenuTreeNode extends Menu {
  children?: MenuTreeNode[];
}

/**
 * 查询菜单DTO
 */
export interface QueryMenuDto {
  name?: string; // 按菜单名称搜索
  type?: MenuType; // 按类型筛选
  isActive?: boolean; // 按状态筛选
  isVisible?: boolean; // 按可见性筛选
}

/**
 * 创建菜单DTO
 */
export interface CreateMenuDto {
  name: string;
  path?: string;
  type: MenuType;
  icon?: string;
  component?: string;
  parentId?: number | null;
  sort?: number;
  isActive?: boolean;
  isVisible?: boolean;
  isExternal?: boolean;
  isCache?: boolean;
  meta?: Record<string, unknown>;
  remark?: string;
}

/**
 * 更新菜单DTO
 */
export interface UpdateMenuDto {
  name?: string;
  path?: string;
  type?: MenuType;
  icon?: string;
  component?: string;
  parentId?: number | null;
  sort?: number;
  isActive?: boolean;
  isVisible?: boolean;
  isExternal?: boolean;
  isCache?: boolean;
  meta?: Record<string, unknown>;
  remark?: string;
}

export interface MoveMenuDto {
  targetParentId: number | null;
  targetId?: number;
  position?: 'before' | 'after' | 'inside';
}
