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

  // Chat State
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hello! I am CommunityGPT. How can I assist you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatResolved, setChatResolved] = useState(false);

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

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !companyId) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const res = await axios.post(`${apiBaseUrl}/api/grievance/chat`, {
        companyId,
        message: userMessage,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      if (res.data.isResolved) {
        setChatResolved(true);
      }

      // Communicate success to parent window using postMessage
      if (window.parent) {
        window.parent.postMessage(
          {
            event: 'ticket:submitted',
            ticketId: res.data.ticketId,
            timestamp: new Date(),
          },
          '*'
        );
      }
    } catch (err: any) {
      console.error('Error submitting chat:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'I encountered an error connecting to the server. Please try again.' }]);
    } finally {
      setChatLoading(false);
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
          onClick={() => { setActiveTab('metrics'); }}
          className={`flex-1 py-2 text-center border-b-2 transition-all ${
            activeTab === 'metrics' ? brand.tabActive : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          CSR Performance
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex-1 py-2 text-center border-b-2 transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'contact' ? brand.tabActive : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>CommunityGPT</span>
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
          /* Chat interface tab */
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-2 space-y-3 bg-slate-50/50 rounded-xl mb-3 border border-slate-100">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-2.5 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-slate-800 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              {chatResolved && (
                <div className="flex justify-center my-2">
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-3 py-1 rounded-full flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Issue Auto-Resolved
                  </span>
                </div>
              )}
            </div>
            
            <form onSubmit={handleChatSubmit} className="shrink-0 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask about noise, air quality, etc..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={chatLoading || !inputText.trim()}
                className={`p-2 text-white font-bold rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 ${brand.bg}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Widget;
export type { Metric, Stat };
