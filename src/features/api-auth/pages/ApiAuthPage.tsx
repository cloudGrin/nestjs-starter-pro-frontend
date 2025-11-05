/**
 * API认证管理页面
 */
import { useState } from 'react';
import { Tabs, Modal } from 'antd';
import { ApiAppList } from '../components/ApiAppList';
import { ApiKeyList } from '../components/ApiKeyList';
import { ApiStatistics } from '../components/ApiStatistics';
import type { ApiApp } from '../types/api-auth.types';

export function ApiAuthPage() {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('1');

  /**
   * 打开应用详情Modal
   */
  const handleViewKeys = (app: ApiApp) => {
    setSelectedAppId(app.appId);
    setActiveTab('1');
  };

  /**
   * 关闭应用详情Modal
   */
  const closeAppDetail = () => {
    setSelectedAppId(null);
    setActiveTab('1');
  };

  return (
    <div>
      {/* 应用列表 */}
      <ApiAppList onViewKeys={handleViewKeys} />

      {/* 应用详情Modal（密钥+统计） */}
      <Modal
        title="API应用详情"
        open={!!selectedAppId}
        onCancel={closeAppDetail}
        footer={null}
        width={1200}
        destroyOnHidden
      >
        {selectedAppId && (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: '1',
                label: 'API密钥',
                children: <ApiKeyList appId={selectedAppId} />,
              },
              {
                key: '2',
                label: '使用统计',
                children: <ApiStatistics appId={selectedAppId} />,
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}
