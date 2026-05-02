import { Outlet } from 'react-router-dom';

export function MobileShell() {
  return (
    <div className="mobile-shell">
      <main className="mobile-content">
        <Outlet />
      </main>
    </div>
  );
}
