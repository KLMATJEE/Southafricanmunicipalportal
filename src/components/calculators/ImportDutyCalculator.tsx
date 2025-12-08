import React, { useState } from 'react';
import {
  calculateImportDuty,
  getProductCategories,
  getOriginCountries,
  getPortsOfEntry,
} from '@/services/calculators/importDutyCalculator';
import CurrencyInput from '@/components/inputs/CurrencyInput';
import ResultCard from '@/components/calculators/shared/ResultCard';
import BreakdownCard from '@/components/calculators/shared/BreakdownCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, Download, Share2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormState {
  productValue: number;
  currency: 'ZAR' | 'USD' | 'EUR';
  category: string;
  originCountry: string;
  portOfEntry: string;
}

export const ImportDutyCalculator: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    productValue: 0,
    currency: 'ZAR',
    category: 'other',
    originCountry: 'China',
    portOfEntry: 'Durban',
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const categories = getProductCategories();
  const countries = getOriginCountries();
  const ports = getPortsOfEntry();

  const handleCalculate = () => {
    setLoading(true);
    try {
      if (formState.productValue <= 0) {
        alert('Please enter a valid product value');
        return;
      }

      const calculationResult = calculateImportDuty(formState);
      setResult(calculationResult);
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Error calculating import duty. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormState({
      productValue: 0,
      currency: 'ZAR',
      category: 'other',
      originCountry: 'China',
      portOfEntry: 'Durban',
    });
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
              Import Duty & VAT Calculator
            </CardTitle>
            <CardDescription>
              Calculate import duty, VAT, and total cost for goods entering South Africa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Value */}
            <CurrencyInput
              label="Product Value"
              value={formState.productValue}
              onChange={(value) =>
                setFormState((prev) => ({ ...prev, productValue: value }))
              }
              currency={formState.currency}
              onCurrencyChange={(currency) =>
                setFormState((prev) => ({ ...prev, currency }))
              }
              showCurrencySelector
              placeholder="Enter product value"
            />

            {/* Product Category */}
            <div className="space-y-2">
              <Label>Product Category</Label>
              <Select
                value={formState.category}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Different product categories have different duty rates
              </p>
            </div>

            {/* Origin Country */}
            <div className="space-y-2">
              <Label>Country of Origin</Label>
              <Select
                value={formState.originCountry}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, originCountry: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                SACU member countries (Botswana, Eswatini, Lesotho, Namibia) have zero duty
              </p>
            </div>

            {/* Port of Entry */}
            <div className="space-y-2">
              <Label>Port of Entry</Label>
              <Select
                value={formState.portOfEntry}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, portOfEntry: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select port" />
                </SelectTrigger>
                <SelectContent>
                  {ports.map((port) => (
                    <SelectItem key={port} value={port}>
                      {port}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleClear} className="flex-1">
                Clear All
              </Button>
              <Button onClick={handleCalculate} disabled={loading} className="flex-1">
                {loading ? 'Calculating...' : 'Calculate Costs'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> These calculations are estimates based on standard tariff rates.
            Actual costs may vary depending on specific HS codes, trade agreements, and additional
            fees. Always consult with a licensed clearing agent for accurate quotations.
          </AlertDescription>
        </Alert>
      </div>

      {/* Results Section */}
      {result && (
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24 h-fit">
          <ResultCard
            title="Total Import Cost"
            primaryAmount={result.totalCost}
            currency="ZAR"
            subtitle="Product + Duty + VAT + Port Charges"
            statusColor={result.importDuty > result.productValueZAR * 0.3 ? 'warning' : 'info'}
          />

          <BreakdownCard
            title="Cost Breakdown"
            items={[
              { label: 'Product Value', value: result.breakdown.product, type: 'neutral' },
              {
                label: `Import Duty (${(result.dutyRate * 100).toFixed(0)}%)`,
                value: result.breakdown.duty,
                type: 'negative',
              },
              {
                label: 'VAT (15%)',
                value: result.breakdown.vat,
                type: 'negative',
              },
              {
                label: 'Port Charges',
                value: result.breakdown.portCharges,
                type: 'negative',
              },
            ]}
            showTotal
            totalLabel="Total Cost"
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="text-sm space-y-2 text-gray-700">
                {result.notes.map((note: string, idx: number) => (
                  <li key={idx} className="flex gap-2">
                    <span>•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportDutyCalculator;
