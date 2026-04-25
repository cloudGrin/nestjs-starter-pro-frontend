# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-04

### 🎉 Major Release - Public Open Source Release

Rebranded from "home Web" to **NestJS Starter Pro Web** - A lightweight, production-ready admin dashboard.

**Philosophy**: "Enterprise-grade code quality with simplified features for 80% of projects."

### ✨ Added

#### Rebranding & Documentation
- Renamed project to "nestjs-starter-pro-web"
- Complete README rewrite with bilingual support (English + Chinese)
- Created CLAUDE.md AI development guide
- Created comprehensive feature documentation
- Added LICENSE (MIT License)
- Added detailed CHANGELOG (this file)

#### Core Features Completed
- **RBAC Management**: Full User, Role, Permission, Menu CRUD functionality
- **File Management**: Upload, download, chunked upload support
- **Task Scheduling**: Visual task management with execution logs
- **Notification System**: WebSocket real-time notifications
- **Data Dictionary**: Dictionary type and item management
- **System Configuration**: Dynamic config management
- **API Key Management**: Third-party app API key creation and management

#### UI/UX Enhancements
- **Dark Mode**: Complete dark theme with smooth transitions
- **Component Library**: Reusable components (PageWrap, SearchForm, TableActions, StatusBadge, EmptyState)
- **Responsive Design**: PC-first, tablet-friendly layout
- **Loading States**: Skeleton screens and loading indicators

#### Developer Experience
- **Code Quality**: ESLint 9 + Prettier 3 configured
- **Type Safety**: TypeScript strict mode with full coverage
- **Testing**: Vitest + Playwright configured
- **State Management**: Zustand (client) + TanStack Query (server)
- **Performance**: Route lazy loading, code splitting

### 📦 Changed
- Project name: "home-web" → "nestjs-starter-pro-web"
- Project positioning: "Family admin" → "Lightweight admin framework"
- Target audience: Home users → Freelancers, startups, learners, small teams
- Updated all documentation to reflect new branding

### 🛠️ Tech Stack
- React 18.3 + TypeScript 5.9
- Vite 7.1 + Ant Design 5.27
- Tailwind CSS 4.1
- React Router 7.9
- Zustand 5.0 + TanStack Query 5.90

### 📚 Documentation
- README.md (bilingual)
- CLAUDE.md (AI development guide)
- docs/FEATURES.md (feature documentation)
- docs/ADR.md (architecture decisions)
- docs/COMPARISON.md (framework comparison)

### 🔐 Security
- ✅ No hardcoded secrets
- ✅ Environment variables properly managed
- ✅ Created .env.example
- ✅ Updated .gitignore for security

---

## [Unreleased]

### Added
- ProtectedRoute组件（路由守卫）- 待实现
- 权限控制组件（PermissionGuard, RoleGuard）- 待实现
- 权限判断Hooks（usePermission, useRole）- 待实现
- 注册页面 - 待实现
- 面包屑导航 - 待实现
- 动态菜单系统 - 待实现

## [0.1.0] - 2025-10-28

### Added - 项目搭建与基础功能

#### 项目初始化
- 使用Vite 6创建React 18 + TypeScript 5项目
- 配置ESLint 9 + Prettier 3代码质量工具
- 配置Tailwind CSS 4样式系统
- 集成Ant Design 5 UI组件库

#### 核心依赖
- 安装React Router 7（路由管理）
- 安装Zustand 5（客户端状态管理）
- 安装TanStack Query 5（服务端状态管理）
- 安装Axios 1（HTTP客户端）
- 安装React Hook Form 7（表单管理）
- 安装dayjs（日期时间工具库）

#### 开发工具
- 配置Vitest（单元测试）
- 配置Playwright 1（E2E测试）
- 配置TypeScript严格模式
- 添加npm脚本（dev, build, lint, format, test等）

#### 项目结构
- 创建Feature-First目录结构
- 创建src/app应用层（App.tsx, router.tsx, providers.tsx）
- 创建src/features功能模块（auth, dashboard）
- 创建src/shared共享模块（components, config, types, utils）

#### 认证模块（Auth）
- 实现authService（登录、注册、刷新、登出等API）
- 实现authStore（Zustand状态管理 + persist持久化）
- 实现LoginPage登录页面
- 实现Axios请求拦截器（自动添加Token）
- 实现Axios响应拦截器（Token过期自动刷新）
- 创建auth相关类型定义（auth.types.ts）

#### 布局系统
- 实现MainLayout主布局组件
  - 左侧可折叠侧边栏
  - 顶部导航栏（用户信息、登出）
  - 内容区域（Outlet）
- 实现静态菜单系统（仪表盘、用户管理、权限管理）
- 实现菜单路由高亮
- 集成登录状态检查（未登录自动跳转）

#### Dashboard仪表盘
- 实现DashboardPage基础版
- 添加统计卡片（用户总数、角色总数、权限总数）
- 显示当前用户信息

#### 类型系统
- 创建user.types.ts（用户、角色、权限类型）
- 创建auth.types.ts（登录、注册、Token相关类型）

#### 配置文件
- 创建app.config.ts（应用全局配置）
- 创建query.config.ts（TanStack Query配置）
- 创建.env.development（开发环境变量）
- 创建.env.production（生产环境变量）

#### 工具函数
- 实现request.ts（Axios封装 + 拦截器）
- 创建全局样式（index.css + Tailwind）

#### 文档
- 创建README.md（项目说明文档）
- 创建CLAUDE.md（AI开发指南）
- 创建CHANGELOG.md（本文件）

### Fixed
- 修复Tailwind CSS初始化失败问题（手动创建配置文件）
- 修复ESLint类型警告（使用unknown替代any）
- 修复MainLayout中未使用的导入（MenuOutlined）

### Changed
- 使用npm而非pnpm（环境兼容性考虑）
- MainLayout采用一体化设计（未拆分子组件）
- 登录页面提前实现（验证认证流程）

## [0.0.0] - 2025-10-27

### Added
- 初始化项目规划
- 完成技术方案设计
- 编写开发计划文档

---

## 版本说明

- **[Unreleased]**: 计划中但未实现的功能
- **[0.1.0]**: 项目搭建与基础功能（M1里程碑）
- **[0.0.0]**: 项目规划阶段

## 贡献者

- Claude Code AI Assistant
- home Team

---

**最后更新**: 2025-10-28
