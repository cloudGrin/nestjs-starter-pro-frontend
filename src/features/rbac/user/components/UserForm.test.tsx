import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { UserForm } from './UserForm';
import { createMockUser, renderWithProviders, userEvent } from '@/test/test-utils';

const hookMocks = vi.hoisted(() => ({
  createUser: { mutateAsync: vi.fn(), isPending: false },
  updateUser: { mutateAsync: vi.fn(), isPending: false },
  updateNotificationSettings: { mutateAsync: vi.fn(), isPending: false },
  notificationSettings: {
    data: {
      userId: 9,
      barkKey: 'old-bark-key',
      feishuUserId: 'ou_old',
    },
    isLoading: false,
    isError: false,
  },
}));

vi.mock('../hooks/useUsers', () => ({
  useCreateUser: () => hookMocks.createUser,
  useUpdateUser: () => hookMocks.updateUser,
  useUserNotificationSettings: () => hookMocks.notificationSettings,
  useUpdateUserNotificationSettings: () => hookMocks.updateNotificationSettings,
}));

describe('UserForm notification settings', () => {
  let getComputedStyleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    hookMocks.notificationSettings.data = {
      userId: 9,
      barkKey: 'old-bark-key',
      feishuUserId: 'ou_old',
    };
    hookMocks.notificationSettings.isLoading = false;
    hookMocks.notificationSettings.isError = false;
    getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          getPropertyValue: () => '',
        }) as CSSStyleDeclaration
    );
  });

  afterEach(() => {
    getComputedStyleSpy.mockRestore();
  });

  it('submits complete profile fields when creating a user', async () => {
    renderWithProviders(<UserForm visible user={null} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    await userEvent.type(
      screen.getByPlaceholderText('请输入用户名（字母、数字、下划线或连字符）'),
      'newuser'
    );
    await userEvent.type(screen.getByPlaceholderText('请输入邮箱'), 'new@example.com');
    await userEvent.type(
      screen.getByPlaceholderText('请输入密码（包含大小写字母和数字）'),
      'P@ssw0rd123'
    );
    await userEvent.type(screen.getByLabelText('真实姓名'), '张三');
    await userEvent.type(screen.getByPlaceholderText('请输入昵称（可选）'), '三三');
    await userEvent.type(screen.getByLabelText('手机号'), '+8613800138000');
    await userEvent.click(screen.getByLabelText('性别'));
    await userEvent.click(await screen.findByText('男'));
    await userEvent.type(screen.getByLabelText('生日'), '1990-01-02');
    await userEvent.type(screen.getByLabelText('头像 URL'), 'https://example.com/avatar.png');
    await userEvent.type(screen.getByLabelText('地址'), '上海市浦东新区');
    await userEvent.type(screen.getByLabelText('个人简介'), '家庭管理员');

    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(hookMocks.createUser.mutateAsync).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password: 'P@ssw0rd123',
        realName: '张三',
        nickname: '三三',
        phone: '+8613800138000',
        gender: 'male',
        birthday: '1990-01-02',
        avatar: 'https://example.com/avatar.png',
        address: '上海市浦东新区',
        bio: '家庭管理员',
        status: 'active',
      });
    });
  });

  it('loads and saves complete profile fields in edit mode', async () => {
    const user = createMockUser({
      id: 9,
      username: 'task-user',
      email: 'task@example.com',
      realName: '李四',
      nickname: '小四',
      phone: '+8613800138001',
      gender: 'female',
      birthday: '1991-03-04',
      avatar: 'https://example.com/old.png',
      address: '北京市朝阳区',
      bio: '旧简介',
      status: 'active',
    });

    renderWithProviders(<UserForm visible user={user} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByLabelText('真实姓名')).toHaveValue('李四');
    expect(screen.getByLabelText('手机号')).toHaveValue('+8613800138001');
    expect(screen.getByLabelText('生日')).toHaveValue('1991-03-04');
    expect(screen.getByLabelText('头像 URL')).toHaveValue('https://example.com/old.png');
    expect(screen.getByLabelText('地址')).toHaveValue('北京市朝阳区');
    expect(screen.getByLabelText('个人简介')).toHaveValue('旧简介');

    await userEvent.clear(screen.getByLabelText('真实姓名'));
    await userEvent.type(screen.getByLabelText('真实姓名'), '李四新');
    await userEvent.clear(screen.getByLabelText('手机号'));
    await userEvent.type(screen.getByLabelText('手机号'), '+8613800138002');
    await userEvent.clear(screen.getByLabelText('生日'));
    await userEvent.type(screen.getByLabelText('生日'), '1992-05-06');
    await userEvent.clear(screen.getByLabelText('地址'));
    await userEvent.type(screen.getByLabelText('地址'), '深圳市南山区');
    await userEvent.clear(screen.getByLabelText('个人简介'));
    await userEvent.type(screen.getByLabelText('个人简介'), '新简介');
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(hookMocks.updateUser.mutateAsync).toHaveBeenCalledWith({
        id: 9,
        silent: true,
        data: expect.objectContaining({
          email: 'task@example.com',
          realName: '李四新',
          nickname: '小四',
          phone: '+8613800138002',
          gender: 'female',
          birthday: '1992-05-06',
          avatar: 'https://example.com/old.png',
          address: '深圳市南山区',
          bio: '新简介',
          status: 'active',
        }),
      });
    });
  });

  it('sends null when nullable profile fields are cleared', async () => {
    const user = createMockUser({
      id: 9,
      username: 'task-user',
      email: 'task@example.com',
      realName: '李四',
      nickname: '小四',
      phone: '+8613800138001',
      birthday: '1991-03-04',
      avatar: 'https://example.com/old.png',
      address: '北京市朝阳区',
      bio: '旧简介',
      status: 'active',
    });

    renderWithProviders(<UserForm visible user={user} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    await userEvent.clear(screen.getByLabelText('真实姓名'));
    await userEvent.clear(screen.getByPlaceholderText('请输入昵称（可选）'));
    await userEvent.clear(screen.getByLabelText('手机号'));
    await userEvent.clear(screen.getByLabelText('生日'));
    await userEvent.clear(screen.getByLabelText('头像 URL'));
    await userEvent.clear(screen.getByLabelText('地址'));
    await userEvent.clear(screen.getByLabelText('个人简介'));
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(hookMocks.updateUser.mutateAsync).toHaveBeenCalledWith({
        id: 9,
        silent: true,
        data: expect.objectContaining({
          realName: null,
          nickname: null,
          phone: null,
          birthday: null,
          avatar: null,
          address: null,
          bio: null,
        }),
      });
    });
  });

  it('loads and saves admin managed user notification bindings in edit mode', async () => {
    const user = createMockUser({ id: 9, username: 'task-user', email: 'task@example.com' });

    renderWithProviders(<UserForm visible user={user} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    const barkKeyInput = await screen.findByLabelText('Bark Key');
    const feishuUserIdInput = screen.getByLabelText('飞书 user_id');

    expect(barkKeyInput).toHaveValue('old-bark-key');
    expect(feishuUserIdInput).toHaveValue('ou_old');

    await userEvent.clear(barkKeyInput);
    await userEvent.type(barkKeyInput, 'new-bark-key');
    await userEvent.clear(feishuUserIdInput);
    await userEvent.type(feishuUserIdInput, 'ou_new');
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(hookMocks.updateUser.mutateAsync).toHaveBeenCalledWith({
        id: 9,
        data: expect.any(Object),
        silent: true,
      });
      expect(hookMocks.updateNotificationSettings.mutateAsync).toHaveBeenCalledWith({
        id: 9,
        silent: true,
        data: {
          barkKey: 'new-bark-key',
          feishuUserId: 'ou_new',
        },
      });
    });
  });

  it('blocks saving while notification bindings are still loading', async () => {
    hookMocks.notificationSettings.data = undefined;
    hookMocks.notificationSettings.isLoading = true;
    const user = createMockUser({ id: 9, username: 'task-user', email: 'task@example.com' });

    renderWithProviders(<UserForm visible user={user} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    const okButton = screen.getByRole('button', { name: /OK/ });
    expect(okButton).toBeDisabled();

    await userEvent.click(okButton);

    expect(hookMocks.updateUser.mutateAsync).not.toHaveBeenCalled();
    expect(hookMocks.updateNotificationSettings.mutateAsync).not.toHaveBeenCalled();
  });

  it('does not reset edited user fields when notification bindings arrive later', async () => {
    hookMocks.notificationSettings.data = undefined;
    const user = createMockUser({ id: 9, username: 'task-user', email: 'task@example.com' });

    const { rerender } = renderWithProviders(
      <UserForm visible user={user} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    const emailInput = screen.getByDisplayValue('task@example.com');
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'changed@example.com');

    hookMocks.notificationSettings.data = {
      userId: 9,
      barkKey: 'loaded-bark-key',
      feishuUserId: 'ou_loaded',
    };
    rerender(<UserForm visible user={user} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    expect(emailInput).toHaveValue('changed@example.com');
    expect(screen.getByLabelText('Bark Key')).toHaveValue('loaded-bark-key');
    expect(screen.getByLabelText('飞书 user_id')).toHaveValue('ou_loaded');
  });
});
