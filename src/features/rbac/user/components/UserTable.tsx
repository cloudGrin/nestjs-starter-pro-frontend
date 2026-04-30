/**
 * 用户列表表格组件
 */

import { Table, Tag, Space } from 'antd';
import { EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { TableActions, StatusBadge } from '@/shared/components';
import { formatDate } from '@/shared/utils';
import type { User, UserStatus, Role } from '@/shared/types/user.types';

interface UserTableProps {
  data?: {
    items: User[];
    page: number;
    pageSize: number;
    total: number;
  };
  loading?: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onAssignRoles: (user: User) => void;
  onPaginationChange: (pagination: TablePaginationConfig) => void;
}

/**
 * 状态映射（用于StatusBadge）
 */
const getStatusProps = (
  status: UserStatus
): { status: 'success' | 'error' | 'warning' | 'default'; text: string } => {
  const statusMap: Record<
    UserStatus,
    { status: 'success' | 'error' | 'warning' | 'default'; text: string }
  > = {
    active: { status: 'success', text: '正常' },
    inactive: { status: 'default', text: '未激活' },
    disabled: { status: 'error', text: '禁用' },
    locked: { status: 'warning', text: '锁定' },
  };
  return statusMap[status] || { status: 'default', text: '未知' };
};

export function UserTable({
  data,
  loading,
  onEdit,
  onDelete,
  onAssignRoles,
  onPaginationChange,
}: UserTableProps) {
  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 150,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 200,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: '角色',
      dataIndex: 'roles',
      width: 200,
      render: (roles: Role[]) =>
        roles && roles.length > 0 ? (
          <Space size={[0, 4]} wrap>
            {roles.map((role: Role) => (
              <Tag key={role.id} color="blue">
                {role.name}
              </Tag>
            ))}
          </Space>
        ) : (
          <Tag>无角色</Tag>
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: UserStatus) => {
        const { status: badgeStatus, text } = getStatusProps(status);
        return <StatusBadge status={badgeStatus} text={text} />;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: formatDate.full,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <TableActions
          actions={[
            {
              label: '编辑',
              icon: <EditOutlined />,
              onClick: () => onEdit(record),
              permission: 'user:update',
            },
            {
              label: '分配角色',
              icon: <TeamOutlined />,
              onClick: () => onAssignRoles(record),
              permission: 'role:assign',
            },
            {
              label: '删除',
              icon: <DeleteOutlined />,
              onClick: () => onDelete(record.id),
              danger: true,
              permission: 'user:delete',
            },
          ]}
        />
      ),
    },
  ];

  return (
    <Table<User>
      columns={columns}
      dataSource={data?.items || []}
      rowKey="id"
      loading={loading}
      pagination={{
        current: data?.page || 1,
        pageSize: data?.pageSize || 10,
        total: data?.total || 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
      }}
      onChange={onPaginationChange}
      scroll={{ x: 1350 }}
    />
  );
}
