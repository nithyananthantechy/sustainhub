import React, { useEffect, useState, useCallback } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MetricsCard, { Metric } from '../components/MetricsCard';
import MetricsChart from '../components/MetricsChart';
import TicketCard, { Ticket } from '../components/TicketCard';
import ComplianceDashboard from './ComplianceDashboard';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, BarChart, Bar 
} from 'recharts';
import { 
  Ticket as TicketIcon, Clock, Leaf, RefreshCw, AlertCircle, 
  TrendingUp, Activity, Inbox, ArrowRight, MessageSquare 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardSummary {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  totalMetrics: number;
  avgResolutionHours: number;
}

interface AggregatedData {
  metricsSummary: Array<{ category: string; _count: { id: number }; _avg: { metricValue: number } }>;
  ticketsByStatus: Array<{ status: string; _count: { id: number } }>;
  ticketsByPriority: Array<{ priority: string; _count: { id: number } }>;
  recentTickets: Ticket[];
  latestMetrics: Metric[];
  recentStats: Array<{ id: string; statName: string; statValue: string | number; statUnit: string; timestamp: string }>;
}

const Dashboard: React.FC = () => {
  const { user, company } = useAuth();
  const { socket } = useSocket();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [data, setData] = useState<AggregatedData | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [metricHistory, setMetricHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch all dashboard stats
  const fetchDashboardData = useCallback(async () => {
    if (!company) return;
    try {
      const [summaryRes, dataRes, trendsRes] = await Promise.all([
        api.get(`/dashboard/${company.id}/summary`),
        api.get(`/dashboard/${company.id}`),
        api.get('/stats/trends'),
      ]);
      setSummary(summaryRes.data);
      setData(dataRes.data);
      setTrends(trendsRes.data);
    } catch (error) {
      console.error('[Dashboard fetch error]:', error);
    } finally {
      setLoading(false);
    }
  }, [company]);

  // Hook WebSocket event refreshes
  useEffect(() => {
    fetchDashboardData();

    if (!socket) return;

    const handleRefresh = () => {
      console.log('[Socket] Event received, updating dashboard view...');
      fetchDashboardData();
    };

    socket.on('ticket:created', handleRefresh);
    socket.on('ticket:updated', handleRefresh);
    socket.on('metric:updated', handleRefresh);
    socket.on('metric:deleted', handleRefresh);
    socket.on('metrics:synced', handleRefresh);
    socket.on('stat:added', handleRefresh);

    return () => {
      socket.off('ticket:created', handleRefresh);
      socket.off('ticket:updated', handleRefresh);
      socket.off('metric:updated', handleRefresh);
      socket.off('metric:deleted', handleRefresh);
      socket.off('metrics:synced', handleRefresh);
      socket.off('stat:added', handleRefresh);
    };
  }, [socket, fetchDashboardData]);

  // SharePoint Manual Sync trigger
  const handleSyncClick = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.post('/csr-metrics/sync');
      setSyncMessage(`Sync completed: ${res.data.message} (${res.data.count || 0} metrics synced)`);
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (err: any) {
      setSyncMessage(err.response?.data?.error || 'Synchronization failed.');
    } finally {
      setSyncing(false);
    }
  };

  // Fetch details for historical modal
  const handleMetricCardClick = async (metric: Metric) => {
    setSelectedMetric(metric);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/csr-metrics/history?metricId=${metric.id}`);
      setMetricHistory(res.data.history);
    } catch (error) {
      console.error('[History fetch error]:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Group trends data by day for Recharts multi-line chart
  const getFormattedTrends = () => {
    if (!trends || trends.length === 0) return [];
    
    // Group records by Date key
    const dateGroups: { [key: string]: any } = {};

    trends.forEach((item) => {
      const dateKey = new Date(item.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = { name: dateKey };
      }
      // Assign value key dynamically
      dateGroups[dateKey][item.statName] = parseFloat(Number(item.statValue).toFixed(1));
    });

    return Object.values(dateGroups);
  };

  const formattedTrendsData = getFormattedTrends();

  // Find unique stat names to dynamically render Lines
  const getUniqueStatNames = () => {
    const names = new Set<string>();
    trends.forEach((item) => names.add(item.statName));
    return Array.from(names);
  };

  const statNames = getUniqueStatNames();

  // Colors mapping for trends lines
  const trendLineColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Compiling statistics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-outfit font-extrabold text-3xl text-slate-800 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time visual reports of sustainability achievements and helpdesk support tickets.
          </p>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center space-x-3">
          {company?.csrDataSource === 'sharepoint' && (
            <button
              onClick={handleSyncClick}
              disabled={syncing}
              className="flex items-center px-4 py-2.5 bg-brand-700 hover:bg-brand-850 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync SharePoint'}
            </button>
          )}
        </div>
      </div>

      {syncMessage && (
        <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl text-xs font-semibold text-brand-700 animate-fadeIn">
          {syncMessage}
        </div>
      )}

      {/* KPI Cards Grid */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-premium hover:shadow-premium-hover transition-all duration-300 flex items-center space-x-4">
            <div className="p-3.5 bg-violet-50 text-violet-600 rounded-xl">
              <TicketIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Tickets</span>
              <div className="font-outfit font-extrabold text-2xl text-slate-800 mt-0.5">{summary.totalTickets}</div>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-premium hover:shadow-premium-hover transition-all duration-300 flex items-center space-x-4">
            <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl relative">
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Open Tickets</span>
              <div className="font-outfit font-extrabold text-2xl text-slate-800 mt-0.5">{summary.openTickets}</div>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-premium hover:shadow-premium-hover transition-all duration-300 flex items-center space-x-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CSR Metrics</span>
              <div className="font-outfit font-extrabold text-2xl text-slate-800 mt-0.5">{summary.totalMetrics}</div>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-premium hover:shadow-premium-hover transition-all duration-300 flex items-center space-x-4">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Resolution</span>
              <div className="font-outfit font-extrabold text-2xl text-slate-800 mt-0.5">
                {summary.avgResolutionHours > 0 ? `${summary.avgResolutionHours}h` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols - Main charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Operational statistics trend chart */}
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-slate-800 text-sm">Operational Trends</h3>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Telemetry Telemetry</span>
                </div>
              </div>
            </div>

            {formattedTrendsData.length > 0 ? (
              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={10} dy={10} />
                    <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={10} dx={-10} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ fontSize: '11px', fontWeight: '600' }}
                      labelStyle={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', marginBottom: '4px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                    {statNames.map((name, index) => (
                      <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={trendLineColors[index % trendLineColors.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-slate-400">
                <TrendingUp className="w-8 h-8 mb-2" />
                <span className="text-xs font-semibold">No operational trend data recorded yet.</span>
              </div>
            )}
          </div>

          {/* CSR Metrics display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-outfit font-bold text-slate-800 text-sm">Key Sustainability metrics</h3>
              <Link to="/metrics" className="text-[11px] font-bold text-brand-600 hover:underline flex items-center">
                Manage Metrics
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            {data?.latestMetrics && data.latestMetrics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.latestMetrics.slice(0, 4).map((metric) => (
                  <MetricsCard
                    key={metric.id}
                    metric={metric}
                    onClick={() => handleMetricCardClick(metric)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-3xl shadow-premium text-slate-400">
                <Leaf className="w-8 h-8 mb-2 text-emerald-500" />
                <span className="text-xs font-semibold">No sustainability metrics registered.</span>
                <Link to="/metrics" className="mt-3 px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors">
                  Setup First Metric
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col - Helpdesk tickets overview */}
        <div className="space-y-8">
          
          {/* Recent Helpdesk Support Tickets */}
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium flex flex-col h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
              <div className="flex items-center space-x-2">
                <Inbox className="w-4 h-4 text-violet-500" />
                <h3 className="font-outfit font-bold text-slate-800 text-sm">Recent Tickets</h3>
              </div>
              <Link to="/tickets" className="text-[10px] font-bold text-brand-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[480px] pr-1">
              {data?.recentTickets && data.recentTickets.length > 0 ? (
                data.recentTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
                  <MessageSquare className="w-8 h-8 mb-2" />
                  <span className="text-xs font-semibold">Inbox is clear!</span>
                  <p className="text-[10px] text-slate-400 max-w-xs mt-1 leading-normal">
                    Customer tickets submitted anonymously via iframe or logged users will show up here in real time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Metric Drawer (Modal overlay) */}
      {selectedMetric && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 w-full max-w-2xl shadow-xl flex flex-col space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Historical Trend Analysis</span>
                <h3 className="font-outfit font-extrabold text-xl text-slate-800 mt-0.5">{selectedMetric.metricName}</h3>
              </div>
              <button 
                onClick={() => setSelectedMetric(null)}
                className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Graph view */}
            {loadingHistory ? (
              <div className="h-[260px] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
              </div>
            ) : metricHistory.length > 0 ? (
              <div className="space-y-4">
                <MetricsChart 
                  history={metricHistory} 
                  category={selectedMetric.category} 
                  unit={selectedMetric.metricUnit} 
                />
                <div className="bg-slate-50 p-4 rounded-2xl text-[11px] text-slate-500 leading-relaxed font-medium">
                  <strong>Description: </strong>
                  {selectedMetric.description || 'No descriptive context recorded for this sustainability objective.'}
                </div>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-slate-400 text-xs">
                No historical iterations recorded for this metric.
              </div>
            )}
          </div>
        </div>
      )}
      {/* Inline AI Compliance section */}
      <div className="border-t border-slate-200/60 pt-8 mt-4">
        <ComplianceDashboard />
      </div>
    </div>
  );
};

export default Dashboard;
