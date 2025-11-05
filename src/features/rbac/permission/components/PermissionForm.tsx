/**
 * 权限表单组件（新建/编辑）
 */

import { useEffect } from 'react';
import { Form, Input, Select, Switch, Modal, InputNumber } from 'antd';
import type {
  Permission,
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionType,
} from '../types/permission.types';
import { PermissionType as PermissionTypeEnum } from '../types/permission.types';

const { TextArea } = Input;

interface PermissionFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  permission?: Permission;
  loading?: boolean;
  onSubmit: (data: CreatePermissionDto | UpdatePermissionDto) => void;
  onCancel: () => void;
}

/**
 * 权限类型选项
 */
const PERMISSION_TYPE_OPTIONS: Array<{ label: string; value: PermissionType }> = [
  { label: 'API接口权限', value: PermissionTypeEnum.API },
  { label: '功能权限', value: PermissionTypeEnum.FEATURE },
];

export function PermissionForm({
  open,
  mode,
  permission,
  loading,
  onSubmit,
  onCancel,
}: PermissionFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && permission) {
        form.setFieldsValue({
          code: permission.code,
          name: permission.name,
          type: permission.type,
          module: permission.module,
          description: permission.description,
          sort: permission.sort,
          isActive: permission.isActive,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          type: PermissionTypeEnum.API,
          isActive: true,
          sort: 0,
        });
      }
    }
  }, [open, mode, permission, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title={mode === 'create' ? '创建权限' : '编辑权限'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          label="权限代码"
          name="code"
          rules={[
            { required: true, message: '请输入权限代码' },
            {
              pattern: /^[a-z_:]+$/,
              message: '权限代码只能包含小写字母、下划线和冒号',
            },
            {
              min: 3,
              max: 100,
              message: '权限代码长度为3-100个字符',
            },
          ]}
          tooltip="格式: {module}:{resource}:{action}，如：user:create"
        >
          <Input
            placeholder="输入权限代码（如：user:create）"
            disabled={mode === 'edit' && permission?.isSystem}
          />
        </Form.Item>

        <Form.Item
          label="权限名称"
          name="name"
          rules={[
            { required: true, message: '请输入权限名称' },
            {
              min: 2,
              max: 100,
              message: '权限名称长度为2-100个字符',
            },
          ]}
        >
          <Input placeholder="输入权限名称（如：创建用户）" />
        </Form.Item>

        <Form.Item
          label="权限类型"
          name="type"
          rules={[{ required: true, message: '请选择权限类型' }]}
        >
          <Select
            placeholder="选择权限类型"
            options={PERMISSION_TYPE_OPTIONS}
            disabled={mode === 'edit' && permission?.isSystem}
          />
        </Form.Item>

        <Form.Item
          label="所属模块"
          name="module"
          rules={[
            { required: true, message: '请输入所属模块' },
            {
              pattern: /^[a-z_]+$/,
              message: '模块名只能包含小写字母和下划线',
            },
            {
              min: 2,
              max: 50,
              message: '模块名长度为2-50个字符',
            },
          ]}
          tooltip="模块代码，如：user, role, permission"
        >
          <Input
            placeholder="输入所属模块（如：user）"
            disabled={mode === 'edit' && permission?.isSystem}
          />
        </Form.Item>

        <Form.Item label="权限描述" name="description">
          <TextArea
            rows={4}
            placeholder="输入权限描述（可选）"
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="排序值"
          name="sort"
          rules={[{ required: true, message: '请输入排序值' }]}
          tooltip="数值越小，排序越靠前"
        >
          <InputNumber
            min={0}
            max={9999}
            placeholder="输入排序值"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item label="启用状态" name="isActive" valuePropName="checked">
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>

        {mode === 'edit' && permission?.isSystem && (
          <div className="text-gray-500 text-sm p-3 bg-gray-50 rounded">
            ⚠️ 系统内置权限的代码、类型和模块不可编辑
          </div>
        )}
      </Form>
    </Modal>
  );
}
