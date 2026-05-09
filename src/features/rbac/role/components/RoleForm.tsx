/**
 * 角色表单组件（新建/编辑）
 */

import { useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Modal } from 'antd';
import type { Role, CreateRoleDto, UpdateRoleDto } from '../types/role.types';

const { TextArea } = Input;

interface RoleFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  role?: Role;
  loading?: boolean;
  onSubmit: (data: CreateRoleDto | UpdateRoleDto) => void;
  onCancel: () => void;
}

export function RoleForm({ open, mode, role, loading, onSubmit, onCancel }: RoleFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && role) {
        form.setFieldsValue({
          code: role.code,
          name: role.name,
          description: role.description,
          sort: role.sort,
          isActive: role.isActive,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          sort: 0,
          isActive: true, // 默认启用
        });
      }
    }
  }, [open, mode, role, form]);

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
      title={mode === 'create' ? '创建角色' : '编辑角色'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          label="角色代码"
          name="code"
          rules={[
            { required: true, message: '请输入角色代码' },
            {
              pattern: /^[a-z_]+$/,
              message: '角色代码只能包含小写字母和下划线',
            },
            {
              min: 2,
              max: 50,
              message: '角色代码长度为2-50个字符',
            },
          ]}
        >
          <Input
            placeholder="输入角色代码（如：admin）"
            disabled={mode === 'edit' && role?.isSystem} // 系统角色不可编辑代码
          />
        </Form.Item>

        <Form.Item
          label="角色名称"
          name="name"
          rules={[
            { required: true, message: '请输入角色名称' },
            {
              min: 2,
              max: 50,
              message: '角色名称长度为2-50个字符',
            },
          ]}
        >
          <Input placeholder="输入角色名称（如：管理员）" />
        </Form.Item>

        <Form.Item label="角色描述" name="description">
          <TextArea rows={4} placeholder="输入角色描述（可选）" maxLength={200} showCount />
        </Form.Item>

        <Form.Item label="排序" name="sort">
          <InputNumber min={0} max={9999} placeholder="数字越小越靠前" className="w-full!" />
        </Form.Item>

        <Form.Item label="启用状态" name="isActive" valuePropName="checked">
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>

        {mode === 'edit' && role?.isSystem && (
          <div className="text-gray-500 text-sm p-3 bg-gray-50 rounded">
            ⚠️ 系统角色的代码不可编辑
          </div>
        )}
      </Form>
    </Modal>
  );
}
