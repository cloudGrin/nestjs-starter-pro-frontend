/**
 * 分配权限弹窗组件
 * 使用Tree组件选择权限
 */

import { useEffect, useState, useMemo } from 'react';
import { Modal, Tree, Input, Space, Tag, Spin, Empty } from 'antd';
import { SearchOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { usePermissionTree } from '../../permission/hooks/usePermissions';
import { useAssignPermissions, useRole } from '../hooks/useRoles';
import type { Role } from '../types/role.types';
import type { PermissionTreeNode, Permission } from '../../permission/types/permission.types';

const { Search } = Input;

interface RolePermissionModalProps {
  open: boolean;
  role?: Role;
  onSuccess?: () => void;
  onCancel: () => void;
}

export function RolePermissionModal({
  open,
  role,
  onSuccess,
  onCancel,
}: RolePermissionModalProps) {
  const [searchValue, setSearchValue] = useState('');
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // 获取权限树
  const { data: permissionTree, isLoading: treeLoading } = usePermissionTree();

  // 获取角色已有权限
  const { data: roleDetail, isLoading: permissionsLoading } = useRole(role?.id || 0);

  // 分配权限Mutation
  const { mutate: assignPermissions, isPending } = useAssignPermissions();

  /**
   * 将PermissionTreeNode转换为Ant Design Tree的DataNode
   */
  const convertToDataNode = (nodes: PermissionTreeNode[]): DataNode[] => {
    return nodes.map((node) => ({
      title: renderModuleTitle(node),
      key: node.module,
      selectable: false,
      checkable: false, // 模块节点不可选中
      children: (node.permissions || []).map((permission: Permission) => ({
        title: renderPermissionTitle(permission),
        key: permission.id,
        // 不使用icon属性，图标已整合到title中
      })),
    }));
  };

  /**
   * 渲染模块标题
   */
  const renderModuleTitle = (node: PermissionTreeNode) => (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-base">{node.name}</span>
      <span className="text-gray-400 text-sm">({node.module})</span>
      <Tag color="default">{node.permissions?.length || 0} 个权限</Tag>
    </div>
  );

  /**
   * 渲染权限标题（优化布局：分两行显示）
   */
  const renderPermissionTitle = (permission: Permission) => (
    <div className="py-1 pr-4">
      {/* 第一行：图标 + 权限名称 + 标签 */}
      <div className="flex items-center gap-2 mb-1">
        <SafetyCertificateOutlined className="text-blue-500" />
        <span className="font-medium text-gray-800">{permission.name}</span>
        <Tag color={permission.isActive ? 'success' : 'default'}>
          {permission.isActive ? '启用' : '禁用'}
        </Tag>
        {permission.isSystem && <Tag color="orange">系统内置</Tag>}
      </div>
      {/* 第二行：权限代码 + 描述 */}
      <div className="flex items-center gap-2 text-xs ml-6">
        <code className="bg-gray-100 px-2 py-0.5 rounded text-blue-600">
          {permission.code}
        </code>
        {permission.description && (
          <span className="text-gray-500">{permission.description}</span>
        )}
      </div>
    </div>
  );

  /**
   * 过滤树数据
   */
  const filteredTreeData = useMemo(() => {
    if (!permissionTree || !searchValue) {
      return permissionTree;
    }

    const keyword = searchValue.toLowerCase();
    return permissionTree
      .map((node) => ({
        ...node,
        permissions: (node.permissions || []).filter(
          (p) =>
            p.name.toLowerCase().includes(keyword) ||
            p.code.toLowerCase().includes(keyword) ||
            node.name.toLowerCase().includes(keyword)
        ),
      }))
      .filter((node) => node.permissions.length > 0);
  }, [permissionTree, searchValue]);

  /**
   * 转换为Tree DataNode
   */
  const treeData = useMemo(() => {
    if (!filteredTreeData) return [];
    return convertToDataNode(filteredTreeData);
    // convertToDataNode uses render helpers bound to the current component render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTreeData]);

  /**
   * 初始化已选中的权限
   * 后端角色详情直接返回权限实体数组
   */
  useEffect(() => {
    if (open && roleDetail) {
      setCheckedKeys(roleDetail.permissions?.map((permission) => permission.id) || []);
    }
  }, [open, roleDetail]);

  /**
   * 搜索时自动展开所有节点
   */
  const handleSearch = (value: string) => {
    setSearchValue(value);
    const keyword = value.toLowerCase();
    const nextTreeData = value
      ? permissionTree
          ?.map((node) => ({
            ...node,
            permissions: (node.permissions || []).filter(
              (p) =>
                p.name.toLowerCase().includes(keyword) ||
                p.code.toLowerCase().includes(keyword) ||
                node.name.toLowerCase().includes(keyword)
            ),
          }))
          .filter((node) => node.permissions.length > 0)
      : undefined;

    if (value && nextTreeData) {
      setExpandedKeys(nextTreeData.map((node) => node.module));
    } else {
      setExpandedKeys([]);
    }
  };

  /**
   * 提交分配
   */
  const handleSubmit = () => {
    if (!role) return;

    // 只提交权限ID（不包含模块节点的key）
    const permissionIds = checkedKeys.filter((key) => typeof key === 'number') as number[];

    assignPermissions(
      {
        id: role.id,
        permissionIds,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onCancel();
        },
      }
    );
  };

  /**
   * Tree复选框变化
   */
  const handleCheck = (checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
    const keys = Array.isArray(checked) ? checked : checked.checked;
    setCheckedKeys(keys);
  };

  return (
    <Modal
      title={`分配权限 - ${role?.name}`}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={isPending}
      width={800}
      styles={{ body: { maxHeight: '60vh', overflowY: 'auto' } }}
    >
      <Space direction="vertical" className="w-full" size="large">
        {/* 搜索框 */}
        <Search
          placeholder="搜索权限（支持模块名、权限名、权限代码）"
          prefix={<SearchOutlined />}
          allowClear
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          enterButton
        />

        {/* 已选中权限数量 */}
        <div className="text-gray-600">
          已选中 <Tag color="blue">{checkedKeys.length}</Tag> 个权限
        </div>

        {/* 权限树 */}
        {treeLoading || permissionsLoading ? (
          <div className="flex flex-col justify-center items-center p-8 gap-4">
            <Spin />
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : treeData.length === 0 ? (
          <Empty description="没有找到匹配的权限" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Tree
            checkable
            showIcon
            checkedKeys={checkedKeys}
            expandedKeys={expandedKeys}
            onExpand={(keys) => setExpandedKeys(keys)}
            onCheck={handleCheck}
            treeData={treeData}
            className="bg-white p-4 rounded border"
          />
        )}
      </Space>
    </Modal>
  );
}
