# Calculator Components Guide
**Complete Reference for All Calculator UI Components**

---

## 📦 Table of Contents

1. [Input Components](#input-components)
2. [Display Components](#display-components)
3. [Chart Components](#chart-components)
4. [Utilities](#utilities)
5. [Complete Example](#complete-example)
6. [Import Guide](#import-guide)

---

## 🎛️ Input Components

### CurrencyInput
**Location:** `/components/inputs/CurrencyInput.tsx`

Multi-currency input with formatted display and parsing.

```tsx
import CurrencyInput from '@/components/inputs/CurrencyInput';

<CurrencyInput
  label="Monthly Salary"
  value={salary}
  onChange={(value) => setSalary(value)}
  currency="ZAR"
  onCurrencyChange={(curr) => setCurrency(curr)}
  showCurrencySelector={true}
  placeholder="0.00"
/>
```

**Props:**
- `value: number` - The numeric value
- `onChange: (value: number) => void` - Value change handler
- `currency?: 'ZAR' | 'USD' | 'EUR'` - Currency type (default: 'ZAR')
- `onCurrencyChange?: (currency) => void` - Currency change handler
- `showCurrencySelector?: boolean` - Show dropdown for currency selection
- `label?: string` - Input label
- `placeholder?: string` - Placeholder text
- `disabled?: boolean` - Disable input

---

### RSAIDInput
**Location:** `/components/inputs/RSAIDInput.tsx`

RSA ID number input with real-time Luhn algorithm validation.

```tsx
import RSAIDInput from '@/components/inputs/RSAIDInput';

<RSAIDInput
  value={idNumber}
  onChange={(value) => setIdNumber(value)}
  onValidationChange={(isValid) => setIsValid(isValid)}
  label="RSA ID Number"
  required={true}
/>
```

**Props:**
- `value: string` - The ID number value
- `onChange: (value: string) => void` - Change handler
- `onValidationChange?: (isValid: boolean) => void` - Validation status callback
- `label?: string` - Input label (default: 'RSA ID Number')
- `required?: boolean` - Show required indicator

**Features:**
- ✅ Luhn algorithm checksum validation
- ✅ Date of birth extraction
- ✅ Gender detection
- ✅ Citizenship status parsing
- ✅ Real-time visual feedback (green checkmark / red X)
- ✅ Displays extracted info on validation

---

### PercentageSlider
**Location:** `/components/inputs/PercentageSlider.tsx`

Visual slider with numeric input for percentage values.

```tsx
import PercentageSlider from '@/components/inputs/PercentageSlider';

<PercentageSlider
  label="Tax Rate"
  value={taxRate}
  onChange={(value) => setTaxRate(value)}
  min={0}
  max={100}
  step={1}
  showInput={true}
  description="Adjust the tax percentage"
/>
```

**Props:**
- `value: number` - Current value
- `onChange: (value: number) => void` - Change handler
- `label?: string` - Slider label
- `min?: number` - Minimum value (default: 0)
- `max?: number` - Maximum value (default: 100)
- `step?: number` - Step increment (default: 1)
- `showInput?: boolean` - Show numeric input (default: true)
- `disabled?: boolean` - Disable slider
- `description?: string` - Help text

---

### DateRangePicker
**Location:** `/components/inputs/DateRangePicker.tsx`

Calendar-based date range selection with validation.

```tsx
import DateRangePicker from '@/components/inputs/DateRangePicker';

<DateRangePicker
  label="Select Period"
  value={{ from: startDate, to: endDate }}
  onChange={(range) => {
    setStartDate(range.from);
    setEndDate(range.to);
  }}
  minDate={new Date('2020-01-01')}
  maxDate={new Date()}
/>
```

**Props:**
- `value: { from?: Date, to?: Date }` - Selected date range
- `onChange: (range) => void` - Range change handler
- `label?: string` - Picker label
- `placeholder?: string` - Placeholder text
- `disabled?: boolean` - Disable picker
- `minDate?: Date` - Minimum selectable date
- `maxDate?: Date` - Maximum selectable date

---

## 🎨 Display Components

### ResultCard
**Location:** `/components/calculators/shared/ResultCard.tsx`

Primary result display with status-based coloring.

```tsx
import ResultCard from '@/components/calculators/shared/ResultCard';

<ResultCard
  title="Total UIF Benefit"
  primaryAmount={12500.50}
  currency="ZAR"
  subtitle="For 6 months of unemployment"
  secondaryInfo="This is an estimate only"
  statusColor="success"
/>
```

**Props:**
- `title: string` - Card title
- `primaryAmount: number` - Main amount to display
- `currency?: string` - Currency code (default: 'ZAR')
- `subtitle: string` - Description text
- `secondaryInfo?: string` - Additional info
- `statusColor?: 'success' | 'warning' | 'info' | 'neutral'` - Color theme

**Status Colors:**
- `success` - Green (positive results)
- `warning` - Orange (alerts)
- `info` - Blue (informational)
- `neutral` - Gray (default)

---

### BreakdownCard
**Location:** `/components/calculators/shared/BreakdownCard.tsx`

Itemized breakdown of calculations with optional total.

```tsx
import BreakdownCard from '@/components/calculators/shared/BreakdownCard';

<BreakdownCard
  title="Benefit Breakdown"
  items={[
    { label: 'Base Benefit', value: 10000, type: 'positive' },
    { label: 'Dependent Allowance', value: 3000, type: 'positive' },
    { label: 'Tax Deduction', value: 500, type: 'negative' },
  ]}
  showTotal={true}
  totalLabel="Net Benefit"
/>
```

**Props:**
- `title?: string` - Card title (default: 'Breakdown')
- `items: BreakdownItem[]` - Array of breakdown items
- `showTotal?: boolean` - Display total row (default: false)
- `totalLabel?: string` - Total row label (default: 'Total')

**BreakdownItem:**
```tsx
{
  label: string;
  value: number;
  type?: 'positive' | 'negative' | 'neutral';
  currency?: string;
}
```

---

### ComparisonCard
**Location:** `/components/calculators/shared/ComparisonCard.tsx`

Side-by-side scenario comparison with difference indicators.

```tsx
import ComparisonCard from '@/components/calculators/shared/ComparisonCard';

<ComparisonCard
  title="Scenario Comparison"
  description="Compare different benefit scenarios"
  scenarios={[
    {
      id: 'scenario1',
      name: 'Current Situation',
      primaryAmount: 12500,
      badge: 'Current',
      breakdown: [
        { label: 'Base', value: 10000 },
        { label: 'Bonus', value: 2500 },
      ],
    },
    {
      id: 'scenario2',
      name: 'With Dependents',
      primaryAmount: 15000,
      breakdown: [
        { label: 'Base', value: 10000 },
        { label: 'Bonus', value: 5000 },
      ],
    },
  ]}
  highlightBest={true}
  showDifference={true}
/>
```

**Props:**
- `title: string` - Card title
- `description?: string` - Card description
- `scenarios: Scenario[]` - Array of scenarios to compare
- `highlightBest?: boolean` - Highlight highest value (default: true)
- `showDifference?: boolean` - Show difference between scenarios (default: true)

**Scenario:**
```tsx
{
  id: string;
  name: string;
  primaryAmount: number;
  currency?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  breakdown?: Array<{ label: string; value: number }>;
}
```

---

## 📊 Chart Components

### PieChart
**Location:** `/components/charts/PieChart.tsx`

Circular chart for showing proportional data.

```tsx
import { PieChart } from '@/components/charts';

<PieChart
  title="Benefit Composition"
  description="Breakdown of your benefits"
  data={[
    { name: 'Base Benefit', value: 10000, color: '#10b981' },
    { name: 'Allowances', value: 3000, color: '#3b82f6' },
    { name: 'Deductions', value: 500, color: '#ef4444' },
  ]}
  showLegend={true}
  showTooltip={true}
  height={300}
/>
```

**Props:**
- `data: PieChartDataItem[]` - Chart data
- `title?: string` - Chart title
- `description?: string` - Chart description
- `showLegend?: boolean` - Display legend (default: true)
- `showTooltip?: boolean` - Display tooltip on hover (default: true)
- `height?: number` - Chart height in pixels (default: 300)
- `innerRadius?: number` - Inner radius for donut chart (default: 0)
- `outerRadius?: number` - Outer radius (default: 80)
- `customColors?: string[]` - Custom color palette

---

### BarChart
**Location:** `/components/charts/BarChart.tsx`

Vertical or horizontal bar chart for comparisons.

```tsx
import { BarChart } from '@/components/charts';

<BarChart
  title="Monthly Benefits"
  description="Benefit amount per month"
  data={[
    { name: 'Month 1', value: 2500 },
    { name: 'Month 2', value: 2500 },
    { name: 'Month 3', value: 2500 },
  ]}
  layout="horizontal"
  showGrid={true}
  height={300}
/>
```

**Props:**
- `data: BarChartDataItem[]` - Chart data
- `title?: string` - Chart title
- `description?: string` - Chart description
- `showLegend?: boolean` - Display legend (default: true)
- `showTooltip?: boolean` - Display tooltip (default: true)
- `showGrid?: boolean` - Display grid lines (default: true)
- `height?: number` - Chart height (default: 300)
- `dataKeys?: string[]` - Data keys for multi-series (default: ['value'])
- `colors?: string[]` - Custom colors
- `layout?: 'horizontal' | 'vertical'` - Chart orientation (default: 'horizontal')
- `xAxisLabel?: string` - X-axis label
- `yAxisLabel?: string` - Y-axis label
- `stacked?: boolean` - Stack multiple series (default: false)

---

### LineChart
**Location:** `/components/charts/LineChart.tsx`

Line or area chart for showing trends over time.

```tsx
import { LineChart } from '@/components/charts';

<LineChart
  title="Benefit Trend"
  description="Benefit amount over time"
  data={[
    { name: 'Jan', benefit: 2500, expenses: 2000 },
    { name: 'Feb', benefit: 2500, expenses: 2200 },
    { name: 'Mar', benefit: 2500, expenses: 1800 },
  ]}
  dataKeys={['benefit', 'expenses']}
  showArea={false}
  curved={true}
  dots={true}
/>
```

**Props:**
- `data: LineChartDataItem[]` - Chart data
- `title?: string` - Chart title
- `description?: string` - Chart description
- `showLegend?: boolean` - Display legend (default: true)
- `showTooltip?: boolean` - Display tooltip (default: true)
- `showGrid?: boolean` - Display grid (default: true)
- `showArea?: boolean` - Fill area under line (default: false)
- `height?: number` - Chart height (default: 300)
- `dataKeys: string[]` - Required data keys to plot
- `colors?: string[]` - Custom colors
- `curved?: boolean` - Curved lines (default: true)
- `dots?: boolean` - Show data points (default: true)

---

### GaugeChart
**Location:** `/components/charts/GaugeChart.tsx`

Semi-circular gauge for showing progress or capacity.

```tsx
import { GaugeChart } from '@/components/charts';

<GaugeChart
  title="Contribution Level"
  value={75}
  max={100}
  min={0}
  label="Contribution Percentage"
  unit="%"
  ranges={[
    { min: 0, max: 33, color: '#ef4444', label: 'Low' },
    { min: 34, max: 66, color: '#f59e0b', label: 'Medium' },
    { min: 67, max: 100, color: '#10b981', label: 'High' },
  ]}
/>
```

**Props:**
- `value: number` - Current value
- `max: number` - Maximum value
- `min?: number` - Minimum value (default: 0)
- `title?: string` - Chart title
- `description?: string` - Chart description
- `label?: string` - Value label
- `unit?: string` - Unit of measurement
- `showValue?: boolean` - Display value (default: true)
- `color?: string` - Custom color (overrides ranges)
- `size?: number` - Gauge size in pixels (default: 200)
- `thickness?: number` - Arc thickness (default: 20)
- `ranges?: Range[]` - Color ranges with labels

---

### ChartCard
**Location:** `/components/charts/ChartCard.tsx`

Wrapper component for charts with export/share functionality.

```tsx
import { ChartCard } from '@/components/charts';

<ChartCard
  title="Monthly Breakdown"
  description="Detailed monthly analysis"
  onExport={() => exportToPDF()}
  onShare={() => shareChart()}
  onExpand={() => openFullscreen()}
  showActions={true}
  footer={<p>Last updated: {lastUpdate}</p>}
>
  {/* Your chart component here */}
  <BarChart data={monthlyData} />
</ChartCard>
```

**Props:**
- `title?: string` - Card title
- `description?: string` - Card description
- `children: React.ReactNode` - Chart content
- `onExport?: () => void` - Export button handler
- `onShare?: () => void` - Share button handler
- `onExpand?: () => void` - Expand button handler
- `showActions?: boolean` - Show action buttons (default: true)
- `footer?: React.ReactNode` - Footer content
- `className?: string` - Additional CSS classes

---

## 🛠️ Utilities

### Currency Formatter
**Location:** `/utils/formatters/currencyFormatter.ts`

```tsx
import { formatCurrency, formatNumber, formatPercentage, parseCurrencyInput } from '@/utils/formatters/currencyFormatter';

// Format as currency
formatCurrency(1234.56, 'ZAR'); // "R 1,234.56"
formatCurrency(1234.56, 'USD'); // "$1,234.56"

// Format as number
formatNumber(1234.5678, 2); // "1,234.57"

// Format as percentage
formatPercentage(0.15); // "15.0%"

// Parse user input
parseCurrencyInput("R 1,234.56"); // 1234.56
```

---

### Date Formatter
**Location:** `/utils/formatters/dateFormatter.ts`

```tsx
import {
  formatDateSA,
  formatDateHuman,
  formatDateRelative,
  formatBillDueDate,
  getFinancialYearSA,
} from '@/utils/formatters/dateFormatter';

// South African format
formatDateSA(new Date()); // "05/12/2024"

// Human readable
formatDateHuman(new Date()); // "5 December 2024"

// Relative time
formatDateRelative(new Date('2024-12-03')); // "2 days ago"

// Bill due date with urgency
const { formatted, urgency, daysRemaining } = formatBillDueDate(dueDate);
// urgency: 'overdue' | 'urgent' | 'upcoming' | 'future'

// Financial year
const { start, end, label } = getFinancialYearSA();
// label: "2024/2025"
```

---

### RSA ID Validator
**Location:** `/utils/validators/rsaIdValidator.ts`

```tsx
import { validateRSAID, extractIDInfo } from '@/utils/validators/rsaIdValidator';

// Validate ID
const result = validateRSAID('9001045009087');
// {
//   valid: true,
//   dateOfBirth: Date,
//   gender: 'Male' | 'Female',
//   citizenshipStatus: 'SA Citizen' | 'Permanent Resident',
//   sequenceNumber: number
// }

// Extract info
const info = extractIDInfo('9001045009087');
// {
//   dateOfBirth: Date,
//   gender: 'Male',
//   citizenship: 'SA Citizen',
//   age: 34
// }
```

---

## 📋 Complete Example

Here's a complete calculator using all components:

```tsx
import React, { useState } from 'react';
import CurrencyInput from '@/components/inputs/CurrencyInput';
import RSAIDInput from '@/components/inputs/RSAIDInput';
import PercentageSlider from '@/components/inputs/PercentageSlider';
import ResultCard from '@/components/calculators/shared/ResultCard';
import BreakdownCard from '@/components/calculators/shared/BreakdownCard';
import ComparisonCard from '@/components/calculators/shared/ComparisonCard';
import { PieChart, BarChart, ChartCard } from '@/components/charts';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

export const MyCalculator = () => {
  const [idNumber, setIdNumber] = useState('');
  const [isIdValid, setIsIdValid] = useState(false);
  const [amount, setAmount] = useState(0);
  const [percentage, setPercentage] = useState(50);
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    // Your calculation logic
    const calculated = {
      total: amount * (percentage / 100),
      breakdown: {
        base: amount,
        adjustment: amount * (percentage / 100) - amount,
      },
    };
    setResult(calculated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Inputs */}
      <div className="space-y-6">
        <RSAIDInput
          value={idNumber}
          onChange={setIdNumber}
          onValidationChange={setIsIdValid}
          required
        />
        
        <CurrencyInput
          label="Amount"
          value={amount}
          onChange={setAmount}
        />
        
        <PercentageSlider
          label="Adjustment Factor"
          value={percentage}
          onChange={setPercentage}
        />
        
        <Button
          onClick={handleCalculate}
          disabled={!isIdValid}
          className="w-full"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calculate
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <ResultCard
            title="Calculated Result"
            primaryAmount={result.total}
            subtitle="Based on your inputs"
            statusColor="success"
          />
          
          <BreakdownCard
            items={[
              { label: 'Base Amount', value: result.breakdown.base },
              { label: 'Adjustment', value: result.breakdown.adjustment },
            ]}
            showTotal
          />
          
          <ChartCard title="Visual Breakdown">
            <PieChart
              data={[
                { name: 'Base', value: result.breakdown.base },
                { name: 'Adjustment', value: Math.abs(result.breakdown.adjustment) },
              ]}
            />
          </ChartCard>
        </div>
      )}
    </div>
  );
};
```

---

## 📥 Import Guide

### Single Component Import
```tsx
import CurrencyInput from '@/components/inputs/CurrencyInput';
import ResultCard from '@/components/calculators/shared/ResultCard';
```

### Multiple Chart Imports
```tsx
import { PieChart, BarChart, LineChart, GaugeChart, ChartCard } from '@/components/charts';
```

### Utility Imports
```tsx
import { formatCurrency } from '@/utils/formatters/currencyFormatter';
import { formatDateSA } from '@/utils/formatters/dateFormatter';
import { validateRSAID } from '@/utils/validators/rsaIdValidator';
```

### Type Imports
```tsx
import type { UIFCalculationInput, UIFCalculationResult } from '@/types/calculator.types';
import type { GovernmentService, TaxBracket } from '@/types/government.types';
```

---

## 🎯 Best Practices

1. **Always validate inputs** before calculations
2. **Use StatusColor appropriately** - green for positive, red for negative, amber for warnings
3. **Provide clear labels and descriptions** for all inputs
4. **Include disclaimers** for estimates and calculations
5. **Format all currency values** using the currency formatter
6. **Validate RSA IDs** before using them in calculations
7. **Use ComparisonCard** to help users make informed decisions
8. **Export/Share functionality** enhances user experience
9. **Responsive design** - test on mobile and desktop
10. **Accessibility** - all components support keyboard navigation

---

**Last Updated:** December 5, 2024  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
