import React, { useState } from 'react';
import {
  calculateTaxiFare,
  calculateDistance,
  getCurrentFuelPrice,
  isPeakHour,
  SA_CITIES,
} from '@/services/calculators/taxiFareCalculator';
import ResultCard from '@/components/calculators/shared/ResultCard';
import BreakdownCard from '@/components/calculators/shared/BreakdownCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, MapPin, Users, Fuel, Clock } from 'lucide-react';

interface FormState {
  startLocation: string;
  endLocation: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  distanceKm: number;
  passengers: number;
  fuelEfficiency: number;
  currentFuelPrice: number;
  isPeakHour: boolean;
}

export const TaxiFareCalculator: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    startLocation: '',
    endLocation: '',
    startLat: -26.2041,
    startLng: 28.0473,
    endLat: -26.1076,
    endLng: 28.0567,
    distanceKm: 0,
    passengers: 1,
    fuelEfficiency: 12,
    currentFuelPrice: getCurrentFuelPrice(),
    isPeakHour: isPeakHour(),
  });

  const [result, setResult] = useState<any>(null);

  const handleLocationSelect = (type: 'start' | 'end', value: string) => {
    const city = SA_CITIES.find((c) => c.name === value);
    if (!city) return;

    if (type === 'start') {
      setFormState((prev) => ({
        ...prev,
        startLocation: value,
        startLat: city.lat,
        startLng: city.lng,
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        endLocation: value,
        endLat: city.lat,
        endLng: city.lng,
      }));
    }

    // Auto-calculate distance if both locations are set
    if (type === 'start' && formState.endLocation) {
      const dist = calculateDistance(city.lat, city.lng, formState.endLat, formState.endLng);
      setFormState((prev) => ({ ...prev, distanceKm: dist }));
    } else if (type === 'end' && formState.startLocation) {
      const dist = calculateDistance(formState.startLat, formState.startLng, city.lat, city.lng);
      setFormState((prev) => ({ ...prev, distanceKm: dist }));
    }
  };

  const handleCalculate = () => {
    try {
      if (formState.distanceKm <= 0) {
        alert('Please enter a valid distance or select locations');
        return;
      }

      const calculationResult = calculateTaxiFare({
        distanceKm: formState.distanceKm,
        startLat: formState.startLat,
        startLng: formState.startLng,
        endLat: formState.endLat,
        endLng: formState.endLng,
        passengers: formState.passengers,
        fuelEfficiency: formState.fuelEfficiency,
        currentFuelPrice: formState.currentFuelPrice,
        isPeakHour: formState.isPeakHour,
      });

      setResult(calculationResult);
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Error calculating taxi fare. Please check your inputs.');
    }
  };

  const handleClear = () => {
    setFormState((prev) => ({
      ...prev,
      startLocation: '',
      endLocation: '',
      distanceKm: 0,
      passengers: 1,
    }));
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-6">
      {/* Input Section */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Taxi Fare & Fuel Cost Calculator
            </CardTitle>
            <CardDescription>
              Calculate taxi fares and split costs among passengers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  From (Starting Point)
                </Label>
                <Select
                  value={formState.startLocation}
                  onValueChange={(value) => handleLocationSelect('start', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select start location" />
                  </SelectTrigger>
                  <SelectContent>
                    {SA_CITIES.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  To (Destination)
                </Label>
                <Select
                  value={formState.endLocation}
                  onValueChange={(value) => handleLocationSelect('end', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {SA_CITIES.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-2">
              <Label>Distance (km)</Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={formState.distanceKm || ''}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    distanceKm: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="Enter distance or select locations above"
              />
            </div>

            {/* Passengers */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Number of Passengers
              </Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={formState.passengers}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    passengers: parseInt(e.target.value) || 1,
                  }))
                }
              />
              <p className="text-xs text-gray-500">
                Fare will be split equally among all passengers
              </p>
            </div>

            {/* Fuel Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Fuel className="w-4 h-4" />
                  Fuel Efficiency (km/L)
                </Label>
                <Input
                  type="number"
                  min={5}
                  max={30}
                  step={0.5}
                  value={formState.fuelEfficiency}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      fuelEfficiency: parseFloat(e.target.value) || 12,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Fuel Price (R/L)</Label>
                <Input
                  type="number"
                  min={10}
                  max={50}
                  step={0.1}
                  value={formState.currentFuelPrice}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      currentFuelPrice: parseFloat(e.target.value) || 23.5,
                    }))
                  }
                />
              </div>
            </div>

            {/* Peak Hour */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="peakHour"
                checked={formState.isPeakHour}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, isPeakHour: e.target.checked }))
                }
                className="w-4 h-4"
              />
              <Label htmlFor="peakHour" className="flex items-center gap-2 cursor-pointer">
                <Clock className="w-4 h-4" />
                Peak Hour Surcharge (06:00-09:00, 16:00-19:00)
              </Label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleClear} className="flex-1">
                Clear All
              </Button>
              <Button onClick={handleCalculate} className="flex-1">
                Calculate Fare
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {result && (
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24 h-fit">
          <ResultCard
            title="Cost Per Person"
            primaryAmount={result.costPerPerson}
            currency="ZAR"
            subtitle={`Total fare: ${result.totalFare.toFixed(2)} ZAR`}
            statusColor="success"
          />

          <BreakdownCard
            title="Fare Breakdown"
            items={[
              {
                label: `Distance (${result.totalDistance.toFixed(1)} km)`,
                value: result.breakdown.distance,
                type: 'neutral',
              },
              {
                label: 'Time Charge',
                value: result.breakdown.time,
                type: 'neutral',
              },
              ...(result.breakdown.peak > 0
                ? [{ label: 'Peak Hour Surcharge', value: result.breakdown.peak, type: 'neutral' as const }]
                : []),
              {
                label: 'Suggested Tip (10%)',
                value: result.breakdown.tip,
                type: 'neutral',
              },
            ]}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Driver Economics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Fare</span>
                <span className="text-gray-900">R{result.totalFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fuel Cost</span>
                <span className="text-red-600">- R{result.fuelCost.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between">
                <span className="text-gray-900">Driver Revenue</span>
                <span className="text-green-600">R{result.driverRevenue.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TaxiFareCalculator;
