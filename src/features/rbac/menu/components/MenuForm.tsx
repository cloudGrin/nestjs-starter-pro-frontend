/**
 * 菜单表单组件（新建/编辑）
 */

import { useEffect } from 'react';
import { Form, Input, Select, Switch, InputNumber, TreeSelect, Modal } from 'antd';
import { IconSelector } from './IconSelector';
import { ComponentSelector } from './ComponentSelector';
import type { Menu, MenuTreeNode, CreateMenuDto, UpdateMenuDto } from '../types/menu.types';

const { TextArea } = Input;
const { Option } = Select;

interface TreeSelectNode {
  value: number;
  title: string;
  children?: TreeSelectNode[];
}

interface MenuFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  menu?: Menu;
  menuTree?: MenuTreeNode[];
  parentId?: number | null; // 创建子菜单时指定父菜单ID
  loading?: boolean;
  onSubmit: (data: CreateMenuDto | UpdateMenuDto) => void;
  onCancel: () => void;
}

export function MenuForm({
  open,
  mode,
  menu,
  menuTree = [],
  parentId,
  loading,
  onSubmit,
  onCancel,
}: MenuFormProps) {
  const [form] = Form.useForm();
  const menuType = Form.useWatch('type', form);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && menu) {
        form.setFieldsValue({
          name: menu.name,
          path: menu.path,
          type: menu.type,
          icon: menu.icon,
          component: menu.component,
          parentId: menu.parentId,
          sort: menu.sort,
          isActive: menu.isActive,
          isVisible: menu.isVisible,
          remark: menu.remark,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          type: 'menu',
          parentId: parentId || null,
          sort: 0,
          isActive: true,
          isVisible: true,
        });
      }
    }
  }, [open, mode, menu, parentId, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  /**
   * 将MenuTreeNode转换为TreeSelect DataNode
   * 过滤当前节点及其子节点（避免循环引用）
   */
  const convertToTreeSelectData = (nodes: MenuTreeNode[], excludeId?: number): TreeSelectNode[] => {
    return nodes
      .filter((node) => node.id !== excludeId)
      .map((node) => ({
        value: node.id,
        title: `${node.name} (${node.type === 'directory' ? '目录' : '菜单'})`,
        children: node.children ? convertToTreeSelectData(node.children, excludeId) : [],
      }));
  };

  const parentMenuOptions = convertToTreeSelectData(menuTree, menu?.id);

  return (
    <Modal
      title={mode === 'create' ? '创建菜单' : '编辑菜单'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={700}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          label="菜单名称"
          name="name"
          rules={[
            { required: true, message: '请输入菜单名称' },
            { min: 2, max: 50, message: '菜单名称长度为2-50个字符' },
          ]}
        >
          <Input placeholder="输入菜单名称（如：用户管理）" />
        </Form.Item>

        <Form.Item
          label="菜单类型"
          name="type"
          rules={[{ required: true, message: '请选择菜单类型' }]}
        >
          <Select placeholder="选择菜单类型">
            <Option value="directory">目录（有子菜单，不对应路由）</Option>
            <Option value="menu">菜单（对应具体页面）</Option>
          </Select>
        </Form.Item>

        <Form.Item label="父菜单" name="parentId">
          <TreeSelect
            treeData={parentMenuOptions}
            placeholder="选择父菜单（留空为顶级菜单）"
            allowClear
            treeDefaultExpandAll
          />
        </Form.Item>

        <Form.Item
          label="路由路径"
          name="path"
          rules={[
            {
              validator: (_, value?: string) => {
                if (menuType === 'menu' && !value?.trim()) {
                  return Promise.reject(new Error('菜单类型必须填写路由路径'));
                }
                return Promise.resolve();
              },
            },
            {
              pattern: /^\/[a-zA-Z0-9/_-]*$/,
              message: '路径必须以/开头，只能包含字母、数字、/、-、_',
            },
          ]}
        >
          <Input placeholder="输入路由路径（如：/system/users）" />
        </Form.Item>

        <Form.Item label="菜单图标" name="icon">
          <IconSelector placeholder="输入Ant Design图标名称（如：UserOutlined）" />
        </Form.Item>

        {menuType === 'menu' && (
          <Form.Item
            label="页面组件"
            name="component"
            preserve={false}
            rules={[{ required: menuType === 'menu', message: '菜单类型必须选择页面组件' }]}
            extra="自动扫描 features/[module]/pages/，并兼容文件模块 FileList 入口"
          >
            <ComponentSelector />
          </Form.Item>
        )}

        <Form.Item label="排序" name="sort">
          <InputNumber min={0} max={9999} placeholder="数字越小越靠前" style={{ width: '100%' }} />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="启用状态" name="isActive" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item label="显示菜单" name="isVisible" valuePropName="checked">
            <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
          </Form.Item>
        </div>

        <Form.Item label="备注" name="remark">
          <TextArea rows={3} placeholder="输入备注（可选）" maxLength={200} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}
