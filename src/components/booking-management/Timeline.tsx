import React from 'react';

export interface TimelineEvent {
  id: string;
  status: string;
  timestamp: string;
  description?: string;
  type: 'pending' | 'sent' | 'received' | 'info';
  isCurrent?: boolean;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative pl-4 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event) => (
        <div key={event.id} className="relative pl-8">
          {/* Dot/Icon */}
          <div className={`absolute left-0 top-0 size-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${
            event.type === 'pending' ? 'bg-amber-100 text-amber-600' :
            event.type === 'sent' ? 'bg-blue-100 text-blue-600' :
            event.type === 'received' ? 'bg-slate-100 text-slate-600' :
            'bg-slate-100 text-slate-600'
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {event.type === 'pending' ? 'hourglass_empty' :
               event.type === 'sent' ? 'send' :
               event.type === 'received' ? 'mail' : 'info'}
            </span>
          </div>

          {/* Content */}
          <div>
            <h4 className={`text-sm font-bold ${event.isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>
              {event.status}
            </h4>
            {event.isCurrent && (
                <span className="text-xs font-medium text-slate-500 block mb-1">Current Status</span>
            )}
            <p className="text-xs text-slate-400 mb-2">{event.timestamp}</p>
            {event.description && (
              <div className={`text-sm p-3 rounded-lg border ${
                event.isCurrent ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-transparent border-transparent text-slate-500 pl-0 border-0'
              }`}>
                {event.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
