import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';
import { clearMockUser, mockUsers, setMockUser } from '@/test/test-utils';

vi.mock('@/features/notification/components/NotificationBell', () => ({
  NotificationBell: () => <button type="button">通知入口</button>,
}));

vi.mock('@/shared/hooks/useBreadcrumb', () => ({
  useBreadcrumb: () => [{ title: '首页' }],
}));

describe('Header', () => {
  beforeEach(() => {
    clearMockUser();
  });

  it('未下发通知权限时不渲染通知入口', () => {
    setMockUser({
      ...mockUsers.user,
      permissions: undefined,
    });

    render(
      <MemoryRouter>
        <Header collapsed={false} onToggleCollapsed={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: '通知入口' })).not.toBeInTheDocument();
  });

  it('拥有通知权限时渲染通知入口', () => {
    setMockUser({
      ...mockUsers.user,
      permissions: ['notification:read'],
    });

    render(
      <MemoryRouter>
        <Header collapsed={false} onToggleCollapsed={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: '通知入口' })).toBeInTheDocument();
  });

  it('顶部图标按钮使用统一的语义样式类', () => {
    setMockUser({
      ...mockUsers.user,
      permissions: [],
    });

    const { container } = render(
      <MemoryRouter>
        <Header collapsed={false} onToggleCollapsed={vi.fn()} />
      </MemoryRouter>
    );

    const iconButtons = Array.from(container.querySelectorAll('.ant-btn')).filter((button) =>
      button.className.includes('app-header-icon-button')
    );

    expect(iconButtons).toHaveLength(2);
    expect(container.querySelectorAll('.app-header-icon')).toHaveLength(2);
  });

  it('用户菜单提供个人资料和修改密码入口', async () => {
    const user = userEvent.setup();
    setMockUser({
      ...mockUsers.user,
      nickname: '测试用户',
      permissions: [],
    });

    render(
      <MemoryRouter>
        <Header collapsed={false} onToggleCollapsed={vi.fn()} />
      </MemoryRouter>
    );

    await user.click(screen.getByText('测试用户'));

    expect(await screen.findByText('个人资料')).toBeInTheDocument();
    expect(screen.getByText('修改密码')).toBeInTheDocument();
  });
});
