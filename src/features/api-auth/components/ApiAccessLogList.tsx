import { useMemo, useState } from 'react';
import { Button, Input, InputNumber, Select, Space, Table, Tag, Tooltip, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useApiAccessLogs } from '../hooks/useApiApps';
import { formatDate } from '@/shared/utils';
import type { ApiAccessLog, ApiKey, QueryApiAccessLogDto } from '../types/api-auth.types';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface ApiAccessLogListProps {
  appId: number;
  keys: ApiKey[];
}

interface FilterDraft {
  keyId?: number;
  path?: string;
  statusCode?: number;
}

export function ApiAccessLogList({ appId, keys }: ApiAccessLogListProps) {
  const [draft, setDraft] = useState<FilterDraft>({});
  const [query, setQuery] = useState<QueryApiAccessLogDto>({ page: 1, limit: 10 });
  const { data, isLoading } = useApiAccessLogs(appId, query);

  const keyOptions = useMemo(
    () =>
      keys.map((key) => ({
        label: `${key.name} (${key.displayKey})`,
        value: key.id,
      })),
    [keys]
  );

  const applyFilters = () => {
    setQuery({
      page: 1,
      limit: query.limit ?? 10,
      keyId: draft.keyId,
      path: draft.path?.trim() || undefined,
      statusCode: draft.statusCode,
    });
  };

  const resetFilters = () => {
    setDraft({});
    setQuery({ page: 1, limit: query.limit ?? 10 });
  };

  const columns: ColumnsType<ApiAccessLog> = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 180,
      render: formatDate.full,
    },
    {
      title: '密钥',
      dataIndex: 'keyName',
      width: 220,
      render: (_, record) => {
        if (!record.keyId) {
          return <Text type="secondary">-</Text>;
        }

        return (
          <Space direction="vertical" size={0}>
            <Text>{record.keyName || `#${record.keyId}`}</Text>
            {record.keyPrefix && record.keySuffix && (
              <Text type="secondary" className="text-xs">
                {record.keyPrefix}_****{record.keySuffix}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: '请求',
      dataIndex: 'path',
      width: 360,
      render: (path: string, record) => (
        <Space>
          <Tag color="green">{record.method}</Tag>
          <Text code className="break-all">
            {path}
          </Text>
        </Space>
      ),
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      width: 100,
      render: (statusCode: number) => <Tag color={getStatusColor(statusCode)}>{statusCode}</Tag>,
    },
    {
      title: '耗时',
      dataIndex: 'durationMs',
      width: 100,
      render: (durationMs: number) => `${durationMs} ms`,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      width: 140,
      render: (ip?: string) => ip || '-',
    },
    {
      title: 'User Agent',
      dataIndex: 'userAgent',
      ellipsis: true,
      render: (userAgent?: string) =>
        userAgent ? (
          <Tooltip title={userAgent}>
            <Text>{userAgent}</Text>
          </Tooltip>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <div className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Text strong>详细访问日志</Text>
        <Space wrap>
          <Select
            value={draft.keyId}
            options={keyOptions}
            allowClear
            placeholder="按密钥筛选"
            className="w-64"
            onChange={(keyId) => setDraft((current) => ({ ...current, keyId }))}
          />
          <Input
            value={draft.path}
            allowClear
            placeholder="按路径筛选"
            className="w-64"
            onChange={(event) => setDraft((current) => ({ ...current, path: event.target.value }))}
            onPressEnter={applyFilters}
          />
          <InputNumber
            value={draft.statusCode}
            min={100}
            max={599}
            controls={false}
            placeholder="状态码"
            className="w-28"
            onChange={(statusCode) =>
              setDraft((current) => ({
                ...current,
                statusCode: typeof statusCode === 'number' ? statusCode : undefined,
              }))
            }
            onPressEnter={applyFilters}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={applyFilters}>
            筛选
          </Button>
          <Button icon={<ReloadOutlined />} onClick={resetFilters}>
            重置
          </Button>
        </Space>
      </div>

      <Table
        size="small"
        dataSource={data?.items || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1250 }}
        pagination={{
          current: data?.page || query.page || 1,
          pageSize: data?.pageSize || query.limit || 10,
          total: data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            setQuery((current) => ({
              ...current,
              page,
              limit: pageSize,
            }));
          },
        }}
      />
    </div>
  );
}

function getStatusColor(statusCode: number) {
  if (statusCode >= 500) {
    return 'red';
  }
  if (statusCode >= 400) {
    return 'orange';
  }
  if (statusCode >= 300) {
    return 'gold';
  }
  return 'green';
}
