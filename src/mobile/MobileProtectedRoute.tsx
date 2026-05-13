import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';

export function MobileProtectedRoute() {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const from = `${location.pathname}${location.search}${location.hash}`;

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return <Outlet />;
}
