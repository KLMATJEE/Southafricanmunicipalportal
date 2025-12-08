/**
 * Billing Dashboard
 * 
 * Main dashboard for real-time billing system
 * Shows real-time usage, meters, and provides meter registration
 */

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { RealTimeBillCard } from './RealTimeBillCard';
import { MeterRegistrationForm } from './MeterRegistrationForm';
import { useRealTimeBilling } from '../../hooks/useRealTimeBilling';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface BillingDashboardProps {
  userId: string;
  accessToken?: string;
}

export function BillingDashboard({ userId, accessToken }: BillingDashboardProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data, loading, error, lastUpdated, refresh } = useRealTimeBilling({
    userId,
    horizonMinutes: 60,
    pollingInterval: 30000, // 30 seconds
    enabled: true,
    accessToken
  });

  const handleRefresh = () => {
    refresh();
  };

  const handleMeterRegistered = () => {
    // Trigger refresh after meter registration
    setTimeout(() => {
      refresh();
    }, 1000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Real-Time Billing</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your utility usage and costs in real-time
          </p>
        </div>
        <MeterRegistrationForm
          userId={userId}
          accessToken={accessToken}
          onSuccess={handleMeterRegistered}
        />
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && !data && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Loading billing data...</p>
          </CardContent>
        </Card>
      )}

      {/* Data Display */}
      {data && (
        <RealTimeBillCard
          data={data}
          loading={loading}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
        />
      )}

      {/* Setup Instructions */}
      {data && data.breakdown.length === 0 && (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>Getting Started</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              <p>To start using real-time billing:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Click &ldquo;Register Meter&rdquo; to add your first meter</li>
                <li>The system will begin tracking your usage automatically</li>
                <li>View real-time costs and forecasts on this dashboard</li>
              </ol>
              <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                <strong>Note:</strong> For testing purposes, you may need to set up the database schema first. 
                Run the SQL in <code>/supabase/functions/server/database-schema.tsx</code> in your Supabase SQL Editor.
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
