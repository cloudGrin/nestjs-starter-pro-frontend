/**
 * 用户搜索表单组件
 */

import { Form, Input, Select } from 'antd';
import { SearchForm } from '@/shared/components';
import type { QueryUserDto } from '../types/user.types';

interface UserSearchFormProps {
  onSearch: (values: Partial<QueryUserDto>) => void;
  onReset?: () => void;
}

export function UserSearchForm({ onSearch, onReset }: UserSearchFormProps) {
  return (
    <SearchForm onSearch={onSearch} onReset={onReset}>
      <Form.Item name="username" label="用户名">
        <Input placeholder="请输入用户名" allowClear />
      </Form.Item>
      <Form.Item name="email" label="邮箱">
        <Input placeholder="请输入邮箱" allowClear />
      </Form.Item>
      <Form.Item name="realName" label="真实姓名">
        <Input placeholder="请输入真实姓名" allowClear />
      </Form.Item>
      <Form.Item name="phone" label="手机号">
        <Input placeholder="请输入手机号" allowClear />
      </Form.Item>
      <Form.Item name="status" label="状态">
        <Select
          allowClear
          placeholder="请选择状态"
          options={[
            { label: '正常', value: 'active' },
            { label: '未激活', value: 'inactive' },
            { label: '禁用', value: 'disabled' },
            { label: '锁定', value: 'locked' },
          ]}
        />
      </Form.Item>
      <Form.Item name="gender" label="性别">
        <Select
          allowClear
          placeholder="请选择性别"
          options={[
            { label: '男', value: 'male' },
            { label: '女', value: 'female' },
            { label: '未知', value: 'unknown' },
          ]}
        />
      </Form.Item>
    </SearchForm>
  );
}
