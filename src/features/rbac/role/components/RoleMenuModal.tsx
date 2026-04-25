/**
 * 分配菜单弹窗组件
 * 使用Tree组件选择菜单（支持父子联动）
 */

import { useEffect, useState, useMemo } from 'react';
import { Modal, Tree, Input, Space, Tag, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { getMenuIcon } from '@/shared/components/icons/menuIcons';
import { useMenuTree } from '../../menu/hooks/useMenus';
import { useRoleMenus, useAssignMenus } from '../hooks/useRoles';
import type { Role } from '../types/role.types';
import type { MenuTreeNode, Menu } from '../../menu/types/menu.types';

const { Search } = Input;

interface RoleMenuModalProps {
  open: boolean;
  role?: Role;
  onSuccess?: () => void;
  onCancel: () => void;
}

export function RoleMenuModal({
  open,
  role,
  onSuccess,
  onCancel,
}: RoleMenuModalProps) {
  const [searchValue, setSearchValue] = useState('');
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // 获取菜单树
  const { data: menuTree, isLoading: treeLoading } = useMenuTree();

  // 获取角色已有菜单
  const { data: roleMenus, isLoading: menusLoading } = useRoleMenus(role?.id || 0);

  // 分配菜单Mutation
  const { mutate: assignMenus, isPending } = useAssignMenus();

  /**
   * 将MenuTreeNode转换为Ant Design Tree的DataNode
   */
  const convertToDataNode = (nodes: MenuTreeNode[]): DataNode[] => {
    return nodes.map((node) => ({
      title: renderMenuTitle(node),
      key: node.id,
      children: node.children ? convertToDataNode(node.children) : [],
    }));
  };

  /**
   * 渲染菜单标题
   */
  const renderMenuTitle = (menu: Menu) => {
    const IconComponent = getMenuIcon(menu.icon);

    return (
      <div className="flex items-center gap-2">
        {IconComponent && <IconComponent />}
        <span>{menu.name}</span>
        <Tag color={menu.type === 'directory' ? 'blue' : 'green'}>
          {menu.type === 'directory' ? '目录' : '菜单'}
        </Tag>
        {menu.path && <span className="text-gray-400 text-sm">{menu.path}</span>}
      </div>
    );
  };

  /**
   * 过滤树数据
   */
  const filteredTreeData = useMemo(() => {
    if (!menuTree || !searchValue) {
      return menuTree;
    }

    const keyword = searchValue.toLowerCase();

    const filterNode = (node: MenuTreeNode): MenuTreeNode | null => {
      const matches =
        node.name.toLowerCase().includes(keyword) ||
        node.path?.toLowerCase().includes(keyword);

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

    return menuTree
      .map((node) => filterNode(node))
      .filter((node): node is MenuTreeNode => node !== null);
  }, [menuTree, searchValue]);

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
   * 初始化已选中的菜单
   */
  useEffect(() => {
    if (open && roleMenus) {
      const menuIds = roleMenus.map((menu) => menu.id);
      setCheckedKeys(menuIds);
    }
  }, [open, roleMenus]);

  /**
   * 搜索时自动展开所有节点
   */
  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value && filteredTreeData) {
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
      setExpandedKeys(getAllKeys(filteredTreeData));
    } else {
      setExpandedKeys([]);
    }
  };

  /**
   * 提交分配
   */
  const handleSubmit = () => {
    if (!role) return;

    // 获取选中的菜单ID（包括半选状态）
    const menuIds = checkedKeys.filter((key) => typeof key === 'number') as number[];

    assignMenus(
      {
        id: role.id,
        data: { menuIds },
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
   * Tree复选框变化（父子联动）
   */
  const handleCheck = (
    checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }
  ) => {
    // checked 是 { checked: number[], halfChecked: number[] } 格式
    if (typeof checked === 'object' && 'checked' in checked) {
      setCheckedKeys(checked.checked as number[]);
    } else {
      setCheckedKeys(checked);
    }
  };

  return (
    <Modal
      title={`分配菜单 - ${role?.name}`}
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
          placeholder="搜索菜单（支持菜单名、路径）"
          prefix={<SearchOutlined />}
          allowClear
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          enterButton
        />

        {/* 已选中菜单数量 */}
        <div className="text-gray-600">
          已选中 <Tag color="blue">{checkedKeys.length}</Tag> 个菜单
        </div>

        {/* 菜单树 */}
        {treeLoading || menusLoading ? (
          <div className="flex flex-col justify-center items-center p-8 gap-4">
            <Spin />
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : treeData.length === 0 ? (
          <Empty description="没有找到匹配的菜单" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Tree
            checkable
            checkStrictly={false} // 启用父子联动
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
