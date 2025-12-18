# Real-Time Billing System Setup Guide

## Overview

This guide will help you set up the comprehensive real-time billing system for South African municipal utilities (electricity and water). The system provides:

- **Real-time usage monitoring** with 30-second polling intervals
- **Time-of-use electricity tariffs** (Peak/Standard/Off-peak)
- **Inclining block water tariffs** with leak detection
- **Load-shedding adjustments** and carbon emissions tracking
- **Month-end cost forecasts** based on current usage patterns
- **Comprehensive audit logging** for compliance

## Architecture

### Backend
- **Database**: PostgreSQL via Supabase with 6 specialized tables
- **API**: Hono edge functions for tariff calculations
- **Real-time data**: Supports IoT/smart meter ingestion via MQTT/WebSocket

### Frontend
- **Dashboard**: React components with real-time updates
- **Visualization**: Live cost breakdowns with TailwindCSS styling
- **Notifications**: Alerts for tier changes and peak periods

## Step 1: Database Setup

### Run the SQL Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `/supabase/functions/server/database-schema.tsx`
4. Copy the contents of the `DATABASE_SCHEMA` constant
5. Paste and run in the SQL Editor
6. Copy the contents of the `SEED_DATA` constant
7. Paste and run to seed initial tariff data

### Tables Created

- **meters**: Register user meters (electricity/water)
- **readings**: Time-series usage data
- **tariffs**: Versioned tariff rules with JSON schemas
- **context_signals**: Real-time context (load-shedding, peak schedules)
- **bill_snapshots**: Historical billing records
- **audit_calculations**: Comprehensive audit trail

## Step 2: Tariff Configuration

### Electricity Tariff Structure

Time-of-use windows (Johannesburg example):
- **Peak**: 06:00-09:00 and 17:00-21:00 → R3.20/kWh
- **Standard**: 09:00-17:00 and 21:00-23:00 → R2.40/kWh
- **Off-peak**: 23:00-06:00 → R1.60/kWh

Additional components:
- Network charge: R0.15/kWh
- Environmental levy: R0.03/kWh
- Fixed monthly charge: R120.00

Load-shedding multipliers:
- Stage 0: 1.00× (no adjustment)
- Stage 4: 1.05× (5% increase)
- Stage 6: 1.08× (8% increase)

### Water Tariff Structure

Inclining block tariffs (Johannesburg example):
- **Block 1**: 0-6 kL → R0.00/kL (free basic water)
- **Block 2**: 6-20 kL → R25.00/kL
- **Block 3**: 20-35 kL → R35.00/kL
- **Block 4**: 35+ kL → R45.00/kL

Fixed charges:
- Availability: R90.00/month
- Sewer: R70.00/month

Surcharges:
- Leak detection: 1.20× on excess usage
- Drought period: 1.15× on all usage

### Customizing Tariffs

To add new tariffs or providers, insert into the `tariffs` table:

```sql
INSERT INTO tariffs (provider, utility, valid_from, schema, version)
VALUES (
  'your_provider',
  'electricity', -- or 'water'
  '2026-01-01'::timestamptz,
  '{
    "utility": "electricity",
    "version": "2026.01",
    "components": { ... },
    "timeOfUse": [ ... ],
    "adjustments": { ... }
  }'::jsonb,
  '2026.01'
);
```

## Step 3: Meter Registration

### Via API

```typescript
POST /make-server-4c8674b4/meters/register
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "userId": "user_123",
  "meterType": "electricity",  // or "water"
  "provider": "city_power_jhb", // or "jhb_water"
  "location": {
    "name": "Main House"
  },
  "isSmart": true
}
```

### Via Frontend

Use the `MeterRegistrationForm` component:
- Select meter type (Electricity/Water)
- Choose provider
- Optionally name the meter location
- Indicate if it's a smart meter

## Step 4: Data Ingestion

### IoT/Smart Meter Integration

```typescript
POST /make-server-4c8674b4/readings/ingest
Content-Type: application/json
Authorization: Bearer <service_role_key>

{
  "meterId": "meter_uuid",
  "readings": [
    {
      "timestamp": "2025-12-08T12:00:00Z",
      "value": 0.25,  // kWh or kL
      "quality_flag": "good"
    }
  ]
}
```

### Seed Test Data

For development/testing, seed sample data:

```typescript
POST /make-server-4c8674b4/billing/seed
Content-Type: application/json

{
  "userId": "user_123"
}
```

This generates:
- 1 electricity meter with 60 minutes of readings
- 1 water meter with 60 minutes of readings
- Updated context signals

## Step 5: Frontend Integration

### Basic Usage

```typescript
import { BillingDashboard } from './components/billing/BillingDashboard';

function App() {
  return (
    <BillingDashboard
      userId="user_123"
      accessToken={accessToken}
    />
  );
}
```

### Custom Hook

```typescript
import { useRealTimeBilling } from './hooks/useRealTimeBilling';

function MyComponent() {
  const { data, loading, error, lastUpdated, refresh } = useRealTimeBilling({
    userId: 'user_123',
    horizonMinutes: 60,
    pollingInterval: 30000,
    enabled: true,
    accessToken
  });
  
  return (
    <div>
      <h2>Total Cost: R{data?.totalCost.toFixed(2)}</h2>
      {data?.breakdown.map(meter => (
        <div key={meter.meterId}>
          {meter.type}: R{meter.totalCost.toFixed(2)}
        </div>
      ))}
    </div>
  );
}
```

## Step 6: Context Signals Management

### Update Load-Shedding Stage

```typescript
INSERT INTO context_signals (signal_name, signal_value, timestamp)
VALUES (
  'load_shedding_stage',
  '{"stage": 4, "updated_at": "2025-12-08T14:00:00Z"}'::jsonb,
  NOW()
);
```

### Update Time-of-Use Window

```typescript
INSERT INTO context_signals (signal_name, signal_value, timestamp)
VALUES (
  'peak_schedule',
  '{
    "current_window": "peak",
    "next_change": "2025-12-08T21:00:00Z",
    "updated_at": "2025-12-08T17:00:00Z"
  }'::jsonb,
  NOW()
);
```

### Update Carbon Intensity

```typescript
INSERT INTO context_signals (signal_name, signal_value, timestamp)
VALUES (
  'carbon_intensity',
  '{
    "gco2_per_kwh": 950,
    "source": "eskom_mix",
    "updated_at": "2025-12-08T12:00:00Z"
  }'::jsonb,
  NOW()
);
```

## API Endpoints

### Billing

- `POST /billing/realtime` - Calculate real-time billing
- `GET /billing/history` - Get billing history
- `GET /billing/forecast` - Get forecasted costs

### Meters

- `POST /meters/register` - Register new meter
- `GET /meters/list` - List user's meters

### Readings

- `POST /readings/ingest` - Ingest meter readings

### Utility

- `POST /billing/seed` - Seed test data (development only)

## Calculation Formulas

### Electricity

```
cost_i = kWh_i × rate(timestamp_i, tier(cum_kWh))
rate' = rate × (1 + α_stage) × seasonal_multiplier
total = Σ(cost_i) + fixed_monthly + network_charge + levy
```

### Water

```
cost = Σ_b (min(V_b, Δ_b) × R_b) + fixed_sewer + availability
surcharge = leak_multiplier × (V - V̄_historical) if V >> V̄
```

## Performance Optimization

### Caching Strategy

- Real-time card: 30-second cache
- Tariff rules: 15-minute cache
- Context signals: 5-minute cache

### Database Indexes

All critical indexes are created automatically:
- `idx_readings_meter_timestamp` for time-series queries
- `idx_meters_user_id` for user filtering
- `idx_tariffs_active` for active tariff lookups

## Security & Compliance

### POPIA Alignment

- Row-level security on all tables
- Encrypted data at rest
- Minimal PII in readings
- Comprehensive audit trail

### Data Retention

- Readings: 24 months rolling window
- Bill snapshots: Permanent retention
- Audit logs: 7 years (regulatory requirement)

## Troubleshooting

### No Data Showing

1. Check if meters are registered: `GET /meters/list?userId=<userId>`
2. Verify readings exist: Check `readings` table in Supabase
3. Check tariff availability: Query `tariffs` table for provider
4. Review browser console for errors

### Incorrect Calculations

1. Verify tariff version: Check `tariff_version` in response
2. Validate context signals: Query `context_signals` table
3. Review audit logs: Check `audit_calculations` for input/output
4. Confirm reading quality: Check `quality_flag` in readings

### Performance Issues

1. Reduce polling interval from 30s to 60s
2. Enable browser caching
3. Add database indexes if custom queries are slow
4. Consider read replicas for high-traffic scenarios

## Next Steps

1. **Forecasting Engine**: Add ML-based usage predictions
2. **Budget Alerts**: Notify users when approaching budget limits
3. **Tariff Comparison**: Show savings from switching providers
4. **Energy Efficiency Tips**: AI-powered recommendations
5. **Solar Integration**: Track solar generation and grid export

## Support

For issues or questions:
- Review audit logs in `audit_calculations` table
- Check Supabase logs for edge function errors
- Examine browser console for frontend errors
- Verify all environment variables are set correctly
