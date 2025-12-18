/**
 * Real-Time Bill Card Component
 * 
 * Main component that displays all meter cards and summary information.
 * Orchestrates the display of electricity and water cards.
 */

import { RefreshCw, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ElectricityCard } from './ElectricityCard';
import { WaterCard } from './WaterCard';
import { RealTimeBillData } from '../../hooks/useRealTimeBilling';
import { formatDistanceToNow } from 'date-fns';

interface RealTimeBillCardProps {
  data: RealTimeBillData;
  loading: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export function RealTimeBillCard({ data, loading, lastUpdated, onRefresh }: RealTimeBillCardProps) {
  const electricityMeters = data.breakdown.filter(m => m.type === 'electricity');
  const waterMeters = data.breakdown.filter(m => m.type === 'water');

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Real-Time Billing</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Live utility usage and costs
              </p>
            </div>
            <Button
              onClick={onRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Cost */}
          <div className="flex items-baseline justify-between rounded-lg bg-primary/10 p-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Cost ({data.horizonMinutes}min)</div>
              <div className="text-3xl">
                R{data.totalCost.toFixed(2)}
              </div>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                <span>
                  {formatDistanceToNow(lastUpdated, { addSuffix: true })}
                </span>
              </div>
            )}
          </div>

          {/* Context Signals */}
          {data.signals && (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground mb-1">Load Shedding</div>
                <div>
                  Stage {data.signals.loadSheddingStage}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground mb-1">Time Window</div>
                <div className="capitalize">
                  {data.signals.currentWindow}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground mb-1">Grid Intensity</div>
                <div>
                  {data.signals.carbonIntensity} gCO₂/kWh
                </div>
              </div>
            </div>
          )}

          {/* No Meters Message */}
          {data.breakdown.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                {data.message || 'No meters registered. Register meters to start tracking your usage.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Electricity Meters */}
      {electricityMeters.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg">Electricity Meters</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {electricityMeters.map((meter) => (
              <ElectricityCard
                key={meter.meterId}
                data={meter}
                loadSheddingStage={data.signals?.loadSheddingStage}
              />
            ))}
          </div>
        </div>
      )}

      {/* Water Meters */}
      {waterMeters.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg">Water Meters</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {waterMeters.map((meter) => (
              <WaterCard key={meter.meterId} data={meter} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
