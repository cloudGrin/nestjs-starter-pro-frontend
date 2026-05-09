/**
 * 用户表单组件（创建/编辑用户）
 */

import { useEffect } from 'react';
import { App, Modal, Form, Input, Select, Divider } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import type { User, UserStatus } from '@/shared/types/user.types';
import type {
  CreateUserDto,
  UpdateUserDto,
  UserNotificationSettings,
  UpdateUserNotificationSettingsDto,
} from '../types/user.types';
import {
  useCreateUser,
  useUpdateUser,
  useUserNotificationSettings,
  useUpdateUserNotificationSettings,
} from '../hooks/useUsers';

interface UserFormProps {
  visible: boolean;
  user?: User | null; // null表示创建模式，User表示编辑模式
  onCancel: () => void;
  onSuccess: () => void;
}

interface UserFormData {
  username: string;
  email: string;
  password?: string;
  realName?: string;
  nickname?: string;
  phone?: string;
  gender?: User['gender'];
  birthday?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  status: UserStatus;
  barkKey?: string;
  feishuUserId?: string;
}

function notificationSettingsToFormValues(
  settings?: UserNotificationSettings | null
): Pick<UserFormData, 'barkKey' | 'feishuUserId'> {
  return {
    barkKey: settings?.barkKey ?? '',
    feishuUserId: settings?.feishuUserId ?? '',
  };
}

function normalizeOptionalText(value?: string | null) {
  const text = value?.trim();
  return text ? text : null;
}

function toNotificationSettingsPayload(data: UserFormData): UpdateUserNotificationSettingsDto {
  return {
    barkKey: normalizeOptionalText(data.barkKey),
    feishuUserId: normalizeOptionalText(data.feishuUserId),
  };
}

function toUserProfilePayload(data: UserFormData) {
  return {
    realName: normalizeOptionalText(data.realName),
    nickname: normalizeOptionalText(data.nickname),
    phone: normalizeOptionalText(data.phone),
    gender: data.gender ?? 'unknown',
    birthday: normalizeOptionalText(data.birthday),
    address: normalizeOptionalText(data.address),
    bio: normalizeOptionalText(data.bio),
    avatar: normalizeOptionalText(data.avatar),
  };
}

/**
 * 用户表单组件
 * 支持创建和编辑模式
 */
export function UserForm({ visible, user, onCancel, onSuccess }: UserFormProps) {
  const isEditMode = !!user;
  const { message } = App.useApp();

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<UserFormData>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      realName: '',
      nickname: '',
      phone: '',
      gender: 'unknown',
      birthday: '',
      address: '',
      bio: '',
      avatar: '',
      status: 'active' as UserStatus,
      barkKey: '',
      feishuUserId: '',
    },
  });

  // 创建/更新Mutation
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const userId = user?.id;
  const notificationSettingsQuery = useUserNotificationSettings(userId, visible && isEditMode);
  const updateNotificationSettings = useUpdateUserNotificationSettings();
  const isNotificationSettingsLoading = isEditMode && notificationSettingsQuery.isLoading;
  const isNotificationSettingsUnavailable =
    isNotificationSettingsLoading || (isEditMode && notificationSettingsQuery.isError);

  // 编辑模式：填充表单数据
  useEffect(() => {
    if (!visible) {
      return;
    }

    if (user) {
      reset({
        username: user.username,
        email: user.email,
        realName: user.realName || '',
        nickname: user.nickname || '',
        phone: user.phone || '',
        gender: user.gender || 'unknown',
        birthday: user.birthday || '',
        address: user.address || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        status: user.status,
        barkKey: '',
        feishuUserId: '',
      });
    } else {
      reset({
        username: '',
        email: '',
        password: '',
        realName: '',
        nickname: '',
        phone: '',
        gender: 'unknown',
        birthday: '',
        address: '',
        bio: '',
        avatar: '',
        status: 'active' as UserStatus,
        barkKey: '',
        feishuUserId: '',
      });
    }
  }, [visible, user, reset]);

  useEffect(() => {
    if (!user || !notificationSettingsQuery.data) {
      return;
    }

    const values = notificationSettingsToFormValues(notificationSettingsQuery.data);
    if (!dirtyFields.barkKey) {
      setValue('barkKey', values.barkKey, { shouldDirty: false });
    }
    if (!dirtyFields.feishuUserId) {
      setValue('feishuUserId', values.feishuUserId, { shouldDirty: false });
    }
  }, [
    dirtyFields.barkKey,
    dirtyFields.feishuUserId,
    notificationSettingsQuery.data,
    setValue,
    user,
  ]);

  // 提交表单
  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditMode) {
        if (isNotificationSettingsUnavailable) {
          return;
        }

        // 编辑模式
        const updateDto: UpdateUserDto = {
          email: data.email,
          ...toUserProfilePayload(data),
          status: data.status,
        };
        await updateUser.mutateAsync({ id: user.id, data: updateDto, silent: true });
        await updateNotificationSettings.mutateAsync({
          id: user.id,
          data: toNotificationSettingsPayload(data),
          silent: true,
        });
        message.success?.('更新用户成功');
      } else {
        // 创建模式
        if (!data.password) {
          message.error('密码不能为空');
          return;
        }
        const createDto: CreateUserDto = {
          username: data.username,
          email: data.email,
          password: data.password,
          ...toUserProfilePayload(data),
          status: data.status,
        };
        await createUser.mutateAsync(createDto);
      }

      onSuccess();
      reset();
    } catch (error) {
      // 错误已经在Hooks中处理
      console.error('提交失败:', error);
    }
  };

  return (
    <Modal
      title={isEditMode ? '编辑用户' : '创建用户'}
      open={visible}
      onOk={handleSubmit(onSubmit)}
      onCancel={onCancel}
      confirmLoading={
        createUser.isPending ||
        updateUser.isPending ||
        updateNotificationSettings.isPending ||
        isNotificationSettingsLoading
      }
      okButtonProps={{ disabled: isNotificationSettingsUnavailable }}
      width={720}
      afterClose={() => reset()}
    >
      <Form layout="vertical" style={{ marginTop: 24 }}>
        {/* 用户名 */}
        <Form.Item
          label="用户名"
          validateStatus={errors.username ? 'error' : ''}
          help={errors.username?.message}
          required
        >
          <Controller
            name="username"
            control={control}
            rules={{
              required: '用户名不能为空',
              minLength: { value: 3, message: '用户名至少3个字符' },
              maxLength: { value: 50, message: '用户名最多50个字符' },
              pattern: {
                value: /^[a-zA-Z0-9_-]+$/,
                message: '用户名只能包含字母、数字、下划线和连字符',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="请输入用户名（字母、数字、下划线或连字符）"
                disabled={isEditMode} // 编辑模式禁用
              />
            )}
          />
        </Form.Item>

        {/* 邮箱 */}
        <Form.Item
          label="邮箱"
          validateStatus={errors.email ? 'error' : ''}
          help={errors.email?.message}
          required
        >
          <Controller
            name="email"
            control={control}
            rules={{
              required: '邮箱不能为空',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: '请输入有效的邮箱地址',
              },
            }}
            render={({ field }) => <Input {...field} placeholder="请输入邮箱" type="email" />}
          />
        </Form.Item>

        {/* 密码（创建时必填，编辑时选填） */}
        {!isEditMode && (
          <Form.Item
            label="密码"
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
            required
          >
            <Controller
              name="password"
              control={control}
              rules={{
                required: '密码不能为空',
                minLength: { value: 6, message: '密码至少6个字符' },
                maxLength: { value: 50, message: '密码最多50个字符' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&_-]+$/,
                  message: '密码必须包含大小写字母和数字',
                },
              }}
              render={({ field }) => (
                <Input.Password {...field} placeholder="请输入密码（包含大小写字母和数字）" />
              )}
            />
          </Form.Item>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 真实姓名 */}
          <Form.Item
            label="真实姓名"
            htmlFor="realName"
            validateStatus={errors.realName ? 'error' : ''}
            help={errors.realName?.message}
          >
            <Controller
              name="realName"
              control={control}
              rules={{ maxLength: { value: 50, message: '真实姓名最多50个字符' } }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="realName"
                  value={field.value || ''}
                  maxLength={50}
                  placeholder="请输入真实姓名"
                />
              )}
            />
          </Form.Item>

          {/* 昵称 */}
          <Form.Item
            label="昵称"
            validateStatus={errors.nickname ? 'error' : ''}
            help={errors.nickname?.message}
          >
            <Controller
              name="nickname"
              control={control}
              rules={{ maxLength: { value: 50, message: '昵称最多50个字符' } }}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value || ''}
                  maxLength={50}
                  placeholder="请输入昵称（可选）"
                />
              )}
            />
          </Form.Item>

          {/* 手机号 */}
          <Form.Item
            label="手机号"
            htmlFor="phone"
            validateStatus={errors.phone ? 'error' : ''}
            help={errors.phone?.message}
          >
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="phone"
                  value={field.value || ''}
                  placeholder="请输入中国大陆手机号"
                />
              )}
            />
          </Form.Item>

          {/* 性别 */}
          <Form.Item
            label="性别"
            htmlFor="gender"
            validateStatus={errors.gender ? 'error' : ''}
            help={errors.gender?.message}
          >
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  id="gender"
                  placeholder="请选择性别"
                  options={[
                    { label: '男', value: 'male' },
                    { label: '女', value: 'female' },
                    { label: '未知', value: 'unknown' },
                  ]}
                />
              )}
            />
          </Form.Item>

          {/* 生日 */}
          <Form.Item
            label="生日"
            htmlFor="birthday"
            validateStatus={errors.birthday ? 'error' : ''}
            help={errors.birthday?.message}
          >
            <Controller
              name="birthday"
              control={control}
              render={({ field }) => (
                <Input {...field} id="birthday" value={field.value || ''} type="date" />
              )}
            />
          </Form.Item>

          {/* 头像 */}
          <Form.Item
            label="头像 URL"
            htmlFor="avatar"
            validateStatus={errors.avatar ? 'error' : ''}
            help={errors.avatar?.message}
          >
            <Controller
              name="avatar"
              control={control}
              rules={{ maxLength: { value: 255, message: '头像 URL 最多255个字符' } }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="avatar"
                  value={field.value || ''}
                  maxLength={255}
                  placeholder="请输入头像 URL"
                />
              )}
            />
          </Form.Item>
        </div>

        {/* 地址 */}
        <Form.Item
          label="地址"
          htmlFor="address"
          validateStatus={errors.address ? 'error' : ''}
          help={errors.address?.message}
        >
          <Controller
            name="address"
            control={control}
            rules={{ maxLength: { value: 255, message: '地址最多255个字符' } }}
            render={({ field }) => (
              <Input
                {...field}
                id="address"
                value={field.value || ''}
                maxLength={255}
                placeholder="请输入地址"
              />
            )}
          />
        </Form.Item>

        {/* 个人简介 */}
        <Form.Item
          label="个人简介"
          htmlFor="bio"
          validateStatus={errors.bio ? 'error' : ''}
          help={errors.bio?.message}
        >
          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                id="bio"
                value={field.value || ''}
                rows={3}
                maxLength={500}
                showCount
                placeholder="请输入个人简介"
              />
            )}
          />
        </Form.Item>

        {/* 状态 */}
        <Form.Item
          label="状态"
          validateStatus={errors.status ? 'error' : ''}
          help={errors.status?.message}
          required
        >
          <Controller
            name="status"
            control={control}
            rules={{ required: '请选择状态' }}
            render={({ field }) => (
              <Select {...field} placeholder="请选择状态">
                <Select.Option value="active">正常</Select.Option>
                <Select.Option value="inactive">未激活</Select.Option>
                <Select.Option value="disabled">禁用</Select.Option>
                <Select.Option value="locked">锁定</Select.Option>
              </Select>
            )}
          />
        </Form.Item>

        {isEditMode && (
          <>
            <Divider orientation="left">通知绑定</Divider>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item
                label="Bark Key"
                htmlFor="barkKey"
                validateStatus={errors.barkKey ? 'error' : ''}
                help={errors.barkKey?.message}
              >
                <Controller
                  name="barkKey"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="barkKey"
                      value={field.value || ''}
                      placeholder="请输入 Bark 设备 Key"
                      disabled={isNotificationSettingsUnavailable}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="飞书 user_id"
                htmlFor="feishuUserId"
                validateStatus={errors.feishuUserId ? 'error' : ''}
                help={errors.feishuUserId?.message}
              >
                <Controller
                  name="feishuUserId"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="feishuUserId"
                      value={field.value || ''}
                      placeholder="请输入飞书用户 user_id"
                      disabled={isNotificationSettingsUnavailable}
                    />
                  )}
                />
              </Form.Item>
            </div>
          </>
        )}
      </Form>
    </Modal>
  );
}
