# NestJS Starter Pro Web

Frontend management console for `home-admin`, built with React 18, TypeScript 5.9, Vite 7, Ant Design 5, TanStack Query and Zustand.

## Features

- Backend-driven dynamic routing from `/menus/user-menus`
- RBAC pages: users, roles, menus, permissions
- Dashboard, file management, notifications, API app/key management
- Dark mode with Ant Design and Tailwind CSS
- Typed service layer aligned with local `api-docs.json`
- Vitest unit and component tests

## Requirements

- Node.js `>=20.19.0 || >=22.12.0`
- pnpm `>=9`
- Backend running at `http://localhost:3000`

## Commands

```bash
pnpm install
pnpm run dev
pnpm exec tsc --noEmit
pnpm run lint
pnpm test -- --run
pnpm run build
```

Dev server: `http://localhost:3001`

## Project Structure

```text
src/
  main.tsx
  app/
    App.tsx
    providers.tsx
    useAppRoutes.tsx
    generateRoutes.tsx
    componentRegistry.ts
  features/
    auth/
    dashboard/
    rbac/
      user/
      role/
      menu/
      permission/
    file/
    notification/
    api-auth/
  shared/
    components/
    config/
    hooks/
    stores/
    types/
    utils/
  assets/styles/
```

## Runtime Flow

```text
src/main.tsx
  -> App
  -> AppProviders
  -> useAppRoutes
  -> generateRoutesWithDefault
  -> componentRegistry
```

After login, the app navigates to `/`. The default page is the first visible, active and resolvable backend menu. If no menu can be resolved, the app shows a no-access empty state instead of redirecting `/` to itself.

## Environment

```bash
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=http://localhost:3000
VITE_APP_TITLE=NestJS Starter Pro
```

## API Contract

The frontend uses handwritten services under `src/features/**/services`. Keep them aligned with local `api-docs.json` after backend controller changes.

## Testing

This project currently keeps Vitest unit and component tests only. E2E/Playwright configuration has been removed.

```bash
pnpm test -- --run
pnpm run test:coverage
```

## 中文说明

这是 `home-admin` 后端对应的前端管理后台。当前保留的业务模块包括认证、仪表盘、RBAC、文件管理、通知中心和 API 应用/密钥管理。项目使用 pnpm，测试范围为 Vitest 单元测试和组件测试，不包含 E2E 配置。
