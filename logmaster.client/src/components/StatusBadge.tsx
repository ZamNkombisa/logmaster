interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  Driving: 'bg-dispatch-driving/15 text-dispatch-driving border-dispatch-driving/30',
  OnDuty: 'bg-dispatch-onduty/15 text-dispatch-onduty border-dispatch-onduty/30',
  Sleeper: 'bg-dispatch-sleeper/15 text-dispatch-sleeper border-dispatch-sleeper/30',
  OffDuty: 'bg-dispatch-off text-dispatch-muted border-dispatch-border',
  Scheduled: 'bg-dispatch-steel/15 text-dispatch-steel border-dispatch-steel/30',
  InProgress: 'bg-dispatch-amber/15 text-dispatch-amber border-dispatch-amber/30',
  Completed: 'bg-dispatch-driving/15 text-dispatch-driving border-dispatch-driving/30',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-dispatch-off text-dispatch-muted border-dispatch-border';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-mono uppercase tracking-wide ${style}`}
    >
      {status}
    </span>
  );
}
