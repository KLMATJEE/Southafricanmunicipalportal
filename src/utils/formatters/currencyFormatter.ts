// Currency Formatting Utilities

export const formatCurrency = (
  amount: number,
  currency: string = 'ZAR',
  locale: string = 'en-ZA'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (
  value: number,
  decimals: number = 2,
  locale: string = 'en-ZA'
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const parseCurrencyInput = (input: string): number => {
  // Remove currency symbols, spaces, and commas
  const cleaned = input.replace(/[R$€,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};
