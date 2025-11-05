/**
 * 认证模块 E2E 测试
 *
 * 测试场景：
 * 1. 用户登录流程
 * 2. 登录表单验证
 * 3. 登录失败处理
 * 4. 登出流程
 */

import { test, expect } from '@playwright/test';

test.describe('用户认证', () => {
  test.beforeEach(async ({ page }) => {
    // 访问登录页
    await page.goto('/login');
  });

  test('登录页面应该正确渲染', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/NestJS Starter Pro/);

    // 验证表单元素
    await expect(page.getByPlaceholder('请输入账号')).toBeVisible();
    await expect(page.getByPlaceholder('请输入密码')).toBeVisible();
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
  });

  test('表单验证应该正常工作', async ({ page }) => {
    // 点击登录按钮（未填写）
    await page.getByRole('button', { name: '登录' }).click();

    // 应该显示验证错误
    await expect(page.getByText('请输入账号')).toBeVisible();
    await expect(page.getByText('请输入密码')).toBeVisible();
  });

  test('登录失败应该显示错误提示', async ({ page }) => {
    // 填写错误的凭证
    await page.getByPlaceholder('请输入账号').fill('wronguser');
    await page.getByPlaceholder('请输入密码').fill('wrongpass');

    // 点击登录
    await page.getByRole('button', { name: '登录' }).click();

    // 应该显示错误提示（等待API响应）
    await expect(page.getByText(/账号或密码错误|登录失败/)).toBeVisible({
      timeout: 5000,
    });
  });

  test('成功登录应该跳转到仪表盘', async ({ page }) => {
    // 填写正确的凭证
    await page.getByPlaceholder('请输入账号').fill('admin');
    await page.getByPlaceholder('请输入密码').fill('Admin123');

    // 点击登录
    await page.getByRole('button', { name: '登录' }).click();

    // 等待跳转到仪表盘
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // 验证仪表盘页面元素
    await expect(page.getByText('系统概览')).toBeVisible();
  });

  test('登出功能应该正常工作', async ({ page }) => {
    // 先登录
    await page.getByPlaceholder('请输入账号').fill('admin');
    await page.getByPlaceholder('请输入密码').fill('Admin123');
    await page.getByRole('button', { name: '登录' }).click();

    // 等待跳转到仪表盘
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // 点击用户头像打开下拉菜单
    await page.getByRole('button', { name: /admin/i }).click();

    // 点击登出
    await page.getByText('退出登录').click();

    // 应该跳转回登录页
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});
