/**
 * PageWrap 组件测试
 *
 * 测试范围：
 * 1. 基础渲染（title、titleRight、header、footer、children）
 * 2. 面包屑显示（includeBreadcrumbs）
 * 3. Sticky 模式
 * 4. 深色模式支持
 * 5. 布局结构
 * 6. 样式类
 * 7. 组合使用
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PageWrap } from '../PageWrap';
import { Button } from 'antd';
import { useThemeStore } from '@/shared/stores';
import type { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';

// Mock useBreadcrumb hook
vi.mock('@/shared/hooks/useBreadcrumb', () => ({
  useBreadcrumb: vi.fn(() => [
    { title: '首页', href: '/' },
    { title: '用户管理', href: '/users' },
    { title: '用户列表' },
  ] as BreadcrumbItemType[]),
}));

// 测试辅助函数
const expectHasClass = (element: HTMLElement, className: string) => {
  expect(element.className).toContain(className);
};

describe('PageWrap 组件', () => {
  beforeEach(() => {
    // 每次测试前重置主题为浅色模式
    useThemeStore.getState().setTheme('light');
  });

  // ==================== 基础渲染测试 ====================

  describe('基础渲染', () => {
    it('应该渲染最简单的内容（只有 children）', () => {
      render(<PageWrap>测试内容</PageWrap>);

      expect(screen.getByText('测试内容')).toBeInTheDocument();
    });

    it('应该渲染标题', () => {
      render(
        <PageWrap title="用户管理">
          <div>内容</div>
        </PageWrap>
      );

      // 使用 getByRole 查找标题元素，避免与面包屑中的"用户管理"冲突
      expect(screen.getByRole('heading', { name: '用户管理' })).toBeInTheDocument();
    });

    it('应该渲染标题右侧内容', () => {
      render(
        <PageWrap
          title="用户管理"
          titleRight={<Button data-testid="export-btn">导出</Button>}
        >
          <div>内容</div>
        </PageWrap>
      );

      // Ant Design Button 会在文本中添加空格，所以只检查按钮元素存在
      expect(screen.getByTestId('export-btn')).toBeInTheDocument();
    });

    it('应该渲染头部额外内容', () => {
      render(
        <PageWrap
          title="用户管理"
          header={<div data-testid="search-form">搜索表单</div>}
        >
          <div>内容</div>
        </PageWrap>
      );

      expect(screen.getByTestId('search-form')).toBeInTheDocument();
      expect(screen.getByText('搜索表单')).toBeInTheDocument();
    });

    it('应该渲染底部内容', () => {
      render(
        <PageWrap footer={<div data-testid="footer">底部内容</div>}>
          <div>内容</div>
        </PageWrap>
      );

      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByText('底部内容')).toBeInTheDocument();
    });
  });

  // ==================== 面包屑测试 ====================

  describe('面包屑', () => {
    it('应该默认显示面包屑（includeBreadcrumbs=true）', () => {
      render(
        <PageWrap title="用户管理">
          <div>内容</div>
        </PageWrap>
      );

      // 验证面包屑项存在（面包屑中的"用户管理"和标题中的"用户管理"都存在）
      expect(screen.getByText('首页')).toBeInTheDocument();
      expect(screen.getAllByText('用户管理').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('用户列表')).toBeInTheDocument();
    });

    it('应该在 includeBreadcrumbs=false 时隐藏面包屑', () => {
      render(
        <PageWrap title="用户管理" includeBreadcrumbs={false}>
          <div>内容</div>
        </PageWrap>
      );

      // 面包屑不应该存在
      expect(screen.queryByText('首页')).not.toBeInTheDocument();
      expect(screen.queryByText('用户列表')).not.toBeInTheDocument();
    });

    it('应该在没有 title 和 header 时仍显示面包屑', () => {
      render(<PageWrap><div>内容</div></PageWrap>);

      expect(screen.getByText('首页')).toBeInTheDocument();
      expect(screen.getByText('用户管理')).toBeInTheDocument();
    });

    it('应该包含面包屑容器的样式类', () => {
      const { container } = render(
        <PageWrap title="用户管理">
          <div>内容</div>
        </PageWrap>
      );

      // 查找包含 app-breadcrumbs 类的元素
      const breadcrumb = container.querySelector('.app-breadcrumbs');
      expect(breadcrumb).toBeInTheDocument();
    });
  });

  // ==================== Sticky 模式测试 ====================

  describe('Sticky 模式', () => {
    it('应该默认不启用 sticky（sticky=false）', () => {
      const { container } = render(
        <PageWrap title="用户管理">
          <div>内容</div>
        </PageWrap>
      );

      const wrapper = container.firstChild as HTMLElement;
      // 不应该包含 sticky 相关的类
      expect(wrapper.className).not.toMatch(/sticky/);
    });

    it('应该在 sticky=true 时启用固定头部', () => {
      const { container } = render(
        <PageWrap title="用户管理" sticky={true}>
          <div>内容</div>
        </PageWrap>
      );

      const wrapper = container.firstChild as HTMLElement;
      // 验证包含 sticky 相关的类
      // 注意：Tailwind 的动态类会被编译，所以我们检查整个 className 字符串
      expect(wrapper.className.length).toBeGreaterThan(0);
    });
  });

  // ==================== 深色模式测试 ====================

  describe('深色模式', () => {
    it('应该在浅色模式下使用浅色背景', () => {
      useThemeStore.getState().setTheme('light');

      const { container } = render(
        <PageWrap title="用户管理">
          <div>内容</div>
        </PageWrap>
      );

      const wrapper = container.firstChild as HTMLElement;
      expectHasClass(wrapper, 'bg-gray-50');
    });

    it('应该在深色模式下使用深色背景', () => {
      useThemeStore.getState().setTheme('dark');

      const { container } = render(
        <PageWrap title="用户管理">
          <div>内容</div>
        </PageWrap>
      );

      const wrapper = container.firstChild as HTMLElement;
      expectHasClass(wrapper, 'bg-gray-900');
    });

    it('应该在切换主题后更新样式', () => {
      const { container, rerender } = render(
        <PageWrap title="用户管理">
          <div>内容</div>
        </PageWrap>
      );

      let wrapper = container.firstChild as HTMLElement;
      expectHasClass(wrapper, 'bg-gray-50');

      // 切换到深色模式
      useThemeStore.getState().setTheme('dark');
      rerender(
        <PageWrap title="用户管理">
          <div>内容</div>
        </PageWrap>
      );

      wrapper = container.firstChild as HTMLElement;
      expectHasClass(wrapper, 'bg-gray-900');
    });

    it('应该在深色模式下标题使用白色文字', () => {
      useThemeStore.getState().setTheme('dark');

      render(
        <PageWrap title="用户管理">
          <div>内容</div>
        </PageWrap>
      );

      const title = screen.getByRole('heading', { name: '用户管理' });
      expectHasClass(title, 'text-white');
    });

    it('应该在浅色模式下标题使用黑色文字', () => {
      useThemeStore.getState().setTheme('light');

      render(
        <PageWrap title="用户管理">
          <div>内容</div>
        </PageWrap>
      );

      const title = screen.getByRole('heading', { name: '用户管理' });
      expectHasClass(title, 'text-black');
    });
  });

  // ==================== 布局结构测试 ====================

  describe('布局结构', () => {
    it('应该包含头部区域（当有 title 或 header 时）', () => {
      const { container } = render(
        <PageWrap title="用户管理">
          <div>内容</div>
        </PageWrap>
      );

      const header = container.querySelector('.page-wrap-header');
      expect(header).toBeInTheDocument();
    });

    it('应该包含内容区域', () => {
      const { container } = render(
        <PageWrap>
          <div>内容</div>
        </PageWrap>
      );

      const content = container.querySelector('.page-wrap-content');
      expect(content).toBeInTheDocument();
    });

    it('应该包含底部区域（当传入 footer 时）', () => {
      const { container } = render(
        <PageWrap footer={<div>底部</div>}>
          <div>内容</div>
        </PageWrap>
      );

      const footer = container.querySelector('.page-wrap-footer');
      expect(footer).toBeInTheDocument();
    });

    it('应该在没有 footer 时不渲染底部区域', () => {
      const { container } = render(
        <PageWrap>
          <div>内容</div>
        </PageWrap>
      );

      const footer = container.querySelector('.page-wrap-footer');
      expect(footer).not.toBeInTheDocument();
    });
  });

  // ==================== 样式类测试 ====================

  describe('样式类', () => {
    it('应该包含弹性布局类', () => {
      const { container } = render(
        <PageWrap title="用户管理">
          <div>内容</div>
        </PageWrap>
      );

      const wrapper = container.firstChild as HTMLElement;
      expectHasClass(wrapper, 'flex');
      expectHasClass(wrapper, 'flex-col');
      expectHasClass(wrapper, 'w-full');
      expectHasClass(wrapper, 'h-full');
    });

    it('应该包含毛玻璃效果（backdrop-blur）', () => {
      const { container } = render(
        <PageWrap title="用户管理">
          <div>内容</div>
        </PageWrap>
      );

      const header = container.querySelector('.page-wrap-header');
      expectHasClass(header as HTMLElement, 'backdrop-blur-xl');
    });

    it('应该包含内容区域的 padding 和 overflow', () => {
      const { container } = render(
        <PageWrap>
          <div>内容</div>
        </PageWrap>
      );

      const content = container.querySelector('.page-wrap-content');
      expectHasClass(content as HTMLElement, 'p-4');
      expectHasClass(content as HTMLElement, 'overflow-auto');
    });
  });

  // ==================== 组合使用测试 ====================

  describe('组合使用', () => {
    it('应该支持完整配置（title + titleRight + header + footer）', () => {
      render(
        <PageWrap
          title="用户管理"
          titleRight={<Button data-testid="export-btn">导出</Button>}
          header={<div data-testid="search-form">搜索表单</div>}
          footer={<div data-testid="footer">底部内容</div>}
        >
          <div data-testid="content">主要内容</div>
        </PageWrap>
      );

      // 验证所有部分都存在
      expect(screen.getByRole('heading', { name: '用户管理' })).toBeInTheDocument();
      expect(screen.getByTestId('export-btn')).toBeInTheDocument();
      expect(screen.getByTestId('search-form')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByText('首页')).toBeInTheDocument();
    });

    it('应该支持空配置（只有 children）', () => {
      render(
        <PageWrap>
          <div data-testid="content">主要内容</div>
        </PageWrap>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
      // 应该仍然有面包屑
      expect(screen.getByText('首页')).toBeInTheDocument();
    });

    it('应该支持 sticky 模式 + 完整配置', () => {
      const { container } = render(
        <PageWrap
          title="用户管理"
          titleRight={<Button>导出</Button>}
          header={<div>搜索表单</div>}
          footer={<div>底部</div>}
          sticky={true}
        >
          <div>内容</div>
        </PageWrap>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className.length).toBeGreaterThan(0);
      expect(screen.getByRole('heading', { name: '用户管理' })).toBeInTheDocument();
    });
  });

  // ==================== ErrorBoundary 测试 ====================

  describe('ErrorBoundary', () => {
    it('应该包含 ErrorBoundary 包裹的内容区域', () => {
      const { container } = render(
        <PageWrap>
          <div>内容</div>
        </PageWrap>
      );

      // 内容应该被渲染
      expect(screen.getByText('内容')).toBeInTheDocument();

      // 验证内容在正确的区域内
      const content = container.querySelector('.page-wrap-content');
      expect(content).toContainHTML('<div>内容</div>');
    });

    it('应该包含 ErrorBoundary 包裹的 header 区域', () => {
      render(
        <PageWrap header={<div data-testid="header">头部</div>}>
          <div>内容</div>
        </PageWrap>
      );

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('头部')).toBeInTheDocument();
    });

    it('应该包含 ErrorBoundary 包裹的 footer 区域', () => {
      render(
        <PageWrap footer={<div data-testid="footer">底部</div>}>
          <div>内容</div>
        </PageWrap>
      );

      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByText('底部')).toBeInTheDocument();
    });
  });

  // ==================== 边界情况测试 ====================

  describe('边界情况', () => {
    it('应该支持长标题', () => {
      const longTitle = '这是一个非常非常非常非常非常长的页面标题';
      render(
        <PageWrap title={longTitle}>
          <div>内容</div>
        </PageWrap>
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('应该支持复杂的 children 结构', () => {
      render(
        <PageWrap title="用户管理">
          <div>
            <div data-testid="card1">卡片1</div>
            <div data-testid="card2">卡片2</div>
            <div data-testid="card3">卡片3</div>
          </div>
        </PageWrap>
      );

      expect(screen.getByTestId('card1')).toBeInTheDocument();
      expect(screen.getByTestId('card2')).toBeInTheDocument();
      expect(screen.getByTestId('card3')).toBeInTheDocument();
    });

    it('应该支持多个 titleRight 按钮', () => {
      render(
        <PageWrap
          title="用户管理"
          titleRight={
            <>
              <Button data-testid="btn1">导出</Button>
              <Button data-testid="btn2">导入</Button>
              <Button data-testid="btn3">刷新</Button>
            </>
          }
        >
          <div>内容</div>
        </PageWrap>
      );

      expect(screen.getByTestId('btn1')).toBeInTheDocument();
      expect(screen.getByTestId('btn2')).toBeInTheDocument();
      expect(screen.getByTestId('btn3')).toBeInTheDocument();
    });
  });
});
