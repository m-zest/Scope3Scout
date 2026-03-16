import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  userEmail?: string;
}

export function AppLayout({ userEmail }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar userEmail={userEmail} />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
