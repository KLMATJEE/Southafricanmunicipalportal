import React from 'react';
import { formatCurrency } from '@/utils/formatters/currencyFormatter';

interface BreakdownItem {
  label: string;
  value: number;
  type?: 'positive' | 'negative' | 'neutral';
  currency?: string;
}

interface BreakdownCardProps {
  title?: string;
  items: BreakdownItem[];
  showTotal?: boolean;
  totalLabel?: string;
}

export const BreakdownCard: React.FC<BreakdownCardProps> = ({
  title = 'Breakdown',
  items,
  showTotal = false,
  totalLabel = 'Total',
}) => {
  const total = items.reduce((sum, item) => {
    if (item.type === 'negative') {
      return sum - item.value;
    }
    return sum + item.value;
  }, 0);

  const getValueClass = (type?: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h4 className="text-neutral-900 mb-4">{title}</h4>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded"
          >
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className={`${getValueClass(item.type)}`}>
              {item.type === 'negative' && '- '}
              {formatCurrency(Math.abs(item.value), item.currency || 'ZAR')}
            </span>
          </div>
        ))}

        {showTotal && (
          <>
            <div className="h-px bg-gray-300 my-3" />
            <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded">
              <span className="text-gray-900">{totalLabel}</span>
              <span className="text-blue-700">
                {formatCurrency(total, items[0]?.currency || 'ZAR')}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BreakdownCard;
