/**
 * API密钥列表组件
 */
import { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  Alert,
  Typography,
  Select,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '../hooks/useApiApps';
import { TableActions, StatusBadge, PermissionGuard } from '@/shared/components';
import { formatDate } from '@/shared/utils';
import type { ApiKey, CreateApiKeyDto, CreateApiKeyResponse } from '../types/api-auth.types';
import type { ColumnsType } from 'antd/es/table';

const { Text, Paragraph } = Typography;

/**
 * 表单数据
 */
interface FormData {
  name: string;
  environment: 'production' | 'test';
  scopes?: string;
  expiresAt?: string;
}

interface ApiKeyListProps {
  appId: number;
}

export function ApiKeyList({ appId }: ApiKeyListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKey, setNewKey] = useState<CreateApiKeyResponse | null>(null);

  // Hooks
  const { data: keys = [], isLoading } = useApiKeys(appId);
  const createMutation = useCreateApiKey();
  const revokeMutation = useRevokeApiKey();

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      environment: 'production',
      scopes: '',
      expiresAt: undefined,
    },
  });

  /**
   * 打开创建弹窗
   */
  const handleCreate = () => {
    reset();
    setIsCreateModalOpen(true);
  };

  /**
   * 提交创建密钥表单
   */
  const onSubmit = async (formData: FormData) => {
    const dto: CreateApiKeyDto = {
      name: formData.name,
      environment: formData.environment,
    };

    // 可选字段
    if (formData.scopes) {
      dto.scopes = formData.scopes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (formData.expiresAt) {
      dto.expiresAt = formData.expiresAt;
    }

    const result = await createMutation.mutateAsync({ appId, data: dto });
    setIsCreateModalOpen(false);
    setNewKey(result);
    reset();
  };

  /**
   * 撤销密钥
   */
  const handleRevoke = (keyId: number) => {
    revokeMutation.mutate(keyId);
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<ApiKey> = [
    {
      title: '密钥名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '密钥',
      dataIndex: 'displayKey',
      width: 250,
      render: (displayKey) => (
        <Space>
          <EyeInvisibleOutlined className="text-gray-400" />
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{displayKey}</code>
        </Space>
      ),
    },
    {
      title: '权限范围',
      dataIndex: 'scopes',
      width: 200,
      render: (scopes: string[]) => (
        <Space wrap>
          {scopes.slice(0, 2).map((scope) => (
            <Tag key={scope} color="blue">
              {scope}
            </Tag>
          ))}
          {scopes.length > 2 && <Tag>+{scopes.length - 2}</Tag>}
        </Space>
      ),
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      width: 100,
      render: (count) => <Text>{count.toLocaleString()}</Text>,
    },
    {
      title: '最后使用',
      dataIndex: 'lastUsedAt',
      width: 180,
      render: (lastUsedAt) => (lastUsedAt ? formatDate.relative(lastUsedAt) : '-'),
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      width: 180,
      render: (expiresAt) => {
        if (!expiresAt) return <Text type="secondary">永不过期</Text>;

        const isExpired = dayjs(expiresAt).isBefore(dayjs());
        return (
          <Text type={isExpired ? 'danger' : 'secondary'}>
            {isExpired ? '已过期' : formatDate.full(expiresAt)}
          </Text>
        );
      },
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
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <TableActions
          actions={[
            {
              label: '撤销',
              icon: <DeleteOutlined />,
              onClick: () => handleRevoke(record.id),
              danger: true,
              permission: 'api-app:key:delete',
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Text strong>API密钥列表</Text>
        <PermissionGuard permissions={['api-app:key:create']}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            生成密钥
          </Button>
        </PermissionGuard>
      </div>

      <Table
        dataSource={keys}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        scroll={{ x: 1200 }}
      />

      {/* 创建密钥Modal */}
      <Modal
        title="生成API密钥"
        open={isCreateModalOpen}
        onOk={handleSubmit(onSubmit)}
        onCancel={() => {
          setIsCreateModalOpen(false);
          reset();
        }}
        confirmLoading={createMutation.isPending}
        width={600}
      >
        <Alert
          message="密钥安全提示"
          description="生成的密钥仅显示一次，请立即复制并安全保存。密钥泄露可能导致数据被非法访问。"
          type="warning"
          showIcon
          className="mb-4"
        />

        <Form layout="vertical">
          <Form.Item
            label="密钥名称"
            required
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              rules={{
                required: '请输入密钥名称',
                minLength: { value: 2, message: '密钥名称至少2个字符' },
                maxLength: { value: 50, message: '密钥名称最多50个字符' },
              }}
              render={({ field }) => <Input {...field} placeholder="如：生产环境密钥" />}
            />
          </Form.Item>

          <Form.Item label="环境" required>
            <Controller
              name="environment"
              control={control}
              rules={{ required: '请选择环境' }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={[
                    { label: '生产', value: 'production' },
                    { label: '测试', value: 'test' },
                  ]}
                />
              )}
            />
          </Form.Item>

          <Form.Item label="权限范围" help="留空则继承应用权限，多个权限用逗号分隔">
            <Controller
              name="scopes"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="finance:read, finance:create（可选）" />
              )}
            />
          </Form.Item>

          <Form.Item label="过期时间" help="留空则永不过期">
            <Controller
              name="expiresAt"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.toISOString())}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              )}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 显示新生成的密钥Modal */}
      <Modal
        title="密钥生成成功"
        open={!!newKey}
        onOk={() => setNewKey(null)}
        onCancel={() => setNewKey(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setNewKey(null)}>
            我已复制并保存
          </Button>,
        ]}
        width={700}
        closable={false}
        maskClosable={false}
      >
        <Alert
          message="请立即复制并安全保存密钥"
          description="密钥仅此一次显示，关闭后将无法再次查看完整密钥。请将密钥保存在安全的地方。"
          type="error"
          showIcon
          className="mb-4"
        />

        <div className="bg-gray-50 p-4 rounded">
          <Text strong>密钥名称：</Text>
          <Paragraph copyable={{ text: newKey?.name || '' }}>{newKey?.name}</Paragraph>

          <Text strong>完整密钥：</Text>
          <Paragraph
            copyable={{
              text: newKey?.key || '',
              tooltips: ['复制密钥', '已复制'],
              icon: [<CopyOutlined key="copy" />, <CopyOutlined key="copied" />],
            }}
            code
            className="bg-yellow-50 border border-yellow-200"
          >
            {newKey?.key}
          </Paragraph>

          <Text type="secondary" className="text-xs">
            过期时间：{newKey?.expiresAt ? formatDate.full(newKey.expiresAt) : '永不过期'}
          </Text>
        </div>
      </Modal>
    </div>
  );
}
