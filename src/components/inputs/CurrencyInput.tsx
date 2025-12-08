import React, { useState } from 'react';
import { parseCurrencyInput, formatNumber } from '@/utils/formatters/currencyFormatter';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: 'ZAR' | 'USD' | 'EUR';
  onCurrencyChange?: (currency: 'ZAR' | 'USD' | 'EUR') => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  showCurrencySelector?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  currency = 'ZAR',
  onCurrencyChange,
  placeholder = '0.00',
  label,
  disabled = false,
  showCurrencySelector = false,
}) => {
  const [displayValue, setDisplayValue] = useState(
    value > 0 ? formatNumber(value, 2) : ''
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);

    const parsed = parseCurrencyInput(input);
    onChange(parsed);
  };

  const handleBlur = () => {
    if (value > 0) {
      setDisplayValue(formatNumber(value, 2));
    }
  };

  const currencySymbols: Record<string, string> = {
    ZAR: 'R',
    USD: '$',
    EUR: '€',
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm text-gray-700">{label}</label>
      )}

      <div className="flex items-center gap-2">
        {showCurrencySelector && onCurrencyChange && (
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as 'ZAR' | 'USD' | 'EUR')}
            className="px-3 py-3 bg-gray-100 rounded-lg text-gray-700 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
            disabled={disabled}
          >
            <option value="ZAR">ZAR (R)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        )}

        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {currencySymbols[currency]}
          </span>
          <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};

export default CurrencyInput;
