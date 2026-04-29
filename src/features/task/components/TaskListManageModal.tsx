import { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Select, Space, Switch, Table, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, RollbackOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useCreateTaskList,
  useDeleteTaskList,
  useUpdateTaskList,
} from '../hooks/useTasks';
import type { TaskList, TaskListScope } from '../types/task.types';

interface TaskListManageModalProps {
  open: boolean;
  lists: TaskList[];
  loading?: boolean;
  onCancel: () => void;
}

interface TaskListFormValues {
  name: string;
  scope: TaskListScope;
  color?: string;
  sort: number;
  isArchived: boolean;
}

const scopeOptions: Array<{ label: string; value: TaskListScope }> = [
  { label: '个人', value: 'personal' },
  { label: '家庭', value: 'family' },
];

export function TaskListManageModal({
  open,
  lists,
  loading,
  onCancel,
}: TaskListManageModalProps) {
  const [form] = Form.useForm<TaskListFormValues>();
  const [editingList, setEditingList] = useState<TaskList | null>(null);
  const createTaskList = useCreateTaskList();
  const updateTaskList = useUpdateTaskList();
  const deleteTaskList = useDeleteTaskList();

  useEffect(() => {
    if (!open) {
      setEditingList(null);
      form.resetFields();
    }
  }, [form, open]);

  const resetForm = () => {
    setEditingList(null);
    form.setFieldsValue({
      name: '',
      scope: 'personal',
      color: undefined,
      sort: 0,
      isArchived: false,
    });
  };

  const handleEdit = (list: TaskList) => {
    setEditingList(list);
    form.setFieldsValue({
      name: list.name,
      scope: list.scope,
      color: list.color ?? undefined,
      sort: list.sort,
      isArchived: list.isArchived,
    });
  };

  const handleSubmit = async () => {
    let values: TaskListFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const color = values.color?.trim();
    const basePayload = {
      ...values,
      name: values.name.trim(),
    };

    try {
      if (editingList) {
        await updateTaskList.mutateAsync({
          id: editingList.id,
          data: {
            ...basePayload,
            color: color || null,
          },
        });
      } else {
        await createTaskList.mutateAsync({
          ...basePayload,
          color: color || undefined,
        });
      }
    } catch {
      return;
    }

    resetForm();
  };

  const columns: ColumnsType<TaskList> = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (name: string, record) => (
        <Space>
          {record.color ? (
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: record.color }}
            />
          ) : null}
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: '范围',
      dataIndex: 'scope',
      width: 90,
      render: (scope: TaskListScope) => (scope === 'family' ? <Tag color="blue">家庭</Tag> : <Tag>个人</Tag>),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'isArchived',
      width: 90,
      render: (isArchived: boolean) =>
        isArchived ? <Tag color="default">已归档</Tag> : <Tag color="green">使用中</Tag>,
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            danger
            size="small"
            type="text"
            icon={<DeleteOutlined />}
            loading={deleteTaskList.isPending}
            onClick={() => deleteTaskList.mutate(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title="管理任务清单"
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      forceRender
      width={920}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ scope: 'personal', sort: 0, isArchived: false }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <Form.Item
            name="name"
            label="名称"
            rules={[
              { required: true, message: '请输入清单名称' },
              {
                validator: (_, value?: string) =>
                  value?.trim()
                    ? Promise.resolve()
                    : Promise.reject(new Error('清单名称不能为空')),
              },
              { max: 100, message: '名称不能超过 100 个字符' },
            ]}
          >
            <Input placeholder="例如：家庭计划" allowClear />
          </Form.Item>
          <Form.Item name="scope" label="范围">
            <Select options={scopeOptions} />
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <Input placeholder="#4f46e5" allowClear />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item name="isArchived" label="归档" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <Space className="mb-4">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={createTaskList.isPending || updateTaskList.isPending}
            onClick={handleSubmit}
          >
            {editingList ? '保存清单' : '新增清单'}
          </Button>
          {editingList ? (
            <Button icon={<RollbackOutlined />} onClick={resetForm}>
              取消编辑
            </Button>
          ) : null}
        </Space>
      </Form>

      <Table<TaskList>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={lists}
        loading={loading}
        pagination={false}
      />
    </Modal>
  );
}
