import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { Droplets, Cpu, Flame } from 'lucide-react';

const CircularEconomy: React.FC = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/circular');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Circular Economy...</div>;

  const waterStats = stats.filter(s => s.category === 'WATER');
  const heatStats = stats.filter(s => s.category === 'HEAT');
  const ewasteStats = stats.filter(s => s.category === 'E-WASTE');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Circular Economy</h1>
          <p className="text-slate-500 mt-1">Waste reduction and resource recovery</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Water Loop */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-blue-500">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-xl mr-4"><Droplets className="w-6 h-6 text-blue-600" /></div>
            <h3 className="text-xl font-bold text-slate-800">Water Loop</h3>
          </div>
          <div className="space-y-4">
            {waterStats.map((stat, i) => (
              <div key={i} className="flex justify-between items-end border-b border-slate-100 pb-2">
                <span className="text-slate-600 text-sm font-medium">{stat.metricName}</span>
                <span className="text-lg font-bold text-slate-800">{stat.value} <span className="text-xs text-slate-400">{stat.unit}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Heat Recovery */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-orange-500">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-orange-100 rounded-xl mr-4"><Flame className="w-6 h-6 text-orange-600" /></div>
            <h3 className="text-xl font-bold text-slate-800">Heat Recovery</h3>
          </div>
          <div className="space-y-4">
            {heatStats.map((stat, i) => (
              <div key={i} className="flex justify-between items-end border-b border-slate-100 pb-2">
                <span className="text-slate-600 text-sm font-medium">{stat.metricName}</span>
                <span className="text-lg font-bold text-slate-800">{stat.value} <span className="text-xs text-slate-400">{stat.unit}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* E-Waste */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-emerald-100 rounded-xl mr-4"><Cpu className="w-6 h-6 text-emerald-600" /></div>
            <h3 className="text-xl font-bold text-slate-800">Materials Recovery</h3>
          </div>
          <div className="space-y-4">
            {ewasteStats.map((stat, i) => (
              <div key={i} className="flex justify-between items-end border-b border-slate-100 pb-2">
                <span className="text-slate-600 text-sm font-medium">{stat.metricName}</span>
                <span className="text-lg font-bold text-slate-800">{stat.value} <span className="text-xs text-slate-400">{stat.unit}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularEconomy;
