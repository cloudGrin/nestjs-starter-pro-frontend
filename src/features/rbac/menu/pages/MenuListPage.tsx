/**
 * 菜单管理页面
 */

import { useState } from 'react';
import { Card, Button, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { MenuTree } from '../components/MenuTree';
import { MenuForm } from '../components/MenuForm';
import { PageWrap, PermissionGuard } from '@/shared/components';
import {
  useMenuTree,
  useCreateMenu,
  useUpdateMenu,
  useDeleteMenu,
  useMoveMenu,
} from '../hooks/useMenus';
import type { Menu, CreateMenuDto, UpdateMenuDto } from '../types/menu.types';

export function MenuListPage() {
  // 表单Modal状态
  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    menu?: Menu;
    parentId?: number | null;
  }>({
    open: false,
    mode: 'create',
  });

  // 获取菜单树
  const { data: menuTree, isLoading: treeLoading, refetch } = useMenuTree();

  // CRUD Mutations
  const { mutate: createMenu, isPending: creating } = useCreateMenu();
  const { mutate: updateMenu, isPending: updating } = useUpdateMenu();
  const { mutate: deleteMenu } = useDeleteMenu();
  const { mutate: moveMenu } = useMoveMenu();

  /**
   * 打开创建表单
   */
  const handleCreate = (parentId?: number) => {
    setFormModal({
      open: true,
      mode: 'create',
      parentId: parentId || null,
    });
  };

  /**
   * 打开编辑表单
   */
  const handleEdit = (menu: Menu) => {
    setFormModal({
      open: true,
      mode: 'edit',
      menu,
    });
  };

  /**
   * 表单提交
   */
  const handleFormSubmit = (data: CreateMenuDto | UpdateMenuDto) => {
    if (formModal.mode === 'create') {
      createMenu(data as CreateMenuDto, {
        onSuccess: () => {
          setFormModal({ open: false, mode: 'create' });
        },
      });
    } else if (formModal.mode === 'edit' && formModal.menu) {
      updateMenu(
        { id: formModal.menu.id, data: data as UpdateMenuDto },
        {
          onSuccess: () => {
            setFormModal({ open: false, mode: 'create' });
          },
        }
      );
    }
  };

  /**
   * 删除菜单
   */
  const handleDelete = (id: number) => {
    deleteMenu(id);
  };

  /**
   * 拖拽移动菜单
   */
  const handleDrop = (dragId: number, targetParentId: number | null) => {
    moveMenu({ id: dragId, targetParentId });
  };

  return (
    <PageWrap
      title="菜单管理"
      titleRight={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            刷新
          </Button>
          <PermissionGuard permissions={['menu:create']}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreate()}>
              创建顶级菜单
            </Button>
          </PermissionGuard>
        </Space>
      }
    >
      <Card className="shadow-sm dark:border-slate-700">
        <MenuTree
          treeData={menuTree}
          loading={treeLoading}
          onAdd={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDrop={handleDrop}
        />
      </Card>

      {/* 菜单表单Modal */}
      <MenuForm
        open={formModal.open}
        mode={formModal.mode}
        menu={formModal.menu}
        menuTree={menuTree}
        parentId={formModal.parentId}
        loading={creating || updating}
        onSubmit={handleFormSubmit}
        onCancel={() => setFormModal({ open: false, mode: 'create' })}
      />
    </PageWrap>
  );
}
