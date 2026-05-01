/**
 * 角色管理页面
 */

import { useState } from 'react';
import { Card, Button, Space, Form, Input } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { RoleList } from '../components/RoleList';
import { RoleForm } from '../components/RoleForm';
import { RoleAccessModal } from '../components/RoleAccessModal';
import { PageWrap, SearchForm, PermissionGuard, EmptyState } from '@/shared/components';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '../hooks/useRoles';
import type { Role, QueryRoleDto, CreateRoleDto, UpdateRoleDto } from '../types/role.types';

export function RoleListPage() {
  // 查询参数
  const [queryParams, setQueryParams] = useState<QueryRoleDto>({
    page: 1,
    limit: 10,
  });

  // 表单Modal状态
  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    role?: Role;
  }>({
    open: false,
    mode: 'create',
  });

  // 授权Modal状态
  const [accessModal, setAccessModal] = useState<{
    open: boolean;
    role?: Role;
  }>({
    open: false,
  });

  // 获取角色列表
  const { data: listData, isLoading: listLoading, refetch } = useRoles(queryParams);

  // CRUD Mutations
  const { mutate: createRole, isPending: creating } = useCreateRole();
  const { mutate: updateRole, isPending: updating } = useUpdateRole();
  const { mutate: deleteRole } = useDeleteRole();

  /**
   * 打开创建表单
   */
  const handleCreate = () => {
    setFormModal({
      open: true,
      mode: 'create',
    });
  };

  /**
   * 打开编辑表单
   */
  const handleEdit = (role: Role) => {
    setFormModal({
      open: true,
      mode: 'edit',
      role,
    });
  };

  /**
   * 表单提交
   */
  const handleFormSubmit = (data: CreateRoleDto | UpdateRoleDto) => {
    if (formModal.mode === 'create') {
      createRole(data as CreateRoleDto, {
        onSuccess: () => {
          setFormModal({ open: false, mode: 'create' });
        },
      });
    } else if (formModal.mode === 'edit' && formModal.role) {
      updateRole(
        { id: formModal.role.id, data: data as UpdateRoleDto },
        {
          onSuccess: () => {
            setFormModal({ open: false, mode: 'create' });
          },
        }
      );
    }
  };

  /**
   * 删除角色
   */
  const handleDelete = (id: number) => {
    deleteRole(id);
  };

  /**
   * 打开角色授权弹窗
   */
  const handleAssignAccess = (role: Role) => {
    setAccessModal({
      open: true,
      role,
    });
  };

  /**
   * 分页变化
   */
  const handlePageChange = (page: number, pageSize: number) => {
    setQueryParams({
      ...queryParams,
      page,
      limit: pageSize,
    });
  };

  /**
   * 搜索
   */
  const handleSearch = (values: Partial<QueryRoleDto>) => {
    setQueryParams({
      ...queryParams,
      ...values,
      page: 1,
    });
  };

  /**
   * 重置
   */
  const handleReset = () => {
    setQueryParams({
      page: 1,
      limit: 10,
    });
  };

  return (
    <PageWrap
      title="角色管理"
      titleRight={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            刷新
          </Button>
          <PermissionGuard permissions={['role:create']}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              创建角色
            </Button>
          </PermissionGuard>
        </Space>
      }
      header={
        <SearchForm onSearch={handleSearch} onReset={handleReset}>
          <Form.Item name="name" label="角色名称">
            <Input placeholder="请输入角色名称" allowClear />
          </Form.Item>
          <Form.Item name="code" label="角色代码">
            <Input placeholder="请输入角色代码" allowClear />
          </Form.Item>
        </SearchForm>
      }
    >
      <Card>
        {/* 空状态 */}
        {!listLoading && (!listData?.items || listData.items.length === 0) ? (
          <EmptyState
            title="暂无角色"
            description="还没有任何角色，快去创建一个吧"
            action={
              <PermissionGuard permissions={['role:create']}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                  创建角色
                </Button>
              </PermissionGuard>
            }
          />
        ) : (
          /* 角色列表 */
          <RoleList
            data={listData?.items}
            total={listData?.total}
            loading={listLoading}
            pagination={{
              current: queryParams.page || 1,
              pageSize: queryParams.limit || 10,
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAssignAccess={handleAssignAccess}
            onPageChange={handlePageChange}
          />
        )}
      </Card>

      {/* 角色表单Modal */}
      <RoleForm
        open={formModal.open}
        mode={formModal.mode}
        role={formModal.role}
        loading={creating || updating}
        onSubmit={handleFormSubmit}
        onCancel={() => setFormModal({ open: false, mode: 'create' })}
      />

      {/* 角色授权Modal */}
      <RoleAccessModal
        open={accessModal.open}
        role={accessModal.role}
        onSuccess={() => setAccessModal({ open: false })}
        onCancel={() => setAccessModal({ open: false })}
      />
    </PageWrap>
  );
}
