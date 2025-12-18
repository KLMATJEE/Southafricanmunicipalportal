import React from 'react';
import { formatCurrency } from '@/utils/formatters/currencyFormatter';

interface ResultCardProps {
  title: string;
  primaryAmount: number;
  currency?: string;
  subtitle: string;
  secondaryInfo?: string;
  statusColor?: 'success' | 'warning' | 'info' | 'neutral';
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  primaryAmount,
  currency = 'ZAR',
  subtitle,
  secondaryInfo,
  statusColor = 'success',
}) => {
  const colorClasses: Record<string, string> = {
    success: 'text-green-600',
    warning: 'text-orange-500',
    info: 'text-blue-600',
    neutral: 'text-gray-700',
  };

  const borderColors: Record<string, string> = {
    success: 'border-green-500',
    warning: 'border-orange-500',
    info: 'border-blue-500',
    neutral: 'border-gray-400',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 space-y-3 border-l-4 ${borderColors[statusColor]}`}
    >
      <h3 className="text-neutral-900">{title}</h3>
      <div className="h-px bg-gray-200" />

      <div className={`text-4xl ${colorClasses[statusColor]}`}>
        {formatCurrency(primaryAmount, currency)}
      </div>

      <p className="text-sm text-gray-600">{subtitle}</p>

      {secondaryInfo && <p className="text-xs text-gray-500 mt-2">{secondaryInfo}</p>}
    </div>
  );
};

export default ResultCard;
