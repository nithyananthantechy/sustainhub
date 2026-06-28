import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { Users, DollarSign, Briefcase, GraduationCap } from 'lucide-react';

interface EconomicData {
  localJobs: number;
  localSpend: number;
  taxContribution: number;
  apprenticeships: number;
}

const EconomicImpact: React.FC = () => {
  const [data, setData] = useState<EconomicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await api.get('/economic');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchImpact();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Economic Impact...</div>;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Local Economic Impact</h1>
          <p className="text-slate-500 mt-1">Community value and job creation tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="p-3 bg-indigo-100 rounded-xl w-max mb-4"><Users className="w-6 h-6 text-indigo-600" /></div>
          <span className="text-slate-500 font-medium text-sm">Direct Local Jobs</span>
          <span className="text-3xl font-black text-slate-800">{data?.localJobs || 0}</span>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="p-3 bg-emerald-100 rounded-xl w-max mb-4"><Briefcase className="w-6 h-6 text-emerald-600" /></div>
          <span className="text-slate-500 font-medium text-sm">Local Supply Chain Spend</span>
          <span className="text-3xl font-black text-slate-800">{data?.localSpend ? formatCurrency(data.localSpend) : '$0'}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="p-3 bg-rose-100 rounded-xl w-max mb-4"><DollarSign className="w-6 h-6 text-rose-600" /></div>
          <span className="text-slate-500 font-medium text-sm">Municipal Tax Contribution</span>
          <span className="text-3xl font-black text-slate-800">{data?.taxContribution ? formatCurrency(data.taxContribution) : '$0'}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="p-3 bg-amber-100 rounded-xl w-max mb-4"><GraduationCap className="w-6 h-6 text-amber-600" /></div>
          <span className="text-slate-500 font-medium text-sm">Apprenticeships & Training</span>
          <span className="text-3xl font-black text-slate-800">{data?.apprenticeships || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default EconomicImpact;
