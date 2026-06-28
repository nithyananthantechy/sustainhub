import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Leaf, Volume2, Droplets, Flame, TrendingUp, TrendingDown, Users, Building2, Trees } from 'lucide-react';
import { Link } from 'react-router-dom';

const emissionsData = [
  { month: 'Jan', Total: 440, Avoided: 800 },
  { month: 'Feb', Total: 420, Avoided: 820 },
  { month: 'Mar', Total: 395, Avoided: 900 },
  { month: 'Apr', Total: 380, Avoided: 950 },
  { month: 'May', Total: 360, Avoided: 1050 },
  { month: 'Jun', Total: 340, Avoided: 1100 },
  { month: 'Jul', Total: 330, Avoided: 1120 },
  { month: 'Aug', Total: 335, Avoided: 1100 },
  { month: 'Sep', Total: 340, Avoided: 1080 },
  { month: 'Oct', Total: 355, Avoided: 1020 },
  { month: 'Nov', Total: 370, Avoided: 980 },
  { month: 'Dec', Total: 360, Avoided: 960 },
];

export default function PublicPortal() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IE', {hour:'2-digit',minute:'2-digit'}) + ' · ' + now.toLocaleDateString('en-IE'));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-outfit text-slate-800 selection:bg-brand-200 selection:text-brand-900">
      {/* Portal Hero */}
      <div className="bg-gradient-to-tr from-brand-900 to-indigo-900 text-white py-16 px-6 sm:px-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Link to="/login" className="absolute top-0 right-0 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors backdrop-blur-md">
            Operator Login
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-3xl mb-6 shadow-xl">
            🌍
          </div>
          <h1 className="font-extrabold text-4xl sm:text-5xl tracking-tight mb-4">
            DublinDC-01 Sustainability Scorecard
          </h1>
          <p className="text-brand-100 text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Real-time environmental, social, and economic data for our community neighbours. We believe transparency builds trust.
          </p>
          <div className="mt-8 inline-flex items-center px-4 py-2 bg-black/20 rounded-full border border-white/10 text-xs font-mono text-brand-50 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
            Live data · Last updated: {time}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
            <div className="flex items-center text-emerald-600 mb-2">
              <Leaf className="w-5 h-5 mr-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Renewable Energy</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="font-extrabold text-4xl text-slate-800">87</span>
              <span className="text-slate-500 font-semibold">%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '87%' }}></div>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-3">Target: 95% by 2027</div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
            <div className="flex items-center text-teal-600 mb-2">
              <Volume2 className="w-5 h-5 mr-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Noise (Boundary)</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="font-extrabold text-4xl text-slate-800">42</span>
              <span className="text-slate-500 font-semibold">dB</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '84%' }}></div>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-3 flex items-center">
              Limit: 45 dB · <span className="text-emerald-600 font-bold ml-1">✓ Compliant</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
            <div className="flex items-center text-amber-600 mb-2">
              <Droplets className="w-5 h-5 mr-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Water Use</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="font-extrabold text-4xl text-slate-800">0.43</span>
              <span className="text-slate-500 font-semibold">L/kWh</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '57%' }}></div>
            </div>
            <div className="text-xs font-semibold text-emerald-600 mt-3 flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              12% vs 2023
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
            <div className="flex items-center text-emerald-600 mb-2">
              <Flame className="w-5 h-5 mr-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Waste Heat Supplied</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="font-extrabold text-4xl text-slate-800">14.8</span>
              <span className="text-slate-500 font-semibold">MW</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '67%' }}></div>
            </div>
            <div className="text-xs font-semibold text-emerald-600 mt-3 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              4,250 homes benefiting
            </div>
          </div>
        </div>

        {/* Charts & Table Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-premium flex flex-col">
            <h3 className="font-extrabold text-xl text-slate-800 mb-6 flex items-center">
              📊 12-Month Emissions Track
            </h3>
            <div className="h-72 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={emissionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                  <Line type="monotone" dataKey="Total" name="Total Emissions (tCO₂e/mo)" stroke="#F59E0B" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#F59E0B', strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="Avoided" name="Carbon Avoided (tCO₂e/mo)" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#10B981', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-premium">
            <h3 className="font-extrabold text-xl text-emerald-700 mb-6 flex items-center">
              💚 Community Investments 2024
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-4 pr-4">Initiative</th>
                    <th className="pb-4 px-4 text-right">Value</th>
                    <th className="pb-4 pl-4 text-right">Impact</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="py-4 pr-4 font-semibold text-slate-800 flex items-center"><Building2 className="w-4 h-4 mr-3 text-slate-400 group-hover:text-emerald-500 transition-colors"/> District Heating Network</td>
                    <td className="py-4 px-4 text-right font-mono text-slate-600">€2.4M</td>
                    <td className="py-4 pl-4 text-right text-slate-500">4,250 homes</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="py-4 pr-4 font-semibold text-slate-800 flex items-center"><Users className="w-4 h-4 mr-3 text-slate-400 group-hover:text-emerald-500 transition-colors"/> STEM School Programme</td>
                    <td className="py-4 px-4 text-right font-mono text-slate-600">€85K</td>
                    <td className="py-4 pl-4 text-right text-slate-500">640 students</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="py-4 pr-4 font-semibold text-slate-800 flex items-center"><Trees className="w-4 h-4 mr-3 text-slate-400 group-hover:text-emerald-500 transition-colors"/> Urban Tree Planting</td>
                    <td className="py-4 px-4 text-right font-mono text-slate-600">€42K</td>
                    <td className="py-4 pl-4 text-right text-slate-500">1,200 trees</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="py-4 pr-4 font-semibold text-slate-800 flex items-center"><Droplets className="w-4 h-4 mr-3 text-slate-400 group-hover:text-emerald-500 transition-colors"/> Pool Heat Donation</td>
                    <td className="py-4 px-4 text-right font-mono text-slate-600">€60K</td>
                    <td className="py-4 pl-4 text-right text-slate-500">Free public swim</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="py-4 pr-4 font-semibold text-slate-800 flex items-center"><TrendingUp className="w-4 h-4 mr-3 text-slate-400 group-hover:text-emerald-500 transition-colors"/> Community Wi-Fi</td>
                    <td className="py-4 px-4 text-right font-mono text-slate-600">€28K</td>
                    <td className="py-4 pl-4 text-right text-slate-500">3 public hubs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-teal-50/50 p-6 rounded-3xl border border-teal-100 flex items-center space-x-4">
            <div className="p-4 bg-teal-100 text-teal-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">Local Jobs Created</div>
              <div className="font-outfit font-extrabold text-2xl text-teal-900">240 <span className="text-sm font-semibold text-teal-700">FTE</span></div>
              <div className="text-xs text-teal-600 font-semibold mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                28 new this year
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex items-center space-x-4">
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Total CO₂ Avoided</div>
              <div className="font-outfit font-extrabold text-2xl text-emerald-900">12,400 <span className="text-sm font-semibold text-emerald-700">tCO₂e</span></div>
              <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                vs fossil baseline
              </div>
            </div>
          </div>

          <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 flex items-center space-x-4">
            <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Community Investment</div>
              <div className="font-outfit font-extrabold text-2xl text-amber-900">€2.7M <span className="text-sm font-semibold text-amber-700">/yr</span></div>
              <div className="text-xs text-amber-600 font-semibold mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                31% vs 2023
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
