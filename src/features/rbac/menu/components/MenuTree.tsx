/**
 * 菜单树组件（支持拖拽）
 */

import { useState, useMemo } from 'react';
import { Tree, Input, Button, Tag, Space, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { PermissionGuard } from '@/shared/components/auth/PermissionGuard';
import { EmptyState } from '@/shared/components';
import { getMenuIcon } from '@/shared/components/icons/menuIcons';
import { MenuTypeTag } from './MenuTypeTag';
import type { MenuTreeNode, Menu } from '../types/menu.types';
import './MenuTree.css';

const { Search } = Input;

interface MenuTreeProps {
  treeData?: MenuTreeNode[];
  loading?: boolean;
  onAdd?: (parentId?: number) => void;
  onEdit?: (menu: Menu) => void;
  onDelete?: (id: number) => void;
  onDrop?: (dragId: number, targetParentId: number | null) => void;
}

export function MenuTree({
  treeData = [],
  loading,
  onAdd,
  onEdit,
  onDelete,
  onDrop,
}: MenuTreeProps) {
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const { message } = App.useApp();

  /**
   * 将MenuTreeNode转换为Ant Design Tree的DataNode
   */
  const convertToDataNode = (nodes: MenuTreeNode[]): DataNode[] => {
    return nodes.map((node) => ({
      title: renderMenuNode(node),
      key: node.id,
      children: node.children ? convertToDataNode(node.children) : [],
    }));
  };

  /**
   * 渲染菜单节点
   */
  const renderMenuNode = (node: Menu) => {
    // 动态获取图标组件
    const IconComponent = getMenuIcon(node.icon);

    return (
      <div className="menu-tree-node group flex items-center justify-between w-full pr-4 py-1">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {/* 第一行：图标 + 名称 + 标签 */}
          <div className="flex items-center gap-2">
            {IconComponent && (
              <IconComponent className="text-base text-blue-500 dark:text-blue-400 flex-shrink-0" />
            )}
            <span className="font-bold text-black dark:text-white truncate">{node.name}</span>
            <MenuTypeTag type={node.type} />
            <Tag color={node.isActive ? 'success' : 'default'} className="!m-0">
              {node.isActive ? '启用' : '禁用'}
            </Tag>
            {!node.isVisible && (
              <Tag color="warning" className="!m-0">
                隐藏
              </Tag>
            )}
          </div>

          {/* 第二行：路径信息 */}
          {node.path && (
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 ml-6">
              <span className="font-mono">{node.path}</span>
              {node.component && (
                <span className="text-gray-300 dark:text-gray-600">→ {node.component}</span>
              )}
            </div>
          )}
        </div>

        {/* 操作按钮（hover时显示） */}
        <div className="menu-tree-actions flex items-center ml-4">
          <Space size="small">
            <PermissionGuard permissions={['menu:create']}>
              <Button
                size="small"
                type="text"
                icon={<PlusOutlined />}
                className="hover:text-blue-500 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd?.(node.id);
                }}
                title="添加子菜单"
              />
            </PermissionGuard>

            <PermissionGuard permissions={['menu:update']}>
              <Button
                size="small"
                type="text"
                icon={<EditOutlined />}
                className="hover:text-green-500 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-950/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(node);
                }}
                title="编辑"
              />
            </PermissionGuard>

            <PermissionGuard permissions={['menu:delete']}>
              <Button
                size="small"
                type="text"
                danger
                icon={<DeleteOutlined />}
                className="hover:bg-red-50 dark:hover:bg-red-950/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(node.id);
                }}
                title="删除"
              />
            </PermissionGuard>
          </Space>
        </div>
      </div>
    );
  };

  /**
   * 过滤树数据（根据搜索关键字）
   */
  const filteredTreeData = useMemo(() => {
    if (!searchValue) return treeData;

    const keyword = searchValue.toLowerCase();

    const filterNode = (node: MenuTreeNode): MenuTreeNode | null => {
      const matches =
        node.name.toLowerCase().includes(keyword) || node.path?.toLowerCase().includes(keyword);

      const filteredChildren = node.children
        ?.map((child) => filterNode(child))
        .filter((child): child is MenuTreeNode => child !== null);

      if (matches || (filteredChildren && filteredChildren.length > 0)) {
        return {
          ...node,
          children: filteredChildren,
        };
      }

      return null;
    };

    return treeData
      .map((node) => filterNode(node))
      .filter((node): node is MenuTreeNode => node !== null);
  }, [treeData, searchValue]);

  /**
   * 查找节点的父ID
   * @returns 找到节点时返回其父ID（可能是null），未找到时返回undefined
   */
  const findParentId = (
    nodes: MenuTreeNode[],
    targetId: number,
    parentId: number | null = null
  ): number | null | undefined => {
    for (const node of nodes) {
      // 找到目标节点，返回其父ID（可能是null表示顶级节点）
      if (node.id === targetId) {
        return parentId;
      }

      // 递归查找子节点
      if (node.children) {
        const found = findParentId(node.children, targetId, node.id);
        // 只有在找到（!== undefined）时才返回，null是有效值（表示顶级节点）
        if (found !== undefined) {
          return found;
        }
      }
    }

    // 未找到目标节点，返回undefined
    return undefined;
  };

  /**
   * 检查节点是否是后代节点（防止循环引用）
   */
  const isDescendant = (dragId: number, targetId: number): boolean => {
    const findNode = (nodes: MenuTreeNode[], id: number): MenuTreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findNode(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const dragNode = findNode(treeData, dragId);
    if (!dragNode || !dragNode.children) return false;

    const checkChildren = (children: MenuTreeNode[]): boolean => {
      for (const child of children) {
        if (child.id === targetId) return true;
        if (child.children && checkChildren(child.children)) return true;
      }
      return false;
    };

    return checkChildren(dragNode.children);
  };

  /**
   * 拖拽处理
   */
  const handleDrop = (info: Parameters<NonNullable<TreeProps['onDrop']>>[0]) => {
    const dragNodeId = info.dragNode.key as number;
    const dropNodeId = info.node.key as number;

    // 判断是拖到目标节点内部还是前后
    const targetParentId = info.dropToGap
      ? findParentId(treeData, dropNodeId) // 拖到节点前后（同级）
      : dropNodeId; // 拖到节点内部（成为子节点）

    // 如果findParentId返回undefined（未找到节点），不应该继续
    if (info.dropToGap && targetParentId === undefined) {
      message.error('拖拽失败：无法确定目标位置');
      return;
    }

    // 防止循环引用
    if (targetParentId && isDescendant(dragNodeId, targetParentId)) {
      message.error('不能将父节点移动到子节点下');
      return;
    }

    // 调用API
    onDrop?.(dragNodeId, targetParentId ?? null);
  };

  /**
   * 搜索处理
   */
  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value) {
      const keyword = value.toLowerCase();
      const filterNode = (node: MenuTreeNode): MenuTreeNode | null => {
        const matches =
          node.name.toLowerCase().includes(keyword) || node.path?.toLowerCase().includes(keyword);

        const filteredChildren = node.children
          ?.map((child) => filterNode(child))
          .filter((child): child is MenuTreeNode => child !== null);

        if (matches || (filteredChildren && filteredChildren.length > 0)) {
          return {
            ...node,
            children: filteredChildren,
          };
        }

        return null;
      };
      const nextTreeData = treeData
        .map((node) => filterNode(node))
        .filter((node): node is MenuTreeNode => node !== null);

      // 展开所有匹配的节点
      const getAllKeys = (nodes: MenuTreeNode[]): React.Key[] => {
        let keys: React.Key[] = [];
        nodes.forEach((node) => {
          keys.push(node.id);
          if (node.children) {
            keys = keys.concat(getAllKeys(node.children));
          }
        });
        return keys;
      };
      setExpandedKeys(getAllKeys(nextTreeData));
    } else {
      setExpandedKeys([]);
    }
  };

  const dataNodes = useMemo(() => {
    return convertToDataNode(filteredTreeData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTreeData]);

  return (
    <div className="menu-tree">
      <Space direction="vertical" className="w-full" size="large">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 shadow-sm transition-theme dark:border-blue-500/20">
          <PermissionGuard permissions={['menu:create']}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => onAdd?.()}
              size="middle"
              className="shadow-sm"
            >
              创建顶级菜单
            </Button>
          </PermissionGuard>

          <Search
            placeholder="搜索菜单（支持名称、路径）"
            prefix={<SearchOutlined />}
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 360 }}
            size="middle"
            className="shadow-sm"
            enterButton
          />
        </div>

        {/* 菜单树 */}
        {!loading && filteredTreeData.length === 0 ? (
          <EmptyState
            title="暂无菜单"
            description="还没有任何菜单，快去创建一个吧"
            action={
              <PermissionGuard permissions={['menu:create']}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => onAdd?.()}>
                  创建顶级菜单
                </Button>
              </PermissionGuard>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-theme dark:border-slate-700 dark:bg-slate-800">
            <Tree
              draggable
              blockNode
              showLine
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys)}
              treeData={dataNodes}
              onDrop={handleDrop}
              className="menu-tree-custom p-4"
            />
          </div>
        )}
      </Space>
    </div>
  );
}
