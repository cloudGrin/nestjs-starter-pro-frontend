/**
 * Playwright Fixtures
 *
 * 用途：
 * 1. 提供登录状态的 fixture
 * 2. 提供常用操作的辅助函数
 * 3. 统一管理测试数据
 */

import { test as base, expect, Page } from '@playwright/test';

/**
 * 扩展的测试 fixture
 */
export const test = base.extend<{
  /**
   * 已登录的页面实例
   */
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // 登录
    await page.goto('/login');
    await page.getByPlaceholder('请输入账号').fill('admin');
    await page.getByPlaceholder('请输入密码').fill('Admin123');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // 使用已登录的页面
    await use(page);

    // 清理：登出（可选）
    // await page.getByRole('button', { name: /admin/i }).click();
    // await page.getByText('退出登录').click();
  },
});

export { expect };

/**
 * 测试数据工厂
 */
export const TestData = {
  /**
   * 生成唯一的用户名
   */
  uniqueUsername: (prefix = 'testuser') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  },

  /**
   * 生成唯一的邮箱
   */
  uniqueEmail: (prefix = 'test') => {
    return `${prefix}_${Date.now()}@example.com`;
  },

  /**
   * 默认测试密码
   */
  defaultPassword: 'Test123456',
};

/**
 * 页面对象模型（POM）
 */
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.page.getByPlaceholder('请输入账号').fill(username);
    await this.page.getByPlaceholder('请输入密码').fill(password);
    await this.page.getByRole('button', { name: '登录' }).click();
  }

  async expectLoginSuccess() {
    await expect(this.page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  }

  async expectLoginFailure() {
    await expect(this.page.getByText(/账号或密码错误|登录失败/)).toBeVisible({
      timeout: 5000,
    });
  }
}

export class UserListPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.getByText('用户管理').click();
    await expect(this.page).toHaveURL('/users');
  }

  async createUser(data: {
    username: string;
    email: string;
    realName?: string;
    phone?: string;
    password: string;
  }) {
    await this.page.getByRole('button', { name: '创建用户' }).click();
    await expect(this.page.getByText('创建用户')).toBeVisible();

    await this.page.getByLabel('用户名').fill(data.username);
    await this.page.getByLabel('邮箱').fill(data.email);
    if (data.realName) {
      await this.page.getByLabel('真实姓名').fill(data.realName);
    }
    if (data.phone) {
      await this.page.getByLabel('手机号').fill(data.phone);
    }
    await this.page.getByLabel('密码').fill(data.password);

    await this.page.getByRole('button', { name: '提交' }).click();
    await expect(this.page.getByText('创建成功')).toBeVisible({ timeout: 5000 });
  }

  async searchUser(username: string) {
    await this.page.getByPlaceholder('请输入用户名').fill(username);
    await this.page.getByRole('button', { name: '搜索' }).click();
    await this.page.waitForTimeout(1000);
  }

  async deleteUser(username: string) {
    const row = this.page.locator(`tbody tr:has-text("${username}")`);
    await row.getByRole('button', { name: '删除' }).click();
    await this.page.getByRole('button', { name: '确定' }).click();
    await expect(this.page.getByText('删除成功')).toBeVisible({ timeout: 5000 });
  }
}
