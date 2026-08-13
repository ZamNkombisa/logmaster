import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrips } from '../api/trips';
import { useAuth } from '../context/AuthContext';
import type { Trip } from '../types';

type Tab = 'all' | 'active' | 'completed' | 'flagged';

export function TripsPage() {
  const { hasRole } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('all');

  useEffect(() => {
    getTrips()
      .then(setTrips)
      .catch(() => setError('Could not load trips.'))
      .finally(() => setLoading(false));
  }, []);

  const tabFiltered = trips.filter((t) => {
    if (tab === 'active') return !t.endTime;
    if (tab === 'completed') return !!t.endTime;
    if (tab === 'flagged') return t.hasViolations;
    return true;
  });

  const filtered = tabFiltered.filter((t) =>
    [t.shipperName, t.loadNumber, t.driverName, t.vehicleNumber]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: trips.length },
    { key: 'active', label: 'Active', count: trips.filter((t) => !t.endTime).length },
    { key: 'completed', label: 'Completed', count: trips.filter((t) => !!t.endTime).length },
    { key: 'flagged', label: 'Flagged', count: trips.filter((t) => t.hasViolations).length },
  ];

  if (loading) return <div className="text-gray-400">Loading trips…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{hasRole('Admin', 'Dispatcher') ? 'All trips' : 'My trips'}</h1>
        <input
          placeholder="Search shipper, load #, driver…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm w-64 placeholder:text-gray-600"
        />
      </div>

      <div className="flex gap-2 mb-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-sm px-3 py-1.5 rounded-lg transition ${
              tab === t.key ? 'bg-lime text-graphite font-medium' : 'bg-graphite-card text-gray-400 hover:text-white'
            }`}
          >
            {t.label} <span className="opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {error && <p className="text-violation-text bg-violation-bg text-sm rounded-lg px-3 py-2 mb-4 w-fit">{error}</p>}

      {filtered.length === 0 ? (
        <div className="bg-graphite-card rounded-xl p-10 text-center text-gray-500 text-sm">
          No trips match this view.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((trip) => (
            <Link
              to={`/trips/${trip.id}`}
              key={trip.id}
              className="bg-graphite-card rounded-xl p-4 hover:ring-1 hover:ring-lime/60 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium">{trip.shipperName}</p>
                  <p className="text-xs text-gray-500">Load #{trip.loadNumber}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {trip.hasViolations && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-violation-bg text-violation-text">Flagged</span>
                  )}
                  {trip.endTime ? (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-graphite-input text-gray-400">Completed</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-compliant-bg text-compliant-text">Active</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1 text-sm text-gray-400">
                {hasRole('Admin', 'Dispatcher') && <span>👤 {trip.driverName || '—'}</span>}
                <span>🚚 {trip.vehicleNumber || '—'}</span>
                <span>📏 {trip.distanceMiles} mi @ {trip.averageSpeedMph} mph</span>
                <span className="text-xs text-gray-600 mt-1">{new Date(trip.startTime).toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}