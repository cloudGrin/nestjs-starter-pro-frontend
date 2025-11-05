import { useState } from 'react';
import { Card, Tabs, Button, Table, Tag, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageWrap, SearchForm, TableActions, EnabledBadge } from '@/shared/components';
import { useConfigs, useDeleteConfig, useToggleConfig } from '../hooks/useConfigs';
import { ConfigForm } from '../components/ConfigForm';
import type {
  SystemConfig,
  ConfigType,
  ConfigGroup,
  SystemConfigListResponse,
} from '../types/config.types';

// Tabs.TabPane已废弃，改用items属性

export function ConfigListPage() {
  const [activeGroup, setActiveGroup] = useState<ConfigGroup | 'all'>('all');

  // 配置Form状态
  const [configFormVisible, setConfigFormVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<SystemConfig | null>(null);

  // 配置查询参数
  const [configParams, setConfigParams] = useState<{
    page: number;
    limit: number;
    configKey?: string;
    configName?: string;
    configType?: ConfigType;
    configGroup?: ConfigGroup;
    isEnabled?: boolean;
  }>({
    page: 1,
    limit: 10,
  });

  // 配置数据
  const { data: configData, isLoading: configLoading } = useConfigs(configParams);
  const deleteConfigMutation = useDeleteConfig();
  const toggleConfigMutation = useToggleConfig();

  // 配置搜索
  const handleConfigSearch = (values: Record<string, unknown>) => {
    const group = activeGroup === 'all' ? undefined : activeGroup;

    setConfigParams({
      page: 1,
      limit: 10,
      configKey: values.configKey as string | undefined,
      configName: values.configName as string | undefined,
      configType: values.configType as ConfigType | undefined,
      configGroup: group,
      isEnabled:
        values.isEnabled === 'true' ? true : values.isEnabled === 'false' ? false : undefined,
    });
  };

  // 删除配置
  const handleDeleteConfig = (id: number) => {
    deleteConfigMutation.mutate(id);
    // ⚠️ 不需要手动 Modal.confirm，Service 层已配置 confirmConfig
  };

  // 切换分组Tab
  const handleGroupChange = (group: string) => {
    setActiveGroup(group as ConfigGroup | 'all');
    setConfigParams({
      ...configParams,
      page: 1,
      configGroup: group === 'all' ? undefined : (group as ConfigGroup),
    });
  };

  // 打开创建配置弹窗
  const handleCreateConfig = () => {
    setCurrentConfig(null);
    setConfigFormVisible(true);
  };

  // 打开编辑配置弹窗
  const handleEditConfig = (config: SystemConfig) => {
    setCurrentConfig(config);
    setConfigFormVisible(true);
  };

  // 配置Form成功回调
  const handleConfigFormSuccess = () => {
    setConfigFormVisible(false);
    setCurrentConfig(null);
  };

  // 配置表格列
  const configColumns: ColumnsType<SystemConfig> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '配置键名',
      dataIndex: 'configKey',
      width: 200,
      render: (text: string) => <code className="text-sm">{text}</code>,
    },
    {
      title: '配置名称',
      dataIndex: 'configName',
      width: 150,
    },
    {
      title: '配置值',
      dataIndex: 'configValue',
      ellipsis: true,
      render: (text: string) => <span className="text-gray-600">{text || '-'}</span>,
    },
    {
      title: '类型',
      dataIndex: 'configType',
      width: 100,
      render: (type: ConfigType) => {
        const colorMap: Record<ConfigType, string> = {
          text: 'default',
          number: 'blue',
          boolean: 'green',
          json: 'purple',
          array: 'orange',
        };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      },
    },
    {
      title: '分组',
      dataIndex: 'configGroup',
      width: 120,
      render: (group: ConfigGroup) => {
        const nameMap: Record<ConfigGroup, string> = {
          system: '系统配置',
          business: '业务配置',
          security: '安全配置',
          third_party: '第三方配置',
          other: '其他',
        };
        return <Tag>{nameMap[group]}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      width: 100,
      render: (isEnabled: boolean) => <EnabledBadge enabled={isEnabled} />,
    },
    {
      title: '系统内置',
      dataIndex: 'isSystem',
      width: 100,
      render: (isSystem: boolean) => (isSystem ? <Tag color="gold">系统</Tag> : <span>-</span>),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: unknown, record: SystemConfig) => (
        <TableActions
          actions={[
            {
              label: '编辑',
              icon: <EditOutlined />,
              onClick: () => handleEditConfig(record),
              permission: 'config:update',
            },
            {
              label: '切换状态',
              onClick: () => toggleConfigMutation.mutate(record.id),
              permission: 'config:update',
            },
            {
              label: '删除',
              icon: <DeleteOutlined />,
              onClick: () => handleDeleteConfig(record.id),
              danger: true,
              permission: 'config:delete',
              disabled: record.isSystem, // 系统配置不可删除
            },
          ]}
        />
      ),
    },
  ];

  return (
    <PageWrap
      title="系统配置"
      titleRight={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateConfig}>
          新建配置项
        </Button>
      }
    >
      <Card>
        <Tabs
          activeKey={activeGroup}
          onChange={handleGroupChange}
          items={[
            { key: 'all', label: '全部' },
            { key: 'system', label: '系统配置' },
            { key: 'business', label: '业务配置' },
            { key: 'security', label: '安全配置' },
            { key: 'third_party', label: '第三方配置' },
            { key: 'other', label: '其他' },
          ]}
        />

        <SearchForm onSearch={handleConfigSearch}>
          <Form.Item name="configKey" label="配置键名">
            <Input placeholder="请输入配置键名" />
          </Form.Item>

          <Form.Item name="configName" label="配置名称">
            <Input placeholder="请输入配置名称" />
          </Form.Item>

          <Form.Item name="configType" label="配置类型">
            <Select
              placeholder="请选择配置类型"
              options={[
                { label: '全部', value: '' },
                { label: 'text', value: 'text' },
                { label: 'number', value: 'number' },
                { label: 'boolean', value: 'boolean' },
                { label: 'json', value: 'json' },
                { label: 'array', value: 'array' },
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

        <Table
          columns={configColumns}
          dataSource={(configData as SystemConfigListResponse | undefined)?.items || []}
          rowKey="id"
          loading={configLoading}
          pagination={{
            current: configParams.page,
            pageSize: configParams.limit,
            total: (configData as SystemConfigListResponse | undefined)?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, limit) => setConfigParams({ ...configParams, page, limit }),
          }}
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* 配置Form */}
      <ConfigForm
        visible={configFormVisible}
        config={currentConfig}
        onCancel={() => setConfigFormVisible(false)}
        onSuccess={handleConfigFormSuccess}
      />
    </PageWrap>
  );
}
