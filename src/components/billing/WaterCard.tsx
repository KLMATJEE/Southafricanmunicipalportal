/**
 * Water Card Component
 * 
 * Displays real-time water billing information with:
 * - Current usage (kL)
 * - Current block tier
 * - Rate per kL
 * - Cost breakdown (volume, sewer, availability)
 * - Remaining in current block
 * - Month-end forecast
 */

import { Droplets, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { RealTimeBillBreakdown } from '../../hooks/useRealTimeBilling';

interface WaterCardProps {
  data: RealTimeBillBreakdown;
}

export function WaterCard({ data }: WaterCardProps) {
  const blockColors = {
    B1: 'bg-green-500',
    B2: 'bg-blue-500',
    B3: 'bg-yellow-500',
    B4: 'bg-red-500'
  };

  const blockColor = blockColors[data.currentBlock as keyof typeof blockColors] || 'bg-gray-500';
  
  // Calculate progress in current block
  let blockProgress = 0;
  if (data.nextBlockThreshold && data.remainingInBlock !== undefined) {
    const used = (data.nextBlockThreshold - data.remainingInBlock);
    const total = data.nextBlockThreshold;
    blockProgress = (used / total) * 100;
  }

  const hasSurcharge = data.components.surcharge !== undefined && data.components.surcharge > 0;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
              <Droplets className="size-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Water</CardTitle>
              {data.location && (
                <p className="text-muted-foreground text-sm">{data.location.name || 'Primary Meter'}</p>
              )}
            </div>
          </div>
          <Badge className={`${blockColor} text-white`}>
            {data.currentBlock || 'B1'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage & Cost */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-muted-foreground text-sm">Current Usage</div>
            <div className="text-2xl">
              {data.usageKl?.toFixed(2)} kL
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
          <span>R{data.rateRPerKl?.toFixed(2)}/kL</span>
        </div>

        {/* Block Progress */}
        {data.remainingInBlock !== undefined && data.nextBlockThreshold && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Block Usage</span>
              <span>{data.remainingInBlock.toFixed(1)} kL remaining until next tier</span>
            </div>
            <Progress value={blockProgress} className="h-2" />
          </div>
        )}

        {/* Leak Warning */}
        {hasSurcharge && (
          <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
            <AlertTriangle className="size-4 text-orange-600 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="text-sm">Unusual Usage Detected</div>
              <div className="text-xs text-muted-foreground">
                Your usage is significantly higher than normal. Check for leaks.
              </div>
              <div className="text-sm">
                Surcharge: R{data.components.surcharge?.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Breakdown */}
        <div className="space-y-2">
          <div className="text-sm">Cost Breakdown</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Volume Charge</span>
              <span>R{data.components.volume?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Availability</span>
              <span>R{data.components.fixedAvailabilityProrated?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sewer</span>
              <span>R{data.components.fixedSewerProrated?.toFixed(2) || '0.00'}</span>
            </div>
            {hasSurcharge && (
              <div className="flex justify-between text-orange-600">
                <span>Leak Surcharge</span>
                <span>R{data.components.surcharge?.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

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
