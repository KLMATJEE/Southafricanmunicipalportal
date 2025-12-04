# Calculator System - Quick Implementation Guide

## ✅ What Has Been Implemented

### Core Infrastructure
- ✅ TypeScript type definitions for all calculators
- ✅ RSA ID validator with Luhn algorithm
- ✅ Currency formatting utilities
- ✅ Calculator service layer (business logic)
- ✅ Reusable UI components
- ✅ Database schema with RLS policies

### Calculators (Fully Functional)
1. ✅ **UIF Benefits Calculator**
   - RSA ID validation
   - Benefit estimation
   - Tax calculations
   - Dependent allowances

2. ✅ **Import Duty & VAT Calculator**
   - Multi-currency support
   - SACU member rates
   - Category-based tariffs
   - Port charges

3. ✅ **Taxi Fare Calculator**
   - Distance calculation
   - Passenger cost splitting
   - Peak hour surcharge
   - Driver revenue

4. ✅ **APS Score Calculator**
   - Subject-to-points conversion
   - University eligibility
   - Personalized recommendations

### UI Components
- ✅ Calculator Hub (landing page)
- ✅ Individual calculator pages
- ✅ Result cards
- ✅ Breakdown cards
- ✅ Currency input with selector
- ✅ RSA ID input with live validation
- ✅ Navigation integration

### Database
- ✅ Complete SQL migration file
- ✅ Tables: calculation_history, saved_calculations, bill_reminders, expense_tracking, government_services, exchange_rates
- ✅ RLS policies
- ✅ Indexes for performance
- ✅ Sample data seeding

## 🚀 How to Deploy

### Step 1: Run Database Migration

```bash
# In your Supabase dashboard or using Supabase CLI
supabase migration up

# Or manually run the SQL file
# Located at: /supabase/migrations/20241204_calculator_tables.sql
```

### Step 2: Verify Installation

The calculators are now integrated into your portal. Access them via:

1. Log into the portal
2. Click the **"Calculators"** tab in the navigation
3. Select any calculator to use

### Step 3: Customize (Optional)

#### Update Exchange Rates

```sql
-- Update exchange rates in Supabase
UPDATE exchange_rates
SET rate = 18.75, updated_at = NOW()
WHERE from_currency = 'USD' AND to_currency = 'ZAR';
```

#### Add Government Services

```sql
-- Add new service
INSERT INTO government_services (
  service_name,
  category,
  description,
  url,
  phone,
  sort_order
) VALUES (
  'New Service Name',
  'category_name',
  'Service description',
  'https://example.gov.za',
  '012 345 6789',
  10
);
```

## 📋 Usage Examples

### For Citizens

#### Calculate UIF Benefits
1. Navigate to **Calculators** → **UIF Benefits**
2. Enter your RSA ID (format: YYMMDDGGGGGSC)
3. Enter monthly wage (before deductions)
4. Select unemployment period (1-12 months)
5. Enter number of dependents
6. Click **"Calculate Benefit"**
7. View detailed breakdown

#### Calculate Import Costs
1. Navigate to **Calculators** → **Import Duty & VAT**
2. Enter product value
3. Select currency (ZAR/USD/EUR)
4. Choose product category
5. Select origin country
6. Choose port of entry
7. Click **"Calculate Costs"**
8. View total cost breakdown

#### Calculate Taxi Fare
1. Navigate to **Calculators** → **Taxi Fare**
2. Select start location from dropdown OR enter distance manually
3. Select destination
4. Enter number of passengers
5. Adjust fuel efficiency if needed
6. Check peak hour if applicable
7. Click **"Calculate Fare"**
8. View per-person cost and driver revenue

#### Calculate APS Score
1. Navigate to **Calculators** → **APS Score**
2. Click **"Add Subject"** to add subjects (minimum 6)
3. Select subject name from dropdown
4. Enter final mark (0-100)
5. Repeat for all subjects
6. Click **"Calculate APS"**
7. View total APS and university eligibility

## 🔧 Configuration

### Rate Updates

To update calculation rates, edit the service files:

#### UIF Rates
File: `/services/calculators/uifCalculator.ts`

```typescript
// Update these constants
const maxUIFMonths = 12; // Maximum benefit period
const benefitPercentage = 0.6; // 60% of wages
const dependentAllowance = 300; // R per dependent per month
```

#### Import Duty Rates
File: `/services/calculators/importDutyCalculator.ts`

```typescript
const TARIFF_RATES: Record<string, number> = {
  'electronics': 0.15, // 15%
  'clothing': 0.45,    // 45%
  // ... update rates
};
```

#### Taxi Fare Rates
File: `/services/calculators/taxiFareCalculator.ts`

```typescript
const baseRatePerKm = 12.50; // R per km
const timeRatePerMin = 0.75; // R per minute
const peakCharge = 25.0;     // Peak hour surcharge
```

## 🎨 Customization

### Adding a New Product Category (Import Duty)

1. Edit `/services/calculators/importDutyCalculator.ts`:

```typescript
const TARIFF_RATES: Record<string, number> = {
  // ... existing categories
  'new_category': 0.20, // 20% duty rate
};
```

2. The dropdown will automatically update with the new category.

### Adding SA Cities (Taxi Calculator)

Edit `/services/calculators/taxiFareCalculator.ts`:

```typescript
export const SA_CITIES = [
  // ... existing cities
  { name: 'New City', lat: -XX.XXXX, lng: XX.XXXX },
];
```

### Adding Universities (APS Calculator)

Edit `/services/calculators/apsCalculator.ts`:

```typescript
const universities = [
  // ... existing universities
  { name: 'New University', minimumAPS: 30, tier: 'mid' },
];
```

## 🧪 Testing

### Manual Testing Checklist

#### UIF Calculator
- [ ] Enter invalid RSA ID → Should show error
- [ ] Enter valid RSA ID → Should show validation checkmark
- [ ] Calculate with 0 wage → Should show alert
- [ ] Calculate valid inputs → Should show results
- [ ] Verify dependent allowance calculation
- [ ] Verify tax deduction calculation

#### Import Duty Calculator
- [ ] Test ZAR currency → No conversion
- [ ] Test USD/EUR → Should convert to ZAR
- [ ] Test SACU country → Should show 0% duty
- [ ] Test non-SACU country → Should apply duty
- [ ] Verify VAT calculation (15% of product + duty)
- [ ] Verify port charges

#### Taxi Fare Calculator
- [ ] Select two cities → Should auto-calculate distance
- [ ] Enter manual distance → Should calculate fare
- [ ] Adjust passengers → Per-person cost should update
- [ ] Enable peak hour → Should add surcharge
- [ ] Verify fuel cost calculation
- [ ] Verify driver revenue (fare - fuel)

#### APS Calculator
- [ ] Add less than 6 subjects → Should show alert
- [ ] Add 6+ subjects → Should calculate APS
- [ ] Test mark boundaries (0, 30, 40, 50, 60, 70, 80, 100)
- [ ] Verify grade-to-points conversion
- [ ] Verify university eligibility matching
- [ ] Check that best 6 subjects are used

### Automated Testing

Create test files in `/tests/` directory:

```typescript
// Example: /tests/uifCalculator.test.ts
import { calculateUIFBenefit } from '@/services/calculators/uifCalculator';
import { validateRSAID } from '@/utils/validators/rsaIdValidator';

describe('UIF Calculator', () => {
  it('should calculate correct benefit', () => {
    const result = calculateUIFBenefit({
      monthlyWage: 10000,
      unemploymentMonths: 3,
      dependents: 0,
      rsaIDNumber: '9001015009087'
    });
    expect(result.netBenefit).toBeGreaterThan(0);
  });
  
  it('should validate RSA ID', () => {
    const result = validateRSAID('9001015009087');
    expect(result.valid).toBe(true);
  });
});
```

## 📊 Analytics & Monitoring

### Track Calculator Usage

```sql
-- Most used calculators
SELECT 
  calculator_type,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users
FROM calculation_history
GROUP BY calculator_type
ORDER BY usage_count DESC;

-- Average calculations per user
SELECT 
  user_id,
  COUNT(*) as total_calculations,
  COUNT(DISTINCT calculator_type) as calculators_used
FROM calculation_history
GROUP BY user_id;

-- Recent calculations
SELECT *
FROM calculation_history
ORDER BY created_at DESC
LIMIT 10;
```

### Export Calculator Data

```sql
-- Export user's calculation history
SELECT 
  calculator_type,
  input_data,
  result_data,
  created_at
FROM calculation_history
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC;
```

## 🔒 Security Checklist

- [x] RLS policies enabled on all tables
- [x] User data isolated per user_id
- [x] Input validation on all fields
- [x] XSS protection via React
- [x] SQL injection protection via Supabase
- [ ] Rate limiting (implement in production)
- [ ] CAPTCHA for high-volume usage
- [ ] Audit logging enabled

## 🐛 Troubleshooting

### Issue: Calculator not showing

**Solution**: Check browser console for errors. Verify CalculatorView is imported in App.tsx.

### Issue: RSA ID validation failing

**Solution**: Ensure ID is exactly 13 digits. Check Luhn algorithm implementation.

### Issue: Database errors when saving

**Solution**: Verify RLS policies are created. Check user authentication state.

### Issue: Styling looks wrong

**Solution**: Clear browser cache. Verify Tailwind classes are not conflicting.

### Issue: Exchange rates outdated

**Solution**: Update exchange_rates table or implement auto-update from external API.

## 📞 Support

### Get Help

1. **Documentation**: Check `/CALCULATOR_SYSTEM_README.md` for detailed documentation
2. **Database Schema**: Review `/supabase/migrations/20241204_calculator_tables.sql`
3. **Code Examples**: See individual calculator components for patterns

### Report Issues

When reporting issues, include:
- Calculator name
- Input values used
- Expected vs actual result
- Browser and OS
- Console error messages

## 🎯 Next Steps

### Immediate Tasks

1. ✅ Run database migration
2. ✅ Test each calculator with sample data
3. ✅ Update exchange rates if needed
4. ✅ Review and update tariff rates
5. ✅ Add organization-specific branding

### Future Enhancements

- [ ] Implement PDF export
- [ ] Add social sharing
- [ ] Create mobile app version
- [ ] Add more calculators (Tax, NSFAS, etc.)
- [ ] Implement calculation templates
- [ ] Add comparison mode
- [ ] Create analytics dashboard

## 📝 Maintenance

### Monthly Tasks

- Update exchange rates
- Review and update tariff rates
- Update UIF benefit percentages
- Update university APS requirements
- Review and update fuel prices

### Quarterly Tasks

- Audit calculation accuracy against official sources
- Review and update disclaimers
- Performance optimization
- Security audit
- User feedback review

---

**Deployment Date**: December 4, 2024
**Status**: ✅ Ready for Production
**Version**: 1.0.0
