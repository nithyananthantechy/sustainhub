import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  ArrowLeft, MessageSquare, Clock, Shield, AlertCircle, 
  CheckCircle, Play, Send, CheckSquare, Sparkles, ChevronDown
} from 'lucide-react';

interface ResponseItem {
  id: string;
  responseText: string;
  createdAt: string;
  user: { id: string; name: string; role: string };
}

interface TicketDetailData {
  id: string;
  title: string;
  description: string;
  category: 'complaint' | 'suggestion' | 'issue';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  resolvedAt: string | null;
  user?: { name: string; email: string } | null;
}

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const threadEndRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<TicketDetailData | null>(null);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Fetch ticket details and responses
  const fetchTicketDetails = useCallback(async () => {
    if (!id) return;
    try {
      const [ticketRes, responsesRes] = await Promise.all([
        api.get(`/tickets/detail/${id}`),
        api.get(`/tickets/${id}/responses`),
      ]);
      setTicket(ticketRes.data);
      setResponses(responsesRes.data);
    } catch (err) {
      console.error('[Fetch ticket detail error]:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Hook WebSocket updates for live chat and status synchronizations
  useEffect(() => {
    fetchTicketDetails();

    if (!socket || !id) return;

    // Listen for status changes
    const handleTicketSocketUpdate = (updatedTicket: any) => {
      if (updatedTicket.id === id) {
        console.log('[Socket] Live ticket update received:', updatedTicket);
        setTicket(updatedTicket);
      }
    };

    // Listen for live response messages
    const handleResponseSocketAdded = (data: { ticketId: string; response: ResponseItem }) => {
      if (data.ticketId === id) {
        console.log('[Socket] Live message received:', data.response);
        setResponses((prev) => {
          // Prevent duplicates if submitted by the same client
          if (prev.some((r) => r.id === data.response.id)) return prev;
          return [...prev, data.response];
        });
      }
    };

    socket.on('ticket:updated', handleTicketSocketUpdate);
    socket.on('ticket:response_added', handleResponseSocketAdded);

    return () => {
      socket.off('ticket:updated', handleTicketSocketUpdate);
      socket.off('ticket:response_added', handleResponseSocketAdded);
    };
  }, [socket, id, fetchTicketDetails]);

  // Scroll chat down on new entries
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses]);

  // Submit response
  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponse.trim() || !id) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/tickets/${id}/respond`, {
        responseText: newResponse,
      });
      
      const responsePayload = res.data.response;
      setResponses((prev) => {
        if (prev.some((r) => r.id === responsePayload.id)) return prev;
        return [...prev, responsePayload];
      });
      setNewResponse('');

      // If status changed to in_progress dynamically, update local state
      if (res.data.ticket) {
        setTicket(res.data.ticket);
      }
    } catch (err) {
      console.error('[Submit response error]:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Change Ticket Status
  const handleStatusChange = async (newStatus: string) => {
    if (!id || !ticket) return;
    setStatusUpdating(true);
    try {
      const res = await api.put(`/tickets/${id}`, {
        status: newStatus,
      });
      setTicket(res.data.ticket);
    } catch (err) {
      console.error('[Update status error]:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'closed':
        return 'bg-slate-100 text-slate-500 border-slate-350';
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

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center bg-white border border-slate-100 rounded-3xl shadow-premium">
        <AlertCircle className="w-12 h-12 mx-auto text-rose-500 mb-3" />
        <h3 className="font-outfit font-bold text-slate-700">Ticket not found</h3>
        <p className="text-xs text-slate-400 mt-1">This ticket does not exist or has been deleted.</p>
        <Link to="/tickets" className="mt-4 inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Back button & Ticket content details (Left 2 columns) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Back Link */}
        <Link 
          to="/tickets"
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-brand-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Tickets Inbox
        </Link>

        {/* Ticket Header & Description */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase tracking-wider ${getStatusBadge(ticket.status)}`}>
              {ticket.status.replace('_', ' ')}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase tracking-wider ${getPriorityBadge(ticket.priority)}`}>
              {ticket.priority} priority
            </span>
            <span className="text-[10px] font-bold text-slate-400 border border-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {ticket.category}
            </span>
          </div>

          <h2 className="font-outfit font-extrabold text-2xl text-slate-800 tracking-tight leading-tight">
            {ticket.title}
          </h2>

          <div className="flex items-center text-[10px] text-slate-400 space-x-4 border-b border-slate-50 pb-4">
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              Created: {formatDate(ticket.createdAt)}
            </span>
            {ticket.resolvedAt && (
              <span className="flex items-center text-emerald-600 font-medium">
                <CheckSquare className="w-3.5 h-3.5 mr-1" />
                Resolved: {formatDate(ticket.resolvedAt)}
              </span>
            )}
            <span className="font-medium text-slate-500">
              Submitted by: {ticket.user?.name || 'Anonymous Guest'}
            </span>
          </div>

          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line pt-2">
            {ticket.description}
          </div>
        </div>

        {/* Responses Thread */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium flex flex-col h-[400px]">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-50 mb-4 shrink-0">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <h3 className="font-outfit font-bold text-slate-800 text-sm">Response Thread</h3>
          </div>

          {/* Chat Bubble List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
            {responses.length > 0 ? (
              responses.map((resp) => {
                // Check if response is from the logged-in user to align right
                const isOwnResponse = user && resp.user.id === user.id;

                return (
                  <div key={resp.id} className={`flex flex-col ${isOwnResponse ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-500">{resp.user.name}</span>
                      <span className="text-[8px] font-extrabold uppercase px-1 py-0.25 bg-slate-100 text-slate-400 rounded tracking-wider">
                        {resp.user.role}
                      </span>
                      <span className="text-[9px] text-slate-400">{formatDate(resp.createdAt)}</span>
                    </div>

                    <div className={`p-3.5 rounded-2xl max-w-md text-xs leading-normal shadow-sm ${
                      isOwnResponse 
                        ? 'bg-brand-700 text-white rounded-tr-none' 
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                    }`}>
                      {resp.responseText}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <MessageSquare className="w-8 h-8 mb-2" />
                <span className="text-xs font-semibold">No response comments posted yet.</span>
              </div>
            )}
            <div ref={threadEndRef} />
          </div>

          {/* Quick reply form */}
          {ticket.status !== 'closed' ? (
            <form onSubmit={handleResponseSubmit} className="flex items-center space-x-2 shrink-0 pt-2 border-t border-slate-50">
              <input
                type="text"
                placeholder="Type your response comment..."
                className="input-premium flex-1"
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                disabled={submitting}
              />
              <button
                type="submit"
                className="p-2.5 bg-brand-700 hover:bg-brand-850 text-white rounded-xl shadow-md transition-colors shrink-0 disabled:opacity-50"
                disabled={submitting || !newResponse.trim()}
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs font-medium text-slate-500 select-none">
              This ticket has been closed. No further responses can be posted.
            </div>
          )}
        </div>
      </div>

      {/* Ticket metadata & actions (Right 1 column) */}
      <div className="space-y-6">
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium space-y-4">
          <h3 className="font-outfit font-bold text-slate-800 text-sm pb-2 border-b border-slate-50">
            Staff Actions
          </h3>

          {/* Status Changer */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Change Ticket Status
            </label>
            <div className="relative">
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none appearance-none focus:border-brand-500 transition-colors"
                disabled={statusUpdating || ticket.status === 'closed'}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Helper notes */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/60 text-[10px] text-slate-400 space-y-2 leading-relaxed">
            <div className="flex items-start space-x-1.5">
              <Shield className="w-4.5 h-4.5 text-brand-500 shrink-0 mt-0.5" />
              <span>Only designated administrators and managers can adjust statuses and publish responses.</span>
            </div>
            <div className="flex items-start space-x-1.5">
              <Sparkles className="w-4.5 h-4.5 text-brand-500 shrink-0 mt-0.5" />
              <span>Resolving a ticket updates the completion indicators displayed in the executive KPI widgets.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
