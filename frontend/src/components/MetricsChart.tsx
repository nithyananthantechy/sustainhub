import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HistoryPoint {
  timestamp: string;
  value: number;
}

interface MetricsChartProps {
  history: HistoryPoint[];
  category: 'environmental' | 'social' | 'economic';
  unit: string;
}

const MetricsChart: React.FC<MetricsChartProps> = ({ history, category, unit }) => {
  // Format timestamps for the X-axis (e.g. "Jan", "Feb")
  const formattedData = history.map((point) => {
    try {
      const date = new Date(point.timestamp);
      return {
        ...point,
        formattedDate: date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
      };
    } catch {
      return {
        ...point,
        formattedDate: point.timestamp,
      };
    }
  });

  const getColorConfig = (cat: string) => {
    switch (cat) {
      case 'environmental':
        return { stroke: '#10b981', fill: 'url(#colorEnvironmental)' };
      case 'social':
        return { stroke: '#6366f1', fill: 'url(#colorSocial)' };
      case 'economic':
        return { stroke: '#f59e0b', fill: 'url(#colorEconomic)' };
      default:
        return { stroke: '#475569', fill: 'url(#colorDefault)' };
    }
  };

  const colors = getColorConfig(category);

  // Custom tooltips matching dark premium themes
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const dateString = new Date(data.timestamp).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      });
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl text-white text-xs">
          <div className="text-slate-400 font-semibold mb-1">{dateString}</div>
          <div className="flex items-baseline space-x-1">
            <span className="text-base font-extrabold tracking-tight text-white">
              {Number(payload[0].value).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">{unit}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorEnvironmental" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.00}/>
            </linearGradient>
            <linearGradient id="colorSocial" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.00}/>
            </linearGradient>
            <linearGradient id="colorEconomic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.00}/>
            </linearGradient>
            <linearGradient id="colorDefault" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#475569" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#475569" stopOpacity={0.00}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          
          <XAxis 
            dataKey="formattedDate" 
            tickLine={false} 
            axisLine={false}
            stroke="#94a3b8"
            fontSize={10}
            dy={10}
          />
          
          <YAxis 
            tickLine={false} 
            axisLine={false}
            stroke="#94a3b8"
            fontSize={10}
            dx={-10}
            tickFormatter={(value) => Number(value).toLocaleString()}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={colors.stroke} 
            strokeWidth={2}
            fillOpacity={1} 
            fill={colors.fill} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricsChart;
export type { HistoryPoint };
