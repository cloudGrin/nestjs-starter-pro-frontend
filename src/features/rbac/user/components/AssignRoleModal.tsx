/**
 * 分配角色弹窗组件
 */

import { useEffect, useState } from 'react';
import { Modal, Transfer } from 'antd';
import type { TransferProps } from 'antd';
import type { User } from '@/shared/types/user.types';
import { useActiveRoles } from '@/features/rbac/role/hooks/useRoles';
import { useAssignRoles } from '../hooks/useUsers';
import { useApp } from '@/shared/hooks';

interface AssignRoleModalProps {
  visible: boolean;
  user: User | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface RoleTransferItem {
  key: string;
  title: string;
  description: string;
}

/**
 * 分配角色弹窗组件
 * 使用Transfer组件实现角色的分配和移除
 */
export function AssignRoleModal({
  visible,
  user,
  onCancel,
  onSuccess,
}: AssignRoleModalProps) {
  const { message } = useApp();

  // 获取所有活跃角色
  const { data: roles } = useActiveRoles();

  // 分配角色Mutation
  const assignRoles = useAssignRoles();

  // Transfer组件的数据源
  const [dataSource, setDataSource] = useState<RoleTransferItem[]>([]);

  // Transfer组件选中的角色ID列表
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  // 初始化数据源和已选角色
  useEffect(() => {
    if (roles && user) {
      // 构建Transfer数据源
      const items: RoleTransferItem[] = roles.map((role) => ({
        key: String(role.id),
        title: role.name,
        description: role.description || role.code,
      }));
      setDataSource(items);

      // 设置已分配的角色
      const assignedRoleIds = user.roles.map((r) => String(r.id));
      setTargetKeys(assignedRoleIds);
    }
  }, [roles, user]);

  // 处理Transfer变化
  const handleChange: TransferProps['onChange'] = (newTargetKeys) => {
    setTargetKeys(newTargetKeys as string[]);
  };

  // 提交分配
  const handleOk = async () => {
    if (!user) return;

    try {
      // 将string[]转换为number[]
      const roleIds = targetKeys.map((key) => Number(key));

      await assignRoles.mutateAsync({ id: user.id, data: { roleIds } });
      // ⚠️ 不需要手动显示提示，Service 层已配置 successMessage
      onSuccess();
    } catch (error) {
      // 错误已经在Hooks中处理
      console.error('分配角色失败:', error);
    }
  };

  // 清理状态（Modal关闭后）
  const handleAfterClose = () => {
    setDataSource([]);
    setTargetKeys([]);
  };

  return (
    <Modal
      title={`分配角色 - ${user?.username || ''}`}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={assignRoles.isPending}
      width={700}
      afterClose={handleAfterClose}
    >
      <div style={{ marginTop: 24 }}>
        <Transfer
          dataSource={dataSource}
          titles={['可分配角色', '已分配角色']}
          targetKeys={targetKeys}
          onChange={handleChange}
          render={(item) => (
            <div>
              <div style={{ fontWeight: 500 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {item.description}
              </div>
            </div>
          )}
          listStyle={{
            width: 300,
            height: 400,
          }}
          showSearch
          filterOption={(inputValue, item) =>
            item.title.toLowerCase().includes(inputValue.toLowerCase()) ||
            item.description.toLowerCase().includes(inputValue.toLowerCase())
          }
        />

        <div style={{ marginTop: 16, color: '#666', fontSize: 12 }}>
          提示：将角色从左侧移动到右侧即可分配，从右侧移回左侧即可移除。
        </div>
      </div>
    </Modal>
  );
}
