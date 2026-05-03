import { useState, type ReactNode } from 'react';
import {
  BellOutlined,
  CheckSquareOutlined,
  HomeOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, List, Popup } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';

const moduleItems = [
  { path: '/family', title: '家庭', icon: <HomeOutlined /> },
  { path: '/tasks', title: '任务中心', icon: <CheckSquareOutlined /> },
  { path: '/insurance', title: '家庭保险', icon: <SafetyCertificateOutlined /> },
  { path: '/notifications', title: '通知', icon: <BellOutlined /> },
  { path: '/profile', title: '我的', icon: <UserOutlined /> },
];

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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const headerClass = taskMode ? 'mobile-task-hero' : 'mobile-module-header';
  const headingClass = taskMode ? 'mobile-task-heading' : 'mobile-module-heading';
  const actionsClass = taskMode ? 'mobile-task-header-actions' : 'mobile-module-actions';

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

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
      <Popup
        visible={open}
        position="left"
        onMaskClick={() => setOpen(false)}
        bodyStyle={{ width: '78vw', maxWidth: 320 }}
      >
        <div className="mobile-module-menu">
          <strong>家庭应用</strong>
          <List className="mobile-form-list">
            {moduleItems.map((item) => (
              <List.Item key={item.path} prefix={item.icon} onClick={() => handleNavigate(item.path)}>
                {item.title}
              </List.Item>
            ))}
          </List>
        </div>
      </Popup>
    </>
  );
}
