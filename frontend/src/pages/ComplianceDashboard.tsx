import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, RefreshCw, FileText, ArrowRight } from 'lucide-react';
import { api, useAuth } from '../context/AuthContext';

interface ComplianceMetric {
  metricName: string;
  currentValue: number;
  standardValue: number;
  unit: string;
  status: 'green' | 'yellow' | 'red';
  compliancePercentage: number;
  analysis: string;
  recommendations: string;
  priority: 'immediate' | 'soon' | 'planned';
}

interface ComplianceReport {
  companyId: string;
  timestamp: string;
  overallScore: number;
  metrics: ComplianceMetric[];
  summary: string;
  alerts: string[];
}

export default function ComplianceDashboard() {
  const { company } = useAuth();
  const companyId = company?.id;
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplianceData = async (forceRefresh = false) => {
    if (!companyId) return;
    
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await api.get(`/compliance/${companyId}${forceRefresh ? '?refresh=true' : ''}`);
      setReport(response.data);
    } catch (err: any) {
      console.error('Failed to fetch compliance:', err);
      setError(err.response?.data?.error || 'Failed to generate compliance report.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplianceData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Generating compliance report with AI...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl shadow-premium max-w-xl mx-auto mt-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="font-outfit font-bold text-slate-700 text-lg">Failed to load Compliance</h3>
        <p className="text-xs text-slate-400 leading-normal">{error}</p>
        <button
          onClick={() => fetchComplianceData(false)}
          className="px-5 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-16 text-slate-400 text-xs font-semibold">
        No compliance report available.
      </div>
    );
  }

  const getRGYColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'yellow':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'red':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getRGYIcon = (status: string) => {
    switch (status) {
      case 'green':
        return <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'yellow':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'red':
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'immediate':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'soon':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-outfit font-extrabold text-3xl text-slate-800 tracking-tight">
            Regulatory Compliance
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time compliance validation and AI remediation recommendations against global ESG standards.
          </p>
        </div>

        {/* Sync Controls */}
        <button
          onClick={() => fetchComplianceData(true)}
          disabled={refreshing}
          className="flex items-center px-4 py-2.5 bg-brand-700 hover:bg-brand-850 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Analyzing...' : 'Re-Run Compliance'}
        </button>
      </div>

      {/* Overall Score Card */}
      <div className="bg-gradient-to-tr from-brand-600 to-indigo-700 text-white rounded-3xl p-6 md:p-8 shadow-premium relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10">
          <TrendingUp className="w-64 h-64" />
        </div>
        <div className="space-y-2 text-center md:text-left z-10">
          <p className="text-sm font-semibold uppercase tracking-widest opacity-85">Overall Compliance Index</p>
          <p className="font-outfit font-extrabold text-6xl md:text-7xl tracking-tighter">
            {report.overallScore.toFixed(0)}%
          </p>
          <p className="text-xs font-semibold bg-white/10 px-3 py-1 rounded-full border border-white/10 inline-block">
            {report.summary}
          </p>
        </div>
        <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md max-w-sm text-center md:text-left space-y-2 z-10">
          <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-500 text-white px-2 py-0.5 rounded">AI System Note</span>
          <p className="text-xs leading-normal opacity-90">
            Compliance calculations are performed dynamically by comparing your current CSR metrics values with reference target bounds from registered treaties.
          </p>
        </div>
      </div>

      {/* Alerts banner */}
      {report.alerts.length > 0 && (
        <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl shadow-premium space-y-3">
          <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Active Non-Compliance Warnings</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
            {report.alerts.map((alert, i) => (
              <div key={i} className="text-xs text-rose-700 leading-relaxed font-semibold">
                {alert}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-premium flex items-center space-x-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Compliant Goals</span>
            <div className="font-outfit font-extrabold text-2xl text-emerald-600 mt-0.5">
              {report.metrics.filter((m) => m.status === 'green').length}
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-premium flex items-center space-x-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Warnings</span>
            <div className="font-outfit font-extrabold text-2xl text-amber-600 mt-0.5">
              {report.metrics.filter((m) => m.status === 'yellow').length}
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-premium flex items-center space-x-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Non-Compliant</span>
            <div className="font-outfit font-extrabold text-2xl text-rose-600 mt-0.5">
              {report.metrics.filter((m) => m.status === 'red').length}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Listing */}
      <div className="space-y-6">
        <h2 className="font-outfit font-extrabold text-xl text-slate-800 tracking-tight">Standards Evaluation</h2>
        
        {report.metrics.length > 0 ? (
          <div className="space-y-6">
            {report.metrics.map((metric, i) => (
              <div
                key={i}
                className={`p-6 border rounded-3xl shadow-premium space-y-4 transition-all duration-200 hover:shadow-premium-hover ${getRGYColor(
                  metric.status
                )}`}
              >
                {/* Metric Title & Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-3">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {getRGYIcon(metric.status)}
                    <h3 className="font-outfit font-bold text-slate-800 text-base truncate">{metric.metricName}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold border uppercase tracking-wider rounded-md ${getPriorityBadge(metric.priority)}`}>
                      {metric.priority} priority
                    </span>
                    <span className="px-2.5 py-0.5 text-[9px] font-extrabold bg-white border border-black/5 rounded-md uppercase tracking-wider font-outfit">
                      {metric.status}
                    </span>
                  </div>
                </div>

                {/* Values Comparison Grid */}
                <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Current Value</span>
                    <span className="block font-outfit font-extrabold text-sm text-slate-800 mt-0.5">
                      {metric.currentValue.toLocaleString()} {metric.unit}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Reference Limit</span>
                    <span className="block font-outfit font-extrabold text-sm text-slate-800 mt-0.5">
                      {metric.standardValue.toLocaleString()} {metric.unit}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Compliance Ratio</span>
                    <span className="block font-outfit font-extrabold text-sm text-slate-800 mt-0.5">
                      {metric.compliancePercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar slider */}
                <div className="space-y-1">
                  <div className="w-full bg-black/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        metric.status === 'green'
                          ? 'bg-emerald-500'
                          : metric.status === 'yellow'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min(metric.compliancePercentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* AI Analysis description text */}
                <div className="bg-white/60 p-4 border border-black/5 rounded-2xl space-y-3 leading-relaxed">
                  <div className="text-xs text-slate-700">
                    <strong className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">AI Analysis</strong>
                    {metric.analysis}
                  </div>
                  <div className="text-xs text-slate-700 border-t border-black/5 pt-3">
                    <strong className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Recommendations</strong>
                    {metric.recommendations}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl shadow-premium text-slate-450 text-xs font-semibold">
            No CSR metrics are registered for compliance validation. Add metrics in CSR Metrics tab first!
          </div>
        )}
      </div>

      {/* PDF Report Generation Trigger */}
      <div className="pt-4 shrink-0">
        <button 
          onClick={() => alert('PDF generation is simulated for local dev mode. Standard report compile successfully.')}
          className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
        >
          <FileText className="w-4 h-4 mr-2" />
          Compile PDF Compliance Report
        </button>
      </div>
    </div>
  );
}
export type { ComplianceMetric, ComplianceReport };
