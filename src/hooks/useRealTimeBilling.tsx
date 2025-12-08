/**
 * useRealTimeBilling Hook
 * 
 * Custom hook for managing real-time billing data with:
 * - Automatic polling every 30 seconds
 * - Manual refresh capability
 * - Loading and error states
 * - Auth token management
 */

import { useState, useEffect, useCallback } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface RealTimeBillBreakdown {
  meterId: string;
  type: 'electricity' | 'water';
  location?: any;
  periodMinutes: number;
  usageKwh?: number;
  usageKl?: number;
  currentWindow?: string;
  currentBlock?: string;
  rateRPerKwh?: number;
  rateRPerKl?: number;
  components: {
    energy?: number;
    network?: number;
    levy?: number;
    fixedMonthlyProrated?: number;
    volume?: number;
    fixedAvailabilityProrated?: number;
    fixedSewerProrated?: number;
    surcharge?: number;
  };
  totalCost: number;
  forecastMonthEnd: number;
  tariffVersion: string;
  emissionsGCO2?: number;
  remainingInBlock?: number;
  nextBlockThreshold?: number;
}

export interface RealTimeBillData {
  userId: string;
  horizonMinutes: number;
  totalCost: number;
  breakdown: RealTimeBillBreakdown[];
  generatedAt: string;
  signals?: {
    loadSheddingStage: number;
    currentWindow: string;
    carbonIntensity: number;
  };
  message?: string;
}

export interface UseRealTimeBillingOptions {
  userId: string;
  horizonMinutes?: number;
  pollingInterval?: number;
  enabled?: boolean;
  accessToken?: string;
}

export function useRealTimeBilling(options: UseRealTimeBillingOptions) {
  const {
    userId,
    horizonMinutes = 60,
    pollingInterval = 30000, // 30 seconds
    enabled = true,
    accessToken
  } = options;

  const [data, setData] = useState<RealTimeBillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBillingData = useCallback(async () => {
    if (!userId || !enabled) return;

    try {
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4c8674b4/billing/realtime`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken || publicAnonKey}`
          },
          body: JSON.stringify({
            userId,
            horizonMinutes
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch billing data');
      }

      const billingData = await response.json();
      setData(billingData);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Real-time billing fetch error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, horizonMinutes, enabled, accessToken]);

  // Initial fetch
  useEffect(() => {
    if (enabled && userId) {
      fetchBillingData();
    }
  }, [enabled, userId, fetchBillingData]);

  // Polling interval
  useEffect(() => {
    if (!enabled || !userId) return;

    const interval = setInterval(() => {
      fetchBillingData();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [enabled, userId, pollingInterval, fetchBillingData]);

  const refresh = useCallback(() => {
    setLoading(true);
    return fetchBillingData();
  }, [fetchBillingData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh
  };
}
