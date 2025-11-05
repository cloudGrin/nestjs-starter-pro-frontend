/**
 * 字典类型管理面板
 */

import { useState } from 'react';
import { Button, Table, Tag, Form, Input, Select } from 'antd';
import { EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { SearchForm, TableActions, EnabledBadge } from '@/shared/components';
import { useDictTypes, useDeleteDictType, useToggleDictType } from '../hooks/useDicts';
import type { DictType, DictSource, DictTypeListResponse } from '../types/dict.types';

interface DictTypesPanelProps {
  onEdit: (type: DictType) => void;
  onCreate: () => void;
}

export function DictTypesPanel({ onEdit, onCreate }: DictTypesPanelProps) {
  // 查询参数
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    code?: string;
    name?: string;
    source?: DictSource;
    isEnabled?: boolean;
  }>({
    page: 1,
    limit: 10,
  });

  // 数据查询
  const { data, isLoading, refetch } = useDictTypes(params);
  const deleteMutation = useDeleteDictType();
  const toggleMutation = useToggleDictType();

  // 搜索处理
  const handleSearch = (values: Record<string, unknown>) => {
    const code = values.code as string | undefined;
    const name = values.name as string | undefined;
    const source = values.source as DictSource | undefined;
    const isEnabledStr = values.isEnabled as string | undefined;
    const isEnabled = isEnabledStr === 'true' ? true : isEnabledStr === 'false' ? false : undefined;

    setParams({
      page: 1,
      limit: 10,
      code,
      name,
      source,
      isEnabled,
    });
  };

  // 删除
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  // 表格列定义
  const columns: ColumnsType<DictType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '字典编码',
      dataIndex: 'code',
      width: 150,
    },
    {
      title: '字典名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '来源',
      dataIndex: 'source',
      width: 100,
      render: (source: DictSource) => (
        <Tag color={source === 'platform' ? 'blue' : 'green'}>
          {source === 'platform' ? '平台' : '自定义'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      width: 100,
      render: (isEnabled: boolean) => <EnabledBadge enabled={isEnabled} />,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: unknown, record: DictType) => (
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
          新建字典类型
        </Button>
      </div>

      {/* 搜索表单 */}
      <SearchForm onSearch={handleSearch}>
        <Form.Item name="code" label="字典编码">
          <Input placeholder="请输入字典编码" />
        </Form.Item>

        <Form.Item name="name" label="字典名称">
          <Input placeholder="请输入字典名称" />
        </Form.Item>

        <Form.Item name="source" label="来源">
          <Select
            placeholder="请选择来源"
            options={[
              { label: '全部', value: '' },
              { label: '平台', value: 'platform' },
              { label: '自定义', value: 'custom' },
            ]}
          />
        </Form.Item>

        <Form.Item name="isEnabled" label="状态">
          <Select
            placeholder="请选择状态"
            options={[
              { label: '全部', value: '' },
              { label: '启用', value: 'true' },
              { label: '禁用', value: 'false' },
            ]}
          />
        </Form.Item>
      </SearchForm>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={(data as DictTypeListResponse | undefined)?.items || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: params.page,
          pageSize: params.limit,
          total: (data as DictTypeListResponse | undefined)?.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, limit) => setParams({ ...params, page, limit }),
        }}
        scroll={{ x: 1400 }}
      />
    </div>
  );
}
