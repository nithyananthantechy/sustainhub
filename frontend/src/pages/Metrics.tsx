import React, { useEffect, useState, useCallback } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MetricsCard, { Metric } from '../components/MetricsCard';
import { Plus, Leaf, HelpCircle, X, Trash2, Edit3, Save, AlertCircle } from 'lucide-react';

const Metrics: React.FC = () => {
  const { company } = useAuth();
  const { socket } = useSocket();

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [metricName, setMetricName] = useState('');
  const [metricValue, setMetricValue] = useState('');
  const [metricUnit, setMetricUnit] = useState('');
  const [category, setCategory] = useState<'environmental' | 'social' | 'economic'>('environmental');
  const [description, setDescription] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchMetrics = useCallback(async () => {
    if (!company) return;
    try {
      const res = await api.get(`/csr-metrics/${company.id}`);
      setMetrics(res.data);
    } catch (err) {
      console.error('[Fetch metrics error]:', err);
    } finally {
      setLoading(false);
    }
  }, [company]);

  // Hook WebSocket event listeners
  useEffect(() => {
    fetchMetrics();

    if (!socket) return;

    const handleSocketUpdate = () => {
      console.log('[Socket] Refreshing metrics lists...');
      fetchMetrics();
    };

    socket.on('metric:updated', handleSocketUpdate);
    socket.on('metric:deleted', handleSocketUpdate);
    socket.on('metrics:synced', handleSocketUpdate);

    return () => {
      socket.off('metric:updated', handleSocketUpdate);
      socket.off('metric:deleted', handleSocketUpdate);
      socket.off('metrics:synced', handleSocketUpdate);
    };
  }, [socket, fetchMetrics]);

  // Handle manual metric CRUD submissions
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricName || !metricValue || !metricUnit) {
      setError('Please provide a name, value, and unit.');
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      await api.post('/csr-metrics', {
        metricName,
        metricValue: Number(metricValue),
        metricUnit,
        category,
        description,
      });

      // Reset
      resetForm();
      setShowCreateModal(false);
      setEditingMetric(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred saving the metric.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Trigger Edit Mode
  const startEdit = (metric: Metric) => {
    setEditingMetric(metric);
    setMetricName(metric.metricName);
    setMetricValue(String(metric.metricValue));
    setMetricUnit(metric.metricUnit);
    setCategory(metric.category);
    setDescription(metric.description || '');
    setShowCreateModal(true);
  };

  // Delete Metric
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to permanently delete this metric?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/csr-metrics/${id}`);
      // list updates automatically via socket notification
    } catch (err) {
      console.error('[Delete metric error]:', err);
    }
  };

  const resetForm = () => {
    setMetricName('');
    setMetricValue('');
    setMetricUnit('');
    setCategory('environmental');
    setDescription('');
    setEditingMetric(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-outfit font-extrabold text-3xl text-slate-800 tracking-tight">
            Sustainability Metrics
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Display, document, and manage key environmental, social, and economic indicators.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center px-4 py-2.5 bg-brand-700 hover:bg-brand-850 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add CSR Metric
        </button>
      </div>

      {/* Metrics Grid list */}
      {metrics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric) => (
            <div key={metric.id} className="relative group">
              {/* Embed Card */}
              <MetricsCard metric={metric} showTrendIcon={false} />
              
              {/* Overlay controls for hover */}
              <div className="absolute top-4 right-4 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <button
                  onClick={() => startEdit(metric)}
                  className="p-1.5 bg-white border border-slate-200 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 rounded-lg text-slate-400 shadow-sm transition-all"
                  title="Edit metric values"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(metric.id)}
                  className="p-1.5 bg-white border border-slate-200 hover:border-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 shadow-sm transition-all"
                  title="Delete metric record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-100 rounded-3xl shadow-premium text-slate-400 text-center">
          <Leaf className="w-12 h-12 mb-3 text-emerald-500/80" />
          <span className="text-sm font-bold text-slate-700">No ESG metrics established yet.</span>
          <p className="text-xs max-w-sm mt-1 leading-normal">
            Establish your first metric card above, or setup a SharePoint list data stream in your configuration settings.
          </p>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 w-full max-w-md shadow-xl flex flex-col space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-outfit font-extrabold text-lg text-slate-800">
                {editingMetric ? 'Edit CSR Metric' : 'Establish New Metric'}
              </h3>
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
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Metric Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Carbon Offsets"
                  className="input-premium"
                  value={metricName}
                  onChange={(e) => setMetricName(e.target.value)}
                  disabled={submitLoading || !!editingMetric} // Lock name on edit to maintain uniqueness
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Metric Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 100.5"
                    className="input-premium"
                    value={metricValue}
                    onChange={(e) => setMetricValue(e.target.value)}
                    disabled={submitLoading}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Metric Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. tonnes, %"
                    className="input-premium"
                    value={metricUnit}
                    onChange={(e) => setMetricUnit(e.target.value)}
                    disabled={submitLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ESG Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none"
                  disabled={submitLoading}
                >
                  <option value="environmental">Environmental (E)</option>
                  <option value="social">Social (S)</option>
                  <option value="economic">Economic (G/Governance)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description / Context
                </label>
                <textarea
                  placeholder="Explain how this sustainability metrics is compiled and audit trail context..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200 text-sm resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitLoading}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-700 hover:bg-brand-850 text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 mt-2 flex items-center justify-center disabled:opacity-50"
                disabled={submitLoading}
              >
                {submitLoading ? 'Saving...' : editingMetric ? 'Save Changes' : 'Establish Metric'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Metrics;
