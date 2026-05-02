import { useEffect, useState } from 'react';
import { Button, Form, Input, Toast } from 'antd-mobile';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';

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
  const from = (location.state as { from?: string } | null)?.from || '/tasks';

  useEffect(() => {
    if (token && user) {
      navigate(from, { replace: true });
    }
  }, [from, navigate, token, user]);

  const handleFinish = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      await login(values.account.trim(), values.password);
      navigate(from, { replace: true });
    } catch {
      Toast.show({ icon: 'fail', content: '登录失败', position: 'center' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mobile-page flex min-h-screen flex-col justify-center">
      <div className="mb-8">
        <h1 className="mobile-title">家庭助手</h1>
        <div className="mobile-subtitle">查看家庭任务、保险和提醒</div>
      </div>
      <div className="mobile-card p-3">
        <Form
          layout="vertical"
          footer={
            <Button block color="primary" type="submit" loading={submitting}>
              登录
            </Button>
          }
          onFinish={(values: LoginFormValues) => void handleFinish(values)}
        >
          <Form.Item
            name="account"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input placeholder="用户名、邮箱或手机号" clearable />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input placeholder="请输入密码" type="password" clearable />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
