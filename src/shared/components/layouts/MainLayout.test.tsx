import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainLayout } from './MainLayout';

vi.mock('antd', () => {
  const Layout = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  );
  Layout.Content = ({ children, className }: { children: ReactNode; className?: string }) => (
    <main className={className}>{children}</main>
  );
  return { Layout };
});

vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="layout-outlet" />,
}));

vi.mock('./Sidebar', () => ({
  Sidebar: ({ collapsed }: { collapsed: boolean }) => (
    <aside data-collapsed={String(collapsed)} data-testid="layout-sidebar" />
  ),
}));

vi.mock('./Header', () => ({
  Header: ({
    collapsed,
    onToggleCollapsed,
  }: {
    collapsed: boolean;
    onToggleCollapsed: () => void;
  }) => (
    <button data-collapsed={String(collapsed)} onClick={onToggleCollapsed} type="button">
      toggle
    </button>
  ),
}));

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches,
      media: '(max-width: 767px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  );
}

describe('MainLayout', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts with the sidebar collapsed on narrow screens', () => {
    mockMatchMedia(true);

    render(<MainLayout />);

    expect(screen.getByTestId('layout-sidebar')).toHaveAttribute('data-collapsed', 'true');
  });
});
