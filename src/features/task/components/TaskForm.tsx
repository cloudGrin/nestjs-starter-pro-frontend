/**
 * 任务表单组件
 */

import { Form, Input, InputNumber, Select, Button, Space } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { useCreateTask, useUpdateTask } from '../hooks/useTasks';
import type { TaskDefinition, CreateTaskDto, UpdateTaskDto } from '../types/task.types';
import { CRON_EXAMPLES } from '../types/task.types';

const { TextArea } = Input;
const { Option } = Select;

interface TaskFormProps {
  task?: TaskDefinition | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface TaskFormData {
  name: string;
  code: string;
  cron: string;
  handler: string;
  description?: string;
  timeout?: number;
  retryCount?: number;
  retryInterval?: number;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onSuccess, onCancel }) => {
  const isEdit = !!task;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      name: task?.name || '',
      code: task?.code || '',
      cron: task?.cron || '0 0 2 * * *',
      handler: task?.handler || '',
      description: task?.description || '',
      timeout: task?.timeout || 300000,
      retryCount: task?.retryCount || 3,
      retryInterval: task?.retryInterval || 60000,
    },
  });

  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();

  const isPending = isCreating || isUpdating;

  /**
   * 处理Cron示例选择
   */
  const handleCronExampleSelect = (value: string) => {
    setValue('cron', value);
  };

  /**
   * 处理表单提交
   */
  const onSubmit = (formData: TaskFormData) => {
    if (isEdit && task) {
      const updateDto: UpdateTaskDto = {
        name: formData.name,
        cron: formData.cron,
        handler: formData.handler,
        description: formData.description,
        timeout: formData.timeout,
        retryCount: formData.retryCount,
        retryInterval: formData.retryInterval,
      };
      updateTask(
        { id: task.id, data: updateDto },
        {
          onSuccess: () => {
            onSuccess();
          },
        }
      );
    } else {
      const createDto: CreateTaskDto = {
        name: formData.name,
        code: formData.code,
        cron: formData.cron,
        handler: formData.handler,
        description: formData.description,
        timeout: formData.timeout,
        retryCount: formData.retryCount,
        retryInterval: formData.retryInterval,
      };
      createTask(createDto, {
        onSuccess: () => {
          onSuccess();
        },
      });
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item
        label="任务名称"
        required
        validateStatus={errors.name ? 'error' : ''}
        help={errors.name?.message}
      >
        <Controller
          name="name"
          control={control}
          rules={{ required: '请输入任务名称' }}
          render={({ field }) => (
            <Input {...field} placeholder="请输入任务名称，如：清理过期文件" />
          )}
        />
      </Form.Item>

      <Form.Item
        label="任务代码"
        required
        validateStatus={errors.code ? 'error' : ''}
        help={errors.code?.message}
        extra={isEdit ? '任务代码在编辑时无法修改' : '任务代码必须唯一，建议使用小写字母+下划线'}
      >
        <Controller
          name="code"
          control={control}
          rules={{ required: '请输入任务代码' }}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="请输入任务代码，如：cleanup_expired_files"
              disabled={isEdit}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Cron表达式"
        required
        validateStatus={errors.cron ? 'error' : ''}
        help={errors.cron?.message}
        extra="格式：秒 分 时 日 月 周，可使用下拉框快速选择常用表达式"
      >
        <Space.Compact style={{ width: '100%' }}>
          <Controller
            name="cron"
            control={control}
            rules={{ required: '请输入Cron表达式' }}
            render={({ field }) => <Input {...field} placeholder="0 0 2 * * *" />}
          />
          <Select
            placeholder="常用示例"
            style={{ width: 200 }}
            onChange={handleCronExampleSelect}
            allowClear
          >
            {CRON_EXAMPLES.map((example) => (
              <Option key={example.value} value={example.value}>
                {example.label}
              </Option>
            ))}
          </Select>
        </Space.Compact>
      </Form.Item>

      <Form.Item
        label="处理器"
        required
        validateStatus={errors.handler ? 'error' : ''}
        help={errors.handler?.message}
        extra="处理器类名，如：FileCleanupTask"
      >
        <Controller
          name="handler"
          control={control}
          rules={{ required: '请输入处理器' }}
          render={({ field }) => <Input {...field} placeholder="FileCleanupTask" />}
        />
      </Form.Item>

      <Form.Item label="描述">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              placeholder="请输入任务描述"
              rows={3}
              showCount
              maxLength={500}
            />
          )}
        />
      </Form.Item>

      <Form.Item label="超时时间（毫秒）" extra="任务执行超时时间，默认300000ms（5分钟）">
        <Controller
          name="timeout"
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              min={1000}
              max={3600000}
              step={1000}
              style={{ width: '100%' }}
              placeholder="300000"
            />
          )}
        />
      </Form.Item>

      <Form.Item label="重试次数" extra="任务失败后的重试次数，默认3次">
        <Controller
          name="retryCount"
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              min={0}
              max={10}
              style={{ width: '100%' }}
              placeholder="3"
            />
          )}
        />
      </Form.Item>

      <Form.Item label="重试间隔（毫秒）" extra="任务重试间隔时间，默认60000ms（1分钟）">
        <Controller
          name="retryInterval"
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              min={1000}
              max={600000}
              step={1000}
              style={{ width: '100%' }}
              placeholder="60000"
            />
          )}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isPending}>
            {isEdit ? '更新' : '创建'}
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
