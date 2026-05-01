/**
 * 角色统一授权弹窗
 * 菜单控制页面可见范围，权限控制页面内操作和后端接口访问。
 */

import { useEffect, useMemo, useState } from 'react';
import { Empty, Input, Modal, Space, Spin, Tag, Tree } from 'antd';
import { SearchOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { getMenuIcon } from '@/shared/components/icons/menuIcons';
import { usePermission } from '@/shared/hooks';
import { useMenuTree } from '../../menu/hooks/useMenus';
import { usePermissionTree } from '../../permission/hooks/usePermissions';
import type { Menu, MenuTreeNode } from '../../menu/types/menu.types';
import type { Permission, PermissionTreeNode } from '../../permission/types/permission.types';
import { useRoleAccess, useSaveRoleAccess } from '../hooks/useRoles';
import type { Role } from '../types/role.types';

const { Search } = Input;

interface RoleAccessModalProps {
  open: boolean;
  role?: Role;
  onSuccess?: () => void;
  onCancel: () => void;
}

function getMenuKeys(nodes: MenuTreeNode[]): React.Key[] {
  return nodes.flatMap((node) => [node.id, ...(node.children ? getMenuKeys(node.children) : [])]);
}

function getPermissionModuleKeys(nodes: PermissionTreeNode[]): React.Key[] {
  return nodes.map((node) => node.module);
}

export function RoleAccessModal({ open, role, onSuccess, onCancel }: RoleAccessModalProps) {
  const [menuSearch, setMenuSearch] = useState('');
  const [permissionSearch, setPermissionSearch] = useState('');
  const [menuCheckedKeys, setMenuCheckedKeys] = useState<React.Key[]>([]);
  const [permissionCheckedKeys, setPermissionCheckedKeys] = useState<React.Key[]>([]);
  const [menuExpandedKeys, setMenuExpandedKeys] = useState<React.Key[]>([]);
  const [permissionExpandedKeys, setPermissionExpandedKeys] = useState<React.Key[]>([]);

  const { hasPermission } = usePermission();
  const canAssignMenus = hasPermission(['role:access:assign', 'role:menu:assign']);
  const canAssignPermissions = hasPermission(['role:access:assign', 'role:permission:assign']);

  const { data: menuTree, isLoading: menuTreeLoading } = useMenuTree({
    enabled: canAssignMenus,
  });
  const { data: permissionTree, isLoading: permissionTreeLoading } = usePermissionTree({
    enabled: canAssignPermissions,
  });
  const { data: roleAccess, isLoading: accessLoading } = useRoleAccess(role?.id || 0);
  const { mutate: saveRoleAccess, isPending } = useSaveRoleAccess();

  const filteredMenuTree = useMemo(() => {
    if (!menuTree || !menuSearch) {
      return menuTree || [];
    }

    const keyword = menuSearch.toLowerCase();
    const filterNode = (node: MenuTreeNode): MenuTreeNode | null => {
      const matches =
        node.name.toLowerCase().includes(keyword) || node.path?.toLowerCase().includes(keyword);
      const children = node.children
        ?.map((child) => filterNode(child))
        .filter((child): child is MenuTreeNode => child !== null);

      return matches || (children && children.length > 0) ? { ...node, children } : null;
    };

    return menuTree
      .map((node) => filterNode(node))
      .filter((node): node is MenuTreeNode => node !== null);
  }, [menuTree, menuSearch]);

  const filteredPermissionTree = useMemo(() => {
    if (!permissionTree || !permissionSearch) {
      return permissionTree || [];
    }

    const keyword = permissionSearch.toLowerCase();
    return permissionTree
      .map((node) => ({
        ...node,
        permissions: (node.permissions || []).filter(
          (permission) =>
            permission.name.toLowerCase().includes(keyword) ||
            permission.code.toLowerCase().includes(keyword) ||
            node.name.toLowerCase().includes(keyword) ||
            node.module.toLowerCase().includes(keyword)
        ),
      }))
      .filter((node) => node.permissions.length > 0);
  }, [permissionTree, permissionSearch]);

  const renderMenuTitle = (menu: Menu) => {
    const IconComponent = getMenuIcon(menu.icon);

    return (
      <div className="flex items-center gap-2 py-0.5">
        {IconComponent && <IconComponent className="text-slate-500" />}
        <span>{menu.name}</span>
        <Tag color={menu.type === 'directory' ? 'blue' : 'green'}>
          {menu.type === 'directory' ? '目录' : '菜单'}
        </Tag>
        {menu.path && <span className="text-xs text-gray-400">{menu.path}</span>}
      </div>
    );
  };

  const renderPermissionTitle = (permission: Permission) => (
    <div className="py-1 pr-3">
      <div className="mb-1 flex items-center gap-2">
        <SafetyCertificateOutlined className="text-blue-500" />
        <span className="font-medium text-gray-800">{permission.name}</span>
        <Tag color={permission.isActive ? 'success' : 'default'}>
          {permission.isActive ? '启用' : '禁用'}
        </Tag>
      </div>
      <div className="ml-6 flex items-center gap-2 text-xs">
        <code className="rounded bg-gray-100 px-2 py-0.5 text-blue-600">{permission.code}</code>
        {permission.description && <span className="text-gray-500">{permission.description}</span>}
      </div>
    </div>
  );

  const menuTreeData = useMemo<DataNode[]>(() => {
    const convert = (nodes: MenuTreeNode[]): DataNode[] =>
      nodes.map((node) => ({
        title: renderMenuTitle(node),
        key: node.id,
        children: node.children ? convert(node.children) : [],
      }));

    return convert(filteredMenuTree);
  }, [filteredMenuTree]);

  const permissionTreeData = useMemo<DataNode[]>(() => {
    return filteredPermissionTree.map((node) => ({
      title: (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{node.name}</span>
          <span className="text-xs text-gray-400">({node.module})</span>
          <Tag>{node.permissions.length} 个权限</Tag>
        </div>
      ),
      key: node.module,
      selectable: false,
      checkable: false,
      children: node.permissions.map((permission) => ({
        title: renderPermissionTitle(permission),
        key: permission.id,
      })),
    }));
  }, [filteredPermissionTree]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setMenuSearch('');
    setPermissionSearch('');
  }, [open, role?.id]);

  useEffect(() => {
    if (open && menuTree) {
      setMenuExpandedKeys(getMenuKeys(menuTree));
    }
  }, [open, menuTree]);

  useEffect(() => {
    if (open && permissionTree) {
      setPermissionExpandedKeys(getPermissionModuleKeys(permissionTree));
    }
  }, [open, permissionTree]);

  useEffect(() => {
    if (!open || !roleAccess) {
      return;
    }

    setMenuCheckedKeys(roleAccess.menuIds);
    setPermissionCheckedKeys(roleAccess.permissionIds);
  }, [open, roleAccess]);

  const handleMenuSearch = (value: string) => {
    setMenuSearch(value);
    setMenuExpandedKeys(value ? getMenuKeys(filteredMenuTree) : []);
  };

  const handlePermissionSearch = (value: string) => {
    setPermissionSearch(value);
    setPermissionExpandedKeys(value ? getPermissionModuleKeys(filteredPermissionTree) : []);
  };

  const handleSubmit = () => {
    if (!role) {
      return;
    }

    saveRoleAccess(
      {
        id: role.id,
        data: {
          menuIds: menuCheckedKeys.filter((key) => typeof key === 'number') as number[],
          permissionIds: permissionCheckedKeys.filter((key) => typeof key === 'number') as number[],
        },
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onCancel();
        },
      }
    );
  };

  const loading =
    accessLoading ||
    (canAssignMenus && menuTreeLoading) ||
    (canAssignPermissions && permissionTreeLoading);
  const panelCount = Number(canAssignMenus) + Number(canAssignPermissions);

  return (
    <Modal
      title={`角色授权 - ${role?.name || ''}`}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={isPending}
      width={1120}
      styles={{ body: { maxHeight: '68vh', overflowY: 'auto' } }}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 p-10">
          <Spin />
          <span className="text-gray-500">加载中...</span>
        </div>
      ) : (
        <div className={panelCount > 1 ? 'grid gap-4 lg:grid-cols-2' : 'grid gap-4'}>
          {canAssignMenus && (
            <Space direction="vertical" className="min-w-0" size="middle">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold">菜单访问</div>
                <div className="text-gray-600">
                  已选 <Tag color="blue">{menuCheckedKeys.length}</Tag> 个菜单
                </div>
              </div>
              <Search
                placeholder="搜索菜单（支持菜单名、路径）"
                prefix={<SearchOutlined />}
                allowClear
                onSearch={handleMenuSearch}
                onChange={(event) => handleMenuSearch(event.target.value)}
              />
              <div className="min-h-[360px] rounded border bg-white p-3">
                {menuTreeData.length === 0 ? (
                  <Empty description="没有找到匹配的菜单" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Tree
                    checkable
                    checkedKeys={menuCheckedKeys}
                    expandedKeys={menuExpandedKeys}
                    onExpand={(keys) => setMenuExpandedKeys(keys)}
                    onCheck={(checked) =>
                      setMenuCheckedKeys(Array.isArray(checked) ? checked : checked.checked)
                    }
                    treeData={menuTreeData}
                  />
                )}
              </div>
            </Space>
          )}

          {canAssignPermissions && (
            <Space direction="vertical" className="min-w-0" size="middle">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold">操作权限</div>
                <div className="text-gray-600">
                  已选 <Tag color="blue">{permissionCheckedKeys.length}</Tag> 个权限
                </div>
              </div>
              <Search
                placeholder="搜索权限（支持模块名、权限名、权限代码）"
                prefix={<SearchOutlined />}
                allowClear
                onSearch={handlePermissionSearch}
                onChange={(event) => handlePermissionSearch(event.target.value)}
              />
              <div className="min-h-[360px] rounded border bg-white p-3">
                {permissionTreeData.length === 0 ? (
                  <Empty description="没有找到匹配的权限" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Tree
                    checkable
                    checkedKeys={permissionCheckedKeys}
                    expandedKeys={permissionExpandedKeys}
                    onExpand={(keys) => setPermissionExpandedKeys(keys)}
                    onCheck={(checked) =>
                      setPermissionCheckedKeys(Array.isArray(checked) ? checked : checked.checked)
                    }
                    treeData={permissionTreeData}
                  />
                )}
              </div>
            </Space>
          )}
        </div>
      )}
    </Modal>
  );
}
