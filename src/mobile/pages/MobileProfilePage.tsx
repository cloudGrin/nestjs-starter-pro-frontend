import { useRef, useState } from 'react';
import { CameraOutlined } from '@ant-design/icons';
import { Button, Card, List, Switch, Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { uploadFile } from '@/features/file/services/file.service';
import { useThemeStore } from '@/shared/stores';
import type { User } from '@/shared/types/user.types';
import { MobileModuleHeader } from '../components/MobileModuleHeader';

function displayName(user: User) {
  return user.realName || user.nickname || user.username;
}

export function MobileProfilePage() {
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setTheme);

  const handleAvatarChange = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      Toast.show({ icon: 'fail', content: '请选择图片文件', position: 'center' });
      return;
    }

    setAvatarUploading(true);
    try {
      const uploaded = await uploadFile(file, {
        module: 'user-avatar',
        tags: 'avatar,profile',
        isPublic: true,
      });
      const avatar = uploaded.url || `/api/v1/files/${uploaded.id}/public`;
      const updatedUser = await authService.updateProfile({ avatar });
      setUser(updatedUser);
      Toast.show({ icon: 'success', content: '头像已更新', position: 'center' });
    } catch {
      Toast.show({ icon: 'fail', content: '头像上传失败', position: 'center' });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mobile-page">
      <MobileModuleHeader title="我的" />

      <Card className="mobile-card">
        <div className="mobile-profile-card">
          <input
            ref={avatarInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={(event) => {
              void handleAvatarChange(event.currentTarget.files);
              event.currentTarget.value = '';
            }}
          />
          <button
            className="mobile-profile-avatar"
            type="button"
            onClick={() => avatarInputRef.current?.click()}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={displayName(user)} />
            ) : (
              <span>{user ? displayName(user).slice(0, 1) : '-'}</span>
            )}
            <i>
              <CameraOutlined />
            </i>
          </button>
          <div className="mobile-profile-main">
            <div className="text-lg font-semibold">{user ? displayName(user) : '-'}</div>
            <div className="mobile-subtitle">{user?.email || user?.username}</div>
            <Button
              size="mini"
              className="mobile-profile-avatar-button"
              loading={avatarUploading}
              onClick={() => avatarInputRef.current?.click()}
            >
              更换头像
            </Button>
          </div>
        </div>
      </Card>

      <List className="mt-3">
        <List.Item
          extra={
            <Switch
              checked={themeMode === 'dark'}
              onChange={(checked: boolean) => setThemeMode(checked ? 'dark' : 'light')}
            />
          }
        >
          深色模式
        </List.Item>
      </List>

      <Button
        block
        className="mt-4!"
        color="danger"
        fill="outline"
        onClick={() => void handleLogout()}
      >
        退出登录
      </Button>
    </div>
  );
}
