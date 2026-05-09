import { useEffect, useState, type ReactNode } from 'react';
import {
  AppstoreOutlined,
  BellOutlined,
  CheckSquareOutlined,
  HomeOutlined,
  MenuOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Popup } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { familyService } from '@/features/family/services/family.service';
import { useUnreadNotifications } from '@/features/notification/hooks/useNotifications';

const moduleItems = [
  { path: '/family', title: '家庭', icon: <HomeOutlined />, tone: 'family' },
  { path: '/tasks', title: '任务中心', icon: <CheckSquareOutlined />, tone: 'task' },
  { path: '/insurance', title: '家庭保险', icon: <SafetyCertificateOutlined />, tone: 'insurance' },
  { path: '/notifications', title: '通知', icon: <BellOutlined />, tone: 'notice' },
  { path: '/profile', title: '我的', icon: <UserOutlined />, tone: 'profile' },
];

function formatMenuBadge(count: number) {
  if (count <= 0) return null;
  return count > 99 ? '99+' : String(count);
}

function MobileModuleMenuContent({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [familyUnreadCount, setFamilyUnreadCount] = useState(0);
  const unreadNotificationsQuery = useUnreadNotifications();
  const familyBadge = formatMenuBadge(familyUnreadCount);
  const notificationBadge = formatMenuBadge(unreadNotificationsQuery.data?.length ?? 0);

  useEffect(() => {
    if (!token) {
      setFamilyUnreadCount(0);
      return undefined;
    }

    let cancelled = false;
    void familyService
      .getState()
      .then((state) => {
        if (cancelled) return;
        setFamilyUnreadCount(state.unreadPosts + state.unreadChatMessages);
      })
      .catch(() => {
        if (!cancelled) {
          setFamilyUnreadCount(0);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="mobile-module-menu">
      <div className="mobile-module-menu-hero">
        <span>
          <AppstoreOutlined />
        </span>
        <strong>家庭应用</strong>
      </div>
      <div className="mobile-module-menu-grid">
        {moduleItems.map((item) => (
          <button
            key={item.path}
            className={`mobile-module-menu-card ${item.tone}`}
            type="button"
            onClick={() => handleNavigate(item.path)}
          >
            <span className="mobile-module-menu-icon">{item.icon}</span>
            <strong>{item.title}</strong>
            {item.tone === 'family' && familyBadge ? (
              <span className="mobile-module-menu-badge">{familyBadge}</span>
            ) : null}
            {item.tone === 'notice' && notificationBadge ? (
              <span className="mobile-module-menu-badge">{notificationBadge}</span>
            ) : null}
            <RightOutlined className="mobile-module-menu-arrow" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function MobileModuleMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Popup
      visible={open}
      position="left"
      onMaskClick={onClose}
      bodyStyle={{ width: '84vw', maxWidth: 360 }}
    >
      {open ? <MobileModuleMenuContent onClose={onClose} /> : null}
    </Popup>
  );
}

export function MobileModuleHeader({
  title,
  subtitle,
  actions,
  taskMode,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  taskMode?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const headerClass = taskMode ? 'mobile-task-hero' : 'mobile-module-header';
  const headingClass = taskMode ? 'mobile-task-heading' : 'mobile-module-heading';
  const actionsClass = taskMode ? 'mobile-task-header-actions' : 'mobile-module-actions';

  return (
    <>
      <div className={headerClass}>
        <Button className="mobile-round-button" fill="none" onClick={() => setOpen(true)}>
          <MenuOutlined />
        </Button>
        <div className={headingClass}>
          <h1 className="mobile-title">{title}</h1>
          {subtitle ? <div className="mobile-subtitle">{subtitle}</div> : null}
        </div>
        {actions ? <div className={actionsClass}>{actions}</div> : <div />}
      </div>
      <MobileModuleMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
