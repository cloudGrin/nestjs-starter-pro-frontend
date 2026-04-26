/**
 * API认证管理页面
 */
import { useState } from 'react';
import { Modal } from 'antd';
import { ApiAppList } from '../components/ApiAppList';
import { ApiKeyList } from '../components/ApiKeyList';
import type { ApiApp } from '../types/api-auth.types';

export function ApiAuthPage() {
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);

  /**
   * 打开应用详情Modal
   */
  const handleViewKeys = (app: ApiApp) => {
    setSelectedAppId(app.id);
  };

  /**
   * 关闭应用详情Modal
   */
  const closeAppDetail = () => {
    setSelectedAppId(null);
  };

  return (
    <div>
      {/* 应用列表 */}
      <ApiAppList onViewKeys={handleViewKeys} />

      {/* 应用详情Modal */}
      <Modal
        title="API应用详情"
        open={!!selectedAppId}
        onCancel={closeAppDetail}
        footer={null}
        width={1200}
        destroyOnHidden
      >
        {selectedAppId && <ApiKeyList appId={selectedAppId} />}
      </Modal>
    </div>
  );
}
