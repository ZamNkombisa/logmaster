import React from 'react';

const LogGrid = ({ entries = [] }) => {
  const hours = Array.from({ length: 25 }, (_, i) => i);
  const statuses = [
    { id: 'OFF', label: '1: OFF DUTY', color: '#000000' },
    { id: 'SB', label: '2: SLEEPER BERTH', color: '#000000' },
    { id: 'D', label: '3: DRIVING', color: '#000000' },
    { id: 'ON', label: '4: ON DUTY (NOT DRIVING)', color: '#000000' }
  ];

  const getTimePos = (dateStr) => {
    const date = new Date(dateStr);
    const totalMinutes = (date.getHours() * 60) + date.getMinutes();
    return (totalMinutes / 1440) * 100;
  };

  const getStatusY = (status) => {
    const idx = statuses.findIndex(s => s.id === status);
    return idx * 45 + 22.5;
  };

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="relative h-[200px] border-2 border-slate-900 bg-white" style={{ minWidth: '850px' }}>
        
        {/* Horizontal Status Lanes */}
        {statuses.map((s, i) => (
          <div key={s.id} className="absolute w-full h-[45px] border-b border-slate-100 flex items-center px-2" style={{ top: i * 45 }}>
            <span className="text-[9px] font-black text-blue-600 w-28 uppercase leading-none">{s.label}</span>
          </div>
        ))}

        {/* Vertical Hour Markers */}
        <div className="absolute inset-0 flex justify-between pointer-events-none">
          {hours.map(h => (
            <div key={h} className="h-full border-l border-slate-300 relative">
              <span className="absolute -top-5 -left-1 text-[10px] font-black text-slate-900">{h === 12 ? 'noon' : h === 24 ? 'M' : h}</span>
            </div>
          ))}
        </div>

        {/* SVG Path with Red Separation Nodes */}
        <svg className="absolute inset-0 w-full h-full">
          {entries.map((entry, i) => {
            const startX = `${getTimePos(entry.start_time)}%`;
            const endX = `${getTimePos(entry.end_time)}%`;
            const y = getStatusY(entry.status);
            const nextEntry = entries[i + 1];

            return (
              <g key={i}>
                {/* Main Black Status Line */}
                <line x1={startX} y1={y} x2={endX} y2={y} stroke="black" strokeWidth="3" />
                
                {/* Red Separation Dot at Start of segment */}
                <circle cx={startX} cy={y} r="3" fill="#ef4444" />
                
                {/* Vertical Transition Line and Red Dot at End */}
                {nextEntry && (
                  <>
                    <line x1={endX} y1={y} x2={endX} y2={getStatusY(nextEntry.status)} stroke="black" strokeWidth="2" />
                    <circle cx={endX} cy={y} r="3" fill="#ef4444" />
                  </>
                )}
                {/* Final Dot at the very end of the line */}
                {!nextEntry && <circle cx={endX} cy={y} r="3" fill="#ef4444" />}
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend & Remarks footer */}
      <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-slate-400">
         <p>REMARKS: Locations must be noted at every status change.</p>
         <div className="flex gap-4">
            <span className="text-red-500">● STATUS CHANGE NODE</span>
         </div>
      </div>
    </div>
  );
};

export default LogGrid;