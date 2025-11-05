/**
 * 字典项表单组件（创建/编辑字典项）
 */

import { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import type { DictItem, DictItemStatus } from '../types/dict.types';
import type { CreateDictItemDto, UpdateDictItemDto } from '../types/dict.types';
import {
  useCreateDictItem,
  useUpdateDictItem,
  useEnabledDictTypes,
} from '../hooks/useDicts';
import { useApp } from '@/shared/hooks';

interface DictItemFormProps {
  visible: boolean;
  dictItem?: DictItem | null; // null表示创建模式，DictItem表示编辑模式
  onCancel: () => void;
  onSuccess: () => void;
}

interface DictItemFormData {
  dictTypeId: number;
  label: string;
  labelEn?: string;
  value: string;
  color?: string;
  icon?: string;
  description?: string;
  status: DictItemStatus;
  isDefault: boolean;
  sort: number;
}

/**
 * 字典项表单组件
 * 支持创建和编辑模式
 */
export function DictItemForm({ visible, dictItem, onCancel, onSuccess }: DictItemFormProps) {
  const isEditMode = !!dictItem;
  const { message } = useApp();

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DictItemFormData>({
    defaultValues: {
      dictTypeId: 0,
      label: '',
      labelEn: '',
      value: '',
      color: '',
      icon: '',
      description: '',
      status: 'enabled' as DictItemStatus,
      isDefault: false,
      sort: 0,
    },
  });

  // 获取字典类型列表
  const { data: dictTypes, isLoading: dictTypesLoading } = useEnabledDictTypes();

  // 创建/更新Mutation
  const createDictItem = useCreateDictItem();
  const updateDictItem = useUpdateDictItem();

  // 编辑模式：填充表单数据
  useEffect(() => {
    if (dictItem) {
      reset({
        dictTypeId: dictItem.dictTypeId,
        label: dictItem.label,
        labelEn: dictItem.labelEn || '',
        value: dictItem.value,
        color: dictItem.color || '',
        icon: dictItem.icon || '',
        description: dictItem.description || '',
        status: dictItem.status,
        isDefault: dictItem.isDefault,
        sort: dictItem.sort,
      });
    } else {
      reset({
        dictTypeId: 0,
        label: '',
        labelEn: '',
        value: '',
        color: '',
        icon: '',
        description: '',
        status: 'enabled' as DictItemStatus,
        isDefault: false,
        sort: 0,
      });
    }
  }, [dictItem, reset]);

  // 提交表单
  const onSubmit = async (data: DictItemFormData) => {
    try {
      if (isEditMode) {
        // 编辑模式
        const updateDto: UpdateDictItemDto = {
          dictTypeId: data.dictTypeId,
          label: data.label,
          labelEn: data.labelEn,
          value: data.value,
          color: data.color,
          icon: data.icon,
          description: data.description,
          status: data.status,
          isDefault: data.isDefault,
          sort: data.sort,
        };
        await updateDictItem.mutateAsync({ id: dictItem.id, data: updateDto });
      } else {
        // 创建模式
        if (!data.dictTypeId || data.dictTypeId === 0) {
          message.error('请选择字典类型');
          return;
        }
        const createDto: CreateDictItemDto = {
          dictTypeId: data.dictTypeId,
          label: data.label,
          labelEn: data.labelEn,
          value: data.value,
          color: data.color,
          icon: data.icon,
          description: data.description,
          status: data.status,
          isDefault: data.isDefault,
          sort: data.sort,
        };
        await createDictItem.mutateAsync(createDto);
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
      title={isEditMode ? '编辑字典项' : '创建字典项'}
      open={visible}
      onOk={handleSubmit(onSubmit)}
      onCancel={onCancel}
      confirmLoading={createDictItem.isPending || updateDictItem.isPending}
      width={700}
      afterClose={() => reset()}
    >
      <Form layout="vertical" style={{ marginTop: 24 }}>
        {/* 字典类型 */}
        <Form.Item
          label="字典类型"
          validateStatus={errors.dictTypeId ? 'error' : ''}
          help={errors.dictTypeId?.message}
          required
        >
          <Controller
            name="dictTypeId"
            control={control}
            rules={{
              required: '请选择字典类型',
              validate: (value) => value > 0 || '请选择字典类型',
            }}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="请选择字典类型"
                loading={dictTypesLoading}
                disabled={isEditMode} // 编辑模式禁用
                showSearch
                filterOption={(input, option) =>
                  (option?.label?.toString() ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={dictTypes?.map((type) => ({
                  label: `${type.name} (${type.code})`,
                  value: type.id,
                }))}
              />
            )}
          />
        </Form.Item>

        {/* 标签（中文） */}
        <Form.Item
          label="标签（中文）"
          validateStatus={errors.label ? 'error' : ''}
          help={errors.label?.message}
          required
        >
          <Controller
            name="label"
            control={control}
            rules={{
              required: '标签不能为空',
              maxLength: { value: 50, message: '标签最多50个字符' },
            }}
            render={({ field }) => <Input {...field} placeholder="请输入标签（中文）" />}
          />
        </Form.Item>

        {/* 标签（英文） */}
        <Form.Item
          label="标签（英文）"
          validateStatus={errors.labelEn ? 'error' : ''}
          help={errors.labelEn?.message}
        >
          <Controller
            name="labelEn"
            control={control}
            rules={{
              maxLength: { value: 50, message: '英文标签最多50个字符' },
            }}
            render={({ field }) => (
              <Input {...field} placeholder="请输入标签（英文，可选）" />
            )}
          />
        </Form.Item>

        {/* 值 */}
        <Form.Item
          label="值"
          validateStatus={errors.value ? 'error' : ''}
          help={errors.value?.message}
          required
        >
          <Controller
            name="value"
            control={control}
            rules={{
              required: '值不能为空',
              maxLength: { value: 50, message: '值最多50个字符' },
            }}
            render={({ field }) => <Input {...field} placeholder="请输入值" />}
          />
        </Form.Item>

        {/* 颜色 */}
        <Form.Item
          label="颜色"
          validateStatus={errors.color ? 'error' : ''}
          help={errors.color?.message}
          tooltip="用于前端展示，如Tag组件的颜色（如：blue、red、green、gold等）"
        >
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="请输入颜色（可选，如：blue、#1890ff）" />
            )}
          />
        </Form.Item>

        {/* 图标 */}
        <Form.Item
          label="图标"
          validateStatus={errors.icon ? 'error' : ''}
          help={errors.icon?.message}
          tooltip="图标名称（如：UserOutlined），用于前端展示"
        >
          <Controller
            name="icon"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="请输入图标名称（可选，如：UserOutlined）" />
            )}
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

        {/* 状态 */}
        <Form.Item
          label="状态"
          validateStatus={errors.status ? 'error' : ''}
          help={errors.status?.message}
          required
        >
          <Controller
            name="status"
            control={control}
            rules={{ required: '请选择状态' }}
            render={({ field }) => (
              <Select {...field} placeholder="请选择状态">
                <Select.Option value="enabled">启用</Select.Option>
                <Select.Option value="disabled">禁用</Select.Option>
              </Select>
            )}
          />
        </Form.Item>

        {/* 是否默认 */}
        <Form.Item
          label="是否默认"
          validateStatus={errors.isDefault ? 'error' : ''}
          help={errors.isDefault?.message}
          tooltip="标记为默认值后，在该字典类型中此项将作为默认选项"
        >
          <Controller
            name="isDefault"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <Switch
                {...field}
                checked={value}
                onChange={onChange}
                checkedChildren="是"
                unCheckedChildren="否"
              />
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
