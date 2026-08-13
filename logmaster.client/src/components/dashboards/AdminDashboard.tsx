import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary } from '../../api/dashboard';
import { getUsers } from '../../api/users';
import type { DashboardSummary } from '../../types';

export function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardSummary(), getUsers()])
      .then(([summaryData, users]) => {
        setSummary(summaryData);
        setTotalUsers(users.length);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">Loading…</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Admin overview</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total users" value={totalUsers} />
        <StatCard label="Drivers" value={summary?.totalDrivers ?? 0} />
        <StatCard label="Vehicles" value={summary?.totalVehicles ?? 0} />
        <StatCard label="Violations (30d)" value={summary?.violationsLast30Days ?? 0} tone="violation" />
      </div>

      <div className="flex gap-3">
        <Link to="/users" className="bg-graphite-card rounded-xl px-4 py-3 text-sm hover:bg-graphite-input/40">
          Manage users →
        </Link>
        <Link to="/fleet" className="bg-graphite-card rounded-xl px-4 py-3 text-sm hover:bg-graphite-input/40">
          Manage fleet →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: 'violation' }) {
  return (
    <div className={`rounded-xl p-4 ${tone === 'violation' ? 'bg-violation-bg' : 'bg-graphite-card'}`}>
      <p className={`text-xs mb-1 ${tone === 'violation' ? 'text-violation-text/80' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-2xl font-semibold ${tone === 'violation' ? 'text-violation-text' : ''}`}>{value}</p>
    </div>
  );
}