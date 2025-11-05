/**
 * 共享组件统一导出
 */

// 布局组件
export { MainLayout } from './layouts/MainLayout';
export { PageWrap } from './layouts/PageWrap';
// PageHeader已废弃，请使用PageWrap替代

// 搜索组件
export { SearchForm } from './search/SearchForm';

// 表格组件
export { TableActions } from './table/TableActions';

// 反馈组件
export { EmptyState } from './feedback/EmptyState';
export {
  TableSkeleton,
  CardSkeleton,
  FormSkeleton,
  ListSkeleton,
  StatCardSkeleton,
  Detailskeleton,
} from './feedback/Skeleton';

// 显示组件
export { StatusBadge, BooleanBadge, EnabledBadge } from './display/StatusBadge';

// 插画组件
export {
  EmptyIllustration,
  NotFoundIllustration,
  NoAccessIllustration,
  ErrorIllustration,
  NoSearchResultIllustration,
  LoadingIllustration,
  SuccessIllustration,
  CongratulationIllustration,
} from './illustrations';

// 认证组件
export { PermissionGuard } from './auth/PermissionGuard';
export { RoleGuard } from './auth/RoleGuard';
export { ProtectedRoute } from './auth/ProtectedRoute';

// 错误处理组件
export { ErrorBoundary } from './error/ErrorBoundary';
