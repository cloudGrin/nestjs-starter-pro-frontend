import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent } from '@/test/test-utils';
import { UserSearchForm } from './UserSearchForm';

describe('UserSearchForm', () => {
  it('submits basic and advanced user filters', async () => {
    const onSearch = vi.fn();

    renderWithProviders(<UserSearchForm onSearch={onSearch} />);

    await userEvent.type(screen.getByPlaceholderText('请输入用户名'), 'admin');
    await userEvent.type(screen.getByPlaceholderText('请输入邮箱'), 'admin@example.com');
    await userEvent.type(screen.getByPlaceholderText('请输入真实姓名'), '管理员');
    await userEvent.click(screen.getByRole('button', { name: /展开/ }));
    await userEvent.type(await screen.findByPlaceholderText('请输入手机号'), '+8613800138000');
    await userEvent.click(screen.getByLabelText('状态'));
    await userEvent.click(await screen.findByText('正常'));
    await userEvent.click(screen.getByLabelText('性别'));
    await userEvent.click(await screen.findByText('男'));
    await userEvent.click(screen.getByRole('button', { name: /查询/ }));

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({
        username: 'admin',
        email: 'admin@example.com',
        realName: '管理员',
        phone: '+8613800138000',
        status: 'active',
        gender: 'male',
      });
    });
  });

  it('delegates reset to the page level handler', async () => {
    const onSearch = vi.fn();
    const onReset = vi.fn();

    renderWithProviders(<UserSearchForm onSearch={onSearch} onReset={onReset} />);

    await userEvent.type(screen.getByPlaceholderText('请输入用户名'), 'admin');
    await userEvent.click(screen.getByRole('button', { name: /重置/ }));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onSearch).not.toHaveBeenCalled();
  });
});
