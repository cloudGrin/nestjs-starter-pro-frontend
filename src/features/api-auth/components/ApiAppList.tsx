/**
 * API应用列表组件
 */
import { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import {
  useApiApps,
  useApiScopes,
  useCreateApiApp,
  useUpdateApiApp,
  useDeleteApiApp,
} from '../hooks/useApiApps';
import { PageWrap, TableActions, StatusBadge, PermissionGuard } from '@/shared/components';
import { formatDate } from '@/shared/utils';
import { ApiIntegrationGuide } from './ApiIntegrationGuide';
import { ApiScopeSelector } from './ApiScopeSelector';
import { getApiScopeDescription, getApiScopeLabel } from '../utils/apiScopes';
import type { ApiApp, CreateApiAppDto, UpdateApiAppDto } from '../types/api-auth.types';
import type { ColumnsType } from 'antd/es/table';

/**
 * 表单数据
 */
interface FormData {
  name: string;
  description?: string;
  scopes: string[];
}

interface ApiAppListProps {
  onViewKeys?: (app: ApiApp) => void;
}

export function ApiAppList({ onViewKeys }: ApiAppListProps = {}) {
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<ApiApp | null>(null);

  // Hooks
  const { data, isLoading } = useApiApps(pagination);
  const { data: apiScopeGroups = [] } = useApiScopes();
  const createMutation = useCreateApiApp();
  const updateMutation = useUpdateApiApp();
  const deleteMutation = useDeleteApiApp();

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      scopes: [],
    },
  });

  /**
   * 打开创建弹窗
   */
  const handleCreate = () => {
    setEditingApp(null);
    reset({
      name: '',
      description: '',
      scopes: [],
    });
    setIsModalOpen(true);
  };

  /**
   * 打开编辑弹窗
   */
  const handleEdit = (app: ApiApp) => {
    setEditingApp(app);
    reset({
      name: app.name,
      description: app.description,
      scopes: app.scopes || [],
    });
    setIsModalOpen(true);
  };

  /**
   * 提交表单
   */
  const onSubmit = async (formData: FormData) => {
    const scopes = formData.scopes || [];

    if (editingApp) {
      // 更新
      const dto: UpdateApiAppDto = {
        name: formData.name,
        description: formData.description,
        scopes,
      };
      await updateMutation.mutateAsync({ appId: editingApp.id, data: dto });
    } else {
      // 创建
      const dto: CreateApiAppDto = {
        name: formData.name,
        description: formData.description,
        scopes,
      };
      await createMutation.mutateAsync(dto);
    }

    setIsModalOpen(false);
    reset();
  };

  /**
   * 删除应用
   */
  const handleDelete = (appId: number) => {
    deleteMutation.mutate(appId);
  };

  /**
   * 查看密钥（跳转到密钥页面）
   */
  const handleViewKeys = (app: ApiApp) => {
    onViewKeys?.(app);
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<ApiApp> = [
    {
      title: '应用ID',
      dataIndex: 'id',
      width: 100,
      render: (id: number) => <code className="text-xs">{id}</code>,
    },
    {
      title: '应用名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '权限范围',
      dataIndex: 'scopes',
      width: 200,
      render: (scopes: string[]) => (
        <Space wrap>
          {(scopes || []).slice(0, 2).map((scope) => (
            <Tooltip key={scope} title={getApiScopeDescription(scope, apiScopeGroups)}>
              <Tag color="blue">{getApiScopeLabel(scope, apiScopeGroups)}</Tag>
            </Tooltip>
          ))}
          {(scopes || []).length > 2 && <Tag>+{(scopes || []).length - 2}</Tag>}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <StatusBadge status={isActive ? 'success' : 'error'} text={isActive ? '启用' : '禁用'} />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: formatDate.full,
    },
    {
      title: '操作',
      key: 'actions',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <TableActions
          actions={[
            {
              label: '密钥',
              icon: <KeyOutlined />,
              onClick: () => handleViewKeys(record),
              permission: 'api-app:key:read',
            },
            {
              label: '编辑',
              icon: <EditOutlined />,
              onClick: () => handleEdit(record),
              permission: 'api-app:update',
            },
            {
              label: '停用',
              icon: <DeleteOutlined />,
              onClick: () => handleDelete(record.id),
              danger: true,
              permission: 'api-app:delete',
            },
          ]}
        />
      ),
    },
  ];

  return (
    <PageWrap
      title="API应用管理"
      titleRight={
        <PermissionGuard permissions={['api-app:create']}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建应用
          </Button>
        </PermissionGuard>
      }
    >
      <Card>
        <Table
          dataSource={data?.items || []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination({ page, limit: pageSize });
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <ApiIntegrationGuide />

      {/* 创建/编辑应用Modal */}
      <Modal
        title={editingApp ? '编辑应用' : '创建应用'}
        open={isModalOpen}
        onOk={handleSubmit(onSubmit)}
        onCancel={() => {
          setIsModalOpen(false);
          reset();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item
            label="应用名称"
            required
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              rules={{
                required: '请输入应用名称',
                minLength: { value: 2, message: '应用名称至少2个字符' },
                maxLength: { value: 50, message: '应用名称最多50个字符' },
              }}
              render={({ field }) => (
                <Input {...field} placeholder="请输入应用名称，如：家庭财务小程序" />
              )}
            />
          </Form.Item>

          <Form.Item label="描述">
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  placeholder="请输入应用描述（可选）"
                  rows={3}
                  maxLength={200}
                  showCount
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="权限范围"
            validateStatus={errors.scopes ? 'error' : ''}
            help={errors.scopes?.message || '可选；未选择时应用没有开放 API 访问权限'}
          >
            <Controller
              name="scopes"
              control={control}
              render={({ field }) => (
                <ApiScopeSelector value={field.value} onChange={field.onChange} />
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageWrap>
  );
}
