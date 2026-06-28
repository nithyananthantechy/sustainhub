import React, { useState } from 'react';
import { Download, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { api, useAuth } from '../context/AuthContext';
import { ComplianceReport } from './ComplianceDashboard';

const emissionsData = [
  { year: '2022', Scope1: 420, Scope2: 3200, Scope3: 0 },
  { year: '2023', Scope1: 310, Scope2: 2400, Scope3: 0 },
  { year: '2024', Scope1: 210, Scope2: 1840, Scope3: 3200 },
  { year: '2025F', Scope1: 160, Scope2: 1400, Scope3: 2800 },
  { year: '2026F', Scope1: 120, Scope2: 1000, Scope3: 2400 },
  { year: '2027F', Scope1: 90, Scope2: 700, Scope3: 2000 },
];

const renewableData = [
  { name: 'Wind PPA', value: 48 },
  { name: 'Solar PPA', value: 22 },
  { name: 'Hydro', value: 12 },
  { name: 'Biogas', value: 5 },
  { name: 'Grid', value: 13 },
];

const COLORS = ['#00D4C8', '#10B981', '#3B82F6', '#8B5CF6', '#2A3A50'];

export default function ComplianceESG() {
  const { company } = useAuth();
  const [aiReport, setAiReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAiCompliance = async () => {
    if (!company?.id) return;
    setLoading(true);
    setError(null);
    try {
      // Hit the AI compliance endpoint with refresh=true
      const res = await api.get(`/compliance/${company.id}?refresh=true`);
      setAiReport(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to run AI compliance check.');
    } finally {
      setLoading(false);
    }
  };

  const getRGYColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'yellow': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'red': return 'bg-rose-50 border-rose-200 text-rose-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compliance & Sustainability</span>
          <h1 className="font-outfit font-extrabold text-3xl text-slate-800 tracking-tight mt-1">
            ESG & Environmental Metrics
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Scope 1–3 emissions, environmental performance and permit compliance
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
            12 Months
          </button>
          <button 
            onClick={runAiCompliance}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-brand-700 hover:bg-brand-850 text-white text-sm font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Running AI Engine...' : 'Re-Run Compliance'}
          </button>
        </div>
      </div>

      {/* Scope Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl shadow-premium">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">Scope 1 — Direct</div>
          <div className="flex items-baseline space-x-2">
            <span className="font-outfit font-extrabold text-4xl text-emerald-800">210</span>
            <span className="text-emerald-600 font-semibold text-sm">tCO₂e/yr</span>
          </div>
          <div className="w-full bg-emerald-200/50 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '18%' }}></div>
          </div>
          <div className="flex items-center mt-3 text-xs font-semibold text-emerald-700">
            <TrendingDown className="w-3 h-3 mr-1" />
            <span>18% of budget · ↓ 8% vs 2023</span>
          </div>
        </div>

        <div className="p-6 bg-teal-50 border border-teal-100 rounded-3xl shadow-premium">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">Scope 2 — Grid Power</div>
          <div className="flex items-baseline space-x-2">
            <span className="font-outfit font-extrabold text-4xl text-teal-800">1,840</span>
            <span className="text-teal-600 font-semibold text-sm">tCO₂e/yr</span>
          </div>
          <div className="w-full bg-teal-200/50 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '34%' }}></div>
          </div>
          <div className="flex items-center mt-3 text-xs font-semibold text-teal-700">
            <TrendingDown className="w-3 h-3 mr-1" />
            <span>34% of budget · ↓ 22% vs 2023</span>
          </div>
        </div>

        <div className="p-6 bg-violet-50 border border-violet-100 rounded-3xl shadow-premium">
          <div className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">Scope 3 — Supply Chain</div>
          <div className="flex items-baseline space-x-2">
            <span className="font-outfit font-extrabold text-4xl text-violet-800">3,200</span>
            <span className="text-violet-600 font-semibold text-sm">tCO₂e/yr</span>
          </div>
          <div className="w-full bg-violet-200/50 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: '58%' }}></div>
          </div>
          <div className="flex items-center mt-3 text-xs font-semibold text-violet-700">
            <span className="mr-1">→</span>
            <span>58% of budget · Baseline year</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col">
          <h3 className="font-outfit font-bold text-lg text-slate-800 mb-6">📉 Emissions Trend (3 Year)</h3>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emissionsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="Scope1" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Scope2" stackId="a" fill="#00D4C8" />
                <Bar dataKey="Scope3" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col">
          <h3 className="font-outfit font-bold text-lg text-slate-800 mb-6">🌞 Renewable Energy Mix</h3>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={renewableData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {renewableData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Environmental KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Carbon Intensity</div>
          <div className="font-outfit font-extrabold text-3xl text-amber-900">67 <span className="text-sm font-semibold text-amber-700">gCO₂/kWh</span></div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center">
            <TrendingDown className="w-3 h-3 mr-1" />
            Industry avg: 220 g
          </div>
        </div>

        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Carbon Avoided</div>
          <div className="font-outfit font-extrabold text-3xl text-emerald-900">12,400 <span className="text-sm font-semibold text-emerald-700">tCO₂e</span></div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            via renewables & heat
          </div>
        </div>

        <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-100">
          <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">Waste Recovery Rate</div>
          <div className="font-outfit font-extrabold text-3xl text-teal-900">94 <span className="text-sm font-semibold text-teal-700">%</span></div>
          <div className="text-xs text-teal-600 font-semibold mt-2 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            7% vs target
          </div>
        </div>

        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Water Reuse Rate</div>
          <div className="font-outfit font-extrabold text-3xl text-blue-900">62 <span className="text-sm font-semibold text-blue-700">%</span></div>
          <div className="text-xs text-blue-600 font-semibold mt-2 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            Target: 70% by 2026
          </div>
        </div>
      </div>

      {/* Permit Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
        <h3 className="font-outfit font-bold text-lg text-slate-800 mb-6">📋 Permit Compliance Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <div className="font-bold text-slate-800 text-sm">Noise Emissions Permit NP-2024-07</div>
              <div className="text-xs text-slate-500 font-medium">Expires: Dec 2026</div>
            </div>
            <div className="flex items-center text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg text-xs font-bold">
              <CheckCircle className="w-4 h-4 mr-1.5" /> Compliant
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <div className="font-bold text-slate-800 text-sm">Air Quality — LAQM Ref AQ-2024-IR09</div>
              <div className="text-xs text-slate-500 font-medium">Expires: Jun 2025</div>
            </div>
            <div className="flex items-center text-amber-600 bg-amber-100 px-3 py-1 rounded-lg text-xs font-bold">
              <AlertTriangle className="w-4 h-4 mr-1.5" /> Renewal Due
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <div className="font-bold text-slate-800 text-sm">Water Abstraction Licence WA-2022-04</div>
              <div className="text-xs text-slate-500 font-medium">Expires: Mar 2027</div>
            </div>
            <div className="flex items-center text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg text-xs font-bold">
              <CheckCircle className="w-4 h-4 mr-1.5" /> Compliant
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <div className="font-bold text-slate-800 text-sm">Generator Testing Permit GEN-2024-11</div>
              <div className="text-xs text-slate-500 font-medium">Expires: Jan 2026</div>
            </div>
            <div className="flex items-center text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg text-xs font-bold">
              <CheckCircle className="w-4 h-4 mr-1.5" /> Compliant
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <div className="font-bold text-slate-800 text-sm">IDA Planning Condition PC-2021-03</div>
              <div className="text-xs text-slate-500 font-medium">Ongoing</div>
            </div>
            <div className="flex items-center text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg text-xs font-bold">
              <CheckCircle className="w-4 h-4 mr-1.5" /> Compliant
            </div>
          </div>
        </div>
      </div>

      {/* AI Compliance Engine Results */}
      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-sm font-bold flex items-center">
          <XCircle className="w-5 h-5 mr-2" /> {error}
        </div>
      )}

      {aiReport && (
        <div className="bg-white p-6 rounded-3xl border border-brand-200 shadow-premium mt-8 animate-fadeIn">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-outfit font-bold text-xl text-slate-800">🤖 AI Compliance Engine Results</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Cross-referenced against ISO 27001, German StromStG & EU Standards</p>
            </div>
            <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-extrabold shadow-sm">
              Overall Index: {aiReport.overallScore.toFixed(1)}%
            </div>
          </div>
          
          <div className="space-y-6">
            {aiReport.metrics.map((metric, i) => (
              <div key={i} className={`p-5 border rounded-2xl ${getRGYColor(metric.status)}`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="font-outfit font-bold text-lg">{metric.metricName}</div>
                  <div className="px-3 py-1 bg-white rounded-lg shadow-sm text-xs font-bold uppercase tracking-wider">
                    {metric.status}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm font-semibold">
                  <div><span className="opacity-70 text-xs">Current:</span> {metric.currentValue} {metric.unit}</div>
                  <div><span className="opacity-70 text-xs">Limit/Target:</span> {metric.standardValue} {metric.unit}</div>
                </div>

                <div className="bg-white/60 p-4 rounded-xl border border-black/5 text-sm font-medium">
                  <span className="font-bold text-xs uppercase tracking-wider block mb-1 opacity-70">AI Analysis</span>
                  {metric.analysis}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
