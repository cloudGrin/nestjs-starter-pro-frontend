# NestJS Starter Pro Web

> Frontend for NestJS Starter Pro - A lightweight, production-ready admin dashboard.
> Modern management interface built with React 18 + TypeScript 5 + Ant Design 5.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-18.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.8-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-6.0-646CFF)](https://vitejs.dev/)
[![Ant Design](https://img.shields.io/badge/antd-5.0-1890ff)](https://ant.design/)

[English](#english) | [中文](#中文)

---

## 🎯 Overview

This is the frontend dashboard for **NestJS Starter Pro** - a lightweight backend management framework. Built with modern React ecosystem for optimal developer experience and production performance.

**Perfect for**:
- 💼 Freelancers building admin dashboards quickly
- 🚀 Startups creating MVP products
- 🎓 Learners studying React best practices
- 🛠️ Side projects that need professional UI

---

## ✨ Core Features

- 🎯 **Feature-First Architecture** - Code organized by business modules, not file types
- 🔐 **Complete RBAC System** - Permission guards, role-based access control
- 📊 **Smart State Management** - Zustand (client state) + TanStack Query (server state)
- 🎨 **Modern UI** - Ant Design 5 + Tailwind CSS + Dark Mode support
- 🚀 **Blazing Fast** - Vite 6 + HMR + TypeScript
- 📱 **Responsive Design** - PC-first, tablet-friendly
- 🧪 **Complete Testing** - Vitest (unit) + Playwright (E2E)
- 🌓 **Dark Mode** - Beautiful dark theme with smooth transitions

---

## 🛠️ Tech Stack

### Core Framework
- **React 18.3** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 6** - Build tool

### UI & Styling
- **Ant Design 5** - Component library
- **Tailwind CSS 4** - Utility-first CSS
- **@ant-design/icons** - Icon library

### State Management
- **Zustand 5** - Client state (theme, sidebar, etc.)
- **TanStack Query 5** - Server state (API data caching)

### Routing & Forms
- **React Router 7** - Routing
- **React Hook Form 7** - Forms

### Tools
- **Axios 1** - HTTP client
- **dayjs** - Date/time handling
- **lodash-es** - Utilities

### Dev Tools
- **ESLint 9** - Linting
- **Prettier 3** - Code formatting
- **Vitest 3** - Unit testing
- **Playwright 1** - E2E testing

---

## 📦 Quick Start

### Prerequisites

- Node.js >= 20.x
- npm >= 10.x
- Backend service running at `http://localhost:3000` (see [nestjs-starter-pro](../home-admin))

### Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

**Access**: http://localhost:3001

**Default credentials** (after backend migration):
```
Username: admin
Password: admin123
```

### Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

### Code Quality

```bash
# ESLint check
npm run lint

# Type check
npm run type-check

# Format code
npm run format
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

---

## 📁 Project Structure

```
nestjs-starter-pro-web/
├── public/                 # Static assets
├── src/
│   ├── app/               # App layer
│   │   ├── App.tsx       # Root component
│   │   ├── router.tsx    # Route configuration
│   │   └── providers.tsx # Global providers
│   ├── features/          # Business modules (Feature-First)
│   │   ├── auth/         # Authentication
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   └── types/
│   │   ├── dashboard/    # Dashboard
│   │   ├── rbac/         # RBAC (User/Role/Permission)
│   │   │   ├── user/
│   │   │   ├── role/
│   │   │   ├── permission/
│   │   │   └── menu/
│   │   ├── file/         # File management
│   │   ├── task/         # Task scheduling
│   │   ├── notification/ # Notifications
│   │   ├── dict/         # Data dictionary
│   │   ├── config/       # System config
│   │   └── api-auth/     # API Key management
│   ├── shared/           # Shared modules
│   │   ├── components/   # Common components
│   │   │   ├── layouts/ # Layout components
│   │   │   ├── auth/    # Auth components
│   │   │   └── common/  # Reusable UI
│   │   ├── config/      # Configuration
│   │   ├── hooks/       # Common hooks
│   │   ├── types/       # Global types
│   │   └── utils/       # Utilities
│   ├── assets/          # Assets
│   │   └── styles/      # Global styles
│   └── main.tsx         # Entry point
├── .env.development     # Dev environment
├── .env.production      # Prod environment
├── tailwind.config.ts   # Tailwind config
├── vite.config.ts       # Vite config
├── tsconfig.json        # TypeScript config
└── package.json
```

---

## 🔑 Environment Variables

### Development (.env.development)

```bash
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_TITLE=NestJS Starter Pro
VITE_ENABLE_MOCK=false
```

### Production (.env.production)

```bash
VITE_API_URL=https://api.example.com/api/v1
VITE_APP_TITLE=NestJS Starter Pro
VITE_ENABLE_MOCK=false
```

---

## 📐 Code Standards

### File Naming

- Components: `PascalCase` (e.g., `UserList.tsx`)
- Hooks: `use + camelCase` (e.g., `useUsers.ts`)
- Utils: `camelCase` (e.g., `request.ts`)
- Types: `camelCase` (e.g., `user.types.ts`)

### Component Design

- ✅ Use function components (no class components)
- ✅ Use named exports (no default exports)
- ✅ Props must have interface
- ✅ Components should be < 200 lines

### State Management

- ✅ Client state → Zustand (theme, sidebar, user preferences)
- ✅ Server state → TanStack Query (API data)
- ✅ Components should NOT call APIs directly
- ✅ All API calls must be in Services

---

## 🔐 Authentication & Authorization

### Login Flow

1. User enters username/password
2. Call `/auth/login` endpoint
3. Get `accessToken` and `refreshToken`
4. Store in Zustand + localStorage
5. Subsequent requests auto-attach token

### Permission Control

#### Component-level

```typescript
import { PermissionGuard } from '@/shared/components/auth/PermissionGuard';

<PermissionGuard permissions={['user:create']}>
  <CreateUserButton />
</PermissionGuard>
```

#### Hook-level

```typescript
import { usePermission } from '@/shared/hooks/usePermission';

function UserActions() {
  const { hasPermission } = usePermission();

  return (
    <>
      {hasPermission(['user:create']) && <Button>Create</Button>}
      {hasPermission(['user:delete']) && <Button>Delete</Button>}
    </>
  );
}
```

#### Route-level

```typescript
// router.tsx
{
  path: 'users',
  element: <ProtectedRoute permissions={['user:read']} />,
  children: [
    {
      index: true,
      element: <UserListPage />,
    },
  ],
}
```

---

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

---

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)**: AI development guide (for Claude/ChatGPT)
- **[Backend README](../home-admin/README.md)**: Backend documentation
- **[Architecture Decisions](../docs/ADR.md)**: Why we built it this way
- **[Framework Comparison](../docs/COMPARISON.md)**: vs other frameworks

---

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t nestjs-starter-pro-web .

# Run container
docker run -p 3001:80 nestjs-starter-pro-web
```

### Nginx

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/nestjs-starter-pro-web;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 💬 Community

- 💡 **GitHub Discussions**: Ask questions, share ideas
- 🐛 **GitHub Issues**: Report bugs, request features
- ⭐ **Star this repo**: If you find it useful!

---

**Built with ❤️ by developers who got tired of over-engineered frontends.**

**Philosophy**: Keep it simple, keep it clean, make it work.

---

## 中文

> NestJS Starter Pro 的前端管理界面。
> 基于 React 18 + TypeScript 5 + Ant Design 5 的现代化管理后台。

---

## 🎯 项目简介

这是 **NestJS Starter Pro** 的前端管理界面 - 一个轻量级的后台管理框架。使用现代 React 生态系统构建，提供最佳的开发体验和生产性能。

**适合**：
- 💼 接私活快速搭建管理后台
- 🚀 初创公司构建 MVP 产品
- 🎓 学习 React 最佳实践
- 🛠️ 个人项目需要专业 UI

---

## ✨ 核心特性

- 🎯 **Feature-First 架构** - 按业务模块组织代码
- 🔐 **完整 RBAC 系统** - 权限守卫、基于角色的访问控制
- 📊 **智能状态管理** - Zustand（客户端）+ TanStack Query（服务端）
- 🎨 **现代化 UI** - Ant Design 5 + Tailwind CSS + 深色模式
- 🚀 **极速开发** - Vite 6 + HMR + TypeScript
- 📱 **响应式设计** - PC 优先，兼顾平板
- 🧪 **完整测试** - Vitest（单元测试）+ Playwright（E2E 测试）
- 🌓 **深色模式** - 精美的深色主题，平滑过渡

---

## 📦 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问：http://localhost:3001

默认账号：`admin` / `admin123`（运行后端 migration 后）

---

## 📚 文档

- **[CLAUDE.md](./CLAUDE.md)**：AI 辅助开发指南
- **[后端 README](../home-admin/README.md)**：后端文档
- **[架构决策](../docs/ADR.md)**：为什么这样设计
- **[框架对比](../docs/COMPARISON.md)**：与其他框架对比

---

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

---

**由厌倦了过度设计前端的开发者用 ❤️ 构建。**

**理念**：保持简单，保持干净，让它工作。
