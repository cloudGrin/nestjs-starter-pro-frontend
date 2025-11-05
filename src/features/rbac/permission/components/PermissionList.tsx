/**
 * 权限列表组件（表格视图）
 */

import { Table, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { TableActions, StatusBadge } from '@/shared/components';
import type { Permission, PermissionType } from '../types/permission.types';
import dayjs from 'dayjs';

interface PermissionListProps {
  data?: Permission[];
  total?: number;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
  };
  onEdit?: (permission: Permission) => void;
  onDelete?: (id: string) => void; // 修正：ID类型为string
  onPageChange?: (page: number, pageSize: number) => void;
}

/**
 * 权限类型标签颜色
 */
const TYPE_COLORS: Record<PermissionType, string> = {
  api: 'blue', // 修正：小写
  feature: 'green', // 修正：小写
};

export function PermissionList({
  data = [],
  total = 0,
  loading,
  pagination = { current: 1, pageSize: 10 },
  onEdit,
  onDelete,
  onPageChange,
}: PermissionListProps) {
  const columns: ColumnsType<Permission> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '权限代码',
      dataIndex: 'code',
      key: 'code',
      width: 200,
      ellipsis: true,
    },
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: PermissionType) => (
        <Tag color={TYPE_COLORS[type]}>{type}</Tag>
      ),
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <StatusBadge
          status={isActive ? 'success' : 'default'}
          text={isActive ? '启用' : '禁用'}
        />
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
              permission: 'permission:update',
            },
            {
              label: '删除',
              icon: <DeleteOutlined />,
              onClick: () => onDelete?.(record.id),
              danger: true,
              permission: 'permission:delete',
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
      scroll={{ x: 1200 }}
    />
  );
}
