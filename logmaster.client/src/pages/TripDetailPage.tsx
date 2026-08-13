import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTrip, getLogEntries, completeTrip } from '../api/trips';
import { getComplianceFlags, evaluateCompliance } from '../api/compliance';
import { useAuth } from '../context/AuthContext';
import { RouteMap } from '../components/RouteMap';
import type { Trip, LogEntry, ComplianceFlag, DutyStatus } from '../types';
import { ComplianceCopilot } from '../components/ComplianceCopilot';

export function TripDetailPage() {
  const { id } = useParams();
  const tripId = Number(id);
  const { hasRole } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [flags, setFlags] = useState<ComplianceFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, [tripId]);

  async function loadAll() {
    try {
      const [tripData, entryData, flagData] = await Promise.all([
        getTrip(tripId),
        getLogEntries(tripId),
        getComplianceFlags(tripId),
      ]);
      setTrip(tripData);
      setEntries(entryData);
      setFlags(flagData);
    } catch {
      setError('Could not load trip.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEvaluate() {
    setEvaluating(true);
    setError(null);
    try {
      const result = await evaluateCompliance(tripId);
      setFlags(result);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not evaluate compliance.');
    } finally {
      setEvaluating(false);
    }
  }

  async function handleComplete() {
    setCompleting(true);
    setError(null);
    try {
      await completeTrip(tripId);
      await loadAll();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not complete trip.');
    } finally {
      setCompleting(false);
    }
  }

  const statusColor: Record<DutyStatus, string> = {
    OffDuty: 'bg-info',
    SleeperBerth: 'bg-info',
    Driving: 'bg-lime',
    OnDutyNotDriving: 'bg-warning-text',
  };

  if (loading) return <div className="text-gray-400">Loading trip…</div>;
  if (!trip) return <div className="text-gray-400">Trip not found.</div>;

  const canManage = hasRole('Admin', 'Dispatcher');

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-3xl font-bold">{trip.shipperName}</h1>
          <p className="text-sm text-gray-500">Load #{trip.loadNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          {trip.endTime ? (
            <span className="text-xs px-2.5 py-1 rounded-md bg-graphite-input text-gray-400">Completed</span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-md bg-compliant-bg text-compliant-text">Active</span>
          )}
          {canManage && !trip.endTime && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="bg-graphite-card border border-graphite-border rounded-lg px-3 py-1.5 text-sm hover:border-lime disabled:opacity-50"
            >
              {completing ? 'Completing…' : 'Mark completed'}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-violation-text bg-violation-bg text-sm rounded-lg px-3 py-2 mb-4 w-fit">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-graphite-card rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-4 font-medium">Trip details</p>
          <div className="flex flex-col gap-2.5 text-sm">
            <Row label="Driver" value={trip.driverName || '—'} />
            <Row label="Vehicle" value={trip.vehicleNumber || '—'} />
            <Row label="Distance" value={`${trip.distanceMiles} mi`} />
            <Row label="Avg speed" value={`${trip.averageSpeedMph} mph`} />
            <Row label="Started" value={new Date(trip.startTime).toLocaleString()} />
            {trip.endTime && <Row label="Ended" value={new Date(trip.endTime).toLocaleString()} />}
          </div>
        </div>
        <div className="bg-graphite-card rounded-xl p-6 flex flex-col">
          <p className="text-sm text-gray-400 mb-4 font-medium">Route map</p>
          <div className="flex-1 min-h-[200px] rounded-lg overflow-hidden">
            <RouteMap
              tripId={trip.id}
              originLat={trip.originLat}
              originLng={trip.originLng}
              destinationLat={trip.destinationLat}
              destinationLng={trip.destinationLng}
            />
          </div>
        </div>
      </div>

      <div className="bg-graphite-card rounded-xl p-6 mb-4">
        <p className="text-sm text-gray-400 mb-4 font-medium">Duty status log</p>
        <div className="flex h-8 rounded-lg overflow-hidden mb-2">
          {entries.length === 0 ? (
            <div className="w-full bg-graphite-input" />
          ) : (
            entries.map((e) => <div key={e.id} className={`flex-1 ${statusColor[e.status]}`} title={e.status} />)
          )}
        </div>
      </div>

      <div className="bg-graphite-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400 font-medium">Compliance flags</p>
          {canManage && (
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="bg-lime text-graphite font-medium rounded-lg px-4 py-1.5 text-sm disabled:opacity-60"
            >
              {evaluating ? 'Evaluating…' : 'Evaluate compliance'}
            </button>
          )}
        </div>

        {flags.length === 0 ? (
          <p className="text-gray-500 text-sm">No flags recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {flags.map((f) => (
              <FlagRow key={f.id} flag={f} />
            ))}
          </div>
        )}
      </div>
      {canManage && <ComplianceCopilot tripId={trip.id} />}
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

function FlagRow({ flag }: { flag: ComplianceFlag }) {
  const styles = {
    Violation: 'bg-violation-bg text-violation-text',
    Warning: 'bg-warning-bg text-warning-text',
    Info: 'bg-graphite-input text-info',
  }[flag.severity];

  return (
    <div className={`rounded-lg px-4 py-3 text-sm ${styles}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-xs opacity-80">{flag.ruleCode}</span>
        <span className="text-xs opacity-70">{new Date(flag.detectedAt).toLocaleString()}</span>
      </div>
      <p>{flag.description}</p>
    </div>
  );
}