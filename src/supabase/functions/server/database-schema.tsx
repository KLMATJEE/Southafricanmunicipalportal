/**
 * Database Schema Setup for Real-Time Billing System
 * 
 * This file contains the SQL schema and RLS policies for:
 * - meters: Smart meter registrations
 * - readings: Time-series meter readings
 * - tariffs: Versioned tariff rules
 * - context_signals: Real-time context (load-shedding, peak schedules)
 * - bill_snapshots: Historical billing records
 * - audit_calculations: Audit trail for all calculations
 * 
 * IMPORTANT: Run this SQL in your Supabase SQL Editor to create tables.
 * The schema creates tables with proper indexes and RLS policies.
 */

export const DATABASE_SCHEMA = `
-- Enable RLS
ALTER DATABASE postgres SET timezone TO 'Africa/Johannesburg';

-- Meters table
CREATE TABLE IF NOT EXISTS meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  meter_type TEXT NOT NULL CHECK (meter_type IN ('electricity', 'water')),
  provider TEXT NOT NULL,
  location JSONB,
  is_smart BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meters_user_id ON meters(user_id);
CREATE INDEX IF NOT EXISTS idx_meters_type ON meters(meter_type);

ALTER TABLE meters ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own meters"
  ON meters FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY IF NOT EXISTS "Users can insert their own meters"
  ON meters FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Readings table (time-series data)
CREATE TABLE IF NOT EXISTS readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_id UUID NOT NULL REFERENCES meters(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  value DECIMAL(10, 3) NOT NULL,
  quality_flag TEXT DEFAULT 'good' CHECK (quality_flag IN ('good', 'estimated', 'anomaly')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_readings_meter_id ON readings(meter_id);
CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_readings_meter_timestamp ON readings(meter_id, timestamp DESC);

ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view readings for their meters"
  ON readings FOR SELECT
  USING (
    meter_id IN (
      SELECT id FROM meters 
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Tariffs table (versioned tariff rules)
CREATE TABLE IF NOT EXISTS tariffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  utility TEXT NOT NULL CHECK (utility IN ('electricity', 'water')),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_to TIMESTAMPTZ,
  schema JSONB NOT NULL,
  version TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tariffs_provider_utility ON tariffs(provider, utility);
CREATE INDEX IF NOT EXISTS idx_tariffs_valid_dates ON tariffs(valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_tariffs_active ON tariffs(is_active) WHERE is_active = true;

ALTER TABLE tariffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view active tariffs"
  ON tariffs FOR SELECT
  USING (is_active = true);

-- Context signals table (real-time context data)
CREATE TABLE IF NOT EXISTS context_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_name TEXT NOT NULL,
  signal_value JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_context_signals_name ON context_signals(signal_name);
CREATE INDEX IF NOT EXISTS idx_context_signals_timestamp ON context_signals(timestamp DESC);

ALTER TABLE context_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view context signals"
  ON context_signals FOR SELECT
  USING (true);

-- Bill snapshots table (historical billing records)
CREATE TABLE IF NOT EXISTS bill_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  totals JSONB NOT NULL,
  breakdown JSONB NOT NULL,
  tariff_versions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bill_snapshots_user_id ON bill_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_snapshots_period ON bill_snapshots(period_start, period_end);

ALTER TABLE bill_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own bill snapshots"
  ON bill_snapshots FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Audit calculations table (audit trail)
CREATE TABLE IF NOT EXISTS audit_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  calculation_type TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  output_hash TEXT NOT NULL,
  tariff_versions JSONB NOT NULL,
  request_metadata JSONB DEFAULT '{}',
  response_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_calculations_user_id ON audit_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_calculations_created_at ON audit_calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_calculations_type ON audit_calculations(calculation_type);

ALTER TABLE audit_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own audit logs"
  ON audit_calculations FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_meters_updated_at BEFORE UPDATE ON meters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tariffs_updated_at BEFORE UPDATE ON tariffs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

export const SEED_DATA = `
-- Seed initial tariff data for Johannesburg (City Power)
INSERT INTO tariffs (provider, utility, valid_from, schema, version) VALUES
(
  'city_power_jhb',
  'electricity',
  '2026-01-01'::timestamptz,
  '{
    "utility": "electricity",
    "version": "2026.01",
    "components": {
      "fixed_monthly": 120.00,
      "network_charge_per_kwh": 0.15,
      "levy_per_kwh": 0.03
    },
    "timeOfUse": [
      { "window": "peak", "rate": 3.20, "hours": ["06-09", "17-21"] },
      { "window": "standard", "rate": 2.40, "hours": ["09-17", "21-23"] },
      { "window": "off", "rate": 1.60, "hours": ["23-06"] }
    ],
    "adjustments": {
      "loadShedding": [
        { "stage": 0, "multiplier": 1.00 },
        { "stage": 4, "multiplier": 1.05 },
        { "stage": 6, "multiplier": 1.08 }
      ],
      "season": [
        { "name": "winter", "months": [5, 6, 7, 8], "multiplier": 1.10 },
        { "name": "summer", "months": [11, 12, 1, 2], "multiplier": 1.00 }
      ]
    }
  }'::jsonb,
  '2026.01'
);

-- Seed initial tariff data for Johannesburg Water
INSERT INTO tariffs (provider, utility, valid_from, schema, version) VALUES
(
  'jhb_water',
  'water',
  '2026-01-01'::timestamptz,
  '{
    "utility": "water",
    "version": "2026.01",
    "components": {
      "fixed_availability": 90.00,
      "fixed_sewer": 70.00
    },
    "blocks": [
      { "up_to_kl": 6, "rate_per_kl": 0.00 },
      { "up_to_kl": 20, "rate_per_kl": 25.00 },
      { "up_to_kl": 35, "rate_per_kl": 35.00 },
      { "above_kl": 35, "rate_per_kl": 45.00 }
    ],
    "surcharges": {
      "leak_multiplier": 1.20,
      "drought_multiplier": 1.15
    }
  }'::jsonb,
  '2026.01'
);

-- Seed initial context signals
INSERT INTO context_signals (signal_name, signal_value) VALUES
('load_shedding_stage', '{"stage": 0, "updated_at": "2025-12-08T12:00:00Z"}'::jsonb),
('peak_schedule', '{"current_window": "standard", "next_change": "2025-12-08T17:00:00Z"}'::jsonb),
('carbon_intensity', '{"gco2_per_kwh": 950, "source": "eskom_mix", "updated_at": "2025-12-08T12:00:00Z"}'::jsonb);
`;

/**
 * Instructions for setup:
 * 
 * 1. Copy the DATABASE_SCHEMA constant above
 * 2. Go to your Supabase project → SQL Editor
 * 3. Paste and run the schema
 * 4. Copy the SEED_DATA constant
 * 5. Run the seed data to populate initial tariffs
 * 
 * The schema creates:
 * - 6 tables with proper foreign keys
 * - Row Level Security policies for data protection
 * - Indexes for optimal query performance
 * - Triggers for automatic timestamp updates
 * - Seed data for Johannesburg tariffs
 */
