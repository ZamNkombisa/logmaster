import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDrivers, createDriver, deleteDriver } from '../api/drivers';
import { getVehicles, createVehicle, deleteVehicle } from '../api/vehicles';
import type { Driver, Vehicle } from '../types';

export function FleetPage() {
  const { hasRole } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [driverName, setDriverName] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [d, v] = await Promise.all([getDrivers(), getVehicles()]);
      setDrivers(d);
      setVehicles(v);
    } catch {
      setError('Could not load fleet data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDriver(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createDriver({ fullName: driverName, licenseNumber: driverLicense });
      setDriverName('');
      setDriverLicense('');
      await loadAll();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not add driver.');
    }
  }

  async function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createVehicle({ vehicleNumber, licensePlate: vehiclePlate || undefined });
      setVehicleNumber('');
      setVehiclePlate('');
      await loadAll();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not add vehicle.');
    }
  }

  async function handleDeleteDriver(id: number) {
    try {
      await deleteDriver(id);
      await loadAll();
    } catch {
      setError('Could not delete driver.');
    }
  }

  async function handleDeleteVehicle(id: number) {
    try {
      await deleteVehicle(id);
      await loadAll();
    } catch {
      setError('Could not delete vehicle.');
    }
  }

  if (loading) return <div className="text-gray-400">Loading fleet…</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Fleet</h1>
      {error && <p className="text-violation-text bg-violation-bg text-sm rounded-lg px-3 py-2 mb-4 w-fit">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Drivers */}
        <div>
          <h2 className="text-sm text-gray-400 mb-2">Drivers</h2>
          <form onSubmit={handleAddDriver} className="flex gap-2 mb-3">
            <input
              placeholder="Full name"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              required
              className="flex-1 bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="License #"
              value={driverLicense}
              onChange={(e) => setDriverLicense(e.target.value)}
              required
              className="flex-1 bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm"
            />
            <button type="submit" className="bg-lime text-graphite font-medium rounded-lg px-4 py-2 text-sm">Add</button>
          </form>

          <div className="bg-graphite-card rounded-xl overflow-hidden">
            {drivers.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-4 py-3 text-sm border-t border-graphite-border first:border-t-0">
                <span>{d.fullName} <span className="text-gray-500">— {d.licenseNumber}</span></span>
                {hasRole('Admin') && (
                  <button onClick={() => handleDeleteDriver(d.id)} className="text-violation-text text-xs hover:underline">
                    Remove
                  </button>
                )}
              </div>
            ))}
            {drivers.length === 0 && <p className="text-gray-500 text-sm px-4 py-4">No drivers yet.</p>}
          </div>
        </div>

        {/* Vehicles */}
        <div>
          <h2 className="text-sm text-gray-400 mb-2">Vehicles</h2>
          <form onSubmit={handleAddVehicle} className="flex gap-2 mb-3">
            <input
              placeholder="Vehicle #"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              required
              className="flex-1 bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="License plate"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              className="flex-1 bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm"
            />
            <button type="submit" className="bg-lime text-graphite font-medium rounded-lg px-4 py-2 text-sm">Add</button>
          </form>

          <div className="bg-graphite-card rounded-xl overflow-hidden">
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-4 py-3 text-sm border-t border-graphite-border first:border-t-0">
                <span>{v.vehicleNumber} <span className="text-gray-500">— {v.licensePlate ?? 'no plate'}</span></span>
                {hasRole('Admin') && (
                  <button onClick={() => handleDeleteVehicle(v.id)} className="text-violation-text text-xs hover:underline">
                    Remove
                  </button>
                )}
              </div>
            ))}
            {vehicles.length === 0 && <p className="text-gray-500 text-sm px-4 py-4">No vehicles yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}