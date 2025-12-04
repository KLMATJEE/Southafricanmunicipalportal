// Import Duty & VAT Calculator Service

import { ImportDutyInput, ImportDutyResult } from '@/types/calculator.types';

// SA Tariff rates by category (simplified - actual HS codes are more complex)
const TARIFF_RATES: Record<string, number> = {
  electronics: 0.15,
  clothing: 0.45,
  textiles: 0.40,
  machinery: 0.05,
  food: 0.10,
  beverages: 0.20,
  chemicals: 0.08,
  furniture: 0.30,
  vehicles: 0.25,
  books: 0.0, // Books are duty-free
  medicines: 0.05,
  other: 0.20,
};

// SACU member countries (no import duty within SACU)
const SACU_MEMBERS = ['Botswana', 'Eswatini', 'Lesotho', 'Namibia', 'South Africa'];

// Major ports in South Africa
const PORT_CHARGES: Record<string, number> = {
  'Durban': 1200,
  'Cape Town': 1100,
  'Port Elizabeth': 900,
  'Johannesburg (OR Tambo)': 1500, // Air freight
  'Other': 800,
};

export const calculateImportDuty = (
  input: ImportDutyInput,
  exchangeRates: Record<string, number> = { USD: 18.5, EUR: 20.2, ZAR: 1 }
): ImportDutyResult => {
  // Convert to ZAR
  const exchangeRate = exchangeRates[input.currency] || 1;
  const productValueZAR =
    input.currency === 'ZAR' ? input.productValue : input.productValue * exchangeRate;

  // Get duty rate
  let dutyRate = TARIFF_RATES[input.category.toLowerCase()] || 0.20;

  // SACU members have zero duty
  if (SACU_MEMBERS.includes(input.originCountry)) {
    dutyRate = 0;
  }

  // Calculate import duty
  const importDuty = productValueZAR * dutyRate;

  // VAT is calculated on product value + import duty
  const dutyBase = productValueZAR + importDuty;
  const VAT = dutyBase * 0.15; // South Africa VAT is 15%

  // Port charges
  const portCharges = PORT_CHARGES[input.portOfEntry] || PORT_CHARGES['Other'];

  // Total cost
  const totalCost = productValueZAR + importDuty + VAT + portCharges;

  // Generate notes
  const notes: string[] = [
    `Duty rate: ${(dutyRate * 100).toFixed(0)}% for ${input.category}`,
  ];

  if (SACU_MEMBERS.includes(input.originCountry)) {
    notes.push(`✓ ${input.originCountry} is a SACU member - NO import duty applicable`);
  }

  if (productValueZAR < 500) {
    notes.push('⚠️ Small shipments under R500 may be exempt from duty');
  }

  notes.push('Port charges are estimates - verify with your clearing agent');
  notes.push('Additional fees may apply (storage, inspection, etc.)');

  return {
    productValueZAR,
    importDuty,
    dutyRate,
    VAT,
    portCharges,
    totalCost,
    breakdown: {
      product: productValueZAR,
      duty: importDuty,
      vat: VAT,
      portCharges,
    },
    notes,
  };
};

export const getProductCategories = (): Array<{ value: string; label: string }> => {
  return Object.keys(TARIFF_RATES).map((key) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
  }));
};

export const getOriginCountries = (): string[] => {
  return [
    // SACU Members
    'South Africa',
    'Botswana',
    'Eswatini',
    'Lesotho',
    'Namibia',
    // Common trading partners
    'China',
    'United States',
    'Germany',
    'United Kingdom',
    'Japan',
    'India',
    'France',
    'Italy',
    'Netherlands',
    'Belgium',
    'Other',
  ].sort();
};

export const getPortsOfEntry = (): string[] => {
  return Object.keys(PORT_CHARGES);
};
