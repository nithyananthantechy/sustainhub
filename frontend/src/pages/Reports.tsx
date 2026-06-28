import React, { useState } from 'react';
import { 
  FileText, Download, Wand2, Calendar, Settings2, ShieldCheck, PieChart, Users, Leaf 
} from 'lucide-react';

const recentReports = [
  { id: 'REP-2024-Q1', name: 'Q1 ESG Board Summary', date: '04 Apr 2024', type: 'ESG', size: '2.4 MB' },
  { id: 'REP-2023-AR', name: 'Annual SFDR Article 9 Pack', date: '15 Jan 2024', type: 'Investor', size: '5.1 MB' },
  { id: 'REP-2023-EPA', name: 'EPA Noise & Emissions Log', date: '05 Jan 2024', type: 'Compliance', size: '1.2 MB' },
  { id: 'REP-2023-COM', name: 'Community Impact Review', date: '20 Dec 2023', type: 'Community', size: '3.8 MB' },
];



export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reportTemplate, setReportTemplate] = useState('Full ESG Pack');
  const [reportingPeriod, setReportingPeriod] = useState('Q1 2024 (Jan - Mar)');
  
  const generateTextFile = (filename: string, content: string) => {
    const encodedUri = encodeURI(`data:text/plain;charset=utf-8,${content}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadGenerated = () => {
    const content = `CommunityGPT AI Generated Report
=================================
Template: ${reportTemplate}
Period: ${reportingPeriod}
Generated: ${new Date().toISOString()}

EXECUTIVE SUMMARY
-----------------
Based on the telemetry and ticket data for the selected period, the facility has maintained >95% compliance across all environmental metrics. 

KEY METRICS
-----------
- Scope 1 Emissions: 1,240 tCO2e
- Scope 2 Emissions (Location-based): 42,000 tCO2e
- Scope 2 Emissions (Market-based - 100% Renewable): 0 tCO2e
- Heat Recovered: 14.8 MW

RECOMMENDATIONS
---------------
Continue optimizing cooling systems during off-peak hours to reduce overall grid load. Water consumption anomalies detected on 12-Feb have been investigated and resolved.
`;
    generateTextFile(`${reportTemplate.replace(/\s+/g, '_')}_${reportingPeriod.replace(/\s+/g, '')}.txt`, content);
  };

  const handleDownloadRecent = (reportName: string) => {
    const content = `Historical Report Export
=================================
Report Name: ${reportName}
Exported: ${new Date().toISOString()}

[This is a historical document retrieved from the archive.]
`;
    generateTextFile(`${reportName.replace(/\s+/g, '_')}.txt`, content);
  };

  const handleGenerate = () => {
    setLoading(true);
    setSuccess(false);
    // Simulate AI generation time
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }, 3500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Documentation</span>
          <h1 className="font-outfit font-extrabold text-3xl text-slate-800 tracking-tight mt-1">
            AI-Generated Reports Suite
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Use CommunityGPT to compile dynamic compliance and ESG reports instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Generator Form */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-premium">
          <h3 className="font-outfit font-bold text-lg text-slate-800 mb-6 flex items-center">
            <Wand2 className="w-5 h-5 mr-2 text-brand-600" />
            New Report Configuration
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Report Template</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-start p-4 border-2 border-brand-500 bg-brand-50 rounded-2xl cursor-pointer">
                  <input type="radio" name="template" defaultChecked value="Full ESG Pack" onChange={(e) => setReportTemplate(e.target.value)} className="mt-1" />
                  <div className="ml-3">
                    <div className="font-bold text-brand-900 text-sm">Full ESG Pack</div>
                    <div className="text-xs text-brand-700 mt-1">E, S, G metrics, Carbon tax, and trajectory.</div>
                  </div>
                </label>
                <label className="flex items-start p-4 border border-slate-200 hover:border-brand-300 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors">
                  <input type="radio" name="template" value="Municipal Compliance" onChange={(e) => setReportTemplate(e.target.value)} className="mt-1" />
                  <div className="ml-3">
                    <div className="font-bold text-slate-800 text-sm">Municipal Compliance</div>
                    <div className="text-xs text-slate-500 mt-1">Permits, planning conditions, noise logs.</div>
                  </div>
                </label>
                <label className="flex items-start p-4 border border-slate-200 hover:border-brand-300 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors">
                  <input type="radio" name="template" value="Community Impact" onChange={(e) => setReportTemplate(e.target.value)} className="mt-1" />
                  <div className="ml-3">
                    <div className="font-bold text-slate-800 text-sm">Community Impact</div>
                    <div className="text-xs text-slate-500 mt-1">Waste heat recipients, STEM funds, jobs.</div>
                  </div>
                </label>
                <label className="flex items-start p-4 border border-slate-200 hover:border-brand-300 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors">
                  <input type="radio" name="template" value="Custom AI Brief" onChange={(e) => setReportTemplate(e.target.value)} className="mt-1" />
                  <div className="ml-3">
                    <div className="font-bold text-slate-800 text-sm">Custom AI Brief</div>
                    <div className="text-xs text-slate-500 mt-1">Select specific metrics and prompt constraints.</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Reporting Period</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={reportingPeriod}
                    onChange={(e) => setReportingPeriod(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
                  >
                    <option>Q1 2024 (Jan - Mar)</option>
                    <option>FY 2023 (Annual)</option>
                    <option>Last 30 Days</option>
                    <option>Custom Date Range</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Include Data Sets</label>
                <div className="relative">
                  <Settings2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none">
                    <option>All Telemetry & Tickets</option>
                    <option>Verified IoT Data Only</option>
                    <option>Manual Inputs Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500 font-medium">
                Uses CommunityGPT-4 API for natural language insights.
              </div>
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-brand-700 hover:bg-brand-800 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
            
            {success && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-fadeIn">
                <div className="flex items-center text-emerald-800 text-sm font-bold">
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Report Generated Successfully
                </div>
                <button 
                  onClick={handleDownloadGenerated}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Download Report (TXT)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* History Sidebar */}
        <div className="bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-premium text-white flex flex-col">
          <h3 className="font-outfit font-bold text-lg text-white mb-6">Recent Reports</h3>
          
          <div className="space-y-4 flex-1">
            {recentReports.map((report) => (
              <div 
                key={report.id} 
                onClick={() => handleDownloadRecent(report.name)}
                className="p-4 bg-slate-700/50 rounded-2xl hover:bg-slate-700 transition-colors group cursor-pointer border border-slate-600/50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-sm truncate pr-2">{report.name}</div>
                  <div className="text-slate-400 group-hover:text-white transition-colors">
                    <Download className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" /> {report.date}
                  </span>
                  <span>{report.size}</span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors">
            View All History
          </button>
        </div>
      </div>
    </div>
  );
}
