// UIF Benefits Calculator Service

import {
  UIFCalculationInput,
  UIFCalculationResult,
} from '@/types/calculator.types';

export const calculateUIFBenefit = (
  input: UIFCalculationInput
): UIFCalculationResult => {
  // UIF formula: 38-60% of wages for max 12 months (as of 2024)
  const maxUIFMonths = Math.min(input.unemploymentMonths, 12);
  const benefitMonths = maxUIFMonths;

  // Calculate daily income rate
  const dailyRate = input.monthlyWage / 30;

  // UIF pays 38-60% depending on income bracket
  // For simplicity, using 60% for lower incomes, 38% for higher
  let benefitPercentage = 0.6;
  if (input.monthlyWage > 15000) {
    benefitPercentage = 0.5;
  }
  if (input.monthlyWage > 25000) {
    benefitPercentage = 0.38;
  }

  // Calculate monthly benefit (capped at max UIF benefit)
  const monthlyBenefit = Math.min(
    input.monthlyWage * benefitPercentage,
    17712 // Max UIF benefit per month as of 2024
  );

  const baseBenefit = monthlyBenefit * benefitMonths;

  // Dependent allowance: R300 per dependent per month (estimated)
  const dependentAllowance = input.dependents * 300 * benefitMonths;

  // Subtotal
  const subtotal = baseBenefit + dependentAllowance;

  // Tax calculation - UIF benefits are taxable
  // Using simplified PAYE calculation
  let taxAmount = 0;
  const annualEquivalent = subtotal * (12 / benefitMonths);

  if (annualEquivalent > 95750) {
    taxAmount = subtotal * 0.18; // 18% tax bracket
  }
  if (annualEquivalent > 237100) {
    taxAmount = subtotal * 0.26; // 26% tax bracket
  }

  const netBenefit = subtotal - taxAmount;

  return {
    grossBenefit: baseBenefit,
    dependentAllowance,
    taxDeduction: taxAmount,
    netBenefit,
    validityMonths: 12,
    breakdown: {
      baseBenefit,
      dependentBonus: dependentAllowance,
      subtotal,
      taxRate: taxAmount > 0 ? taxAmount / subtotal : 0,
      taxAmount,
    },
    disclaimers: [
      'This is an estimate only - actual benefits may vary',
      'UIF benefits depend on your contribution history',
      'You must have contributed to UIF for at least 13 weeks in the last 4 years',
      'Benefits are paid out over a maximum period of 12 months',
      'Verify with the Department of Employment and Labour for official calculation',
    ],
  };
};

export const getUIFEligibility = (monthlyWage: number): boolean => {
  // UIF is mandatory for all workers earning less than R17,712 per month
  // But anyone can claim if they've contributed
  return monthlyWage > 0 && monthlyWage < 100000; // Basic sanity check
};
