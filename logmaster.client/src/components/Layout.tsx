import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-graphite text-white">
      <nav className="flex items-center justify-between px-6 py-3 border-b border-graphite-border">
        <div className="flex items-center gap-2">
          <span className="text-lime text-lg">🚛</span>
          <span className="font-bold text-2xl tracking-tight">L O G M A S T E R</span>
        </div>

        <div className="flex items-center gap-6 text-base text-gray-300">
          <Link to="/" className="hover:text-white">Dashboard</Link>
          <Link to="/trips" className="hover:text-white">Trips</Link>
          {hasRole('Admin') && <Link to="/users" className="hover:text-white">Users</Link>}
          {hasRole('Admin', 'Dispatcher') && <Link to="/fleet" className="hover:text-white">Fleet</Link>}

          <button
            onClick={handleLogout}
            className="w-7 h-7 rounded-full bg-graphite-card flex items-center justify-center text-xs text-lime hover:ring-1 hover:ring-lime"
            title="Log out"
          >
            {initials}
          </button>
        </div>
      </nav>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}