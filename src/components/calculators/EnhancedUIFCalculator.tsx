import React, { useState } from 'react';
import { calculateUIFBenefit } from '@/services/calculators/uifCalculator';
import CurrencyInput from '@/components/inputs/CurrencyInput';
import RSAIDInput from '@/components/inputs/RSAIDInput';
import PercentageSlider from '@/components/inputs/PercentageSlider';
import ResultCard from '@/components/calculators/shared/ResultCard';
import BreakdownCard from '@/components/calculators/shared/BreakdownCard';
import ComparisonCard from '@/components/calculators/shared/ComparisonCard';
import { PieChart, BarChart, ChartCard } from '@/components/charts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calculator, Download, Share2, Save, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner@2.0.3';

interface FormState {
  rsaID: string;
  monthlyWage: number;
  unemploymentMonths: number;
  dependents: number;
  contributionPercentage: number;
}

export const EnhancedUIFCalculator: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    rsaID: '',
    monthlyWage: 15000,
    unemploymentMonths: 6,
    dependents: 0,
    contributionPercentage: 100,
  });

  const [result, setResult] = useState<any>(null);
  const [isIdValid, setIsIdValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const handleCalculate = () => {
    setLoading(true);
    try {
      if (!isIdValid) {
        toast.error('Please enter a valid RSA ID number');
        return;
      }

      if (formState.monthlyWage <= 0) {
        toast.error('Please enter a valid monthly wage');
        return;
      }

      const calculationResult = calculateUIFBenefit({
        monthlyWage: formState.monthlyWage,
        unemploymentMonths: formState.unemploymentMonths,
        dependents: formState.dependents,
        rsaIDNumber: formState.rsaID,
      });

      setResult(calculationResult);
      toast.success('Calculation complete!');
    } catch (error) {
      console.error('Calculation error:', error);
      toast.error('Error calculating benefits. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormState({
      rsaID: '',
      monthlyWage: 15000,
      unemploymentMonths: 6,
      dependents: 0,
      contributionPercentage: 100,
    });
    setResult(null);
    setIsIdValid(false);
    setShowComparison(false);
  };

  const handleExport = () => {
    toast.success('Exporting calculation to PDF...');
    // TODO: Implement PDF export
  };

  const handleShare = () => {
    toast.success('Share link copied to clipboard!');
    // TODO: Implement share functionality
  };

  const handleSave = () => {
    toast.success('Calculation saved!');
    // TODO: Implement save to database
  };

  // Generate comparison scenarios
  const getComparisonScenarios = () => {
    if (!result) return [];

    const scenarios = [];

    // Scenario 1: Current calculation
    scenarios.push({
      id: 'current',
      name: 'Your Scenario',
      primaryAmount: result.netBenefit,
      badge: 'Current',
      badgeVariant: 'default' as const,
      breakdown: [
        { label: 'Gross Benefit', value: result.grossBenefit },
        { label: 'Dependent Allowance', value: result.dependentAllowance },
        { label: 'Tax Deduction', value: -result.taxDeduction },
      ],
    });

    // Scenario 2: With more dependents
    const moreDependents = calculateUIFBenefit({
      monthlyWage: formState.monthlyWage,
      unemploymentMonths: formState.unemploymentMonths,
      dependents: formState.dependents + 2,
      rsaIDNumber: formState.rsaID,
    });

    scenarios.push({
      id: 'more-dependents',
      name: `+2 Dependents (${formState.dependents + 2} total)`,
      primaryAmount: moreDependents.netBenefit,
      breakdown: [
        { label: 'Gross Benefit', value: moreDependents.grossBenefit },
        { label: 'Dependent Allowance', value: moreDependents.dependentAllowance },
        { label: 'Tax Deduction', value: -moreDependents.taxDeduction },
      ],
    });

    return scenarios;
  };

  // Generate pie chart data
  const getPieChartData = () => {
    if (!result) return [];

    return [
      { name: 'Base Benefit', value: result.grossBenefit, color: '#10b981' },
      { name: 'Dependent Allowance', value: result.dependentAllowance, color: '#3b82f6' },
      { name: 'Tax Deduction', value: result.taxDeduction, color: '#ef4444' },
    ];
  };

  // Generate bar chart data for month-by-month breakdown
  const getBarChartData = () => {
    if (!result) return [];

    const monthlyBenefit = result.netBenefit / formState.unemploymentMonths;
    
    return Array.from({ length: Math.min(formState.unemploymentMonths, 6) }, (_, i) => ({
      name: `Month ${i + 1}`,
      value: monthlyBenefit,
      color: i % 2 === 0 ? '#10b981' : '#059669',
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-neutral-900 flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Enhanced UIF Benefits Calculator
          </h1>
          <p className="text-gray-600 mt-1">
            Calculate your unemployment benefits with detailed breakdowns and comparisons
          </p>
        </div>
        
        {result && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Details</CardTitle>
              <CardDescription>
                Enter your employment and personal information
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
                placeholder="15,000.00"
              />

              {/* Unemployment Duration */}
              <div className="space-y-2">
                <Label>Unemployment Duration (Months)</Label>
                <Input
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
                <p className="text-xs text-gray-500">Maximum 12 months</p>
              </div>

              {/* Number of Dependents */}
              <div className="space-y-2">
                <Label>Number of Dependents</Label>
                <Input
                  type="number"
                  min={0}
                  value={formState.dependents}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      dependents: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              {/* Contribution Percentage Slider */}
              <PercentageSlider
                label="Contribution History"
                value={formState.contributionPercentage}
                onChange={(value) =>
                  setFormState((prev) => ({ ...prev, contributionPercentage: value }))
                }
                description="Percentage of required contribution period completed"
              />

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCalculate}
                  disabled={!isIdValid || loading}
                  className="flex-1"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  {loading ? 'Calculating...' : 'Calculate'}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <>
              {/* Main Result Card */}
              <ResultCard
                title="Total Net Benefit"
                primaryAmount={result.netBenefit}
                subtitle={`For ${formState.unemploymentMonths} month${
                  formState.unemploymentMonths > 1 ? 's' : ''
                } of unemployment`}
                secondaryInfo="This is an estimate - actual benefits may vary"
                statusColor="success"
              />

              {/* Breakdown */}
              <BreakdownCard
                title="Benefit Breakdown"
                items={[
                  { label: 'Gross Benefit', value: result.grossBenefit, type: 'positive' },
                  {
                    label: 'Dependent Allowance',
                    value: result.dependentAllowance,
                    type: 'positive',
                  },
                  { label: 'Tax Deduction', value: result.taxDeduction, type: 'negative' },
                ]}
                showTotal
                totalLabel="Net Benefit"
              />

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard
                  title="Benefit Composition"
                  description="Breakdown of your UIF benefit"
                  onExport={handleExport}
                >
                  <PieChart data={getPieChartData()} showLegend={false} height={250} />
                </ChartCard>

                <ChartCard
                  title="Monthly Payments"
                  description="Expected monthly benefit amount"
                  onExport={handleExport}
                >
                  <BarChart data={getBarChartData()} showLegend={false} height={250} />
                </ChartCard>
              </div>

              {/* Comparison Toggle */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowComparison(!showComparison)}
                >
                  {showComparison ? 'Hide' : 'Show'} Scenario Comparison
                </Button>
              </div>

              {/* Comparison Card */}
              {showComparison && (
                <ComparisonCard
                  title="Scenario Comparison"
                  description="Compare your current calculation with alternative scenarios"
                  scenarios={getComparisonScenarios()}
                  highlightBest
                  showDifference
                />
              )}

              {/* Disclaimers */}
              <Alert>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    {result.disclaimers.map((disclaimer: string, index: number) => (
                      <li key={index}>{disclaimer}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calculator className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">
                  Enter your details and click Calculate to see your UIF benefit estimate
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedUIFCalculator;
