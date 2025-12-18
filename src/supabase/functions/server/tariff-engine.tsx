/**
 * Tariff Engine - Core calculation logic for electricity and water billing
 * 
 * Implements:
 * - Time-of-use electricity tariffs with peak/standard/off-peak windows
 * - Block-rate water tariffs with inclining tiers
 * - Load-shedding adjustments
 * - Seasonal multipliers
 * - Leak detection surcharges
 * - Fixed charges and levies
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

export interface Reading {
  timestamp: Date;
  value: number;
  quality_flag: 'good' | 'estimated' | 'anomaly';
}

export interface TariffSchema {
  utility: 'electricity' | 'water';
  version: string;
  components: Record<string, number>;
  timeOfUse?: Array<{
    window: string;
    rate: number;
    hours: string[];
  }>;
  blocks?: Array<{
    up_to_kl?: number;
    above_kl?: number;
    rate_per_kl: number;
  }>;
  adjustments?: {
    loadShedding?: Array<{ stage: number; multiplier: number }>;
    season?: Array<{ name: string; months: number[]; multiplier: number }>;
  };
  surcharges?: {
    leak_multiplier?: number;
    drought_multiplier?: number;
  };
}

export interface ContextSignals {
  load_shedding_stage: number;
  current_window: string;
  carbon_intensity_gco2_per_kwh: number;
  is_drought_period: boolean;
}

export interface ElectricityCalculation {
  periodMinutes: number;
  usageKwh: number;
  currentWindow: string;
  rateRPerKwh: number;
  components: {
    energy: number;
    network: number;
    levy: number;
    fixedMonthlyProrated: number;
  };
  totalCost: number;
  forecastMonthEnd: number;
  tariffVersion: string;
  emissionsGCO2: number;
}

export interface WaterCalculation {
  periodMinutes: number;
  usageKl: number;
  currentBlock: string;
  rateRPerKl: number;
  components: {
    volume: number;
    fixedAvailabilityProrated: number;
    fixedSewerProrated: number;
    surcharge?: number;
  };
  totalCost: number;
  forecastMonthEnd: number;
  tariffVersion: string;
  remainingInBlock?: number;
  nextBlockThreshold?: number;
}

/**
 * Determine which time-of-use window a timestamp falls into
 */
function getTimeOfUseWindow(timestamp: Date, tariff: TariffSchema): { window: string; rate: number } {
  if (!tariff.timeOfUse) {
    return { window: 'standard', rate: 0 };
  }

  const hour = timestamp.getHours();
  
  for (const tou of tariff.timeOfUse) {
    for (const hourRange of tou.hours) {
      const [start, end] = hourRange.split('-').map(Number);
      
      if (start <= end) {
        // Normal range like 09-17
        if (hour >= start && hour < end) {
          return { window: tou.window, rate: tou.rate };
        }
      } else {
        // Overnight range like 23-06
        if (hour >= start || hour < end) {
          return { window: tou.window, rate: tou.rate };
        }
      }
    }
  }

  return { window: 'standard', rate: tariff.timeOfUse[1]?.rate || 0 };
}

/**
 * Get load-shedding adjustment multiplier
 */
function getLoadSheddingMultiplier(stage: number, tariff: TariffSchema): number {
  if (!tariff.adjustments?.loadShedding) return 1.0;
  
  const adjustment = tariff.adjustments.loadShedding.find(adj => adj.stage === stage);
  return adjustment?.multiplier || 1.0;
}

/**
 * Get seasonal adjustment multiplier
 */
function getSeasonalMultiplier(timestamp: Date, tariff: TariffSchema): number {
  if (!tariff.adjustments?.season) return 1.0;
  
  const month = timestamp.getMonth() + 1; // 1-12
  
  for (const season of tariff.adjustments.season) {
    if (season.months.includes(month)) {
      return season.multiplier;
    }
  }
  
  return 1.0;
}

/**
 * Calculate electricity bill for a given period
 * 
 * Formula:
 * cost_i = kWh_i × rate(timestamp_i, tier(cum_kWh))
 * total = Σ(cost_i) + fixed_monthly + network_charge + levy
 * 
 * With adjustments:
 * rate' = rate × (1 + α_stage) × seasonal_multiplier
 */
export function calcElectricity(
  readings: Reading[],
  tariff: TariffSchema,
  signals: ContextSignals,
  periodMinutes: number = 60
): ElectricityCalculation {
  if (!readings || readings.length === 0) {
    // Return zero calculation if no readings
    return {
      periodMinutes,
      usageKwh: 0,
      currentWindow: 'standard',
      rateRPerKwh: 0,
      components: {
        energy: 0,
        network: 0,
        levy: 0,
        fixedMonthlyProrated: 0
      },
      totalCost: 0,
      forecastMonthEnd: 0,
      tariffVersion: tariff.version,
      emissionsGCO2: 0
    };
  }

  // Calculate total usage
  const totalKwh = readings.reduce((sum, r) => sum + r.value, 0);
  
  // Get current window and base rate
  const latestTimestamp = new Date(readings[readings.length - 1].timestamp);
  const { window, rate: baseRate } = getTimeOfUseWindow(latestTimestamp, tariff);
  
  // Apply adjustments
  const loadSheddingMultiplier = getLoadSheddingMultiplier(signals.load_shedding_stage, tariff);
  const seasonalMultiplier = getSeasonalMultiplier(latestTimestamp, tariff);
  const adjustedRate = baseRate * loadSheddingMultiplier * seasonalMultiplier;
  
  // Calculate components
  const energyCost = totalKwh * adjustedRate;
  const networkCharge = totalKwh * (tariff.components.network_charge_per_kwh || 0);
  const levy = totalKwh * (tariff.components.levy_per_kwh || 0);
  
  // Prorate fixed monthly charge based on period
  const fixedMonthlyProrated = (tariff.components.fixed_monthly || 0) * (periodMinutes / (30 * 24 * 60));
  
  const totalCost = energyCost + networkCharge + levy + fixedMonthlyProrated;
  
  // Forecast month-end cost (extrapolate current usage rate)
  const minutesInMonth = 30 * 24 * 60;
  const forecastMonthEnd = (totalCost / periodMinutes) * minutesInMonth;
  
  // Calculate emissions
  const emissionsGCO2 = totalKwh * signals.carbon_intensity_gco2_per_kwh;
  
  return {
    periodMinutes,
    usageKwh: totalKwh,
    currentWindow: window,
    rateRPerKwh: adjustedRate,
    components: {
      energy: energyCost,
      network: networkCharge,
      levy: levy,
      fixedMonthlyProrated: fixedMonthlyProrated
    },
    totalCost,
    forecastMonthEnd,
    tariffVersion: tariff.version,
    emissionsGCO2
  };
}

/**
 * Determine which block a volume falls into and calculate cost
 * 
 * Formula:
 * cost = Σ_b (min(V_b, Δ_b) × R_b) + fixed_sewer + availability
 * 
 * With surcharges:
 * surcharge = leak_multiplier × (V - V̄_historical) if V >> V̄
 */
export function calcWater(
  readings: Reading[],
  tariff: TariffSchema,
  signals: ContextSignals,
  periodMinutes: number = 60,
  historicalAverageKl?: number
): WaterCalculation {
  if (!readings || readings.length === 0) {
    return {
      periodMinutes,
      usageKl: 0,
      currentBlock: 'B1',
      rateRPerKl: 0,
      components: {
        volume: 0,
        fixedAvailabilityProrated: 0,
        fixedSewerProrated: 0
      },
      totalCost: 0,
      forecastMonthEnd: 0,
      tariffVersion: tariff.version
    };
  }

  // Calculate total usage
  const totalKl = readings.reduce((sum, r) => sum + r.value, 0);
  
  // Calculate volume cost using block tariff
  let volumeCost = 0;
  let currentBlock = 'B1';
  let currentRate = 0;
  let remainingKl = totalKl;
  let remainingInBlock = 0;
  let nextBlockThreshold = 0;
  
  if (tariff.blocks) {
    let previousThreshold = 0;
    
    for (let i = 0; i < tariff.blocks.length; i++) {
      const block = tariff.blocks[i];
      const blockSize = block.up_to_kl ? (block.up_to_kl - previousThreshold) : Infinity;
      const consumedInBlock = Math.min(remainingKl, blockSize);
      
      volumeCost += consumedInBlock * block.rate_per_kl;
      
      if (remainingKl > 0) {
        currentBlock = `B${i + 1}`;
        currentRate = block.rate_per_kl;
        
        if (block.up_to_kl) {
          remainingInBlock = block.up_to_kl - (totalKl - remainingKl + consumedInBlock);
          nextBlockThreshold = block.up_to_kl;
        }
      }
      
      remainingKl -= consumedInBlock;
      
      if (block.up_to_kl) {
        previousThreshold = block.up_to_kl;
      }
      
      if (remainingKl <= 0) break;
    }
  }
  
  // Prorate fixed charges
  const fixedAvailabilityProrated = (tariff.components.fixed_availability || 0) * (periodMinutes / (30 * 24 * 60));
  const fixedSewerProrated = (tariff.components.fixed_sewer || 0) * (periodMinutes / (30 * 24 * 60));
  
  // Check for leak surcharge
  let surcharge = 0;
  if (historicalAverageKl && totalKl > historicalAverageKl * 2) {
    const excess = totalKl - historicalAverageKl;
    surcharge = excess * currentRate * (tariff.surcharges?.leak_multiplier || 1.0);
  }
  
  // Apply drought multiplier if active
  if (signals.is_drought_period && tariff.surcharges?.drought_multiplier) {
    volumeCost *= tariff.surcharges.drought_multiplier;
  }
  
  const totalCost = volumeCost + fixedAvailabilityProrated + fixedSewerProrated + surcharge;
  
  // Forecast month-end cost
  const minutesInMonth = 30 * 24 * 60;
  const forecastMonthEnd = (totalCost / periodMinutes) * minutesInMonth;
  
  return {
    periodMinutes,
    usageKl: totalKl,
    currentBlock,
    rateRPerKl: currentRate,
    components: {
      volume: volumeCost,
      fixedAvailabilityProrated,
      fixedSewerProrated,
      ...(surcharge > 0 && { surcharge })
    },
    totalCost,
    forecastMonthEnd,
    tariffVersion: tariff.version,
    remainingInBlock: remainingInBlock > 0 ? remainingInBlock : undefined,
    nextBlockThreshold: nextBlockThreshold > 0 ? nextBlockThreshold : undefined
  };
}

/**
 * Load active tariffs for given providers
 */
export async function loadActiveTariffs(
  supabase: ReturnType<typeof createClient>,
  providers: Array<{ provider: string; utility: 'electricity' | 'water' }>
): Promise<Map<string, Map<string, TariffSchema>>> {
  const tariffMap = new Map<string, Map<string, TariffSchema>>();
  
  for (const { provider, utility } of providers) {
    const { data, error } = await supabase
      .from('tariffs')
      .select('*')
      .eq('provider', provider)
      .eq('utility', utility)
      .eq('is_active', true)
      .lte('valid_from', new Date().toISOString())
      .or('valid_to.is.null,valid_to.gte.' + new Date().toISOString())
      .order('valid_from', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error(`Error loading tariff for ${provider}/${utility}:`, error);
      continue;
    }
    
    if (!tariffMap.has(provider)) {
      tariffMap.set(provider, new Map());
    }
    
    tariffMap.get(provider)!.set(utility, data.schema as TariffSchema);
  }
  
  return tariffMap;
}

/**
 * Load recent readings for meters
 */
export async function loadRecentReadings(
  supabase: ReturnType<typeof createClient>,
  meterIds: string[],
  horizonMinutes: number
): Promise<Map<string, Reading[]>> {
  const readingsMap = new Map<string, Reading[]>();
  const cutoffTime = new Date(Date.now() - horizonMinutes * 60 * 1000);
  
  for (const meterId of meterIds) {
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .eq('meter_id', meterId)
      .gte('timestamp', cutoffTime.toISOString())
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error(`Error loading readings for meter ${meterId}:`, error);
      continue;
    }
    
    readingsMap.set(meterId, data as Reading[]);
  }
  
  return readingsMap;
}

/**
 * Load context signals (load-shedding, peak schedules, etc.)
 */
export async function loadContextSignals(
  supabase: ReturnType<typeof createClient>
): Promise<ContextSignals> {
  const { data, error } = await supabase
    .from('context_signals')
    .select('*')
    .in('signal_name', ['load_shedding_stage', 'peak_schedule', 'carbon_intensity', 'drought_period'])
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error loading context signals:', error);
  }
  
  // Parse signals
  const signals: ContextSignals = {
    load_shedding_stage: 0,
    current_window: 'standard',
    carbon_intensity_gco2_per_kwh: 950, // Default Eskom mix
    is_drought_period: false
  };
  
  if (data) {
    for (const signal of data) {
      if (signal.signal_name === 'load_shedding_stage') {
        signals.load_shedding_stage = signal.signal_value.stage || 0;
      } else if (signal.signal_name === 'peak_schedule') {
        signals.current_window = signal.signal_value.current_window || 'standard';
      } else if (signal.signal_name === 'carbon_intensity') {
        signals.carbon_intensity_gco2_per_kwh = signal.signal_value.gco2_per_kwh || 950;
      } else if (signal.signal_name === 'drought_period') {
        signals.is_drought_period = signal.signal_value.active || false;
      }
    }
  }
  
  return signals;
}
