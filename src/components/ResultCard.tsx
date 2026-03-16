import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ResultCardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  status?: string;
  statusColor?: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  value,
  unit,
  status,
  statusColor = 'text-gray-800',
  description,
  trend
}) => {
  if (value === null || value === '') return null;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200/60 mb-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-bold text-gray-900 tracking-tight">{value}</span>
        {unit && <span className="text-sm font-medium text-gray-500 mb-1">{unit}</span>}
        {trend === 'up' && <TrendingUp className="w-5 h-5 text-red-500 mb-1.5 ml-1" />}
        {trend === 'down' && <TrendingDown className="w-5 h-5 text-blue-500 mb-1.5 ml-1" />}
        {trend === 'neutral' && <Minus className="w-5 h-5 text-green-500 mb-1.5 ml-1" />}
      </div>
      {status && (
        <div className={`text-sm font-semibold ${statusColor} mb-1`}>
          {status}
        </div>
      )}
      {description && (
        <p className="text-xs text-gray-600 mt-2 italic border-t border-gray-100 pt-2 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
