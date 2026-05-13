import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/shared/components/error/ErrorBoundary';
import { MobileProviders } from './MobileProviders';
import { MobileDebugPanel } from './debug/MobileDebugPanel';
import { mobileRoutes } from './mobileRoutes';
export { MobileProtectedRoute } from './MobileProtectedRoute';

const router = createBrowserRouter(mobileRoutes, { basename: '/m' });

function MobileApp() {
  return (
    <ErrorBoundary>
      <MobileProviders>
        <RouterProvider router={router} />
        <MobileDebugPanel />
      </MobileProviders>
    </ErrorBoundary>
  );
}

export default MobileApp;
