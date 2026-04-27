import { useEffect } from 'react';
import { App, Button, Card, Form, Input, Select, Space, Tabs } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { PageWrap } from '@/shared/components';
import type { User } from '@/shared/types/user.types';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/auth.service';
import type { ChangePasswordDto, UpdateProfileDto } from '../types/auth.types';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&_-]+$/;

function profileToFormValues(profile: User): UpdateProfileDto {
  return {
    realName: profile.realName,
    nickname: profile.nickname,
    phone: profile.phone,
    gender: profile.gender,
    birthday: profile.birthday,
    address: profile.address,
    bio: profile.bio,
    avatar: profile.avatar,
  };
}

function normalizeProfile(values: UpdateProfileDto): UpdateProfileDto {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value === '' ? null : value])
  ) as UpdateProfileDto;
}

export function ProfilePage() {
  const [profileForm] = Form.useForm<UpdateProfileDto>();
  const [passwordForm] = Form.useForm<ChangePasswordDto>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const activeTab = searchParams.get('tab') === 'password' ? 'password' : 'profile';

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
  });

  useEffect(() => {
    if (!profile) return;

    profileForm.setFieldsValue(profileToFormValues(profile));
  }, [profile, profileForm]);

  const updateProfile = useMutation({
    mutationFn: (values: UpdateProfileDto) => authService.updateProfile(normalizeProfile(values)),
    onSuccess: (updatedUser) => {
      const nextUser = {
        ...currentUser,
        ...updatedUser,
        permissions: updatedUser.permissions ?? currentUser?.permissions,
        roleCode: updatedUser.roleCode ?? currentUser?.roleCode,
        isSuperAdmin: updatedUser.isSuperAdmin ?? currentUser?.isSuperAdmin,
      };

      setUser(nextUser);
      queryClient.setQueryData(['profile'], updatedUser);
      message.success('个人资料已更新');
    },
  });

  const changePassword = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      passwordForm.resetFields();
    },
  });

  const handleTabChange = (key: string) => {
    setSearchParams(key === 'password' ? { tab: 'password' } : {});
  };

  const handleResetProfile = () => {
    if (!profile) {
      profileForm.resetFields();
      return;
    }

    profileForm.setFieldsValue(profileToFormValues(profile));
  };

  return (
    <PageWrap title="个人设置">
      <Card loading={isLoading}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: 'profile',
              label: '个人资料',
              children: (
                <Form
                  form={profileForm}
                  layout="vertical"
                  className="max-w-3xl"
                  onFinish={(values) => updateProfile.mutate(values)}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Form.Item label="真实姓名" name="realName">
                      <Input maxLength={50} placeholder="请输入真实姓名" />
                    </Form.Item>
                    <Form.Item label="昵称" name="nickname">
                      <Input maxLength={50} placeholder="请输入昵称" />
                    </Form.Item>
                    <Form.Item label="手机号" name="phone">
                      <Input placeholder="请输入中国大陆手机号" />
                    </Form.Item>
                    <Form.Item label="性别" name="gender">
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
                    <Form.Item label="生日" name="birthday">
                      <Input type="date" />
                    </Form.Item>
                    <Form.Item label="头像 URL" name="avatar">
                      <Input maxLength={255} placeholder="请输入头像 URL" />
                    </Form.Item>
                  </div>

                  <Form.Item label="地址" name="address">
                    <Input maxLength={255} placeholder="请输入地址" />
                  </Form.Item>
                  <Form.Item label="个人简介" name="bio">
                    <Input.TextArea rows={4} maxLength={500} showCount placeholder="请输入个人简介" />
                  </Form.Item>

                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={updateProfile.isPending}
                    >
                      保存资料
                    </Button>
                    <Button onClick={handleResetProfile}>重置</Button>
                  </Space>
                </Form>
              ),
            },
            {
              key: 'password',
              label: '修改密码',
              children: (
                <Form
                  form={passwordForm}
                  layout="vertical"
                  className="max-w-xl"
                  onFinish={(values) => changePassword.mutate(values)}
                >
                  <Form.Item
                    label="当前密码"
                    name="oldPassword"
                    rules={[{ required: true, message: '请输入当前密码' }]}
                  >
                    <Input.Password autoComplete="current-password" />
                  </Form.Item>
                  <Form.Item
                    label="新密码"
                    name="newPassword"
                    rules={[
                      { required: true, message: '请输入新密码' },
                      { min: 6, max: 50, message: '密码长度为6-50个字符' },
                      {
                        pattern: passwordPattern,
                        message: '密码必须包含大小写字母和数字',
                      },
                    ]}
                  >
                    <Input.Password autoComplete="new-password" />
                  </Form.Item>
                  <Form.Item
                    label="确认新密码"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: '请确认新密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('两次输入的新密码不一致'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password autoComplete="new-password" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={changePassword.isPending}>
                    修改密码
                  </Button>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </PageWrap>
  );
}
