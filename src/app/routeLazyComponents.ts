import { lazy } from 'react';

export const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({
    default: m.LoginPage,
  }))
);

export const ProfilePage = lazy(() =>
  import('@/features/auth/pages/ProfilePage').then((m) => ({
    default: m.ProfilePage,
  }))
);

export const MainLayout = lazy(() =>
  import('@/shared/components/layouts/MainLayout').then((m) => ({
    default: m.MainLayout,
  }))
);

export const NotFoundPage = lazy(() =>
  import('@/shared/pages/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
  }))
);
