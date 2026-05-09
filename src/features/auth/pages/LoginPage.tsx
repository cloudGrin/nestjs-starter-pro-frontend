import { useEffect, useState } from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { appConfig } from '@/shared/config/app.config';

interface LoginFormValues {
  account: string; // 与后端API字段名保持一致
  password: string;
}

/**
 * 登录页面
 *
 * ⚠️ 设计原则：
 * 1. 登录成功后立即跳转到首页，由动态路由重定向到第一个可用菜单
 * 2. 菜单加载由 useAppRoutes 和 Sidebar 负责
 * 3. 避免多个地方调用 useUserMenus 导致时序问题
 */
export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    if (token && user) {
      navigate('/', { replace: true });
    }
  }, [navigate, token, user]);

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values.account.trim(), values.password);
      navigate('/', { replace: true });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="pc-login-page flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_55%,#f8fafc_100%)] px-4 py-8 dark:bg-slate-950 dark:bg-none">
      <div className="pc-login-panel w-full max-w-[440px] overflow-hidden rounded-lg border border-white/70 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-indigo-400/15 dark:bg-slate-900/90 dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
        <div className="px-6 py-7 sm:px-8 sm:py-8">
          <div className="mb-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#667eea] text-lg font-bold text-white shadow-[0_12px_28px_rgba(102,126,234,0.28)] dark:bg-[#91d1ff] dark:text-slate-950 dark:shadow-none">
                H
              </div>
              <span className="min-w-0 text-lg font-bold text-slate-900 dark:text-white">
                {appConfig.title}
              </span>
            </div>
            <h1 className="mb-2 text-2xl font-bold leading-tight text-slate-950 dark:text-white">
              欢迎回来
            </h1>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              使用管理员账号登录后台
            </p>
          </div>

          <Form<LoginFormValues>
            name="login"
            initialValues={{ account: '', password: '' }}
            onFinish={handleLogin}
            size="large"
            layout="vertical"
            autoComplete="off"
            disabled={loading}
          >
            <Form.Item
              name="account"
              label="账号"
              rules={[{ required: true, message: '请输入用户名或邮箱！' }]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-400" />}
                placeholder="用户名或邮箱"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码！' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400" />}
                placeholder="密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item className="mb-0 pt-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-11 font-semibold"
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500 dark:border-indigo-400/15 dark:bg-slate-800/60 dark:text-slate-400">
            首次部署后请使用后端日志中的初始管理员密码登录
          </div>
        </div>
      </div>
    </div>
  );
}
