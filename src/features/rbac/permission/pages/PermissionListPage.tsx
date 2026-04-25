/**
 * 权限管理页面
 * 支持列表视图和树形视图切换
 */

import { useState } from 'react';
import { Card, Tabs, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageWrap, PermissionGuard } from '@/shared/components';
import { PermissionList } from '../components/PermissionList';
import { PermissionTree } from '../components/PermissionTree';
import { PermissionForm } from '../components/PermissionForm';
import {
  usePermissions,
  usePermissionTree,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from '../hooks/usePermissions';
import type {
  QueryPermissionDto,
  Permission,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../types/permission.types';

export function PermissionListPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'tree'>('list');
  const [queryParams, setQueryParams] = useState<QueryPermissionDto>({
    page: 1,
    limit: 10, // 后端使用limit参数
  });

  // 表单Modal状态
  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    permission?: Permission;
  }>({
    open: false,
    mode: 'create',
  });

  // 获取权限列表
  const { data: listData, isLoading: listLoading } = usePermissions(queryParams);

  // 获取权限树
  const { data: treeData, isLoading: treeLoading } = usePermissionTree();

  // CRUD Mutations
  const { mutate: createPermission, isPending: creating } = useCreatePermission();
  const { mutate: updatePermission, isPending: updating } = useUpdatePermission();
  const { mutate: deletePermission } = useDeletePermission();

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
  const handleEdit = (permission: Permission) => {
    setFormModal({
      open: true,
      mode: 'edit',
      permission,
    });
  };

  /**
   * 表单提交
   */
  const handleFormSubmit = (data: CreatePermissionDto | UpdatePermissionDto) => {
    if (formModal.mode === 'create') {
      createPermission(data as CreatePermissionDto, {
        onSuccess: () => {
          setFormModal({ open: false, mode: 'create' });
        },
      });
    } else if (formModal.mode === 'edit' && formModal.permission) {
      updatePermission(
        { id: formModal.permission.id, data: data as UpdatePermissionDto },
        {
          onSuccess: () => {
            setFormModal({ open: false, mode: 'create' });
          },
        }
      );
    }
  };

  /**
   * 分页变化处理
   */
  const handlePageChange = (page: number, pageSize: number) => {
    setQueryParams({
      ...queryParams,
      page,
      limit: pageSize, // 后端使用limit参数
    });
  };

  /**
   * 删除权限处理
   */
  const handleDelete = (id: number) => {
    deletePermission(id);
  };

  return (
    <PageWrap
      title="权限管理"
      titleRight={
        <Space>
          <PermissionGuard permissions={['permission:create']}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              创建权限
            </Button>
          </PermissionGuard>
        </Space>
      }
    >
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'list' | 'tree')}
          items={[
            {
              key: 'list',
              label: '列表视图',
              children: (
                <PermissionList
                  data={listData?.items || []}
                  total={listData?.total || 0}
                  loading={listLoading}
                  pagination={{
                    current: queryParams.page || 1,
                    pageSize: queryParams.limit || 10, // 显示时使用pageSize，但内部使用limit
                  }}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPageChange={handlePageChange}
                />
              ),
            },
            {
              key: 'tree',
              label: '树形视图',
              children: (
                <PermissionTree
                  treeData={treeData || []}
                  loading={treeLoading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* 权限表单Modal */}
      <PermissionForm
        open={formModal.open}
        mode={formModal.mode}
        permission={formModal.permission}
        loading={creating || updating}
        onSubmit={handleFormSubmit}
        onCancel={() => setFormModal({ open: false, mode: 'create' })}
      />
    </PageWrap>
  );
}
