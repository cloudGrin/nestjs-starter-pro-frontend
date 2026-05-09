import { useEffect, useState } from 'react';
import { Button, Form, Input, Toast } from 'antd-mobile';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { clearMobilePersistedQueryCache } from '../pwa/queryPersistence';
import { DEFAULT_MOBILE_HOME_PATH } from '../routes';

interface LoginFormValues {
  account: string;
  password: string;
}

export function MobileLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const [submitting, setSubmitting] = useState(false);
  const from = (location.state as { from?: string } | null)?.from || DEFAULT_MOBILE_HOME_PATH;

  useEffect(() => {
    if (token && user) {
      navigate(from, { replace: true });
    }
  }, [from, navigate, token, user]);

  const handleFinish = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      clearMobilePersistedQueryCache();
      await login(values.account.trim(), values.password);
      navigate(from, { replace: true });
    } catch {
      Toast.show({ icon: 'fail', content: '登录失败', position: 'center' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mobile-page mobile-login-page">
      <div className="mobile-login-shell">
        <div className="mobile-login-brand">
          <div className="mobile-login-mark">H</div>
          <div className="mobile-login-brand-copy">
            <h1>家庭助手</h1>
            <p>家庭动态、任务和提醒都在这里</p>
          </div>
        </div>

        <div className="mobile-login-panel">
          <div className="mobile-login-panel-header">
            <h2>欢迎回来</h2>
            <p>登录后继续查看家庭圈</p>
          </div>

          <Form
            className="mobile-login-form"
            layout="vertical"
            footer={
              <Button
                block
                className="mobile-login-submit"
                color="primary"
                type="submit"
                loading={submitting}
              >
                登录
              </Button>
            }
            initialValues={{ account: '', password: '' }}
            onFinish={(values: LoginFormValues) => void handleFinish(values)}
          >
            <Form.Item
              name="account"
              label="账号"
              rules={[{ required: true, message: '请输入账号' }]}
            >
              <Input placeholder="用户名、邮箱或手机号" autoComplete="username" clearable />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input
                placeholder="请输入密码"
                type="password"
                autoComplete="current-password"
                clearable
              />
            </Form.Item>
          </Form>

          <div className="mobile-login-note">首次部署后请使用后端日志中的初始管理员密码登录</div>
        </div>
      </div>
    </div>
  );
}
