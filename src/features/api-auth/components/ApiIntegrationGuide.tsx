import { Alert, Card, Space, Table, Tag, Typography } from 'antd';
import { useApiScopes } from '../hooks/useApiApps';
import { buildOpenApiCurlExample } from '../utils/apiIntegration';

const { Paragraph, Text, Title } = Typography;

export function ApiIntegrationGuide() {
  const { data: apiScopeGroups = [], isLoading } = useApiScopes();
  const curlExample = buildOpenApiCurlExample();
  const endpoints = apiScopeGroups.flatMap((group) =>
    (group.endpoints ?? []).map((endpoint) => ({
      key: `${endpoint.method}:${endpoint.path}:${endpoint.scope}`,
      method: endpoint.method,
      path: endpoint.path,
      scope: endpoint.scope,
      description: endpoint.description || endpoint.summary,
    }))
  );

  return (
    <Card className="mt-4" title="接入文档">
      <Space direction="vertical" size={16} className="w-full">
        <Alert
          type="info"
          showIcon
          message="开放 API 使用 API Key 鉴权"
          description={
            <span>
              请求时在 Header 中传入 <Text code>X-API-Key</Text>
              ，权限由应用和密钥的权限范围共同控制。
            </span>
          }
        />

        <div>
          <Title level={5}>调用示例</Title>
          <Paragraph
            copyable={{ text: curlExample }}
            className="overflow-auto rounded !bg-gray-200 p-3 text-xs !text-gray-900"
          >
            {curlExample}
          </Paragraph>
        </div>

        <div>
          <Title level={5}>可用接口</Title>
          <Table
            size="small"
            loading={isLoading}
            pagination={false}
            dataSource={endpoints}
            columns={[
              {
                title: '方法',
                dataIndex: 'method',
                width: 90,
                render: (method: string) => <Tag color="green">{method}</Tag>,
              },
              {
                title: '路径',
                dataIndex: 'path',
                render: (path: string) => <Text code>{path}</Text>,
              },
              {
                title: '权限范围',
                dataIndex: 'scope',
                width: 160,
                render: (scope: string) => <Tag color="blue">{scope}</Tag>,
              },
              {
                title: '说明',
                dataIndex: 'description',
              },
            ]}
          />
        </div>

        <Alert
          type="success"
          showIcon
          message="访问日志"
          description="在密钥管理里可以按密钥、路径和状态码筛选详细访问日志，用于排查接入问题。"
        />
      </Space>
    </Card>
  );
}
