# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- Removed stale E2E configuration and Playwright dependency.
- Simplified shared utilities and exports to match production usage.
- Kept testing scope focused on Vitest unit and component tests.

### Fixed
- Avoid self-redirecting `/` when backend menus contain no resolvable page.
- Synchronize refreshed access tokens with auth store and WebSocket state.

## [2.0.0] - 2025-11-04

### Added
- RBAC management: users, roles, menus, permissions.
- Dashboard based on current backend list APIs and unread notifications.
- File management: direct upload, list, detail, download, delete.
- Notification center with WebSocket updates.
- API app and API key management.
- Dynamic backend-driven routing with component registry aliases.
- Dark mode, shared layout components, search forms, table actions, status badges, empty states.
- Vitest test setup for unit and component tests.

### Changed
- Project renamed to `nestjs-starter-pro-web`.
- Frontend aligned with the simplified `home-admin` Swagger contract.
