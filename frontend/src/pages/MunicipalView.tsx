import React from 'react';
import { Share, CheckCircle, ShieldAlert, Activity, FileText, Settings, Zap, ArrowRight, Download } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend 
} from 'recharts';

const complianceData = [
  { subject: 'Noise (EPA)', A: 120, B: 110, fullMark: 150 },
  { subject: 'Water (Irish Water)', A: 98, B: 130, fullMark: 150 },
  { subject: 'Emissions (EPA)', A: 86, B: 130, fullMark: 150 },
  { subject: 'Waste (Repak)', A: 99, B: 100, fullMark: 150 },
  { subject: 'Grid (EirGrid)', A: 85, B: 90, fullMark: 150 },
  { subject: 'Planning (Fingal)', A: 65, B: 85, fullMark: 150 },
];

export default function MunicipalView() {
  const downloadComplianceCSV = () => {
    // Generate CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Current Score,Regulatory Limit,Status\n";
    
    // Add compliance data rows
    complianceData.forEach(row => {
      const status = row.A <= row.B ? 'COMPLIANT' : 'WARNING';
      csvContent += `"${row.subject}",${row.A},${row.B},${status}\n`;
    });

    // Add Planning Conditions summary
    csvContent += "\nPlanning Conditions Status\n";
    csvContent += "Condition 4: Noise Attenuation,FULFILLED\n";
    csvContent += "Condition 9: Heat Recovery Prep,FULFILLED\n";
    csvContent += "Condition 12: Landscaping & Biodiversity,IN PROGRESS\n";

    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Municipal_Compliance_Pack_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Authority & Regulator Portal</span>
          <h1 className="font-outfit font-extrabold text-3xl text-slate-800 tracking-tight mt-1">
            Municipal & Planning Compliance
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Dedicated view for city councils, EPA, and urban planners (planning conditions, grid capacity)
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={downloadComplianceCSV}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Compliance Pack
          </button>
        </div>
      </div>

      {/* API & Grid Status row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-slate-800 text-white border border-slate-700 rounded-3xl shadow-premium relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10"><Activity className="w-32 h-32" /></div>
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
              Urban Planning API
            </div>
            <div className="font-outfit font-extrabold text-2xl text-white">System Active</div>
            <div className="text-xs text-slate-300 mt-2">
              Syncing telemetry to Dublin City Council smart city grid every 5 minutes.
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-premium">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
            <Zap className="w-4 h-4 mr-1.5 text-amber-500" />
            Grid Import Status (EirGrid)
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-outfit font-extrabold text-4xl text-slate-800">42</span>
            <span className="text-slate-500 font-semibold text-sm">MW load</span>
          </div>
          <div className="flex items-center mt-3 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-max">
            <CheckCircle className="w-3 h-3 mr-1" />
            Well within 60MW MIC limit
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-premium">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
            <Settings className="w-4 h-4 mr-1.5 text-blue-500" />
            Backup Generators
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-outfit font-extrabold text-4xl text-slate-800">Standby</span>
          </div>
          <div className="flex items-center mt-3 text-xs font-semibold text-slate-500">
            Next scheduled test: <span className="font-bold text-slate-700 ml-1">14-Aug (1hr duration)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Radar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col">
          <h3 className="font-outfit font-bold text-lg text-slate-800 mb-2">⚖️ Regulatory Readiness Radar</h3>
          <p className="text-xs text-slate-500 mb-6">Comparison of our metrics (Teal) against regulatory limits (Grey)</p>
          <div className="h-72 flex-1 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={complianceData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Limits" dataKey="B" stroke="#94a3b8" fill="#e2e8f0" fillOpacity={0.5} />
                <Radar name="Our Score" dataKey="A" stroke="#0d9488" fill="#14b8a6" fillOpacity={0.6} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Planning Conditions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
          <h3 className="font-outfit font-bold text-lg text-slate-800 mb-6">🏗 Planning Conditions (Phase 2)</h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-slate-800 text-sm">Condition 4: Noise Attenuation</div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-md">Fulfilled</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Acoustic louvres installed on all rooftop chillers. Verified by independent acoustic consultant report (submitted 12-Feb-2024).
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-slate-800 text-sm">Condition 9: Heat Recovery Prep</div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-md">Fulfilled</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pipework exported to site boundary. Connected to District Heating network operated by Codema. Exporting 14.8MW.
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-slate-800 text-sm">Condition 12: Landscaping & Biodiversity</div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-md">In Progress</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Planting of 1,200 native tree saplings along the eastern berm. 800 planted to date. Expected completion by Nov-2024.
              </p>
            </div>
          </div>
          <button className="w-full mt-4 py-2.5 flex items-center justify-center text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
            View All Conditions <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
