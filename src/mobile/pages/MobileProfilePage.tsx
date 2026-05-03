import { Button, Card, List, Switch } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useThemeStore } from '@/shared/stores';
import type { User } from '@/shared/types/user.types';
import { MobileModuleHeader } from '../components/MobileModuleHeader';

function displayName(user: User) {
  return user.realName || user.nickname || user.username;
}

export function MobileProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setTheme);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mobile-page">
      <MobileModuleHeader title="我的" />

      <Card className="mobile-card">
        <div className="text-lg font-semibold">{user ? displayName(user) : '-'}</div>
        <div className="mobile-subtitle">{user?.email || user?.username}</div>
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
