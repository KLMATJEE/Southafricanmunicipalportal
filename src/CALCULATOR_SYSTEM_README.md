# South African Calculator System

## Overview

This comprehensive calculator system provides South African citizens with tools to estimate various government benefits, costs, and requirements. The system is fully integrated with the municipal portal and includes database persistence for calculation history.

## Available Calculators

### 1. UIF Benefits Calculator
- **Purpose**: Estimate Unemployment Insurance Fund benefits
- **Inputs**: RSA ID, monthly wage, unemployment period, dependents
- **Features**:
  - Live RSA ID validation with Luhn algorithm
  - Automatic tax calculations
  - Dependent allowances
  - Detailed benefit breakdown

### 2. Import Duty & VAT Calculator
- **Purpose**: Calculate costs for importing goods into South Africa
- **Inputs**: Product value, currency, category, origin country, port of entry
- **Features**:
  - Multi-currency support (ZAR, USD, EUR)
  - SACU member preferential rates
  - Category-based tariff rates
  - Port charges estimation

### 3. Taxi Fare & Fuel Cost Calculator
- **Purpose**: Calculate taxi fares and split costs among passengers
- **Inputs**: Distance/locations, passengers, fuel efficiency, fuel price
- **Features**:
  - Major SA city quick-select
  - Haversine distance calculation
  - Peak hour surcharge
  - Driver revenue calculation
  - Per-person cost splitting

### 4. APS Score Calculator
- **Purpose**: Calculate Admission Point Score for university applications
- **Inputs**: 6+ matric subjects with marks
- **Features**:
  - Grade-to-point conversion
  - University eligibility matching
  - Subject requirement validation
  - Personalized recommendations

## Architecture

### File Structure

```
/types/
  └── calculator.types.ts         # TypeScript interfaces

/utils/
  ├── validators/
  │   └── rsaIdValidator.ts       # RSA ID validation with Luhn
  └── formatters/
      └── currencyFormatter.ts    # Currency/number formatting

/services/
  └── calculators/
      ├── uifCalculator.ts        # UIF calculation logic
      ├── importDutyCalculator.ts # Import duty logic
      ├── taxiFareCalculator.ts   # Taxi fare logic
      └── apsCalculator.ts        # APS calculation logic

/components/
  ├── inputs/
  │   ├── CurrencyInput.tsx       # Multi-currency input
  │   └── RSAIDInput.tsx          # RSA ID with validation
  ├── calculators/
  │   ├── shared/
  │   │   ├── ResultCard.tsx      # Result display component
  │   │   └── BreakdownCard.tsx   # Breakdown display component
  │   ├── UIFBenefitsCalculator.tsx
  │   ├── ImportDutyCalculator.tsx
  │   ├── TaxiFareCalculator.tsx
  │   └── APSCalculator.tsx
  └── CalculatorView.tsx          # Main router component

/pages/
  └── CalculatorHub.tsx            # Hub landing page

/supabase/migrations/
  └── 20241204_calculator_tables.sql  # Database schema
```

## Database Schema

### Tables Created

1. **calculation_history** - Stores all calculator usage
   - Tracks user_id, calculator_type, input/result data
   - Supports saving and naming calculations
   
2. **saved_calculations** - User-favorited calculations
   - Quick access to frequently used calculations
   - Template support
   
3. **bill_reminders** - Bill payment reminders
   - Links to municipal bills
   - Configurable notification periods
   
4. **expense_tracking** - Personal expense tracking
   - Category-based organization
   - Budget linking
   
5. **government_services** - Service directory
   - Contact information
   - Links to official websites
   
6. **exchange_rates** - Currency conversion rates
   - Multi-currency support
   - Timestamp validity

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- Public read access for government services and exchange rates
- Automatic updated_at timestamps

## Usage Guide

### Adding a New Calculator

1. **Create Calculator Service** (`/services/calculators/`)

```typescript
// /services/calculators/myCalculator.ts
export interface MyCalculationInput {
  // Define input fields
}

export interface MyCalculationResult {
  // Define result fields
}

export const calculateMyResult = (
  input: MyCalculationInput
): MyCalculationResult => {
  // Implement calculation logic
  return result;
};
```

2. **Create Calculator Component** (`/components/calculators/`)

```typescript
// /components/calculators/MyCalculator.tsx
import React, { useState } from 'react';
import { calculateMyResult } from '@/services/calculators/myCalculator';
import ResultCard from '@/components/calculators/shared/ResultCard';
import BreakdownCard from '@/components/calculators/shared/BreakdownCard';

export const MyCalculator: React.FC = () => {
  const [formState, setFormState] = useState({});
  const [result, setResult] = useState(null);
  
  const handleCalculate = () => {
    const calculationResult = calculateMyResult(formState);
    setResult(calculationResult);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input section */}
      {/* Results section */}
    </div>
  );
};
```

3. **Add to CalculatorView** (`/components/CalculatorView.tsx`)

```typescript
// Import your calculator
import MyCalculator from '@/components/calculators/MyCalculator';

// Add to type
type CalculatorType = 'hub' | 'uif' | ... | 'my-calculator';

// Add to switch statement
case 'my-calculator':
  return <MyCalculator />;
```

4. **Update Calculator Hub** (`/components/CalculatorView.tsx`)

```typescript
// Add to calculators array
{
  id: 'my-calculator',
  title: 'My Calculator',
  description: 'Description of what it does',
  icon: '🧮',
  path: '/calculators/my-calculator',
  category: 'finance',
  color: 'bg-teal-50 border-teal-200 hover:border-teal-400',
  available: true,
}
```

### Using Reusable Components

#### ResultCard

```typescript
<ResultCard
  title="Your Result"
  primaryAmount={1234.56}
  currency="ZAR"
  subtitle="Description"
  statusColor="success" // 'success' | 'warning' | 'info' | 'neutral'
/>
```

#### BreakdownCard

```typescript
<BreakdownCard
  title="Cost Breakdown"
  items={[
    { label: 'Item 1', value: 100, type: 'positive' },
    { label: 'Item 2', value: 50, type: 'negative' },
  ]}
  showTotal={true}
  totalLabel="Grand Total"
/>
```

#### CurrencyInput

```typescript
<CurrencyInput
  label="Amount"
  value={amount}
  onChange={(value) => setAmount(value)}
  currency="ZAR"
  onCurrencyChange={(currency) => setCurrency(currency)}
  showCurrencySelector={true}
/>
```

#### RSAIDInput

```typescript
<RSAIDInput
  value={idNumber}
  onChange={(value) => setIdNumber(value)}
  onValidationChange={(isValid) => setIsValid(isValid)}
  required
/>
```

## Calculator Service Patterns

### Common Patterns

1. **Input Validation**
```typescript
if (input.value <= 0) {
  throw new Error('Value must be positive');
}
```

2. **Rate-Based Calculations**
```typescript
const rate = RATE_TABLE[category] || DEFAULT_RATE;
const result = baseValue * rate;
```

3. **Progressive Calculations**
```typescript
let total = 0;
if (income > THRESHOLD_1) {
  total += (income - THRESHOLD_1) * RATE_1;
}
// ... more brackets
```

4. **Conditional Logic**
```typescript
const discount = isSACUMember ? 0.75 : 1.0;
const finalRate = baseRate * discount;
```

## Styling Guidelines

### Color Usage

- **Success**: Green tones for positive results (#00A651)
- **Warning**: Orange for fees/alerts (#FF9500)
- **Info**: Blue for informational (#0066CC)
- **Neutral**: Gray tones for standard display

### Layout Pattern

All calculators follow a consistent 3-column layout:
- **Desktop**: Input (66%) | Results (33%)
- **Tablet**: Input (50%) | Results (50%)
- **Mobile**: Stacked single column

### Responsive Breakpoints

- Mobile: 360px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

## Data Persistence

### Saving Calculation History

```typescript
// Auto-saved in calculation_history table
const saveCalculation = async (type, input, result) => {
  await supabase.from('calculation_history').insert({
    calculator_type: type,
    input_data: input,
    result_data: result,
    user_id: user.id
  });
};
```

### Saving Favorite Calculations

```typescript
const saveFavorite = async (name, type, input, result) => {
  await supabase.from('saved_calculations').insert({
    saved_name: name,
    calculator_type: type,
    input_data: input,
    result_data: result,
    user_id: user.id
  });
};
```

## Testing Guidelines

### Unit Tests

Test calculation logic independently:

```typescript
describe('UIF Calculator', () => {
  it('calculates correct benefit amount', () => {
    const result = calculateUIFBenefit({
      monthlyWage: 10000,
      unemploymentMonths: 3,
      dependents: 2,
      rsaIDNumber: '9001015009087'
    });
    expect(result.netBenefit).toBeGreaterThan(0);
  });
});
```

### Integration Tests

Test calculator components with user interactions.

## Security Considerations

1. **Input Validation**: All inputs are validated before processing
2. **XSS Protection**: User inputs are sanitized
3. **RLS Policies**: Database access is restricted per user
4. **Rate Limiting**: Consider implementing for production
5. **Audit Logging**: All calculations are logged

## Regulatory Compliance

### POPIA Compliance

- Personal data (RSA ID) is encrypted in database
- User consent required for data collection
- Data retention policies implemented
- Right to deletion supported

### Disclaimers Required

All calculators must display:
- "Estimates only - not official calculations"
- Reference to official sources
- Last updated date for rates/rules

## Performance Optimization

1. **Lazy Loading**: Calculator components loaded on demand
2. **Memoization**: Expensive calculations cached
3. **Debouncing**: Input changes debounced
4. **Database Indexing**: Queries optimized with indexes

## Future Enhancements

### Planned Calculators

1. **Wage & Rent Split** - Household expense sharing
2. **Tax Calculator** - PAYE and annual tax
3. **Bill Reminders** - Payment tracking
4. **Expense Tracker** - Budget management
5. **NSFAS Calculator** - Student funding eligibility
6. **Grant Calculator** - Social grant amounts
7. **Pension Calculator** - Retirement planning

### Features Roadmap

- [ ] PDF export functionality
- [ ] Social sharing with preview cards
- [ ] Email results
- [ ] Calculator comparison mode
- [ ] Historical data charts
- [ ] Mobile app version
- [ ] Offline mode support
- [ ] Multi-language support

## API Integration

### Exchange Rates

Currently uses manual rates. For production:

```typescript
// Integrate with live API
const fetchExchangeRates = async () => {
  const response = await fetch('https://api.exchangerate-api.com/v4/latest/ZAR');
  const data = await response.json();
  return data.rates;
};
```

### Government Services

```typescript
// Fetch from government_services table
const getGovernmentServices = async (category) => {
  const { data } = await supabase
    .from('government_services')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('sort_order');
  return data;
};
```

## Troubleshooting

### Common Issues

1. **Validation Errors**: Check RSA ID format (13 digits)
2. **Calculation NaN**: Ensure all inputs are numbers
3. **Database Errors**: Verify RLS policies are set
4. **Styling Issues**: Clear browser cache

### Debug Mode

Enable debug logging:

```typescript
localStorage.setItem('DEBUG_CALCULATORS', 'true');
```

## Support & Resources

### Official Documentation

- UIF: https://www.labour.gov.za/uif
- SARS: https://www.sars.gov.za
- Universities SA: https://www.usaf.ac.za
- SARS Customs: https://www.sars.gov.za/customs-and-excise

### Contact

For issues or enhancements, contact the development team or submit a GitHub issue.

## License

This calculator system is part of the South African Municipal Portal and is subject to the same licensing terms.

---

**Last Updated**: December 4, 2024
**Version**: 1.0.0
**Maintained By**: Municipal Portal Development Team
