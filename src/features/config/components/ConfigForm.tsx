/**
 * 系统配置表单组件（创建/编辑配置）
 */

import { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Alert } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import type { SystemConfig, ConfigType, ConfigGroup } from '../types/config.types';
import type { CreateSystemConfigDto, UpdateSystemConfigDto } from '../types/config.types';
import { useCreateConfig, useUpdateConfig } from '../hooks/useConfigs';

interface ConfigFormProps {
  visible: boolean;
  config?: SystemConfig | null; // null表示创建模式，SystemConfig表示编辑模式
  onCancel: () => void;
  onSuccess: () => void;
}

interface ConfigFormData {
  configKey: string;
  configName: string;
  configValue: string;
  configType: ConfigType;
  configGroup: ConfigGroup;
  description?: string;
  defaultValue?: string;
  isEnabled: boolean;
  sort: number;
}

/**
 * 系统配置表单组件
 * 支持创建和编辑模式
 */
export function ConfigForm({ visible, config, onCancel, onSuccess }: ConfigFormProps) {
  const isEditMode = !!config;
  const isSystemConfig = config?.isSystem || false;

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfigFormData>({
    defaultValues: {
      configKey: '',
      configName: '',
      configValue: '',
      configType: 'text' as ConfigType,
      configGroup: 'other' as ConfigGroup,
      description: '',
      defaultValue: '',
      isEnabled: true,
      sort: 0,
    },
  });

  // 创建/更新Mutation
  const createConfig = useCreateConfig();
  const updateConfig = useUpdateConfig();

  // 编辑模式：填充表单数据
  useEffect(() => {
    if (config) {
      reset({
        configKey: config.configKey,
        configName: config.configName,
        configValue: config.configValue,
        configType: config.configType,
        configGroup: config.configGroup,
        description: config.description || '',
        defaultValue: config.defaultValue || '',
        isEnabled: config.isEnabled,
        sort: config.sort,
      });
    } else {
      reset({
        configKey: '',
        configName: '',
        configValue: '',
        configType: 'text' as ConfigType,
        configGroup: 'other' as ConfigGroup,
        description: '',
        defaultValue: '',
        isEnabled: true,
        sort: 0,
      });
    }
  }, [config, reset]);

  // 提交表单
  const onSubmit = async (data: ConfigFormData) => {
    try {
      if (isEditMode) {
        // 编辑模式
        const updateDto: UpdateSystemConfigDto = {
          configName: data.configName,
          configValue: data.configValue,
          configType: data.configType,
          configGroup: data.configGroup,
          description: data.description,
          defaultValue: data.defaultValue,
          isEnabled: data.isEnabled,
          sort: data.sort,
        };
        await updateConfig.mutateAsync({ id: config.id, data: updateDto });
      } else {
        // 创建模式
        const createDto: CreateSystemConfigDto = {
          configKey: data.configKey,
          configName: data.configName,
          configValue: data.configValue,
          configType: data.configType,
          configGroup: data.configGroup,
          description: data.description,
          defaultValue: data.defaultValue,
          isEnabled: data.isEnabled,
          sort: data.sort,
        };
        await createConfig.mutateAsync(createDto);
      }

      // ⚠️ 不需要手动显示提示，Service 层已配置 successMessage
      onSuccess();
      reset();
    } catch (error) {
      // 错误已经在Hooks中处理
      console.error('提交失败:', error);
    }
  };

  return (
    <Modal
      title={isEditMode ? '编辑系统配置' : '创建系统配置'}
      open={visible}
      onOk={handleSubmit(onSubmit)}
      onCancel={onCancel}
      confirmLoading={createConfig.isPending || updateConfig.isPending}
      width={700}
      afterClose={() => reset()}
    >
      {isSystemConfig && (
        <Alert
          message="系统配置提示"
          description="此配置为系统配置，请谨慎修改配置值。配置键名不可修改。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form layout="vertical" style={{ marginTop: 24 }}>
        {/* 配置键名 */}
        <Form.Item
          label="配置键名"
          validateStatus={errors.configKey ? 'error' : ''}
          help={errors.configKey?.message}
          required
          tooltip="配置键名用于程序中获取配置，建议使用英文、数字、下划线和点号"
        >
          <Controller
            name="configKey"
            control={control}
            rules={{
              required: '配置键名不能为空',
              minLength: { value: 2, message: '配置键名至少2个字符' },
              maxLength: { value: 100, message: '配置键名最多100个字符' },
              pattern: {
                value: /^[a-zA-Z0-9_.]+$/,
                message: '配置键名只能包含字母、数字、下划线和点号',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="请输入配置键名（如：app.name、db.host）"
                disabled={isEditMode} // 编辑模式禁用
              />
            )}
          />
        </Form.Item>

        {/* 配置名称 */}
        <Form.Item
          label="配置名称"
          validateStatus={errors.configName ? 'error' : ''}
          help={errors.configName?.message}
          required
        >
          <Controller
            name="configName"
            control={control}
            rules={{
              required: '配置名称不能为空',
              maxLength: { value: 100, message: '配置名称最多100个字符' },
            }}
            render={({ field }) => <Input {...field} placeholder="请输入配置名称（中文）" />}
          />
        </Form.Item>

        {/* 配置值 */}
        <Form.Item
          label="配置值"
          validateStatus={errors.configValue ? 'error' : ''}
          help={errors.configValue?.message}
          tooltip="根据配置类型输入对应的值。JSON类型需输入有效的JSON字符串。"
        >
          <Controller
            name="configValue"
            control={control}
            rules={{
              maxLength: { value: 2000, message: '配置值最多2000个字符' },
            }}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                placeholder="请输入配置值"
                rows={4}
                showCount
                maxLength={2000}
              />
            )}
          />
        </Form.Item>

        {/* 配置类型 */}
        <Form.Item
          label="配置类型"
          validateStatus={errors.configType ? 'error' : ''}
          help={errors.configType?.message}
          required
        >
          <Controller
            name="configType"
            control={control}
            rules={{ required: '请选择配置类型' }}
            render={({ field }) => (
              <Select {...field} placeholder="请选择配置类型">
                <Select.Option value="text">文本</Select.Option>
                <Select.Option value="number">数字</Select.Option>
                <Select.Option value="boolean">布尔值</Select.Option>
                <Select.Option value="json">JSON对象</Select.Option>
                <Select.Option value="array">数组</Select.Option>
              </Select>
            )}
          />
        </Form.Item>

        {/* 配置分组 */}
        <Form.Item
          label="配置分组"
          validateStatus={errors.configGroup ? 'error' : ''}
          help={errors.configGroup?.message}
          required
        >
          <Controller
            name="configGroup"
            control={control}
            rules={{ required: '请选择配置分组' }}
            render={({ field }) => (
              <Select {...field} placeholder="请选择配置分组">
                <Select.Option value="system">系统配置</Select.Option>
                <Select.Option value="business">业务配置</Select.Option>
                <Select.Option value="security">安全配置</Select.Option>
                <Select.Option value="third_party">第三方配置</Select.Option>
                <Select.Option value="other">其他配置</Select.Option>
              </Select>
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

        {/* 默认值 */}
        <Form.Item
          label="默认值"
          validateStatus={errors.defaultValue ? 'error' : ''}
          help={errors.defaultValue?.message}
          tooltip="当配置值为空时使用的默认值"
        >
          <Controller
            name="defaultValue"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="请输入默认值（可选）" />
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
