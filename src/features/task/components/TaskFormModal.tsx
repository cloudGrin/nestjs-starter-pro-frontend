import { useEffect, useRef } from 'react';
import { Alert, DatePicker, Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import type {
  CreateTaskDto,
  Task,
  TaskAssignee,
  TaskList,
  TaskRecurrenceType,
  TaskReminderChannel,
  TaskType,
  UpdateTaskDto,
} from '../types/task.types';

interface TaskFormModalProps {
  open: boolean;
  task: Task | null;
  lists: TaskList[];
  users: TaskAssignee[];
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (data: CreateTaskDto | UpdateTaskDto) => void;
}

interface TaskFormValues {
  title: string;
  description?: string;
  listId: number;
  assigneeId?: number;
  taskType: TaskType;
  dueAt?: Dayjs;
  remindAt?: Dayjs;
  important: boolean;
  urgent: boolean;
  tags?: string[];
  recurrenceType: TaskRecurrenceType;
  recurrenceInterval?: number;
  reminderChannels: TaskReminderChannel[];
  sendExternalReminder: boolean;
}

const recurrenceOptions: Array<{ label: string; value: TaskRecurrenceType }> = [
  { label: '不重复', value: 'none' },
  { label: '每天', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '每年', value: 'yearly' },
  { label: '工作日', value: 'weekdays' },
  { label: '自定义间隔', value: 'custom' },
];

const reminderChannelOptions: Array<{ label: string; value: TaskReminderChannel; disabled?: boolean }> = [
  { label: '站内', value: 'internal', disabled: true },
  { label: 'Bark', value: 'bark' },
  { label: '飞书', value: 'feishu' },
];

const externalReminderChannels = new Set<TaskReminderChannel>(['bark', 'feishu']);

const recurrenceTypesWithInterval = new Set<TaskRecurrenceType>([
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'custom',
]);

function supportsRecurrenceInterval(type: TaskRecurrenceType) {
  return recurrenceTypesWithInterval.has(type);
}

function toDateValue(value?: string | null) {
  return value ? dayjs(value) : undefined;
}

function ensureInternalChannel(channels?: TaskReminderChannel[] | null) {
  return Array.from(new Set<TaskReminderChannel>(['internal', ...(channels ?? [])]));
}

function hasExternalChannel(channels?: TaskReminderChannel[] | null) {
  return channels?.some((channel) => externalReminderChannels.has(channel)) ?? false;
}

function toPayload(values: TaskFormValues, isEditing: boolean): CreateTaskDto | UpdateTaskDto {
  const payload: CreateTaskDto = {
    title: values.title.trim(),
    listId: values.listId,
    taskType: values.taskType,
    important: values.important,
    urgent: values.urgent,
    tags: values.tags ?? [],
    recurrenceType: values.recurrenceType,
    reminderChannels: ensureInternalChannel(values.reminderChannels),
    sendExternalReminder: values.sendExternalReminder,
  };

  const description = values.description?.trim();
  if (description) {
    payload.description = description;
  } else if (isEditing) {
    payload.description = null;
  }
  if (values.assigneeId) {
    payload.assigneeId = values.assigneeId;
  } else if (isEditing) {
    payload.assigneeId = null;
  }
  if (values.dueAt) {
    payload.dueAt = values.dueAt.toISOString();
  } else if (isEditing) {
    payload.dueAt = null;
  }
  if (values.remindAt) {
    payload.remindAt = values.remindAt.toISOString();
  } else if (isEditing) {
    payload.remindAt = null;
  }
  if (supportsRecurrenceInterval(values.recurrenceType) && values.recurrenceInterval) {
    payload.recurrenceInterval = values.recurrenceInterval;
  } else if (isEditing) {
    payload.recurrenceInterval = null;
  }

  return payload;
}

export function TaskFormModal({
  open,
  task,
  lists,
  users,
  submitting,
  onCancel,
  onSubmit,
}: TaskFormModalProps) {
  const [form] = Form.useForm<TaskFormValues>();
  const activeLists = lists.filter((list) => !list.isArchived);
  const firstActiveListId = activeLists[0]?.id;
  const initializedKeyRef = useRef<number | 'create' | null>(null);
  const currentList = task
    ? lists.find((list) => list.id === task.listId) ?? task.list
    : undefined;
  const mustMigrateArchivedList = Boolean(task && currentList?.isArchived);

  useEffect(() => {
    if (!open) {
      initializedKeyRef.current = null;
      form.resetFields();
      return;
    }

    const nextKey = task?.id ?? 'create';
    if (initializedKeyRef.current === nextKey) {
      return;
    }
    initializedKeyRef.current = nextKey;

    if (task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description ?? undefined,
        listId: mustMigrateArchivedList ? undefined : task.listId,
        assigneeId: task.assigneeId ?? undefined,
        taskType: task.taskType,
        dueAt: toDateValue(task.dueAt),
        remindAt: toDateValue(task.remindAt),
        important: task.important,
        urgent: task.urgent,
        tags: task.tags ?? [],
        recurrenceType: task.recurrenceType,
        recurrenceInterval: task.recurrenceInterval ?? undefined,
        reminderChannels: ensureInternalChannel(task.reminderChannels),
        sendExternalReminder: task.sendExternalReminder,
      });
      return;
    }

    form.setFieldsValue({
      title: '',
      description: undefined,
      listId: firstActiveListId,
      assigneeId: undefined,
      taskType: 'task',
      dueAt: undefined,
      remindAt: undefined,
      important: false,
      urgent: false,
      tags: [],
      recurrenceType: 'none',
      recurrenceInterval: undefined,
      reminderChannels: ['internal'],
      sendExternalReminder: false,
    });
  }, [firstActiveListId, form, mustMigrateArchivedList, open, task]);

  useEffect(() => {
    if (!open || task || form.getFieldValue('listId') || !firstActiveListId) {
      return;
    }

    form.setFieldValue('listId', firstActiveListId);
  }, [firstActiveListId, form, open, task]);

  const handleOk = async () => {
    let values: TaskFormValues;

    try {
      values = await form.validateFields();
    } catch {
      // Ant Design has already rendered field-level validation errors.
      return;
    }

    onSubmit(toPayload(values, Boolean(task)));
  };

  const handleReminderChannelsChange = (channels: TaskReminderChannel[]) => {
    form.setFieldValue('reminderChannels', ensureInternalChannel(channels));
  };

  return (
    <Modal
      title={task ? '编辑任务' : '新建任务'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={submitting}
      destroyOnHidden
      forceRender
      width={720}
    >
      <Form form={form} layout="vertical">
        {mustMigrateArchivedList ? (
          <Alert
            className="mb-4"
            type="warning"
            showIcon
            message="当前任务所属清单已归档，请迁移到可用清单"
          />
        ) : null}

        <Form.Item
          name="title"
          label="标题"
          rules={[
            { required: true, message: '请输入任务标题' },
            {
              validator: (_, value?: string) =>
                value?.trim()
                  ? Promise.resolve()
                  : Promise.reject(new Error('任务标题不能为空')),
            },
            { max: 200, message: '标题不能超过 200 个字符' },
          ]}
        >
          <Input placeholder="例如：给家里买菜、准备周会、结婚纪念日" allowClear />
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item
            name="listId"
            label="所属清单"
            rules={[
              {
                required: true,
                message: mustMigrateArchivedList
                  ? '当前任务所属清单已归档，请迁移到可用清单'
                  : '请选择清单',
              },
            ]}
          >
            <Select
              placeholder="请选择清单"
              options={activeLists.map((list) => ({
                label: list.name,
                value: list.id,
              }))}
            />
          </Form.Item>

          <Form.Item name="assigneeId" label="负责人">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="可不指定"
              options={users.map((user) => ({
                label: user.realName || user.nickname || user.username,
                value: user.id,
              }))}
            />
          </Form.Item>
        </div>

        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="补充任务说明" allowClear />
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item name="taskType" label="类型">
            <Select
              options={[
                { label: '普通任务', value: 'task' },
                { label: '纪念日', value: 'anniversary' },
              ]}
            />
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入后回车添加标签" tokenSeparators={[',']} />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item
            name="dueAt"
            label="截止时间"
            dependencies={['taskType', 'recurrenceType', 'remindAt']}
            rules={[
              {
                validator: (_, value?: Dayjs) => {
                  const taskType = form.getFieldValue('taskType');
                  const recurrenceType = form.getFieldValue('recurrenceType');
                  const remindAt = form.getFieldValue('remindAt');

                  if (taskType === 'anniversary' && !value) {
                    return Promise.reject(new Error('纪念日必须设置日期'));
                  }
                  if (recurrenceType !== 'none' && !value) {
                    return Promise.reject(new Error('重复任务必须设置截止时间'));
                  }
                  if (value && remindAt && dayjs(remindAt).isAfter(value)) {
                    return Promise.reject(new Error('提醒时间不能晚于截止时间'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker showTime className="w-full" placeholder="请选择截止时间" />
          </Form.Item>

          <Form.Item
            name="remindAt"
            label="提醒时间"
            dependencies={['dueAt']}
            rules={[
              {
                validator: (_, value?: Dayjs) => {
                  const dueAt = form.getFieldValue('dueAt');
                  if (value && dueAt && dayjs(value).isAfter(dueAt)) {
                    return Promise.reject(new Error('提醒时间不能晚于截止时间'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker showTime className="w-full" placeholder="请选择提醒时间" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item name="recurrenceType" label="重复规则">
            <Select options={recurrenceOptions} />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, next) => prev.recurrenceType !== next.recurrenceType}>
            {({ getFieldValue }) =>
              supportsRecurrenceInterval(getFieldValue('recurrenceType')) ? (
                <Form.Item
                  name="recurrenceInterval"
                  label="重复间隔"
                >
                  <InputNumber min={1} max={365} className="w-full" />
                </Form.Item>
              ) : (
                <Form.Item label="重复间隔">
                  <InputNumber disabled className="w-full" placeholder="当前规则无需填写" />
                </Form.Item>
              )
            }
          </Form.Item>
        </div>

        <Form.Item noStyle shouldUpdate={(prev, next) => prev.sendExternalReminder !== next.sendExternalReminder}>
          {({ getFieldValue }) => (
            <Form.Item
              name="reminderChannels"
              label="提醒渠道"
              rules={[
                {
                  validator: (_, value?: TaskReminderChannel[]) => {
                    const channels = ensureInternalChannel(value);
                    if (getFieldValue('sendExternalReminder') && !hasExternalChannel(channels)) {
                      return Promise.reject(new Error('外部提醒需要选择 Bark 或飞书'));
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                mode="multiple"
                options={reminderChannelOptions}
                onChange={handleReminderChannelsChange}
              />
            </Form.Item>
          )}
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Form.Item name="important" label="重要" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="urgent" label="紧急" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="sendExternalReminder" label="外部提醒" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
