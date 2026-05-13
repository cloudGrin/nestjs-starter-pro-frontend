import { Navigate, type RouteObject } from 'react-router-dom';
import { MobileShell } from './MobileShell';
import { MobileInsuranceDetailPage } from './pages/MobileInsuranceDetailPage';
import { MobileInsurancePage } from './pages/MobileInsurancePage';
import { MobileBabyBirthdayPage, MobileBabyPage } from './pages/MobileBabyPage';
import {
  MobileFamilyChatPage,
  MobileFamilyComposePage,
  MobileFamilyPage,
} from './pages/MobileFamilyPage';
import { MobileLoginPage } from './pages/MobileLoginPage';
import { MobileNotFoundPage } from './pages/MobileNotFoundPage';
import { MobileNotificationsPage } from './pages/MobileNotificationsPage';
import { MobileProfilePage } from './pages/MobileProfilePage';
import { MobileTaskDetailPage } from './pages/MobileTaskDetailPage';
import { MobileTaskPage } from './pages/MobileTaskPage';
import { DEFAULT_MOBILE_HOME_PATH } from './routes';
import { MobileProtectedRoute } from './MobileProtectedRoute';

export const mobileRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <MobileLoginPage />,
  },
  {
    path: '/',
    children: [
      {
        element: <MobileShell />,
        children: [
          { index: true, element: <Navigate to={DEFAULT_MOBILE_HOME_PATH} replace /> },
          { path: 'family', element: <MobileFamilyPage /> },
          {
            element: <MobileProtectedRoute />,
            children: [
              { path: 'family/baby', element: <MobileBabyPage /> },
              { path: 'family/baby/birthdays/:birthdayId', element: <MobileBabyBirthdayPage /> },
              { path: 'family/compose', element: <MobileFamilyComposePage /> },
              { path: 'family/posts/:id', element: <Navigate to="/family" replace /> },
              { path: 'family/chat', element: <MobileFamilyChatPage /> },
              { path: 'tasks', element: <MobileTaskPage /> },
              { path: 'insurance', element: <MobileInsurancePage /> },
              { path: 'notifications', element: <MobileNotificationsPage /> },
              { path: 'profile', element: <MobileProfilePage /> },
            ],
          },
        ],
      },
      {
        element: <MobileProtectedRoute />,
        children: [
          { path: 'tasks/:id', element: <MobileTaskDetailPage /> },
          { path: 'insurance/:id', element: <MobileInsuranceDetailPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <MobileNotFoundPage />,
  },
];
