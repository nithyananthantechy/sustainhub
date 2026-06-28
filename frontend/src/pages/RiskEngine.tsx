import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { ShieldAlert, TrendingUp, AlertTriangle } from 'lucide-react';

interface RiskData {
  riskScore: number;
  riskLevel: string;
  topRiskFactors: any[];
  aiRecommendations: any[];
}

const RiskEngine: React.FC = () => {
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const res = await api.get('/risk');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRisk();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading AI Risk Model...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">AI Risk Engine</h1>
          <p className="text-slate-500 mt-1">Predictive compliance and community friction analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray="502"
                strokeDashoffset={502 - (502 * (data?.riskScore || 0)) / 100}
                className={data?.riskScore && data.riskScore > 50 ? 'text-amber-500' : 'text-emerald-500'}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-5xl font-black text-slate-800">{data?.riskScore || 0}</div>
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-700 uppercase tracking-widest">{data?.riskLevel || 'UNKNOWN'} RISK</h3>
        </div>

        {/* Top Risk Factors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-rose-500 mr-2" /> Top Risk Factors
          </h3>
          <div className="space-y-3">
            {data?.topRiskFactors?.map((factor: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 bg-rose-50 border border-rose-100 rounded-xl">
                <span className="text-slate-800 font-medium">{factor.issue}</span>
                <span className="px-3 py-1 bg-rose-200 text-rose-800 text-xs font-bold rounded-full uppercase">{factor.severity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-3">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <ShieldAlert className="w-5 h-5 text-brand-600 mr-2" /> AI Recommended Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.aiRecommendations?.map((rec: any, i: number) => (
              <div key={i} className="p-4 border border-brand-100 bg-brand-50 rounded-xl hover:shadow-md transition-shadow">
                <div className="text-sm font-bold text-brand-600 mb-2 uppercase">{rec.priority}</div>
                <div className="text-slate-800 font-medium">{rec.action}</div>
                <button className="mt-4 px-4 py-2 bg-white border border-brand-200 text-brand-700 text-sm font-semibold rounded-lg hover:bg-brand-50 w-full">
                  Execute Action
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskEngine;
