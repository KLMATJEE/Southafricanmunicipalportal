import React, { useState } from 'react';
import { calculateUIFBenefit } from '@/services/calculators/uifCalculator';
import { validateRSAID } from '@/utils/validators/rsaIdValidator';
import CurrencyInput from '@/components/inputs/CurrencyInput';
import RSAIDInput from '@/components/inputs/RSAIDInput';
import ResultCard from '@/components/calculators/shared/ResultCard';
import BreakdownCard from '@/components/calculators/shared/BreakdownCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertCircle, Calculator, Download, Share2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormState {
  rsaID: string;
  monthlyWage: number;
  unemploymentMonths: number;
  dependents: number;
}

export const UIFBenefitsCalculator: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    rsaID: '',
    monthlyWage: 0,
    unemploymentMonths: 1,
    dependents: 0,
  });

  const [result, setResult] = useState<any>(null);
  const [isIdValid, setIsIdValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCalculate = () => {
    setLoading(true);
    try {
      if (!isIdValid) {
        alert('Please enter a valid RSA ID number');
        return;
      }

      if (formState.monthlyWage <= 0) {
        alert('Please enter a valid monthly wage');
        return;
      }

      const calculationResult = calculateUIFBenefit({
        monthlyWage: formState.monthlyWage,
        unemploymentMonths: formState.unemploymentMonths,
        dependents: formState.dependents,
        rsaIDNumber: formState.rsaID,
      });

      setResult(calculationResult);
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Error calculating benefits. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormState({
      rsaID: '',
      monthlyWage: 0,
      unemploymentMonths: 1,
      dependents: 0,
    });
    setResult(null);
    setIsIdValid(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-6">
      {/* Input Section */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              UIF Benefits Calculator
            </CardTitle>
            <CardDescription>
              Estimate your Unemployment Insurance Fund benefits based on your employment details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* RSA ID Input */}
            <RSAIDInput
              value={formState.rsaID}
              onChange={(value) => setFormState((prev) => ({ ...prev, rsaID: value }))}
              onValidationChange={setIsIdValid}
              required
            />

            {/* Monthly Wage */}
            <CurrencyInput
              label="Monthly Wage (Before Deductions)"
              value={formState.monthlyWage}
              onChange={(value) => setFormState((prev) => ({ ...prev, monthlyWage: value }))}
              placeholder="Enter your monthly salary"
            />

            {/* Unemployment Months */}
            <div className="space-y-2">
              <Label htmlFor="months">Expected Unemployment Period (Months)</Label>
              <Input
                id="months"
                type="number"
                min={1}
                max={12}
                value={formState.unemploymentMonths}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    unemploymentMonths: parseInt(e.target.value) || 1,
                  }))
                }
              />
              <p className="text-xs text-gray-500">
                UIF benefits are paid for a maximum of 12 months
              </p>
            </div>

            {/* Dependents */}
            <div className="space-y-2">
              <Label htmlFor="dependents">Number of Dependents</Label>
              <Input
                id="dependents"
                type="number"
                min={0}
                max={10}
                value={formState.dependents}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    dependents: parseInt(e.target.value) || 0,
                  }))
                }
              />
              <p className="text-xs text-gray-500">
                Additional allowance may be provided for dependents
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleClear} className="flex-1">
                Clear All
              </Button>
              <Button onClick={handleCalculate} disabled={loading} className="flex-1">
                {loading ? 'Calculating...' : 'Calculate Benefit'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This calculator provides estimates only. Actual UIF benefits
            depend on your contribution history, employment period, and Department of Employment
            verification. You must have contributed to UIF for at least 13 weeks in the last 4 years
            to qualify.
          </AlertDescription>
        </Alert>
      </div>

      {/* Results Section */}
      {result && (
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24 h-fit">
          <ResultCard
            title="Estimated Monthly UIF Benefit"
            primaryAmount={result.netBenefit / formState.unemploymentMonths}
            currency="ZAR"
            subtitle="Net benefit per month after tax"
            statusColor="success"
          />

          <BreakdownCard
            title="Total Benefit Breakdown"
            items={[
              { label: 'Gross Benefit', value: result.grossBenefit, type: 'positive' },
              {
                label: `Dependent Allowance (${formState.dependents})`,
                value: result.dependentAllowance,
                type: 'positive',
              },
              {
                label: 'Tax Deduction (PAYE)',
                value: result.taxDeduction,
                type: 'negative',
              },
            ]}
            showTotal
            totalLabel="Net Total Benefit"
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="text-sm space-y-2 text-gray-700">
                {result.disclaimers.map((disclaimer: string, idx: number) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-orange-500">⚠</span>
                    <span>{disclaimer}</span>
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

export default UIFBenefitsCalculator;
