/**
 * Billing Demo Page
 * 
 * Demonstration page for real-time billing system with:
 * - Quick setup instructions
 * - Sample data generation
 * - Live billing dashboard
 */

import { useState } from 'react';
import { BillingDashboard } from '../components/billing/BillingDashboard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export default function BillingDemo() {
  const [userId, setUserId] = useState('demo_user_123');
  const [setupStatus, setSetupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [setupMessage, setSetupMessage] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);

  const handleGenerateSampleData = async () => {
    setSetupStatus('loading');
    setSetupMessage('');

    try {
      // Call seed endpoint to generate sample data
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4c8674b4/billing/seed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ userId })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate sample data');
      }

      const result = await response.json();
      setSetupStatus('success');
      setSetupMessage(
        `Sample data generated successfully! Created ${result.meters.electricity ? '1 electricity' : ''} ${result.meters.water ? 'and 1 water' : ''} meter with ${result.readings.electricity + result.readings.water} readings.`
      );
      toast.success('Sample data generated successfully!');
      
      // Show dashboard after successful setup
      setTimeout(() => {
        setShowDashboard(true);
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSetupStatus('error');
      setSetupMessage(errorMessage);
      toast.error(errorMessage);
      console.error('Sample data generation error:', errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl mb-2">Real-Time Billing Demo</h1>
        <p className="text-muted-foreground text-lg">
          South African Municipal Utility Billing System
        </p>
      </div>

      {/* Setup Card */}
      {!showDashboard && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Setup</CardTitle>
            <CardDescription>
              Generate sample data to test the real-time billing system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prerequisites Alert */}
            <Alert>
              <AlertCircle className="size-4" />
              <AlertTitle>Prerequisites</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Before using this demo, ensure you&apos;ve completed the database setup:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Run the SQL schema from <code>/supabase/functions/server/database-schema.tsx</code></li>
                  <li>Execute the seed data SQL to populate initial tariffs</li>
                  <li>Verify the backend edge functions are deployed</li>
                </ol>
                <p className="mt-2">
                  See <code>/REALTIME_BILLING_SETUP.md</code> for complete setup instructions.
                </p>
              </AlertDescription>
            </Alert>

            {/* User ID Input */}
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
              />
              <p className="text-sm text-muted-foreground">
                This can be any identifier. For demo purposes, use &quot;demo_user_123&quot;
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateSampleData}
              disabled={!userId || setupStatus === 'loading'}
              className="w-full"
              size="lg"
            >
              {setupStatus === 'loading' ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Generating Sample Data...
                </>
              ) : (
                'Generate Sample Data & View Dashboard'
              )}
            </Button>

            {/* Status Messages */}
            {setupStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="size-4 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  {setupMessage}
                </AlertDescription>
              </Alert>
            )}

            {setupStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {setupMessage}
                  <p className="mt-2">
                    Make sure you&apos;ve run the database setup SQL first. See the setup guide for details.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* What Gets Created */}
            <div className="rounded-lg border p-4 space-y-2">
              <h4>What gets created:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>1 electricity meter (City Power Johannesburg)</li>
                <li>1 water meter (Johannesburg Water)</li>
                <li>60 minutes of realistic usage readings for each meter</li>
                <li>Updated context signals (load-shedding, time-of-use, carbon intensity)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard */}
      {showDashboard && (
        <>
          <div className="flex items-center justify-between">
            <Alert className="flex-1 mr-4">
              <CheckCircle2 className="size-4" />
              <AlertTitle>Demo Active</AlertTitle>
              <AlertDescription>
                Viewing real-time billing for user: <strong>{userId}</strong>
              </AlertDescription>
            </Alert>
            <Button
              variant="outline"
              onClick={() => {
                setShowDashboard(false);
                setSetupStatus('idle');
                setSetupMessage('');
              }}
            >
              Return to Setup
            </Button>
          </div>

          <BillingDashboard userId={userId} />

          {/* Features Overview */}
          <Card>
            <CardHeader>
              <CardTitle>System Features</CardTitle>
              <CardDescription>
                What this billing system provides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Real-Time Monitoring
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Live usage tracking with 30-second updates
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Time-of-Use Tariffs
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Peak, standard, and off-peak electricity pricing
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Block Tariffs
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Inclining water rates with free basic allocation
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Load-Shedding Aware
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Automatic rate adjustments during load-shedding
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Carbon Tracking
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time CO₂ emissions from electricity usage
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Leak Detection
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Automatic alerts for unusual water consumption
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Cost Forecasting
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Month-end projections based on current usage
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Audit Logging
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Complete audit trail for compliance (POPIA)
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Multi-Provider Support
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Eskom, City Power, municipal water providers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
