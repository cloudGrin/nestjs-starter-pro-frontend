import { useEffect } from 'react';
import { DatePicker, Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
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

const reminderChannelOptions: Array<{ label: string; value: TaskReminderChannel }> = [
  { label: '站内', value: 'internal' },
  { label: 'Bark', value: 'bark' },
  { label: '飞书', value: 'feishu' },
];

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

function toPayload(values: TaskFormValues, isEditing: boolean): CreateTaskDto | UpdateTaskDto {
  const payload: CreateTaskDto = {
    title: values.title.trim(),
    listId: values.listId,
    taskType: values.taskType,
    important: values.important,
    urgent: values.urgent,
    tags: values.tags ?? [],
    recurrenceType: values.recurrenceType,
    reminderChannels: values.reminderChannels ?? ['internal'],
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

  useEffect(() => {
    if (!open) {
      return;
    }

    if (task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description ?? undefined,
        listId: task.listId,
        assigneeId: task.assigneeId ?? undefined,
        taskType: task.taskType,
        dueAt: toDateValue(task.dueAt),
        remindAt: toDateValue(task.remindAt),
        important: task.important,
        urgent: task.urgent,
        tags: task.tags ?? [],
        recurrenceType: task.recurrenceType,
        recurrenceInterval: task.recurrenceInterval ?? undefined,
        reminderChannels: task.reminderChannels ?? ['internal'],
        sendExternalReminder: task.sendExternalReminder,
      });
      return;
    }

    form.setFieldsValue({
      title: '',
      description: undefined,
      listId: lists.find((list) => !list.isArchived)?.id,
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
  }, [form, lists, open, task]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(toPayload(values, Boolean(task)));
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
        <Form.Item
          name="title"
          label="标题"
          rules={[
            { required: true, message: '请输入任务标题' },
            { max: 200, message: '标题不能超过 200 个字符' },
          ]}
        >
          <Input placeholder="例如：给家里买菜、准备周会、结婚纪念日" allowClear />
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item name="listId" label="所属清单" rules={[{ required: true, message: '请选择清单' }]}>
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
          <Form.Item name="dueAt" label="截止时间">
            <DatePicker showTime className="w-full" placeholder="请选择截止时间" />
          </Form.Item>

          <Form.Item name="remindAt" label="提醒时间">
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

        <Form.Item name="reminderChannels" label="提醒渠道">
          <Select mode="multiple" options={reminderChannelOptions} />
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
