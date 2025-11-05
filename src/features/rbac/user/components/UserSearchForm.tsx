/**
 * 用户搜索表单组件
 */

import { Form, Input } from 'antd';
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
    </SearchForm>
  );
}
