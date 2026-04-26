import { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { appConfig } from '@/shared/config/app.config';
import { useThemeStore } from '@/shared/stores/themeStore';

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
  const login = useAuthStore((state) => state.login);
  const { mode: themeMode } = useThemeStore();
  const isDark = themeMode === 'dark';

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values.account, values.password);
      navigate('/', { replace: true });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div
      className={
        isDark
          ? 'min-h-screen flex items-center justify-center px-4 py-8 bg-slate-950'
          : 'min-h-screen flex items-center justify-center px-4 py-8 bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_48%,#f5f3ff_100%)]'
      }
    >
      <div className="grid w-full max-w-[1040px] grid-cols-1 overflow-hidden rounded-lg border border-white/60 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.12)] dark:border-indigo-400/20 dark:bg-slate-900/90 lg:grid-cols-[1fr_420px]">
        <div className="hidden lg:flex min-h-[560px] flex-col justify-between p-10 bg-[linear-gradient(135deg,rgba(102,126,234,0.12),rgba(118,75,162,0.12))] dark:bg-[linear-gradient(135deg,rgba(102,126,234,0.16),rgba(118,75,162,0.12))]">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white text-xl font-bold text-[#667eea] shadow-sm dark:bg-slate-800 dark:text-[#91d1ff]">
              H
            </div>
            <h1 className="mt-8 text-4xl font-bold leading-tight text-slate-950 dark:text-white">
              个人数据后台
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">
              统一管理生活、工作、家庭与开放 API 数据能力，保持清晰、稳定、可扩展。
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['RBAC', 'API Key', 'Files'].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm dark:border-indigo-400/15 dark:bg-slate-800/70 dark:text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <Card className="login-panel w-full bg-white/90! dark:bg-slate-900/90!">
          <div className="px-1 py-3 sm:px-4 sm:py-6">
            <div className="mb-8">
              <div className="mb-5 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#667eea] text-lg font-bold text-white">
                  H
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {appConfig.title}
                </span>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-950 dark:text-white">欢迎回来</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                使用管理员账号登录 {appConfig.title}
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
              首次部署后请使用后端日志中的初始管理员密码登录，并立即修改密码。
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
