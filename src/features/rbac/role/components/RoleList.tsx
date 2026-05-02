/**
 * 角色列表组件（表格视图）
 */

import { Table, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { TableActions, StatusBadge } from '@/shared/components';
import type { Role } from '../types/role.types';
import dayjs from 'dayjs';

interface RoleListProps {
  data?: Role[];
  total?: number;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
  };
  onEdit?: (role: Role) => void;
  onDelete?: (id: number) => void;
  onAssignAccess?: (role: Role) => void;
  onPageChange?: (page: number, pageSize: number) => void;
}

export function RoleList({
  data = [],
  total = 0,
  loading,
  pagination = { current: 1, pageSize: 10 },
  onEdit,
  onDelete,
  onAssignAccess,
  onPageChange,
}: RoleListProps) {
  const isProtectedRole = (role: Role) => role.code === 'super_admin' || role.isSystem;

  const columns: ColumnsType<Role> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '角色代码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      ellipsis: true,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <StatusBadge status={isActive ? 'success' : 'default'} text={isActive ? '启用' : '禁用'} />
      ),
    },
    {
      title: '系统角色',
      dataIndex: 'isSystem',
      key: 'isSystem',
      width: 100,
      render: (isSystem: boolean, record) =>
        record.code === 'super_admin' ? (
          <Tag color="red">内置超管</Tag>
        ) : isSystem ? (
          <Tag color="orange">系统角色</Tag>
        ) : (
          <Tag>普通角色</Tag>
        ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
      sorter: (a, b) => a.sort - b.sort,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <TableActions
          actions={[
            {
              label: '编辑',
              icon: <EditOutlined />,
              onClick: () => onEdit?.(record),
              disabled: isProtectedRole(record),
              tooltip:
                record.code === 'super_admin' ? '超级管理员默认拥有所有权限和菜单' : undefined,
              permission: 'role:update',
            },
            {
              label: '授权',
              icon: <SafetyCertificateOutlined />,
              onClick: () => onAssignAccess?.(record),
              disabled: isProtectedRole(record),
              tooltip:
                record.code === 'super_admin' ? '超级管理员默认拥有所有权限和菜单' : undefined,
              permission: ['role:access:assign', 'role:permission:assign', 'role:menu:assign'],
            },
            {
              label: '删除',
              icon: <DeleteOutlined />,
              onClick: () => onDelete?.(record.id),
              danger: true,
              disabled: isProtectedRole(record),
              permission: 'role:delete',
            },
          ]}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        onChange: onPageChange,
      }}
      scroll={{ x: 1400 }}
    />
  );
}
