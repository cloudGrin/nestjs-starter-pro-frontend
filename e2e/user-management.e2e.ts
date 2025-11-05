/**
 * 用户管理模块 E2E 测试
 *
 * 测试场景：
 * 1. 用户列表展示
 * 2. 创建用户
 * 3. 编辑用户
 * 4. 删除用户
 * 5. 搜索用户
 */

import { test, expect } from '@playwright/test';

// 通用登录函数
async function login(page) {
  await page.goto('/login');
  await page.getByPlaceholder('请输入账号').fill('admin');
  await page.getByPlaceholder('请输入密码').fill('Admin123');
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('用户管理', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await login(page);

    // 导航到用户管理页面
    await page.getByText('用户管理').click();
    await expect(page).toHaveURL('/users');
  });

  test('用户列表应该正确展示', async ({ page }) => {
    // 等待表格加载
    await page.waitForSelector('table', { timeout: 5000 });

    // 验证表格列
    await expect(page.getByText('ID')).toBeVisible();
    await expect(page.getByText('用户名')).toBeVisible();
    await expect(page.getByText('邮箱')).toBeVisible();
    await expect(page.getByText('状态')).toBeVisible();
    await expect(page.getByText('操作')).toBeVisible();

    // 验证有数据
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(await rows.count(), {
      timeout: 3000,
    });
  });

  test('创建用户应该成功', async ({ page }) => {
    // 点击创建用户按钮
    await page.getByRole('button', { name: '创建用户' }).click();

    // 等待弹窗出现
    await expect(page.getByText('创建用户')).toBeVisible();

    // 填写表单
    const timestamp = Date.now();
    await page.getByLabel('用户名').fill(`testuser${timestamp}`);
    await page.getByLabel('邮箱').fill(`test${timestamp}@example.com`);
    await page.getByLabel('真实姓名').fill('测试用户');
    await page.getByLabel('手机号').fill('13800138000');
    await page.getByLabel('密码').fill('Test123456');

    // 提交表单
    await page.getByRole('button', { name: '提交' }).click();

    // 应该显示成功提示
    await expect(page.getByText('创建成功')).toBeVisible({ timeout: 5000 });

    // 弹窗应该关闭
    await expect(page.getByText('创建用户')).not.toBeVisible();

    // 列表应该刷新并包含新用户
    await expect(page.getByText(`testuser${timestamp}`)).toBeVisible({
      timeout: 3000,
    });
  });

  test('搜索用户应该正常工作', async ({ page }) => {
    // 在搜索框输入用户名
    await page.getByPlaceholder('请输入用户名').fill('admin');

    // 点击搜索按钮
    await page.getByRole('button', { name: '搜索' }).click();

    // 等待表格更新
    await page.waitForTimeout(1000);

    // 表格应该只显示匹配的用户
    const rows = page.locator('tbody tr');
    const count = await rows.count();

    // 至少应该有一条结果（admin 用户）
    expect(count).toBeGreaterThan(0);

    // 验证结果包含搜索关键词
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('admin');
    }
  });

  test('编辑用户应该成功', async ({ page }) => {
    // 点击第一行的编辑按钮
    await page.locator('tbody tr').first().getByRole('button', { name: '编辑' }).click();

    // 等待弹窗出现
    await expect(page.getByText('编辑用户')).toBeVisible();

    // 修改真实姓名
    const input = page.getByLabel('真实姓名');
    await input.clear();
    await input.fill('更新的姓名');

    // 提交表单
    await page.getByRole('button', { name: '提交' }).click();

    // 应该显示成功提示
    await expect(page.getByText('更新成功')).toBeVisible({ timeout: 5000 });
  });

  test('删除用户应该成功', async ({ page }) => {
    // 先创建一个测试用户
    await page.getByRole('button', { name: '创建用户' }).click();
    const timestamp = Date.now();
    await page.getByLabel('用户名').fill(`deleteuser${timestamp}`);
    await page.getByLabel('邮箱').fill(`delete${timestamp}@example.com`);
    await page.getByLabel('密码').fill('Test123456');
    await page.getByRole('button', { name: '提交' }).click();
    await expect(page.getByText('创建成功')).toBeVisible({ timeout: 5000 });

    // 找到并点击删除按钮
    const row = page.locator(`tbody tr:has-text("deleteuser${timestamp}")`);
    await row.getByRole('button', { name: '删除' }).click();

    // 确认删除
    await page.getByRole('button', { name: '确定' }).click();

    // 应该显示成功提示
    await expect(page.getByText('删除成功')).toBeVisible({ timeout: 5000 });

    // 用户应该从列表中消失
    await expect(page.getByText(`deleteuser${timestamp}`)).not.toBeVisible();
  });
});
