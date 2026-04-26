# CLAUDE.md - home-web AI 开发指南

## 项目概况

- 前端项目：`home-web`
- 后端项目：`../home-admin`
- 本地 Swagger：`api-docs.json`
- 技术栈：React 18、TypeScript 5.9、Vite 7、Ant Design 5、Tailwind CSS 4、React Router 7、Zustand 5、TanStack Query 5
- 包管理器：pnpm

## 常用命令

```bash
pnpm install
pnpm run dev
pnpm exec tsc --noEmit
pnpm run lint
pnpm test -- --run
pnpm run build
```

当前项目只保留 Vitest 单元/组件测试，不包含 E2E 测试配置。

## 初始化入口

```text
src/main.tsx
  -> src/app/App.tsx
  -> src/app/providers.tsx
  -> src/app/useAppRoutes.tsx
  -> src/app/generateRoutes.tsx
  -> src/app/componentRegistry.ts
```

关键约束：
- `useAppRoutes` 必须在 `AppProviders` 内部调用，因为它依赖 TanStack Query。
- 登录成功后跳转 `/`，再由后端菜单生成的第一个可访问页面决定默认页。
- 后端菜单没有可解析页面时，首页显示“暂无可访问菜单”，不要重定向到 `/` 自身。
- 动态组件通过 `import.meta.glob` 扫描页面文件，并通过 `componentAliases` 兼容后端菜单 component 字段。

## 当前功能模块

```text
src/features/auth          登录、登出、认证状态
src/features/dashboard     仪表盘
src/features/rbac/user     用户管理
src/features/rbac/role     角色管理
src/features/rbac/menu     菜单管理
src/features/rbac/permission 权限管理
src/features/file          文件管理
src/features/notification  通知中心
src/features/api-auth      API 应用和密钥管理
```

不要引用已删除模块：`task`、`dict`、`config`、`workflow`。

## API 约定

- API 基础地址：`VITE_API_URL`，默认 `http://localhost:3000/api/v1`
- 所有服务层接口需对照 `api-docs.json`。
- 统一请求封装在 `src/shared/utils/request.ts`。
- access token 刷新成功后通过 `auth:token-refreshed` 事件同步 auth store。
- refresh token 失效后通过 `auth:session-expired` 事件清理认证状态。

## 代码约定

- 新页面放在 `features/**/pages/*.tsx`，并使用命名导出。
- 共享组件只保留生产代码真实复用的内容，避免预置“组件库式”空抽象。
- 权限 UI 控制使用 `PermissionGuard`。
- 路由认证使用 `ProtectedRoute`。
- 日期展示使用 `formatDate`。
- 列表请求统一使用 feature 内 hooks + services，服务端状态交给 TanStack Query。

## 测试策略

- 使用 Vitest + Testing Library。
- 测试基础设施在 `src/test/setup.ts` 和 `src/test/test-utils.tsx`。
- 行为修复先补回归测试，再改实现。
- 完成前至少运行：

```bash
pnpm exec tsc --noEmit
pnpm run lint
pnpm test -- --run
pnpm run build
```
