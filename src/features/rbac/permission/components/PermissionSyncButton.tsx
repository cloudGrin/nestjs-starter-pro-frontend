/**
 * 权限同步按钮组件
 * 调用后端API扫描权限装饰器并同步到数据库
 */

import { Button } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { PermissionGuard } from '@/shared/components/auth/PermissionGuard';
import { useSyncPermissions } from '../hooks/usePermissions';

export function PermissionSyncButton() {
  const { mutate: syncPermissions, isPending } = useSyncPermissions();

  const handleSync = () => {
    syncPermissions();
  };

  return (
    <PermissionGuard permissions={['permission:sync']}>
      <Button
        type="primary"
        icon={<SyncOutlined spin={isPending} />}
        loading={isPending}
        onClick={handleSync}
      >
        同步权限
      </Button>
    </PermissionGuard>
  );
}
