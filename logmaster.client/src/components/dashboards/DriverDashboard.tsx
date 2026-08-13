import { useEffect, useState } from "react";
import {
  getTrips,
  createTrip,
  getLogEntries,
  createLogEntry,
  completeTrip,
} from "../../api/trips";
import { getVehicles } from "../../api/vehicles";
import { RouteMap } from "../RouteMap";
import { LocationPicker } from "../LocationPicker";
import { AddressAutocomplete } from "../AddressAutocomplete";
import type { Trip, Vehicle, LogEntry, DutyStatus } from "../../types";

export function DriverDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const [vehicleId, setVehicleId] = useState("");
  const [shipperName, setShipperName] = useState("");
  const [loadNumber, setLoadNumber] = useState("");
  const [distanceMiles, setDistanceMiles] = useState("");
  const [averageSpeedMph, setAverageSpeedMph] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);

  const [originAddress, setOriginAddress] = useState<string | null>(null);
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<string | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);

  const activeTrip = trips.find((t) => !t.endTime) ?? null;

  useEffect(() => {
    loadTrips();
    getVehicles().then(setVehicles).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTrip) {
      getLogEntries(activeTrip.id).then(setLogEntries).catch(() => {});
    } else {
      setLogEntries([]);
    }
  }, [activeTrip?.id]);

  // Auto-calculate real road distance and average speed once both points are set
  useEffect(() => {
    if (!origin || !destination) {
      setDistanceMiles("");
      setAverageSpeedMph("");
      return;
    }

    setRouteLoading(true);
    const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=false`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const route = data.routes?.[0];
        if (!route) throw new Error("No route found");
        const miles = route.distance / 1609.34;
        const hours = route.duration / 3600;
        setDistanceMiles(miles.toFixed(1));
        setAverageSpeedMph((miles / hours).toFixed(1));
      })
      .catch(() => setError("Could not calculate route. Try different locations."))
      .finally(() => setRouteLoading(false));
  }, [origin, destination]);

  async function loadTrips() {
    try {
      setTrips(await getTrips());
    } catch {
      setError("Could not load trips.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = Boolean(
    vehicleId && shipperName && loadNumber && origin && destination && distanceMiles && averageSpeedMph && !routeLoading
  );

  async function handleCreateTrip(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!vehicleId || !shipperName || !loadNumber || !origin || !destination || !distanceMiles || !averageSpeedMph) {
      setError("Please complete every field, including pickup and dropoff, before starting a trip.");
      return;
    }

    try {
      await createTrip({
        driverId: 0,
        vehicleId: Number(vehicleId),
        shipperName,
        loadNumber,
        distanceMiles: Number(distanceMiles),
        averageSpeedMph: Number(averageSpeedMph),
        startTime: new Date().toISOString(),
        originLat: origin?.[0] ?? null,
        originLng: origin?.[1] ?? null,
        destinationLat: destination?.[0] ?? null,
        destinationLng: destination?.[1] ?? null,
      });
      await loadTrips();
      setShipperName("");
      setLoadNumber("");
      setDistanceMiles("");
      setAverageSpeedMph("");
      setOrigin(null);
      setOriginAddress(null);
      setDestination(null);
      setDestinationAddress(null);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Could not create trip.");
    }
  }

  async function handleCompleteTrip() {
    if (!activeTrip) return;
    setCompleting(true);
    setError(null);
    try {
      await completeTrip(activeTrip.id);
      await loadTrips();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Could not complete trip.");
    } finally {
      setCompleting(false);
    }
  }

  if (loading) return <div className="text-gray-400">Loading…</div>;

  if (!activeTrip) {
    return (
      <div className="h-[calc(100vh-73px)] -m-6 flex">
        <div className="w-[380px] shrink-0 border-r border-graphite-border p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-1">Start a new trip</h1>
          <p className="text-sm text-gray-500 mb-5">You have no active trip right now.</p>

          <form onSubmit={handleCreateTrip} className="flex flex-col gap-3">
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              className="bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.vehicleNumber}</option>
              ))}
            </select>
            <input
              placeholder="Shipper name"
              value={shipperName}
              onChange={(e) => setShipperName(e.target.value)}
              required
              className="bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Load number"
              value={loadNumber}
              onChange={(e) => setLoadNumber(e.target.value)}
              required
              className="bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm"
            />

            <AddressAutocomplete
              label="Pickup location"
              placeholder="Search an address…"
              selectedAddress={originAddress}
              onSelect={(r) => {
                if (isNaN(r.lat)) { setOriginAddress(null); setOrigin(null); return; }
                setOriginAddress(r.address);
                setOrigin([r.lat, r.lng]);
              }}
            />
            <AddressAutocomplete
              label="Dropoff location"
              placeholder="Search an address…"
              selectedAddress={destinationAddress}
              onSelect={(r) => {
                if (isNaN(r.lat)) { setDestinationAddress(null); setDestination(null); return; }
                setDestinationAddress(r.address);
                setDestination([r.lat, r.lng]);
              }}
            />

            <div className="flex gap-3">
              <div className="flex-1 bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm text-gray-300">
                {routeLoading ? "Calculating…" : distanceMiles ? `${distanceMiles} mi` : "Distance (set pickup & dropoff)"}
              </div>
              <div className="flex-1 bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm text-gray-300">
                {routeLoading ? "Calculating…" : averageSpeedMph ? `${averageSpeedMph} mph avg` : "Avg speed (auto)"}
              </div>
            </div>

            {error && <p className="text-violation-text bg-violation-bg text-xs rounded-lg px-3 py-2">{error}</p>}
            <button
              type="submit"
              disabled={!canSubmit}
              className="bg-lime text-graphite font-semibold rounded-lg py-2.5 text-sm mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start trip
            </button>
          </form>
        </div>

        <div className="flex-1">
          <LocationPicker origin={origin} destination={destination} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{activeTrip.shipperName}</h1>
          <p className="text-sm text-gray-500">Load #{activeTrip.loadNumber} — in progress</p>
        </div>
        <button
          onClick={handleCompleteTrip}
          disabled={completing}
          className="bg-graphite-card border border-graphite-border rounded-lg px-4 py-2 text-sm hover:border-lime disabled:opacity-50"
        >
          {completing ? "Completing…" : "End trip"}
        </button>
      </div>

      {error && (
        <p className="text-violation-text bg-violation-bg text-xs rounded-lg px-3 py-2 mb-4 w-fit">{error}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-graphite-card rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-4 font-medium">Trip details</p>
          <div className="flex flex-col gap-2.5 text-sm">
            <Row label="Vehicle" value={activeTrip.vehicleNumber || "—"} />
            <Row label="Distance" value={`${activeTrip.distanceMiles} mi`} />
            <Row label="Avg speed" value={`${activeTrip.averageSpeedMph} mph`} />
            <Row label="Started" value={new Date(activeTrip.startTime).toLocaleString()} />
          </div>
        </div>
        <div className="bg-graphite-card rounded-xl p-6 flex flex-col">
          <p className="text-sm text-gray-400 mb-4 font-medium">Route map</p>
          <div className="flex-1 min-h-[200px] rounded-lg overflow-hidden">
            <RouteMap
              tripId={activeTrip.id}
              originLat={activeTrip.originLat}
              originLng={activeTrip.originLng}
              destinationLat={activeTrip.destinationLat}
              destinationLng={activeTrip.destinationLng}
            />
          </div>
        </div>
      </div>

      <LogTimeline
        tripId={activeTrip.id}
        entries={logEntries}
        onEntryAdded={() => getLogEntries(activeTrip.id).then(setLogEntries)}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-graphite-border/50 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

const STATUS_LABEL: Record<DutyStatus, string> = {
  OffDuty: "Off duty",
  SleeperBerth: "Sleeper berth",
  Driving: "Driving",
  OnDutyNotDriving: "On duty (not driving)",
};

const STATUS_COLOR: Record<DutyStatus, string> = {
  OffDuty: "bg-info",
  SleeperBerth: "bg-info/60",
  Driving: "bg-lime",
  OnDutyNotDriving: "bg-warning-text",
};

function LogTimeline({
  tripId,
  entries,
  onEntryAdded,
}: {
  tripId: number;
  entries: LogEntry[];
  onEntryAdded: () => void;
}) {
  const [status, setStatus] = useState<DutyStatus>("Driving");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sorted = [...entries].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  const totalMs = sorted.reduce(
    (sum, e) => sum + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()),
    0
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createLogEntry(tripId, { status, startTime, endTime });
      setStartTime("");
      setEndTime("");
      onEntryAdded();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Could not add log entry.");
    }
  }

  return (
    <div className="bg-graphite-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-gray-400 font-medium">Duty status log</p>
        <p className="text-xs text-gray-600">Log each change in what you're doing — driving, on a break, etc.</p>
      </div>

      {sorted.length === 0 ? (
        <div className="h-10 rounded-lg bg-graphite-input flex items-center justify-center text-xs text-gray-600 mb-4 mt-3">
          No entries yet — add your first status below
        </div>
      ) : (
        <>
          <div className="flex h-10 rounded-lg overflow-hidden mb-2 mt-3">
            {sorted.map((entry) => {
              const durationMs = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
              const widthPct = totalMs > 0 ? (durationMs / totalMs) * 100 : 100 / sorted.length;
              return (
                <div
                  key={entry.id}
                  className={`${STATUS_COLOR[entry.status]} ${entry.isAuto ? "opacity-50" : ""}`}
                  style={{ width: `${widthPct}%` }}
                  title={`${STATUS_LABEL[entry.status]}${entry.isAuto ? " (auto)" : ""}: ${new Date(entry.startTime).toLocaleTimeString()} – ${new Date(entry.endTime).toLocaleTimeString()}`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-400">
            {(Object.keys(STATUS_LABEL) as DutyStatus[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${STATUS_COLOR[s]}`} />
                {STATUS_LABEL[s]}
              </span>
            ))}
          </div>
        </>
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DutyStatus)}
            className="bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm"
          >
            {(Object.keys(STATUS_LABEL) as DutyStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">From</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">To</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="bg-lime text-graphite font-medium rounded-lg px-4 py-2 text-sm">
          Add entry
        </button>
      </form>
      {error && <p className="text-violation-text bg-violation-bg text-xs rounded-lg px-3 py-2 mt-2">{error}</p>}
    </div>
  );
}