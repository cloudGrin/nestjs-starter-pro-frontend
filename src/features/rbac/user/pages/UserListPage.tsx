/**
 * 用户管理页面（主页面）
 *
 * 职责：
 * - 状态管理（查询参数、Modal状态）
 * - 组件协调（SearchForm、Table、Modal）
 *
 * 业务逻辑已拆分到：
 * - UserSearchForm.tsx (搜索表单)
 * - UserTable.tsx (用户列表表格)
 */

import { useState } from 'react';
import { Card, Button, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd/es/table';
import { PageWrap, EmptyState } from '@/shared/components';
import { PermissionGuard } from '@/shared/components/auth';
import type { User } from '@/shared/types/user.types';
import type { QueryUserDto } from '../types/user.types';
import { useUsers, useDeleteUser } from '../hooks/useUsers';
import { UserSearchForm } from '../components/UserSearchForm';
import { UserTable } from '../components/UserTable';
import { UserForm } from '../components/UserForm';
import { AssignRoleModal } from '../components/AssignRoleModal';

export function UserListPage() {
  // 查询参数
  const [queryParams, setQueryParams] = useState<QueryUserDto>({
    page: 1,
    limit: 10,
  });

  // 获取用户列表
  const { data, isLoading, refetch } = useUsers(queryParams);

  // 删除用户
  const deleteUser = useDeleteUser();

  // UserForm状态管理
  const [userFormVisible, setUserFormVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // AssignRoleModal状态管理
  const [assignRoleModalVisible, setAssignRoleModalVisible] = useState(false);
  const [assignRoleUser, setAssignRoleUser] = useState<User | null>(null);

  // 处理搜索
  const handleSearch = (values: Partial<QueryUserDto>) => {
    setQueryParams({
      ...queryParams,
      ...values,
      page: 1,
    });
  };

  // 处理重置
  const handleReset = () => {
    setQueryParams({
      page: 1,
      limit: 10,
    });
  };

  // 处理分页变化
  const handleTableChange = (pagination: TablePaginationConfig) => {
    setQueryParams({
      ...queryParams,
      page: pagination.current || 1,
      limit: pagination.pageSize || 10,
    });
  };

  // 处理创建
  const handleCreate = () => {
    setCurrentUser(null);
    setUserFormVisible(true);
  };

  // 处理编辑
  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setUserFormVisible(true);
  };

  // 处理分配角色
  const handleAssignRoles = (user: User) => {
    setAssignRoleUser(user);
    setAssignRoleModalVisible(true);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    await deleteUser.mutateAsync(id);
  };

  return (
    <PageWrap
      title="用户管理"
      titleRight={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            刷新
          </Button>
          <PermissionGuard permissions={['user:create']}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              创建用户
            </Button>
          </PermissionGuard>
        </Space>
      }
      header={<UserSearchForm onSearch={handleSearch} onReset={handleReset} />}
    >
      <Card>
        {/* 空状态 */}
        {!isLoading && (!data?.items || data.items.length === 0) ? (
          <EmptyState
            title="暂无用户"
            description="还没有任何用户，快去创建一个吧"
            action={
              <PermissionGuard permissions={['user:create']}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                  创建用户
                </Button>
              </PermissionGuard>
            }
          />
        ) : (
          /* 表格 */
          <UserTable
            data={data}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAssignRoles={handleAssignRoles}
            onPaginationChange={handleTableChange}
          />
        )}
      </Card>

      {/* 创建/编辑用户表单 */}
      <UserForm
        visible={userFormVisible}
        user={currentUser}
        onCancel={() => {
          setUserFormVisible(false);
          setCurrentUser(null);
        }}
        onSuccess={() => {
          setUserFormVisible(false);
          setCurrentUser(null);
          // ⚠️ 不需要手动 refetch，useUpdateUser 的 invalidateQueries 会自动刷新
        }}
      />

      {/* 分配角色弹窗 */}
      <AssignRoleModal
        visible={assignRoleModalVisible}
        user={assignRoleUser}
        onCancel={() => {
          setAssignRoleModalVisible(false);
          setAssignRoleUser(null);
        }}
        onSuccess={() => {
          setAssignRoleModalVisible(false);
          setAssignRoleUser(null);
          // ⚠️ 不需要手动 refetch，useAssignRoles 的 invalidateQueries 会自动刷新
        }}
      />
    </PageWrap>
  );
}
