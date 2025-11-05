/**
 * 数据字典管理页面（主页面）
 *
 * 职责：
 * - Tab切换管理
 * - Modal状态管理（创建/编辑弹窗）
 *
 * 业务逻辑已拆分到：
 * - DictTypesPanel.tsx (字典类型面板)
 * - DictItemsPanel.tsx (字典项面板)
 */

import { useState } from 'react';
import { Card, Tabs } from 'antd';
import { PageWrap } from '@/shared/components';
import { DictTypesPanel } from '../components/DictTypesPanel';
import { DictItemsPanel } from '../components/DictItemsPanel';
import { DictTypeForm } from '../components/DictTypeForm';
import { DictItemForm } from '../components/DictItemForm';
import type { DictType, DictItem } from '../types/dict.types';

export function DictListPage() {
  const [activeTab, setActiveTab] = useState<'types' | 'items'>('types');

  // 字典类型Modal状态
  const [typeFormVisible, setTypeFormVisible] = useState(false);
  const [currentType, setCurrentType] = useState<DictType | null>(null);

  // 字典项Modal状态
  const [itemFormVisible, setItemFormVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<DictItem | null>(null);

  // 字典类型操作
  const handleCreateType = () => {
    setCurrentType(null);
    setTypeFormVisible(true);
  };

  const handleEditType = (type: DictType) => {
    setCurrentType(type);
    setTypeFormVisible(true);
  };

  const handleTypeFormSuccess = () => {
    setTypeFormVisible(false);
    setCurrentType(null);
  };

  // 字典项操作
  const handleCreateItem = () => {
    setCurrentItem(null);
    setItemFormVisible(true);
  };

  const handleEditItem = (item: DictItem) => {
    setCurrentItem(item);
    setItemFormVisible(true);
  };

  const handleItemFormSuccess = () => {
    setItemFormVisible(false);
    setCurrentItem(null);
  };

  return (
    <PageWrap title="数据字典">
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'types' | 'items')}
          items={[
            {
              key: 'types',
              label: '字典类型',
              children: <DictTypesPanel onEdit={handleEditType} onCreate={handleCreateType} />,
            },
            {
              key: 'items',
              label: '字典项',
              children: <DictItemsPanel onEdit={handleEditItem} onCreate={handleCreateItem} />,
            },
          ]}
        />
      </Card>

      {/* 字典类型表单弹窗 */}
      <DictTypeForm
        visible={typeFormVisible}
        dictType={currentType}
        onCancel={() => setTypeFormVisible(false)}
        onSuccess={handleTypeFormSuccess}
      />

      {/* 字典项表单弹窗 */}
      <DictItemForm
        visible={itemFormVisible}
        dictItem={currentItem}
        onCancel={() => setItemFormVisible(false)}
        onSuccess={handleItemFormSuccess}
      />
    </PageWrap>
  );
}
