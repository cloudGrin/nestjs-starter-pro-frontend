# Testing Guide

当前项目只保留 Vitest 单元测试和组件测试，不维护 E2E 测试配置。

## 命令

```bash
pnpm test -- --run
pnpm test --run src/app/__tests__/routing.test.tsx
pnpm run test:coverage
```

配套验证：

```bash
pnpm exec tsc --noEmit
pnpm run lint
pnpm run build
```

## 测试基础设施

- `src/test/setup.ts`：Testing Library cleanup、jest-dom matcher、`matchMedia`/`scrollTo` mock。
- `src/test/test-utils.tsx`：QueryClient 测试 wrapper、mock 用户、auth store 辅助函数。
- 测试文件放在 `*.test.ts(x)` 或 `__tests__` 目录。

## 当前重点覆盖

- `src/shared/utils/request.ts`：token 注入、二次确认、统一响应、错误提示、401 refresh。
- `src/features/auth/stores/authStore.ts`：登录、登出、权限扁平化、token 生命周期事件。
- `src/app/generateRoutes.tsx` / `useAppRoutes.tsx`：后端菜单动态路由、菜单加载失败、空菜单默认页。
- `src/shared/components/auth`：`ProtectedRoute`、`PermissionGuard`。
- 通用 UI：`PageWrap`、`SearchForm`、`TableActions`、`StatusBadge`、`EmptyState`。

## 编写规则

- 行为变更先写失败测试，再改实现。
- 优先测试用户可观察行为，不测试内部实现细节。
- Request 相关测试 mock `RequestContextProvider`，避免依赖 Ant Design 静态上下文。
- 权限测试通过 `setMockUser` / `clearMockUser` 操作 auth store。
- 不新增 Playwright / E2E 用例；需要端到端验证时先恢复并重新设计配置。
