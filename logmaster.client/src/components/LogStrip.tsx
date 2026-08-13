import type { LogEntry, DutyStatus } from '../types';

const STATUS_ROWS: { status: DutyStatus; label: string; colorClass: string }[] = [
  { status: 'Driving', label: 'Driving', colorClass: 'bg-dispatch-driving' },
  { status: 'OnDuty', label: 'On Duty (not driving)', colorClass: 'bg-dispatch-onduty' },
  { status: 'Sleeper', label: 'Sleeper Berth', colorClass: 'bg-dispatch-sleeper' },
  { status: 'OffDuty', label: 'Off Duty', colorClass: 'bg-dispatch-off' },
];

const MINUTES_IN_DAY = 24 * 60;

function minutesSinceMidnight(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

interface LogStripProps {
  entries: LogEntry[];
  dateLabel: string;
}

/**
 * Renders a trip's duty-status entries as a 24-hour banded timeline,
 * modeled on the classic paper/ELD hours-of-service log grid: one row
 * per duty status, with filled bands showing when the driver was in
 * that status across the day.
 */
export function LogStrip({ entries, dateLabel }: LogStripProps) {
  const hourMarks = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div className="bg-dispatch-panel border border-dispatch-border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg tracking-wide uppercase text-dispatch-text">
          Duty Status Log
        </h3>
        <span className="font-mono text-xs text-dispatch-muted">{dateLabel}</span>
      </div>

      {/* Hour markers */}
      <div className="flex text-[10px] font-mono text-dispatch-muted mb-1 pl-32">
        {hourMarks.map((h) => (
          <div key={h} className="flex-1 text-center">
            {h % 3 === 0 ? h : ''}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {STATUS_ROWS.map((row) => (
          <div key={row.status} className="flex items-center">
            <div className="w-32 shrink-0 text-xs font-body text-dispatch-muted pr-2 text-right">
              {row.label}
            </div>
            <div className="relative flex-1 h-5 bg-dispatch-bg border border-dispatch-border rounded-sm overflow-hidden">
              {entries
                .filter((e) => e.status === row.status)
                .map((e) => {
                  const start = minutesSinceMidnight(e.startTime);
                  const end = minutesSinceMidnight(e.endTime) || MINUTES_IN_DAY;
                  const left = (start / MINUTES_IN_DAY) * 100;
                  const width = ((end - start) / MINUTES_IN_DAY) * 100;
                  return (
                    <div
                      key={e.id}
                      className={`absolute top-0 h-full ${row.colorClass}`}
                      style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%` }}
                      title={`${row.label}: ${new Date(e.startTime).toLocaleTimeString()} \u2013 ${new Date(e.endTime).toLocaleTimeString()}`}
                    />
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 pl-32">
        {STATUS_ROWS.map((row) => (
          <div key={row.status} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${row.colorClass}`} />
            <span className="text-[11px] text-dispatch-muted">{row.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
