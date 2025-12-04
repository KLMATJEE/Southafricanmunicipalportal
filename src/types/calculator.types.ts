// Calculator Type Definitions

export interface RSAIDValidationResult {
  valid: boolean;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female';
  citizenshipStatus?: 'SA Citizen' | 'Permanent Resident' | 'Unknown';
  sequenceNumber?: number;
  error?: string;
}

export interface UIFCalculationInput {
  monthlyWage: number;
  unemploymentMonths: number;
  dependents: number;
  rsaIDNumber: string;
}

export interface UIFCalculationResult {
  grossBenefit: number;
  dependentAllowance: number;
  taxDeduction: number;
  netBenefit: number;
  validityMonths: number;
  breakdown: {
    baseBenefit: number;
    dependentBonus: number;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
  };
  disclaimers: string[];
}

export interface ImportDutyInput {
  productValue: number;
  currency: 'ZAR' | 'USD' | 'EUR';
  category: string;
  originCountry: string;
  portOfEntry: string;
}

export interface ImportDutyResult {
  productValueZAR: number;
  importDuty: number;
  dutyRate: number;
  VAT: number;
  portCharges: number;
  totalCost: number;
  breakdown: {
    product: number;
    duty: number;
    vat: number;
    portCharges: number;
  };
  notes: string[];
}

export interface TaxiFareInput {
  distanceKm: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  passengers: number;
  fuelEfficiency: number;
  currentFuelPrice: number;
  isPeakHour: boolean;
}

export interface TaxiFareResult {
  baseFarePerKm: number;
  totalDistance: number;
  distanceCost: number;
  timeCost: number;
  peakCharge: number;
  fuelCost: number;
  totalFare: number;
  costPerPerson: number;
  driverRevenue: number;
  breakdown: {
    distance: number;
    time: number;
    peak: number;
    fuel: number;
    tip: number;
  };
}

export interface Subject {
  name: string;
  finalMark: number;
  isLanguage: boolean;
  isMath: boolean;
}

export interface APSCalculationResult {
  totalAPS: number;
  subjects: Array<{
    name: string;
    mark: number;
    grade: string;
    points: number;
  }>;
  gradeDistribution: Record<string, number>;
  qualifyingUniversities: Array<{
    name: string;
    minimumAPS: number;
    qualifies: boolean;
  }>;
  recommendations: string[];
}

export interface CalculationHistory {
  id: string;
  userId: string;
  calculatorType: 'uif' | 'import_duty' | 'taxi_fare' | 'aps' | 'wage_rent';
  inputData: any;
  resultData: any;
  createdAt: Date;
  isSaved: boolean;
  savedName?: string;
  deviceType: 'web' | 'mobile';
}

export interface SavedCalculation {
  id: string;
  userId: string;
  calculatorType: string;
  savedName: string;
  inputData: any;
  resultData: any;
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
}

export interface GovernmentService {
  id: string;
  serviceName: string;
  category: string;
  description: string;
  url: string;
  phone?: string;
  requiresAuthentication: boolean;
  iconUrl?: string;
  sortOrder: number;
  isActive: boolean;
}
