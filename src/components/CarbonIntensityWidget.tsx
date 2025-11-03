import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Leaf, Zap, TrendingDown, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CarbonIntensityData {
  zone: string;
  carbonIntensity: number;
  datetime: string;
  updatedAt: string;
  fossilFreePercentage?: number;
  renewablePercentage?: number;
}

interface PowerBreakdown {
  fossilFreePercentage: number;
  renewablePercentage: number;
  powerConsumptionBreakdown: {
    [key: string]: number;
  };
  powerProductionBreakdown: {
    [key: string]: number;
  };
}

interface CombinedData {
  carbonIntensity: CarbonIntensityData | null;
  powerBreakdown: PowerBreakdown | null;
  error?: string;
}

export function CarbonIntensityWidget() {
  const [data, setData] = useState<CombinedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchElectricityData();
    // Refresh every 15 minutes
    const interval = setInterval(fetchElectricityData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchElectricityData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4c8674b4/electricity-data`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch electricity data');
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching electricity data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getCarbonIntensityLevel = (intensity: number) => {
    if (intensity < 100) return { level: 'Very Low', color: 'bg-green-500', textColor: 'text-green-700' };
    if (intensity < 250) return { level: 'Low', color: 'bg-lime-500', textColor: 'text-lime-700' };
    if (intensity < 450) return { level: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (intensity < 600) return { level: 'High', color: 'bg-orange-500', textColor: 'text-orange-700' };
    return { level: 'Very High', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const formatPowerSource = (source: string) => {
    const sourceMap: { [key: string]: string } = {
      'solar': 'Solar',
      'wind': 'Wind',
      'hydro': 'Hydro',
      'nuclear': 'Nuclear',
      'coal': 'Coal',
      'gas': 'Gas',
      'oil': 'Oil',
      'geothermal': 'Geothermal',
      'biomass': 'Biomass',
      'battery': 'Battery Storage',
      'unknown': 'Unknown'
    };
    return sourceMap[source] || source.charAt(0).toUpperCase() + source.slice(1);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            Electricity Carbon Intensity
          </CardTitle>
          <CardDescription>Loading environmental impact data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-gray-100 animate-pulse rounded" />
            <div className="h-40 bg-gray-100 animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            Electricity Carbon Intensity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {error.includes('API key') && (
                <span className="block mt-2 text-xs">
                  Please configure your Electricity Maps API key in the environment settings.
                </span>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data?.carbonIntensity) {
    return null;
  }

  const intensityInfo = getCarbonIntensityLevel(data.carbonIntensity.carbonIntensity);
  const lastUpdated = new Date(data.carbonIntensity.updatedAt).toLocaleString('en-ZA');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              Electricity Environmental Impact
            </CardTitle>
            <CardDescription>
              Real-time carbon intensity for {data.carbonIntensity.zone}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Updated: {lastUpdated}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="carbon" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="carbon">Carbon Intensity</TabsTrigger>
            <TabsTrigger value="sources">Power Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="carbon" className="space-y-4">
            {/* Carbon Intensity Display */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-2">
                {Math.round(data.carbonIntensity.carbonIntensity)}
              </div>
              <div className="text-sm text-gray-600 mb-3">gCO₂eq/kWh</div>
              <Badge className={intensityInfo.color}>
                {intensityInfo.level}
              </Badge>
            </div>

            {/* Renewable Percentage */}
            {data.powerBreakdown && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      Renewable Energy
                    </span>
                    <span className="text-sm">
                      {Math.round(data.powerBreakdown.renewablePercentage)}%
                    </span>
                  </div>
                  <Progress 
                    value={data.powerBreakdown.renewablePercentage} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      Fossil-Free Energy
                    </span>
                    <span className="text-sm">
                      {Math.round(data.powerBreakdown.fossilFreePercentage)}%
                    </span>
                  </div>
                  <Progress 
                    value={data.powerBreakdown.fossilFreePercentage} 
                    className="h-2"
                  />
                </div>
              </div>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Carbon intensity measures the environmental impact of electricity generation. 
                Lower values indicate cleaner energy sources.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            {data.powerBreakdown?.powerProductionBreakdown && (
              <div className="space-y-3">
                <h4 className="text-sm">Power Production Breakdown</h4>
                {Object.entries(data.powerBreakdown.powerProductionBreakdown)
                  .filter(([_, value]) => value > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, value]) => {
                    const percentage = value;
                    const isRenewable = ['solar', 'wind', 'hydro', 'geothermal'].includes(source);
                    
                    return (
                      <div key={source}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm flex items-center gap-2">
                            {isRenewable ? (
                              <Leaf className="w-3 h-3 text-green-600" />
                            ) : (
                              <Zap className="w-3 h-3 text-gray-600" />
                            )}
                            {formatPowerSource(source)}
                          </span>
                          <span className="text-sm">{Math.round(percentage)}%</span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className={`h-1.5 ${isRenewable ? '[&>div]:bg-green-500' : '[&>div]:bg-gray-500'}`}
                        />
                      </div>
                    );
                  })}
              </div>
            )}

            {(!data.powerBreakdown?.powerProductionBreakdown || 
              Object.keys(data.powerBreakdown.powerProductionBreakdown).length === 0) && (
              <div className="text-center py-8 text-gray-500 text-sm">
                Power breakdown data not available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
