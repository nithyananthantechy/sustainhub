import React, { useEffect, useState, useCallback } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import TicketCard, { Ticket } from '../components/TicketCard';
import { Inbox, Plus, Filter, AlertCircle, X, CheckCircle, HelpCircle } from 'lucide-react';

const Tickets: React.FC = () => {
  const { company } = useAuth();
  const { socket } = useSocket();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Form state
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'complaint' | 'suggestion' | 'issue'>('issue');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!company) return;
    try {
      const res = await api.get(`/tickets/${company.id}`);
      setTickets(res.data);
    } catch (err) {
      console.error('[Fetch tickets error]:', err);
    } finally {
      setLoading(false);
    }
  }, [company]);

  // Hook socket triggers
  useEffect(() => {
    fetchTickets();

    if (!socket) return;

    const handleSocketUpdate = () => {
      console.log('[Socket] Refreshing tickets list...');
      fetchTickets();
    };

    socket.on('ticket:created', handleSocketUpdate);
    socket.on('ticket:updated', handleSocketUpdate);

    return () => {
      socket.off('ticket:created', handleSocketUpdate);
      socket.off('ticket:updated', handleSocketUpdate);
    };
  }, [socket, fetchTickets]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDescription) {
      setError('Please provide a title and detailed description.');
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      await api.post('/tickets', {
        companyId: company?.id,
        title: ticketTitle,
        description: ticketDescription,
        category: ticketCategory,
        priority: ticketPriority,
      });

      // Clear form & close modal (list refreshes automatically via WebSocket broadcast)
      setTicketTitle('');
      setTicketDescription('');
      setTicketCategory('issue');
      setTicketPriority('medium');
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit support ticket.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter logic
  const filteredTickets = tickets.filter((ticket) => {
    const categoryMatch = filterCategory === 'all' || ticket.category === filterCategory;
    const statusMatch = filterStatus === 'all' || ticket.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || ticket.priority === filterPriority;
    return categoryMatch && statusMatch && priorityMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-semibold">Retrieving tickets inbox...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-outfit font-extrabold text-3xl text-slate-800 tracking-tight">
            Support Tickets
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track user inquiries, operational feedback, and customer complaints in real time.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2.5 bg-brand-700 hover:bg-brand-850 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Ticket
        </button>
      </div>

      {/* Filter panel */}
      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-premium flex flex-wrap gap-4 items-center">
        <span className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
          <Filter className="w-3.5 h-3.5 mr-1.5" />
          Filter Inbox
        </span>

        {/* Category Filter */}
        <div className="flex flex-col">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none focus:border-brand-500 transition-colors"
          >
            <option value="all">All Categories</option>
            <option value="issue">Issues</option>
            <option value="complaint">Complaints</option>
            <option value="suggestion">Suggestions</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none focus:border-brand-500 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-col">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none focus:border-brand-500 transition-colors"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Counter */}
        <span className="ml-auto text-xs font-semibold text-slate-400">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </span>
      </div>

      {/* Tickets List */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-100 rounded-3xl shadow-premium text-slate-400 text-center">
          <Inbox className="w-12 h-12 mb-3 text-slate-300" />
          <span className="text-sm font-bold text-slate-700">No support tickets match your filters.</span>
          <p className="text-xs max-w-sm mt-1 leading-normal">
            Try adjusting your category, status, or priority query configuration.
          </p>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 w-full max-w-md shadow-xl flex flex-col space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-outfit font-extrabold text-lg text-slate-800">Create New Support Ticket</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-accent-rose flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Ticket Title
                </label>
                <input
                  type="text"
                  placeholder="Summarize the issue..."
                  className="input-premium"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  disabled={submitLoading}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Provide all relevant details..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200 text-sm resize-none"
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  disabled={submitLoading}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none focus:border-brand-500"
                    disabled={submitLoading}
                  >
                    <option value="issue">Issue</option>
                    <option value="complaint">Complaint</option>
                    <option value="suggestion">Suggestion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none focus:border-brand-500"
                    disabled={submitLoading}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-700 hover:bg-brand-850 text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 mt-2 flex items-center justify-center disabled:opacity-50"
                disabled={submitLoading}
              >
                {submitLoading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
