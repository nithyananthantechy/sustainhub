import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, Info, X, Ticket, RefreshCw, BarChart } from 'lucide-react';

interface LiveAlert {
  id: string;
  title: string;
  message: string;
  type: 'ticket' | 'sync' | 'stat' | 'general';
}

const RealTimeUpdates: React.FC = () => {
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleTicketCreated = (ticket: any) => {
      console.log('[Socket Alert] Ticket created:', ticket);
      addAlert({
        id: `ticket-${ticket.id}-${Date.now()}`,
        title: 'New Support Ticket Created',
        message: `"${ticket.title}" was submitted as a ${ticket.category}.`,
        type: 'ticket',
      });
    };

    const handleTicketUpdated = (ticket: any) => {
      console.log('[Socket Alert] Ticket updated:', ticket);
      addAlert({
        id: `ticket-update-${ticket.id}-${Date.now()}`,
        title: 'Ticket Status Updated',
        message: `Ticket "${ticket.title}" is now marked as ${ticket.status.replace('_', ' ')}.`,
        type: 'ticket',
      });
    };

    const handleMetricsSynced = (data: any) => {
      console.log('[Socket Alert] Metrics synced:', data);
      addAlert({
        id: `sync-${Date.now()}`,
        title: 'CSR Metrics Synchronized',
        message: data.simulated 
          ? `Simulated sync completed. Added/updated ${data.updatedCount} metrics.`
          : `SharePoint list synced. Updated ${data.updatedCount} metrics.`,
        type: 'sync',
      });
    };

    const handleStatAdded = (stat: any) => {
      console.log('[Socket Alert] Stat added:', stat);
      addAlert({
        id: `stat-${stat.id}-${Date.now()}`,
        title: 'Operational Stat Recorded',
        message: `New value for "${stat.statName}" added: ${stat.statValue} ${stat.statUnit}`,
        type: 'stat',
      });
    };

    // Register listeners
    socket.on('ticket:created', handleTicketCreated);
    socket.on('ticket:updated', handleTicketUpdated);
    socket.on('metrics:synced', handleMetricsSynced);
    socket.on('stat:added', handleStatAdded);

    return () => {
      // Remove listeners
      socket.off('ticket:created', handleTicketCreated);
      socket.off('ticket:updated', handleTicketUpdated);
      socket.off('metrics:synced', handleMetricsSynced);
      socket.off('stat:added', handleStatAdded);
    };
  }, [socket]);

  const addAlert = (newAlert: LiveAlert) => {
    setAlerts((prev) => [newAlert, ...prev].slice(0, 5)); // Keep last 5 alerts max
    
    // Auto remove alert after 6 seconds
    setTimeout(() => {
      removeAlert(newAlert.id);
    }, 6000);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'ticket':
        return {
          border: 'border-violet-100',
          indicator: 'bg-violet-500',
          icon: Ticket,
          iconColor: 'text-violet-500 bg-violet-50',
        };
      case 'sync':
        return {
          border: 'border-emerald-100',
          indicator: 'bg-emerald-500',
          icon: RefreshCw,
          iconColor: 'text-emerald-500 bg-emerald-50',
        };
      case 'stat':
        return {
          border: 'border-amber-100',
          indicator: 'bg-amber-500',
          icon: BarChart,
          iconColor: 'text-amber-500 bg-amber-50',
        };
      default:
        return {
          border: 'border-slate-100',
          indicator: 'bg-brand-500',
          icon: Info,
          iconColor: 'text-brand-500 bg-brand-50',
        };
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col space-y-3 w-full max-w-sm pointer-events-none">
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type);
        const Icon = styles.icon;

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto flex items-start p-4 bg-white/95 backdrop-blur-md rounded-2xl border ${styles.border} shadow-premium-hover animate-slideIn`}
          >
            {/* Action Indicator side line */}
            <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl ${styles.indicator}`}></div>
            
            {/* Visual Icon */}
            <div className={`p-2 rounded-xl mr-3 shrink-0 ${styles.iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>

            {/* Content text */}
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-xs font-bold text-slate-800 tracking-tight leading-tight">
                {alert.title}
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug mt-1 font-medium">
                {alert.message}
              </p>
            </div>

            {/* Manual dismissal */}
            <button
              onClick={() => removeAlert(alert.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default RealTimeUpdates;
export type { LiveAlert };
