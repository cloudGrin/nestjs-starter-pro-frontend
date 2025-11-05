/**
 * 字典项管理面板
 */

import { useState } from 'react';
import { Button, Table, Tag, Form, Input, Select } from 'antd';
import { EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { SearchForm, TableActions, EnabledBadge } from '@/shared/components';
import { useDictItems, useDeleteDictItem, useToggleDictItem } from '../hooks/useDicts';
import type { DictItem, DictItemStatus, DictItemListResponse } from '../types/dict.types';

interface DictItemsPanelProps {
  onEdit: (item: DictItem) => void;
  onCreate: () => void;
}

export function DictItemsPanel({ onEdit, onCreate }: DictItemsPanelProps) {
  // 查询参数
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    dictTypeCode?: string;
    label?: string;
    value?: string;
    status?: DictItemStatus;
  }>({
    page: 1,
    limit: 10,
  });

  // 数据查询
  const { data, isLoading, refetch } = useDictItems(params);
  const deleteMutation = useDeleteDictItem();
  const toggleMutation = useToggleDictItem();

  // 搜索处理
  const handleSearch = (values: Record<string, unknown>) => {
    setParams({
      page: 1,
      limit: 10,
      dictTypeCode: values.dictTypeCode as string | undefined,
      label: values.label as string | undefined,
      value: values.value as string | undefined,
      status: values.status as DictItemStatus | undefined,
    });
  };

  // 删除
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  // 表格列定义
  const columns: ColumnsType<DictItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '字典类型',
      dataIndex: ['dictType', 'name'],
      width: 150,
    },
    {
      title: '标签',
      dataIndex: 'label',
      width: 150,
    },
    {
      title: '英文标签',
      dataIndex: 'labelEn',
      width: 150,
    },
    {
      title: '值',
      dataIndex: 'value',
      width: 120,
    },
    {
      title: '颜色',
      dataIndex: 'color',
      width: 100,
      render: (color?: string) =>
        color ? <Tag color={color}>{color}</Tag> : <span>-</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: DictItemStatus) => <EnabledBadge enabled={status === 'enabled'} />,
    },
    {
      title: '默认',
      dataIndex: 'isDefault',
      width: 80,
      render: (isDefault: boolean) => (isDefault ? <Tag color="gold">默认</Tag> : null),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_: unknown, record: DictItem) => (
        <TableActions
          actions={[
            {
              label: '编辑',
              icon: <EditOutlined />,
              onClick: () => onEdit(record),
              permission: 'dict:update',
            },
            {
              label: '切换状态',
              onClick: () => toggleMutation.mutate(record.id),
              permission: 'dict:update',
            },
            {
              label: '删除',
              icon: <DeleteOutlined />,
              onClick: () => handleDelete(record.id),
              danger: true,
              permission: 'dict:delete',
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      {/* 工具栏 */}
      <div className="mb-4 flex justify-end">
        <Button icon={<ReloadOutlined />} onClick={() => refetch()} className="mr-2">
          刷新
        </Button>
        <Button type="primary" icon={<EditOutlined />} onClick={onCreate}>
          新建字典项
        </Button>
      </div>

      {/* 搜索表单 */}
      <SearchForm onSearch={handleSearch}>
        <Form.Item name="dictTypeCode" label="字典类型">
          <Input placeholder="请输入字典类型编码" />
        </Form.Item>

        <Form.Item name="label" label="标签">
          <Input placeholder="请输入标签" />
        </Form.Item>

        <Form.Item name="value" label="值">
          <Input placeholder="请输入值" />
        </Form.Item>

        <Form.Item name="status" label="状态">
          <Select
            placeholder="请选择状态"
            options={[
              { label: '全部', value: '' },
              { label: '启用', value: 'enabled' },
              { label: '禁用', value: 'disabled' },
            ]}
          />
        </Form.Item>
      </SearchForm>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={(data as DictItemListResponse | undefined)?.items || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: params.page,
          pageSize: params.limit,
          total: (data as DictItemListResponse | undefined)?.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, limit) => setParams({ ...params, page, limit }),
        }}
        scroll={{ x: 1600 }}
      />
    </div>
  );
}
