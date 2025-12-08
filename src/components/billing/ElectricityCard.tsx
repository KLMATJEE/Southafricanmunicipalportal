/**
 * Electricity Card Component
 * 
 * Displays real-time electricity billing information with:
 * - Current usage (kWh)
 * - Time-of-use window (Peak/Standard/Off-peak)
 * - Rate per kWh
 * - Cost breakdown (energy, network, levy)
 * - Carbon emissions
 * - Month-end forecast
 */

import { Zap, TrendingUp, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { RealTimeBillBreakdown } from '../../hooks/useRealTimeBilling';

interface ElectricityCardProps {
  data: RealTimeBillBreakdown;
  loadSheddingStage?: number;
}

export function ElectricityCard({ data, loadSheddingStage }: ElectricityCardProps) {
  const windowColors = {
    peak: 'bg-red-500',
    standard: 'bg-yellow-500',
    off: 'bg-green-500'
  };

  const windowColor = windowColors[data.currentWindow as keyof typeof windowColors] || 'bg-gray-500';

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-100">
              <Zap className="size-5 text-yellow-600" />
            </div>
            <div>
              <CardTitle>Electricity</CardTitle>
              {data.location && (
                <p className="text-muted-foreground text-sm">{data.location.name || 'Primary Meter'}</p>
              )}
            </div>
          </div>
          <Badge className={`${windowColor} text-white`}>
            {data.currentWindow?.toUpperCase() || 'STANDARD'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage & Cost */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-muted-foreground text-sm">Current Usage</div>
            <div className="text-2xl">
              {data.usageKwh?.toFixed(2)} kWh
            </div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground text-sm">Cost</div>
            <div className="text-2xl">
              R{data.totalCost.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Rate */}
        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <span className="text-sm">Current Rate</span>
          <span>R{data.rateRPerKwh?.toFixed(2)}/kWh</span>
        </div>

        {/* Breakdown */}
        <div className="space-y-2">
          <div className="text-sm">Cost Breakdown</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Energy</span>
              <span>R{data.components.energy?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network Charge</span>
              <span>R{data.components.network?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Levy</span>
              <span>R{data.components.levy?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fixed Charge</span>
              <span>R{data.components.fixedMonthlyProrated?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Emissions */}
        {data.emissionsGCO2 !== undefined && (
          <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2">
              <Leaf className="size-4 text-green-600" />
              <span className="text-sm">Carbon Emissions</span>
            </div>
            <span className="text-sm">{data.emissionsGCO2.toFixed(0)} gCO₂</span>
          </div>
        )}

        {/* Load Shedding Alert */}
        {loadSheddingStage !== undefined && loadSheddingStage > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm">Load Shedding Stage {loadSheddingStage}</span>
            </div>
          </div>
        )}

        {/* Forecast */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Month-end Forecast</span>
            </div>
            <span>R{data.forecastMonthEnd.toFixed(2)}</span>
          </div>
        </div>

        {/* Tariff Version */}
        <div className="text-right text-xs text-muted-foreground">
          Tariff v{data.tariffVersion}
        </div>
      </CardContent>
    </Card>
  );
}
