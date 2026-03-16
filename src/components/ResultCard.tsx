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
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/60 mb-3 flex flex-col items-center md:items-start text-center md:text-left">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</h3>
      <div className="flex flex-col md:flex-row items-center md:items-end gap-1 md:gap-2 mb-1">
        <div className="flex items-center justify-center">
          <span className="text-3xl font-bold text-gray-900 tracking-tight">{value}</span>
          {trend === 'up' && <TrendingUp className="w-5 h-5 text-red-500 ml-1" />}
          {trend === 'down' && <TrendingDown className="w-5 h-5 text-blue-500 ml-1" />}
          {trend === 'neutral' && <Minus className="w-5 h-5 text-green-500 ml-1" />}
        </div>
        {unit && <span className="text-sm font-medium text-gray-500 mb-0.5">{unit}</span>}
      </div>
      {status && (
        <div className={`text-sm font-semibold ${statusColor} mb-1`}>
          {status}
        </div>
      )}
      {description && (
        <p className="text-xs text-gray-600 mt-1 italic border-t border-gray-100 pt-1 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
