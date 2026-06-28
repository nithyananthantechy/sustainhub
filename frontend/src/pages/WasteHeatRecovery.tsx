import React from 'react';
import { Share, TrendingUp, TrendingDown, Flame, Home, Building2, Trees } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const heatData = [
  { month: 'Jan', Generated: 22, Recovered: 12 },
  { month: 'Feb', Generated: 22, Recovered: 13 },
  { month: 'Mar', Generated: 22, Recovered: 12 },
  { month: 'Apr', Generated: 22, Recovered: 11 },
  { month: 'May', Generated: 22, Recovered: 10 },
  { month: 'Jun', Generated: 22, Recovered: 9 },
  { month: 'Jul', Generated: 22, Recovered: 9 },
  { month: 'Aug', Generated: 22, Recovered: 10 },
  { month: 'Sep', Generated: 22, Recovered: 11 },
  { month: 'Oct', Generated: 22, Recovered: 14 },
  { month: 'Nov', Generated: 22, Recovered: 15 },
  { month: 'Dec', Generated: 22, Recovered: 15 },
];

export default function WasteHeatRecovery() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Waste Heat Recovery</span>
          <h1 className="font-outfit font-extrabold text-3xl text-slate-800 tracking-tight mt-1">
            Community Heat Contribution
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Converting data centre thermal output into community energy — district heating, schools, hospitals
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Waste heat data link copied to clipboard!');
            }}
            className="flex items-center px-4 py-2 bg-brand-700 hover:bg-brand-850 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
          >
            <Share className="w-4 h-4 mr-2" />
            Share Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Waste Heat Generated</div>
          <div className="flex items-baseline space-x-2">
            <span className="font-outfit font-extrabold text-4xl text-teal-600">22</span>
            <span className="text-slate-500 font-semibold text-sm">MW thermal</span>
          </div>
          <div className="flex items-center mt-3 text-xs font-semibold text-slate-500">
            <span className="mr-1">→</span> Continuous output
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Heat Recovered & Reused</div>
          <div className="flex items-baseline space-x-2">
            <span className="font-outfit font-extrabold text-4xl text-emerald-600">14.8</span>
            <span className="text-slate-500 font-semibold text-sm">MW</span>
          </div>
          <div className="flex items-center mt-3 text-xs font-semibold text-emerald-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            67% recovery rate ↑
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">CO₂ Avoided (Annual)</div>
          <div className="flex items-baseline space-x-2">
            <span className="font-outfit font-extrabold text-4xl text-amber-500">3,800</span>
            <span className="text-slate-500 font-semibold text-sm">tCO₂e</span>
          </div>
          <div className="flex items-center mt-3 text-xs font-semibold text-amber-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            ↑ 14% vs last year
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Natural Gas Avoided</div>
          <div className="flex items-baseline space-x-2">
            <span className="font-outfit font-extrabold text-4xl text-blue-600">1.9M</span>
            <span className="text-slate-500 font-semibold text-sm">m³/yr</span>
          </div>
          <div className="flex items-center mt-3 text-xs font-semibold text-blue-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            ↑ Community benefit
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col">
          <h3 className="font-outfit font-bold text-lg text-slate-800 mb-6">🌡 Monthly Heat Output vs. Recovery</h3>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="Generated" name="Heat Generated (MW)" fill="#EF4444" opacity={0.4} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recovered" name="Heat Recovered (MW)" fill="#00D4C8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Beneficiaries Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
          <h3 className="font-outfit font-bold text-lg text-slate-800 mb-6">🏘 Community Beneficiaries</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">Recipient</th>
                  <th className="pb-3 px-4">Heat (MWh/yr)</th>
                  <th className="pb-3 px-4">Impact</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800 flex items-center"><Home className="w-4 h-4 mr-2 text-slate-400"/> Residential District</td>
                  <td className="py-3 px-4 font-mono text-slate-600">48,200</td>
                  <td className="py-3 px-4"><span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg">4,250 homes</span></td>
                </tr>
                <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800 flex items-center"><Flame className="w-4 h-4 mr-2 text-slate-400"/> Public Swimming Pool</td>
                  <td className="py-3 px-4 font-mono text-slate-600">3,100</td>
                  <td className="py-3 px-4"><span className="inline-block px-2 py-1 bg-teal-100 text-teal-700 text-[10px] font-bold rounded-lg">Year-round ops</span></td>
                </tr>
                <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800 flex items-center"><Building2 className="w-4 h-4 mr-2 text-slate-400"/> 2× Primary Schools</td>
                  <td className="py-3 px-4 font-mono text-slate-600">1,800</td>
                  <td className="py-3 px-4"><span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg">Fully heated</span></td>
                </tr>
                <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800 flex items-center"><Building2 className="w-4 h-4 mr-2 text-slate-400"/> Community Hospital</td>
                  <td className="py-3 px-4 font-mono text-slate-600">8,400</td>
                  <td className="py-3 px-4"><span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg">€480K savings</span></td>
                </tr>
                <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800 flex items-center"><Trees className="w-4 h-4 mr-2 text-slate-400"/> Greenhouses (3×)</td>
                  <td className="py-3 px-4 font-mono text-slate-600">2,600</td>
                  <td className="py-3 px-4"><span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg">Year-round grow</span></td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800 flex items-center"><Building2 className="w-4 h-4 mr-2 text-slate-400"/> Affordable Housing</td>
                  <td className="py-3 px-4 font-mono text-slate-600">6,200</td>
                  <td className="py-3 px-4"><span className="inline-block px-2 py-1 bg-teal-100 text-teal-700 text-[10px] font-bold rounded-lg">320 units</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Community Impact Summary */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
        <h3 className="font-outfit font-bold text-lg text-emerald-700 mb-6 flex items-center">
          <span className="text-2xl mr-2">💚</span> Community Benefit Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-slate-100">
          <div className="text-center px-4">
            <div className="font-outfit font-extrabold text-4xl text-teal-600">4,250</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-2">Homes heated</div>
          </div>
          <div className="text-center px-4">
            <div className="font-outfit font-extrabold text-4xl text-emerald-600">3,800</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-2">Tonnes CO₂ avoided</div>
          </div>
          <div className="text-center px-4">
            <div className="font-outfit font-extrabold text-4xl text-amber-500">€1.2M</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-2">Community savings/yr</div>
          </div>
          <div className="text-center px-4">
            <div className="font-outfit font-extrabold text-4xl text-blue-600">1.9M</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-2">m³ gas avoided</div>
          </div>
        </div>
      </div>
    </div>
  );
}
