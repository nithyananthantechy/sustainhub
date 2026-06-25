import React from 'react';
import { Leaf, Heart, Coins, Calendar, ArrowUpRight } from 'lucide-react';

interface Metric {
  id: string;
  metricName: string;
  metricValue: string | number;
  metricUnit: string;
  category: 'environmental' | 'social' | 'economic';
  description?: string | null;
  updatedAt: string;
}

interface MetricsCardProps {
  metric: Metric;
  onClick?: () => void;
  showTrendIcon?: boolean;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ metric, onClick, showTrendIcon = true }) => {
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'environmental':
        return {
          bg: 'bg-emerald-50 border-emerald-100 hover:border-emerald-200',
          text: 'text-emerald-700',
          badge: 'bg-emerald-100/75 text-emerald-800 border-emerald-200',
          icon: Leaf,
        };
      case 'social':
        return {
          bg: 'bg-indigo-50 border-indigo-100 hover:border-indigo-200',
          text: 'text-indigo-700',
          badge: 'bg-indigo-100/75 text-indigo-800 border-indigo-200',
          icon: Heart,
        };
      case 'economic':
        return {
          bg: 'bg-amber-50 border-amber-100 hover:border-amber-200',
          text: 'text-amber-700',
          badge: 'bg-amber-100/75 text-amber-800 border-amber-200',
          icon: Coins,
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-100 hover:border-slate-200',
          text: 'text-slate-700',
          badge: 'bg-slate-100/75 text-slate-800 border-slate-200',
          icon: Leaf,
        };
    }
  };

  const styles = getCategoryStyles(metric.category);
  const IconComponent = styles.icon;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-6 border rounded-2xl bg-white shadow-premium hover:shadow-premium-hover transition-all duration-300 group ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
    >
      {/* Category Badge & Spark */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border ${styles.badge}`}>
          <IconComponent className="w-3.5 h-3.5 mr-1" />
          {metric.category}
        </span>
        {showTrendIcon && onClick && (
          <span className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50 transition-colors duration-200">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        )}
      </div>

      {/* Metric Title */}
      <h3 className="font-outfit font-semibold text-slate-700 text-sm mb-1 group-hover:text-brand-900 transition-colors">
        {metric.metricName}
      </h3>

      {/* Value Display */}
      <div className="flex items-baseline space-x-1.5 mb-2">
        <span className="font-outfit font-extrabold text-3xl text-slate-900 tracking-tight">
          {Number(metric.metricValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <span className="text-xs font-semibold text-slate-500">{metric.metricUnit}</span>
      </div>

      {/* Description Snippet */}
      {metric.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {metric.description}
        </p>
      )}

      {/* Last Updated Timestamp */}
      <div className="flex items-center text-[10px] text-slate-400 border-t border-slate-50 pt-3 mt-auto">
        <Calendar className="w-3 h-3 mr-1" />
        Updated: {formatDate(metric.updatedAt)}
      </div>
    </div>
  );
};

export default MetricsCard;
export type { Metric };
