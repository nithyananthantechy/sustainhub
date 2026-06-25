import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Leaf, Inbox, Send, CheckCircle2, AlertCircle, Sparkles, Activity } from 'lucide-react';

interface Metric {
  id: string;
  metricName: string;
  metricValue: string | number;
  metricUnit: string;
  category: 'environmental' | 'social' | 'economic';
  description?: string | null;
}

interface Stat {
  id: string;
  statName: string;
  statValue: string | number;
  statUnit: string;
}

const Widget: React.FC = () => {
  // Extract parameters from URL query string
  const queryParams = new URLSearchParams(window.location.search);
  const companyId = queryParams.get('company_id');
  const brandColor = queryParams.get('brand') || 'indigo'; // e.g. emerald, teal, indigo, blue, violet

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [activeTab, setActiveTab] = useState<'metrics' | 'contact'>('metrics');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ticket Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'complaint' | 'suggestion' | 'issue'>('issue');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

  useEffect(() => {
    if (!companyId) {
      setError('Missing target Company ID (company_id parameter required in URL).');
      setLoading(false);
      return;
    }

    const fetchPublicData = async () => {
      try {
        const [metricsRes, statsRes] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/csr-metrics/public/${companyId}`),
          axios.get(`${apiBaseUrl}/api/stats/public/${companyId}`),
        ]);
        setMetrics(metricsRes.data);
        setStats(statsRes.data);
      } catch (err: any) {
        console.error('Failed to load widget statistics:', err);
        setError('Failed to resolve target company statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, [companyId, apiBaseUrl]);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !companyId) return;

    setSubmitting(true);
    try {
      const res = await axios.post(`${apiBaseUrl}/api/tickets`, {
        companyId,
        title,
        description,
        category,
        priority,
      });

      setSubmitted(true);
      setTitle('');
      setDescription('');

      // Communicate success to parent window using postMessage
      if (window.parent) {
        window.parent.postMessage(
          {
            event: 'ticket:submitted',
            ticketId: res.data.ticket?.id,
            timestamp: new Date(),
          },
          '*'
        );
      }
    } catch (err: any) {
      console.error('Error submitting public ticket:', err);
      alert('An error occurred submitting your inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Resolve branding classes dynamically based on query configuration
  const getBrandClasses = () => {
    switch (brandColor) {
      case 'emerald':
        return {
          text: 'text-emerald-600',
          bg: 'bg-emerald-600 hover:bg-emerald-700',
          border: 'border-emerald-100',
          focusRing: 'focus:ring-emerald-500/10 focus:border-emerald-500',
          tabActive: 'border-emerald-500 text-emerald-600',
          pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'teal':
        return {
          text: 'text-teal-600',
          bg: 'bg-teal-600 hover:bg-teal-700',
          border: 'border-teal-100',
          focusRing: 'focus:ring-teal-500/10 focus:border-teal-500',
          tabActive: 'border-teal-500 text-teal-600',
          pill: 'bg-teal-50 text-teal-700 border-teal-200',
        };
      case 'rose':
        return {
          text: 'text-rose-600',
          bg: 'bg-rose-600 hover:bg-rose-700',
          border: 'border-rose-100',
          focusRing: 'focus:ring-rose-500/10 focus:border-rose-500',
          tabActive: 'border-rose-500 text-rose-600',
          pill: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      default: // indigo
        return {
          text: 'text-indigo-600',
          bg: 'bg-indigo-600 hover:bg-indigo-700',
          border: 'border-indigo-100',
          focusRing: 'focus:ring-indigo-500/10 focus:border-indigo-500',
          tabActive: 'border-indigo-600 text-indigo-600',
          pill: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
    }
  };

  const brand = getBrandClasses();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-100">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-655 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-start space-x-2 text-xs">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-150 shadow-sm p-4 overflow-hidden flex flex-col h-full text-slate-800">
      
      {/* Mini Widget Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center space-x-1.5">
          <div className={`w-2.5 h-2.5 rounded-full bg-emerald-500`}></div>
          <span className="font-outfit font-extrabold text-xs tracking-tight">Sustainability Telemetry</span>
        </div>
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Feed Widget</span>
      </div>

      {/* Tabs selectors */}
      <div className="flex border-b border-slate-100 text-xs font-semibold shrink-0 mb-4">
        <button
          onClick={() => { setActiveTab('metrics'); setSubmitted(false); }}
          className={`flex-1 py-2 text-center border-b-2 transition-all ${
            activeTab === 'metrics' ? brand.tabActive : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          CSR Performance
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex-1 py-2 text-center border-b-2 transition-all ${
            activeTab === 'contact' ? brand.tabActive : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Submit Inquiry
        </button>
      </div>

      {/* Tab content panel */}
      <div className="flex-1 overflow-y-auto pr-0.5">
        
        {activeTab === 'metrics' ? (
          /* Metrics list & Stats feeds */
          <div className="space-y-4">
            {metrics.length > 0 ? (
              <div className="space-y-2.5">
                {metrics.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                        <Leaf className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-700 truncate">{m.metricName}</div>
                        <p className="text-[9px] text-slate-400 truncate leading-snug">{m.description || 'Verified ESG objective.'}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-outfit font-extrabold text-sm text-slate-800">
                        {Number(m.metricValue).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400">{m.metricUnit}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No CSR metrics recorded by company.
              </div>
            )}

            {/* Quick stats items */}
            {stats.length > 0 && (
              <div className="border-t border-slate-100 pt-3">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  Live Operational Stats
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {stats.slice(0, 4).map((s) => (
                    <div key={s.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-center">
                      <span className="block text-[9px] font-semibold text-slate-400 truncate">{s.statName}</span>
                      <span className="block font-outfit font-extrabold text-slate-800 mt-0.5 truncate">
                        {Number(s.statValue).toLocaleString()} <span className="text-[9px] font-normal text-slate-400">{s.statUnit}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Ticket submission form tab */
          <div className="h-full">
            {submitted ? (
              <div className="py-8 text-center space-y-3 animate-fadeIn">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">Inquiry Received Successfully</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-normal">
                  Thank you! Your ticket was submitted anonymously and will be reviewed by the operations department.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className={`mt-4 px-4 py-2 border rounded-xl text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-colors`}
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Subject/Inquiry Title
                  </label>
                  <input
                    type="text"
                    placeholder="Short summary..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-xs"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Detailed Message
                  </label>
                  <textarea
                    placeholder="Provide description of your inquiry or feedback..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-xs resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={submitting}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600"
                      disabled={submitting}
                    >
                      <option value="issue">Issue</option>
                      <option value="complaint">Complaint</option>
                      <option value="suggestion">Suggestion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Urgency
                    </label>
                    <select
                      value={priority}
                      onChange={(e: any) => setPriority(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600"
                      disabled={submitting}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !description.trim()}
                  className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center space-x-1.5 disabled:opacity-50 ${brand.bg}`}
                >
                  <Send className="w-3 h-3" />
                  <span>{submitting ? 'Submitting...' : 'Post Message'}</span>
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Widget;
export type { Metric, Stat };
