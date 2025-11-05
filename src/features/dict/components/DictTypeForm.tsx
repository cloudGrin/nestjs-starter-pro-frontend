/**
 * 字典类型表单组件（创建/编辑字典类型）
 */

import { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import type { DictType, DictSource } from '../types/dict.types';
import type { CreateDictTypeDto, UpdateDictTypeDto } from '../types/dict.types';
import { useCreateDictType, useUpdateDictType } from '../hooks/useDicts';

interface DictTypeFormProps {
  visible: boolean;
  dictType?: DictType | null; // null表示创建模式，DictType表示编辑模式
  onCancel: () => void;
  onSuccess: () => void;
}

interface DictTypeFormData {
  code: string;
  name: string;
  description?: string;
  source: DictSource;
  isEnabled: boolean;
  sort: number;
}

/**
 * 字典类型表单组件
 * 支持创建和编辑模式
 */
export function DictTypeForm({ visible, dictType, onCancel, onSuccess }: DictTypeFormProps) {
  const isEditMode = !!dictType;

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DictTypeFormData>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      source: 'custom' as DictSource,
      isEnabled: true,
      sort: 0,
    },
  });

  // 创建/更新Mutation
  const createDictType = useCreateDictType();
  const updateDictType = useUpdateDictType();

  // 编辑模式：填充表单数据
  useEffect(() => {
    if (dictType) {
      reset({
        code: dictType.code,
        name: dictType.name,
        description: dictType.description || '',
        source: dictType.source,
        isEnabled: dictType.isEnabled,
        sort: dictType.sort,
      });
    } else {
      reset({
        code: '',
        name: '',
        description: '',
        source: 'custom' as DictSource,
        isEnabled: true,
        sort: 0,
      });
    }
  }, [dictType, reset]);

  // 提交表单
  const onSubmit = async (data: DictTypeFormData) => {
    try {
      if (isEditMode) {
        // 编辑模式
        const updateDto: UpdateDictTypeDto = {
          name: data.name,
          description: data.description,
          source: data.source,
          isEnabled: data.isEnabled,
          sort: data.sort,
        };
        await updateDictType.mutateAsync({ id: dictType.id, data: updateDto });
      } else {
        // 创建模式
        const createDto: CreateDictTypeDto = {
          code: data.code,
          name: data.name,
          description: data.description,
          source: data.source,
          isEnabled: data.isEnabled,
          sort: data.sort,
        };
        await createDictType.mutateAsync(createDto);
      }

      // 成功提示已经在Hooks的onSuccess中处理，这里不需要重复
      onSuccess();
      reset();
    } catch (error) {
      // 错误已经在Hooks中处理
      console.error('提交失败:', error);
    }
  };

  return (
    <Modal
      title={isEditMode ? '编辑字典类型' : '创建字典类型'}
      open={visible}
      onOk={handleSubmit(onSubmit)}
      onCancel={onCancel}
      confirmLoading={createDictType.isPending || updateDictType.isPending}
      width={600}
      afterClose={() => reset()}
    >
      <Form layout="vertical" style={{ marginTop: 24 }}>
        {/* 字典编码 */}
        <Form.Item
          label="字典编码"
          validateStatus={errors.code ? 'error' : ''}
          help={errors.code?.message}
          required
        >
          <Controller
            name="code"
            control={control}
            rules={{
              required: '字典编码不能为空',
              minLength: { value: 2, message: '字典编码至少2个字符' },
              maxLength: { value: 50, message: '字典编码最多50个字符' },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: '字典编码只能包含字母、数字和下划线',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="请输入字典编码（字母、数字、下划线）"
                disabled={isEditMode} // 编辑模式禁用
              />
            )}
          />
        </Form.Item>

        {/* 字典名称 */}
        <Form.Item
          label="字典名称"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
          required
        >
          <Controller
            name="name"
            control={control}
            rules={{
              required: '字典名称不能为空',
              maxLength: { value: 50, message: '字典名称最多50个字符' },
            }}
            render={({ field }) => <Input {...field} placeholder="请输入字典名称" />}
          />
        </Form.Item>

        {/* 描述 */}
        <Form.Item
          label="描述"
          validateStatus={errors.description ? 'error' : ''}
          help={errors.description?.message}
        >
          <Controller
            name="description"
            control={control}
            rules={{
              maxLength: { value: 200, message: '描述最多200个字符' },
            }}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                placeholder="请输入描述（可选）"
                rows={3}
                showCount
                maxLength={200}
              />
            )}
          />
        </Form.Item>

        {/* 来源 */}
        <Form.Item
          label="来源"
          validateStatus={errors.source ? 'error' : ''}
          help={errors.source?.message}
          required
        >
          <Controller
            name="source"
            control={control}
            rules={{ required: '请选择来源' }}
            render={({ field }) => (
              <Select {...field} placeholder="请选择来源">
                <Select.Option value="platform">平台</Select.Option>
                <Select.Option value="custom">自定义</Select.Option>
              </Select>
            )}
          />
        </Form.Item>

        {/* 状态 */}
        <Form.Item
          label="状态"
          validateStatus={errors.isEnabled ? 'error' : ''}
          help={errors.isEnabled?.message}
          required
        >
          <Controller
            name="isEnabled"
            control={control}
            rules={{ required: '请选择状态' }}
            render={({ field }) => (
              <Select {...field} placeholder="请选择状态">
                <Select.Option value={true}>启用</Select.Option>
                <Select.Option value={false}>禁用</Select.Option>
              </Select>
            )}
          />
        </Form.Item>

        {/* 排序 */}
        <Form.Item
          label="排序"
          validateStatus={errors.sort ? 'error' : ''}
          help={errors.sort?.message}
          required
        >
          <Controller
            name="sort"
            control={control}
            rules={{
              required: '请输入排序值',
              min: { value: 0, message: '排序值不能小于0' },
            }}
            render={({ field }) => (
              <InputNumber
                {...field}
                placeholder="请输入排序值（数字越小越靠前）"
                style={{ width: '100%' }}
                min={0}
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
