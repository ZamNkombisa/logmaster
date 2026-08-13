import { useAuth } from '../context/AuthContext';
import { DriverDashboard } from '../components/dashboards/DriverDashboard';
import { DispatcherDashboard } from '../components/dashboards/DispacherDashboard';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';

export function DashboardPage() {
  const { hasRole } = useAuth();

  if (hasRole('Admin')) return <AdminDashboard />;
  if (hasRole('Dispatcher')) return <DispatcherDashboard />;
  return <DriverDashboard />;
}