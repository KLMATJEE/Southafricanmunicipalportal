// Government Services & Compliance Types

export interface GovernmentService {
  id: string;
  service_name: string;
  category: GovernmentServiceCategory;
  description?: string;
  url?: string;
  phone?: string;
  email?: string;
  requires_authentication: boolean;
  icon_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type GovernmentServiceCategory =
  | 'uif'
  | 'sars'
  | 'department_trade'
  | 'home_affairs'
  | 'education'
  | 'social'
  | 'health'
  | 'transport'
  | 'municipalities'
  | 'other';

export interface ExchangeRate {
  id: string;
  from_currency: Currency;
  to_currency: Currency;
  rate: number;
  source: ExchangeRateSource;
  valid_from: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export type Currency = 'ZAR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'AUD';

export type ExchangeRateSource = 'oanda' | 'xe' | 'fixer' | 'manual' | 'sarb';

// South African Tax Brackets (2024/2025)
export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  baseAmount: number;
}

export const SA_TAX_BRACKETS_2024: TaxBracket[] = [
  { min: 0, max: 237100, rate: 0.18, baseAmount: 0 },
  { min: 237101, max: 370500, rate: 0.26, baseAmount: 42678 },
  { min: 370501, max: 512800, rate: 0.31, baseAmount: 77362 },
  { min: 512801, max: 673000, rate: 0.36, baseAmount: 121475 },
  { min: 673001, max: 857900, rate: 0.39, baseAmount: 179147 },
  { min: 857901, max: 1817000, rate: 0.41, baseAmount: 251258 },
  { min: 1817001, max: null, rate: 0.45, baseAmount: 644489 },
];

// UIF Contribution Rates
export interface UIFRates {
  employeeContribution: number; // 1%
  employerContribution: number; // 1%
  maxMonthlyIncome: number; // R17,712
  maxMonthlyContribution: number; // R177.12
  benefitPercentageMin: number; // 38%
  benefitPercentageMax: number; // 60%
  maxBenefitMonths: number; // 12
}

export const UIF_RATES_2024: UIFRates = {
  employeeContribution: 0.01,
  employerContribution: 0.01,
  maxMonthlyIncome: 17712,
  maxMonthlyContribution: 177.12,
  benefitPercentageMin: 0.38,
  benefitPercentageMax: 0.6,
  maxBenefitMonths: 12,
};

// Customs Duty Categories
export interface CustomsDutyCategory {
  category: string;
  description: string;
  dutyRate: number; // Percentage
  vatRate: number; // Currently 15%
  additionalLevies?: Array<{
    name: string;
    rate: number;
  }>;
}

export const CUSTOMS_DUTY_CATEGORIES: CustomsDutyCategory[] = [
  {
    category: 'electronics',
    description: 'Electronics and Technology',
    dutyRate: 0.15,
    vatRate: 0.15,
  },
  {
    category: 'clothing',
    description: 'Clothing and Textiles',
    dutyRate: 0.4,
    vatRate: 0.15,
  },
  {
    category: 'vehicles',
    description: 'Motor Vehicles',
    dutyRate: 0.25,
    vatRate: 0.15,
    additionalLevies: [
      { name: 'CO2 Tax', rate: 0.02 },
    ],
  },
  {
    category: 'food',
    description: 'Food and Beverages',
    dutyRate: 0.2,
    vatRate: 0.15,
  },
  {
    category: 'general',
    description: 'General Goods',
    dutyRate: 0.2,
    vatRate: 0.15,
  },
];

// APS (Admission Point Score) System
export interface APSSubject {
  name: string;
  level: number; // 1-7 (7 being highest)
  isLanguage?: boolean;
  isMaths?: boolean;
}

export interface APSRequirement {
  university: string;
  program: string;
  minimumAPS: number;
  requiredSubjects: Array<{
    subject: string;
    minimumLevel: number;
  }>;
  additionalRequirements?: string[];
}

export const APS_LEVEL_DESCRIPTIONS: Record<number, { description: string; percentage: string }> = {
  7: { description: 'Outstanding Achievement', percentage: '80-100%' },
  6: { description: 'Meritorious Achievement', percentage: '70-79%' },
  5: { description: 'Substantial Achievement', percentage: '60-69%' },
  4: { description: 'Adequate Achievement', percentage: '50-59%' },
  3: { description: 'Moderate Achievement', percentage: '40-49%' },
  2: { description: 'Elementary Achievement', percentage: '30-39%' },
  1: { description: 'Not Achieved', percentage: '0-29%' },
};

// Municipality Types
export interface Municipality {
  id: string;
  name: string;
  province: SouthAfricanProvince;
  type: MunicipalityType;
  mayor?: string;
  website?: string;
  contact_number?: string;
  electricity_tariff?: number; // Per kWh
  water_tariff?: number; // Per kiloliter
  refuse_tariff?: number; // Monthly
  rates_tariff?: number; // Per R1000 of property value
}

export type MunicipalityType =
  | 'metropolitan'
  | 'local'
  | 'district';

export type SouthAfricanProvince =
  | 'Eastern Cape'
  | 'Free State'
  | 'Gauteng'
  | 'KwaZulu-Natal'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'Northern Cape'
  | 'North West'
  | 'Western Cape';

// Compliance Systems
export interface ComplianceSystem {
  name: string;
  acronym: string;
  description: string;
  regulatoryBody: string;
  applicableTo: string[];
  reportingFrequency: 'monthly' | 'quarterly' | 'annually';
}

export const SA_COMPLIANCE_SYSTEMS: ComplianceSystem[] = [
  {
    name: 'Municipal Finance Management Act',
    acronym: 'MFMA',
    description: 'Financial management framework for municipalities',
    regulatoryBody: 'National Treasury',
    applicableTo: ['municipalities', 'municipal_entities'],
    reportingFrequency: 'monthly',
  },
  {
    name: 'Promotion of Access to Information Act',
    acronym: 'PAIA',
    description: 'Right to access government information',
    regulatoryBody: 'South African Human Rights Commission',
    applicableTo: ['all_public_bodies'],
    reportingFrequency: 'annually',
  },
  {
    name: 'Financial Sector Conduct Authority',
    acronym: 'FSCA',
    description: 'Financial services regulation and market conduct',
    regulatoryBody: 'FSCA',
    applicableTo: ['financial_institutions'],
    reportingFrequency: 'quarterly',
  },
  {
    name: 'South African Revenue Service',
    acronym: 'SARS',
    description: 'Tax collection and customs',
    regulatoryBody: 'SARS',
    applicableTo: ['all_taxpayers'],
    reportingFrequency: 'monthly',
  },
];

// Taxi/Transport Rates
export interface TaxiRoute {
  from: string;
  to: string;
  baseDistance: number; // kilometers
  baseFare: number; // ZAR
  peakSurcharge: number; // Percentage
  nightSurcharge: number; // Percentage
}

export interface TaxiOperator {
  id: string;
  name: string;
  license_number: string;
  routes: TaxiRoute[];
  contact: string;
  rating?: number;
}

// Government API Response Types
export interface GovernmentAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// Budget Categories for Expense Tracking
export type ExpenseCategory =
  | 'utilities'
  | 'rates'
  | 'water'
  | 'electricity'
  | 'refuse'
  | 'personal'
  | 'transport'
  | 'food'
  | 'healthcare'
  | 'education'
  | 'entertainment'
  | 'savings'
  | 'other';

export interface BudgetCategory {
  category: ExpenseCategory;
  name: string;
  icon: string;
  color: string;
  monthlyLimit?: number;
}
