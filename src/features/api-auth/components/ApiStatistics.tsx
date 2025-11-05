/**
 * API使用统计组件
 */
import { useState } from 'react';
import { Card, Row, Col, Statistic, Select, Spin, Empty } from 'antd';
import {
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useApiStatistics } from '../hooks/useApiApps';
import type { QueryStatisticsDto } from '../types/api-auth.types';

interface ApiStatisticsProps {
  appId: string;
}

export function ApiStatistics({ appId }: ApiStatisticsProps) {
  const [period, setPeriod] = useState<QueryStatisticsDto['period']>('day');

  // Hooks
  const { data: statistics, isLoading } = useApiStatistics(appId, { period });

  /**
   * 计算成功率
   */
  const getSuccessRate = () => {
    if (!statistics || statistics.totalCalls === 0) return 0;
    return ((statistics.successCalls / statistics.totalCalls) * 100).toFixed(2);
  };

  /**
   * 计算错误率
   */
  const getErrorRate = () => {
    if (!statistics || statistics.totalCalls === 0) return 0;
    return ((statistics.errorCalls / statistics.totalCalls) * 100).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Spin size="large" />
        <div className="text-gray-500">加载统计数据...</div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <Empty
        description="暂无统计数据"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="py-12"
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <span className="text-base font-semibold">使用统计</span>
        <Select
          value={period}
          onChange={setPeriod}
          style={{ width: 120 }}
          options={[
            { label: '按小时', value: 'hour' },
            { label: '按天', value: 'day' },
            { label: '按月', value: 'month' },
          ]}
        />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总调用次数"
              value={statistics.totalCalls}
              prefix={<ApiOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="成功调用"
              value={statistics.successCalls}
              suffix={`(${getSuccessRate()}%)`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="失败调用"
              value={statistics.errorCalls}
              suffix={`(${getErrorRate()}%)`}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均响应时间"
              value={statistics.avgResponseTime}
              suffix="ms"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 数据列表 */}
      {statistics.data && statistics.data.length > 0 && (
        <Card title="详细数据" className="mt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    总调用
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    成功
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    失败
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    成功率
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics.data.map((item, index) => {
                  const successRate =
                    item.calls > 0 ? ((item.success / item.calls) * 100).toFixed(2) : '0';
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.calls.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {item.success.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {item.error.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {successRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
