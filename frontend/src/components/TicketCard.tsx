import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, HelpCircle, MessageSquare, Clock, User, ArrowRight } from 'lucide-react';


interface Ticket {
  id: string;
  title: string;
  description: string;
  category: 'complaint' | 'suggestion' | 'issue';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  user?: { name: string; email: string } | null;
}

interface TicketCardProps {
  ticket: Ticket;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'closed':
        return 'bg-slate-100 text-slate-500 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'complaint':
        return <AlertCircle className="w-4 h-4 mr-1.5 text-rose-500" />;
      case 'suggestion':
        return <HelpCircle className="w-4 h-4 mr-1.5 text-emerald-500" />;
      default:
        return <MessageSquare className="w-4 h-4 mr-1.5 text-indigo-500" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      className="p-5 bg-white border border-slate-150 rounded-2xl shadow-premium hover:shadow-premium-hover transition-all duration-300 cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Badges row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-1.5">
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase tracking-wider ${getStatusBadge(ticket.status)}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                ticket.status === 'open' ? 'bg-emerald-500' :
                ticket.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-400'
              }`}></span>
              {ticket.status.replace('_', ' ')}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase tracking-wider ${getPriorityBadge(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </div>

          <span className="flex items-center text-xs font-semibold text-slate-500 capitalize">
            {getCategoryIcon(ticket.category)}
            {ticket.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-outfit font-bold text-slate-800 text-sm group-hover:text-brand-900 transition-colors line-clamp-1 mb-1">
          {ticket.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {ticket.description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-auto">
        <div className="flex items-center text-[10px] text-slate-400 space-x-3">
          <span className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {formatDate(ticket.createdAt)}
          </span>
          <span className="flex items-center">
            <User className="w-3.5 h-3.5 mr-1" />
            {ticket.user?.name || 'Anonymous Guest'}
          </span>
        </div>

        <span className="text-[10px] font-bold text-brand-600 flex items-center group-hover:translate-x-1 transition-transform">
          View Detail
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </div>
  );
};

export default TicketCard;
export type { Ticket };
