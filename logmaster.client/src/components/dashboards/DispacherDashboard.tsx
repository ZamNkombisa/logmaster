import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary } from '../../api/dashboard';
import { getTrips } from '../../api/trips';
import type { DashboardSummary, Trip } from '../../types';

export function DispatcherDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDashboardSummary(), getTrips()])
      .then(([summaryData, tripsData]) => {
        setSummary(summaryData);
        setTrips(tripsData);
      })
      .catch(() => setError('Could not load fleet data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">Loading fleet overview…</div>;
  if (error) return <p className="text-violation-text bg-violation-bg text-sm rounded-lg px-3 py-2 w-fit">{error}</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Fleet overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <StatCard label="Active trips" value={summary?.activeTrips ?? 0} />
        <StatCard label="Flagged" value={summary?.flaggedTrips ?? 0} tone="violation" />
        <StatCard label="Drivers on duty" value={summary?.driversOnDuty ?? 0} />
      </div>

      <div className="bg-graphite-card rounded-xl overflow-hidden">
        <div className="grid grid-cols-5 gap-2 px-4 py-2 text-xs text-gray-400">
          <span>Driver</span>
          <span>Vehicle</span>
          <span>Shipper</span>
          <span>Started</span>
          <span>Status</span>
        </div>

        {trips.length === 0 ? (
          <p className="text-gray-500 text-sm px-4 py-6">No trips yet.</p>
        ) : (
          trips.map((trip) => (
            <Link
              to={`/trips/${trip.id}`}
              key={trip.id}
              className="grid grid-cols-5 gap-2 px-4 py-3 text-sm border-t border-graphite-border hover:bg-graphite-input/40"
            >
              <span>{trip.driverName}</span>
              <span className="text-gray-400">{trip.vehicleNumber}</span>
              <span className="text-gray-400">{trip.shipperName}</span>
              <span className="text-gray-400">{new Date(trip.startTime).toLocaleString()}</span>
              <span>
                {trip.endTime ? (
                  <Badge tone="neutral">Completed</Badge>
                ) : (
                  <Badge tone="active">Active</Badge>
                )}
              </span>
            </Link>
          ))
        )}
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

function Badge({ children, tone }: { children: React.ReactNode; tone: 'active' | 'neutral' }) {
  const styles = tone === 'active'
    ? 'bg-compliant-bg text-compliant-text'
    : 'bg-graphite-input text-gray-400';
  return <span className={`text-xs px-2 py-0.5 rounded-md ${styles}`}>{children}</span>;
}