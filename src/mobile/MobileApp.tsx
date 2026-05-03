import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { ErrorBoundary } from '@/shared/components/error/ErrorBoundary';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { MobileProviders } from './MobileProviders';
import { MobileShell } from './MobileShell';
import { MobileInsuranceDetailPage } from './pages/MobileInsuranceDetailPage';
import { MobileInsurancePage } from './pages/MobileInsurancePage';
import { MobileFamilyPage } from './pages/MobileFamilyPage';
import { MobileLoginPage } from './pages/MobileLoginPage';
import { MobileNotFoundPage } from './pages/MobileNotFoundPage';
import { MobileNotificationsPage } from './pages/MobileNotificationsPage';
import { MobileProfilePage } from './pages/MobileProfilePage';
import { MobileTaskDetailPage } from './pages/MobileTaskDetailPage';
import { MobileTaskPage } from './pages/MobileTaskPage';

function MobileProtectedRoute() {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <MobileLoginPage />,
    },
    {
      path: '/',
      element: <MobileProtectedRoute />,
      children: [
        {
          element: <MobileShell />,
          children: [
            { index: true, element: <Navigate to="/tasks" replace /> },
            { path: 'family', element: <MobileFamilyPage /> },
            { path: 'tasks', element: <MobileTaskPage /> },
            { path: 'insurance', element: <MobileInsurancePage /> },
            { path: 'notifications', element: <MobileNotificationsPage /> },
            { path: 'profile', element: <MobileProfilePage /> },
          ],
        },
        { path: 'tasks/:id', element: <MobileTaskDetailPage /> },
        { path: 'insurance/:id', element: <MobileInsuranceDetailPage /> },
      ],
    },
    {
      path: '*',
      element: <MobileNotFoundPage />,
    },
  ],
  { basename: '/m' }
);

function MobileApp() {
  return (
    <ErrorBoundary>
      <MobileProviders>
        <RouterProvider router={router} />
      </MobileProviders>
    </ErrorBoundary>
  );
}

export default MobileApp;
