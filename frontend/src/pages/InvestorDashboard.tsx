import React from 'react';
import { 
  TrendingUp, TrendingDown, ArrowRight, Download, PieChart as PieIcon, LineChart as LineIcon, ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const esgTrendData = [
  { quarter: 'Q1', E: 72, S: 80, G: 85, Total: 78 },
  { quarter: 'Q2', E: 75, S: 82, G: 85, Total: 80 },
  { quarter: 'Q3', E: 78, S: 82, G: 88, Total: 82 },
  { quarter: 'Q4', E: 82, S: 85, G: 88, Total: 84 },
];

const taxonomyData = [
  { name: 'Aligned (Green)', value: 68 },
  { name: 'Eligible (Not Aligned)', value: 22 },
  { name: 'Non-Eligible', value: 10 },
];

const TAXONOMY_COLORS = ['#10B981', '#F59E0B', '#94A3B8'];

export default function InvestorDashboard() {
  const downloadSFDRCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // ESG Trajectory Data
    csvContent += "SFDR ESG Score Trajectory (FY24)\n";
    csvContent += "Quarter,Environmental,Social,Governance,Total ESG Score\n";
    esgTrendData.forEach(row => {
      csvContent += `${row.quarter},${row.E},${row.S},${row.G},${row.Total}\n`;
    });

    // EU Taxonomy Data
    csvContent += "\nEU Taxonomy Alignment (Revenue)\n";
    csvContent += "Category,Percentage\n";
    taxonomyData.forEach(row => {
      csvContent += `"${row.name}",${row.value}%\n`;
    });

    // Tax Liability & Article 9 Status
    csvContent += "\nFinancial & Disclosure Status\n";
    csvContent += "Metric,Value,Notes\n";
    csvContent += "Estimated Carbon Tax Liability (2025),€42000,Based on €100/tonne projected EU ETS price\n";
    csvContent += "SFDR Article 9 Status,Compliant,Objective: Sustainable investment in digital infrastructure\n";

    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SFDR_Disclosure_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Investor Relations</span>
          <h1 className="font-outfit font-extrabold text-3xl text-slate-800 tracking-tight mt-1">
            ESG & Investor Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Standardised reporting for SFDR, EU Taxonomy, and carbon tax liabilities
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={downloadSFDRCSV}
            className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download SFDR Report
          </button>
        </div>
      </div>

      {/* Primary ESG Scores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl shadow-premium relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-20"><ShieldCheck className="w-32 h-32 translate-x-4 translate-y-4"/></div>
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">Overall ESG Score</div>
            <div className="flex items-baseline space-x-2">
              <span className="font-outfit font-extrabold text-5xl text-white">84</span>
              <span className="text-indigo-300 font-semibold text-lg">/100</span>
            </div>
            <div className="flex items-center mt-4 text-xs font-semibold text-emerald-400">
              <TrendingUp className="w-3 h-3 mr-1" />
              ↑ 4 pts vs FY23
            </div>
            <div className="mt-2 text-[10px] font-medium text-indigo-200 uppercase tracking-wider border border-indigo-400/30 bg-indigo-500/20 inline-block px-2 py-1 rounded">
              AA Rating
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Environmental (E)</div>
          <div className="flex items-baseline space-x-2">
            <span className="font-outfit font-extrabold text-4xl text-slate-800">82</span>
            <span className="text-slate-500 font-semibold text-sm">/100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '82%' }}></div>
          </div>
          <div className="flex items-center mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Driven by 100% renewable power
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Social (S)</div>
          <div className="flex items-baseline space-x-2">
            <span className="font-outfit font-extrabold text-4xl text-slate-800">85</span>
            <span className="text-slate-500 font-semibold text-sm">/100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <div className="flex items-center mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Driven by community investment
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium">
          <div className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">Governance (G)</div>
          <div className="flex items-baseline space-x-2">
            <span className="font-outfit font-extrabold text-4xl text-slate-800">88</span>
            <span className="text-slate-500 font-semibold text-sm">/100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: '88%' }}></div>
          </div>
          <div className="flex items-center mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            100% board compliance
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ESG Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col">
          <h3 className="font-outfit font-bold text-lg text-slate-800 mb-6 flex items-center">
            <LineIcon className="w-5 h-5 mr-2 text-indigo-500" />
            ESG Score Trajectory (FY24)
          </h3>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={esgTrendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="Total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="E" stroke="#10b981" strokeWidth={2} fill="none" />
                <Area type="monotone" dataKey="S" stroke="#3b82f6" strokeWidth={2} fill="none" />
                <Area type="monotone" dataKey="G" stroke="#8b5cf6" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* EU Taxonomy */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col">
          <h3 className="font-outfit font-bold text-lg text-slate-800 mb-6 flex items-center">
            <PieIcon className="w-5 h-5 mr-2 text-emerald-500" />
            EU Taxonomy Alignment (Revenue)
          </h3>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taxonomyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {taxonomyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TAXONOMY_COLORS[index % TAXONOMY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Financial / Risk KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Estimated Carbon Tax Liability (2025)</div>
            <div className="font-outfit font-extrabold text-3xl text-rose-900">€42,000</div>
            <div className="text-xs text-rose-600 font-semibold mt-2">
              Based on €100/tonne projected EU ETS price
            </div>
          </div>
          <div className="p-4 bg-rose-100 text-rose-600 rounded-2xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">SFDR Article 9 Status</div>
            <div className="font-outfit font-extrabold text-3xl text-indigo-900">Compliant</div>
            <div className="text-xs text-indigo-600 font-semibold mt-2">
              Objective: Sustainable investment in digital infrastructure
            </div>
          </div>
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
