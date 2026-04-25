import { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

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

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values.account, values.password);

      console.log('[登录] 登录成功，跳转到首页');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('[登录] 登录失败', error);
      // 错误消息已经在 request.ts 中处理
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 transition-colors duration-300">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">
            NestJS Starter Pro
          </h1>
          <p className="text-gray-600">欢迎回来，请登录您的账户</p>
        </div>

        <Form<LoginFormValues>
          name="login"
          initialValues={{ account: '', password: '' }}
          onFinish={handleLogin}
          size="large"
          autoComplete="off"
          disabled={loading}
        >
          <Form.Item
            name="account"
            rules={[{ required: true, message: '请输入用户名或邮箱！' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名或邮箱"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center text-gray-500 text-sm">
          <p>默认账户：admin / admin123</p>
        </div>
      </Card>
    </div>
  );
}
