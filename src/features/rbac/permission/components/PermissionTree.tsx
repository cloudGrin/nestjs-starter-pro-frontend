/**
 * 权限树组件
 * 按模块分组展示权限（支持编辑/删除操作）
 */

import { useState, useMemo } from 'react';
import { Tree, Input, Tag, Space, Empty, Spin, Button } from 'antd';
import {
  SafetyCertificateOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import type { PermissionTreeNode, Permission, PermissionType } from '../types/permission.types';
import { PermissionGuard } from '@/shared/components';

const { Search } = Input;

interface PermissionTreeProps {
  treeData?: PermissionTreeNode[];
  loading?: boolean;
  onEdit?: (permission: Permission) => void;
  onDelete?: (id: number) => void;
}

/**
 * 权限类型配置
 */
const TYPE_CONFIG: Record<PermissionType, { color: string; label: string }> = {
  api: { color: 'blue', label: 'API接口' },
  feature: { color: 'green', label: '功能权限' },
};

export function PermissionTree({ treeData, loading, onEdit, onDelete }: PermissionTreeProps) {
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  /**
   * 将PermissionTreeNode转换为Ant Design Tree的DataNode
   */
  const convertToDataNode = (nodes: PermissionTreeNode[]): DataNode[] => {
    return nodes.map((node) => ({
      title: renderModuleTitle(node),
      key: node.module,
      selectable: false,
      children: (node.permissions || []).map((permission: Permission) => ({
        title: renderPermissionTitle(permission),
        key: permission.id,
        selectable: false,
        // 不使用icon属性，图标已整合到title中
      })),
    }));
  };

  /**
   * 渲染模块标题
   */
  const renderModuleTitle = (node: PermissionTreeNode) => (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-base text-gray-900 dark:text-gray-100">{node.name}</span>
      <span className="text-gray-400 dark:text-gray-500 text-sm">({node.module})</span>
      <Tag color="default">{node.permissions?.length || 0} 个权限</Tag>
    </div>
  );

  /**
   * 渲染权限标题（优化布局：分两行显示 + 操作按钮）
   */
  const renderPermissionTitle = (permission: Permission) => (
    <div className="py-1 pr-4">
      {/* 第一行：图标 + 权限名称 + 标签 + 操作按钮 */}
      <div className="flex items-center gap-2 mb-1">
        <SafetyCertificateOutlined className="text-blue-500 dark:text-blue-400" />
        <span className="font-medium text-gray-800 dark:text-gray-200">{permission.name}</span>
        <Tag color={TYPE_CONFIG[permission.type].color}>
          {TYPE_CONFIG[permission.type].label}
        </Tag>
        <Tag color={permission.isActive ? 'success' : 'default'}>
          {permission.isActive ? '启用' : '禁用'}
        </Tag>
        {permission.isSystem && <Tag color="orange">系统内置</Tag>}

        {/* 操作按钮（显示在右侧） */}
        {(onEdit || onDelete) && (
          <Space size="small" className="ml-auto">
            {onEdit && (
              <PermissionGuard permissions={['permission:update']}>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(permission);
                  }}
                  className="p-0 h-auto"
                />
              </PermissionGuard>
            )}
            {onDelete && (
              <PermissionGuard permissions={['permission:delete']}>
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(permission.id);
                  }}
                  disabled={permission.isSystem}
                  className="p-0 h-auto"
                  title={permission.isSystem ? '系统内置权限不可删除' : '删除权限'}
                />
              </PermissionGuard>
            )}
          </Space>
        )}
      </div>
      {/* 第二行：权限代码 + 描述 */}
      <div className="flex items-center gap-2 text-xs ml-6">
        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400">
          {permission.code}
        </code>
        {permission.description && (
          <span className="text-gray-500 dark:text-gray-400">{permission.description}</span>
        )}
      </div>
    </div>
  );

  /**
   * 过滤树数据（根据搜索关键字）
   */
  const filteredTreeData = useMemo(() => {
    if (!treeData || !searchValue) {
      return treeData;
    }

    const keyword = searchValue.toLowerCase();
    return treeData
      .map((node) => ({
        ...node,
        permissions: node.permissions.filter(
          (p) =>
            p.name.toLowerCase().includes(keyword) ||
            p.code.toLowerCase().includes(keyword) ||
            node.name.toLowerCase().includes(keyword) ||
            node.module.toLowerCase().includes(keyword)
        ),
      }))
      .filter((node) => node.permissions.length > 0);
  }, [treeData, searchValue]);

  /**
   * 搜索时自动展开所有节点
   */
  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value && filteredTreeData) {
      // 展开所有模块节点
      setExpandedKeys(filteredTreeData.map((node) => node.module));
    } else {
      setExpandedKeys([]);
    }
  };

  /**
   * 转换为Tree DataNode
   */
  const dataNodes = useMemo(() => {
    if (!filteredTreeData) return [];
    return convertToDataNode(filteredTreeData);
  }, [filteredTreeData]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-8 gap-4">
        <Spin />
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!treeData || treeData.length === 0) {
    return (
      <Empty
        description="暂无权限数据"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="permission-tree">
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

        {/* 权限树 */}
        {dataNodes.length === 0 ? (
          <Empty description="没有找到匹配的权限" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Tree
            showIcon
            defaultExpandAll={false}
            expandedKeys={expandedKeys}
            onExpand={(keys) => setExpandedKeys(keys)}
            treeData={dataNodes}
            className="permission-tree-component bg-white dark:bg-gray-800 p-4 rounded"
          />
        )}
      </Space>
    </div>
  );
}
