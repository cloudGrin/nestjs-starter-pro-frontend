import { useEffect, useState } from 'react';
import { Form, Input, Modal, Switch } from 'antd';
import type { AutomationTask, UpdateAutomationTaskConfigDto } from '../types/automation.types';

interface AutomationConfigModalProps {
  open: boolean;
  task: AutomationTask | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (taskKey: string, data: UpdateAutomationTaskConfigDto) => void;
}

interface FormValues {
  enabled: boolean;
  cronExpression: string;
  paramsText: string;
}

function stringifyParams(params?: Record<string, unknown> | null) {
  return JSON.stringify(params ?? {}, null, 2);
}

function parseParams(value: string): Record<string, unknown> {
  const parsed = JSON.parse(value || '{}');
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('参数必须是合法的 JSON 对象');
  }
  return parsed;
}

export function AutomationConfigModal({
  open,
  task,
  loading,
  onCancel,
  onSubmit,
}: AutomationConfigModalProps) {
  const [form] = Form.useForm<FormValues>();
  const [jsonError, setJsonError] = useState<string>();

  useEffect(() => {
    if (!open || !task) {
      return;
    }

    form.setFieldsValue({
      enabled: task.config?.enabled ?? true,
      cronExpression: task.config?.cronExpression ?? task.defaultCron,
      paramsText: stringifyParams(task.config?.params),
    });
    setJsonError(undefined);
  }, [form, open, task]);

  const handleOk = async () => {
    if (!task) {
      return;
    }

    const values = await form.validateFields();

    try {
      const params = parseParams(values.paramsText);
      setJsonError(undefined);
      onSubmit(task.key, {
        enabled: values.enabled,
        cronExpression: values.cronExpression.trim(),
        params,
      });
    } catch {
      setJsonError('参数必须是合法的 JSON 对象');
    }
  };

  return (
    <Modal
      title={task ? `编辑配置：${task.name}` : '编辑配置'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText="保存"
      cancelText="取消"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" initialValues={{ enabled: true, paramsText: '{}' }}>
        <Form.Item name="enabled" label="启用定时执行" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item
          name="cronExpression"
          label="Cron 表达式"
          rules={[{ required: true, message: '请输入 Cron 表达式' }]}
        >
          <Input placeholder="例如：0 3 * * *" />
        </Form.Item>
        <Form.Item
          name="paramsText"
          label="参数 JSON"
          validateStatus={jsonError ? 'error' : undefined}
          help={jsonError}
          rules={[{ required: true, message: '请输入 JSON 对象参数' }]}
        >
          <Input.TextArea
            rows={8}
            spellCheck={false}
            placeholder="请输入 JSON 对象参数"
            className="font-mono"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
