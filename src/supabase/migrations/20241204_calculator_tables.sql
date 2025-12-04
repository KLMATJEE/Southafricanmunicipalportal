-- Calculator System Database Tables
-- Migration: 20241204_calculator_tables.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Store calculation history
CREATE TABLE IF NOT EXISTS calculation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calculator_type VARCHAR(50) NOT NULL, -- 'uif', 'import_duty', 'taxi_fare', 'aps', etc.
  input_data JSONB NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_saved BOOLEAN DEFAULT FALSE,
  saved_name VARCHAR(255),
  device_type VARCHAR(20) DEFAULT 'web', -- 'web', 'mobile'
  CONSTRAINT valid_calculator_type CHECK (calculator_type IN ('uif', 'import_duty', 'taxi_fare', 'aps', 'wage_rent', 'tax', 'bill_reminder', 'expense_tracker'))
);

-- Store saved calculations (favorites)
CREATE TABLE IF NOT EXISTS saved_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calculator_type VARCHAR(50) NOT NULL,
  saved_name VARCHAR(255) NOT NULL,
  input_data JSONB NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_template BOOLEAN DEFAULT FALSE,
  CONSTRAINT valid_saved_calculator_type CHECK (calculator_type IN ('uif', 'import_duty', 'taxi_fare', 'aps', 'wage_rent', 'tax', 'bill_reminder', 'expense_tracker'))
);

-- Store bill reminders linked to existing bills
CREATE TABLE IF NOT EXISTS bill_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  notification_days_before INTEGER DEFAULT 3,
  notification_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store expense tracking
CREATE TABLE IF NOT EXISTS expense_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- 'utilities', 'rates', 'personal', etc.
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  date_incurred DATE NOT NULL,
  budget_id UUID, -- Link to budget category (optional)
  receipt_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_amount CHECK (amount >= 0)
);

-- Government services directory
CREATE TABLE IF NOT EXISTS government_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'uif', 'sars', 'department_trade', 'home_affairs', etc.
  description TEXT,
  url VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(255),
  requires_authentication BOOLEAN DEFAULT FALSE,
  icon_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exchange rates cache (for import duty calculator)
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(10, 4) NOT NULL,
  source VARCHAR(100), -- 'oanda', 'xe', 'fixer', 'manual'
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_rate CHECK (rate > 0),
  CONSTRAINT valid_currencies CHECK (LENGTH(from_currency) = 3 AND LENGTH(to_currency) = 3)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calculation_history_user ON calculation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_calculation_history_type ON calculation_history(calculator_type);
CREATE INDEX IF NOT EXISTS idx_calculation_history_created ON calculation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calculation_history_saved ON calculation_history(is_saved) WHERE is_saved = TRUE;

CREATE INDEX IF NOT EXISTS idx_saved_calculations_user ON saved_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_calculations_type ON saved_calculations(calculator_type);

CREATE INDEX IF NOT EXISTS idx_bill_reminders_user ON bill_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_reminders_date ON bill_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_bill_reminders_active ON bill_reminders(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_expense_tracking_user ON expense_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_tracking_date ON expense_tracking(date_incurred DESC);
CREATE INDEX IF NOT EXISTS idx_expense_tracking_category ON expense_tracking(category);

CREATE INDEX IF NOT EXISTS idx_government_services_category ON government_services(category);
CREATE INDEX IF NOT EXISTS idx_government_services_active ON government_services(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_valid ON exchange_rates(valid_from, valid_until);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE calculation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Calculation History Policies
CREATE POLICY "Users can view their own calculation history"
  ON calculation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calculation history"
  ON calculation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculation history"
  ON calculation_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculation history"
  ON calculation_history FOR DELETE
  USING (auth.uid() = user_id);

-- Saved Calculations Policies
CREATE POLICY "Users can view their own saved calculations"
  ON saved_calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved calculations"
  ON saved_calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved calculations"
  ON saved_calculations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved calculations"
  ON saved_calculations FOR DELETE
  USING (auth.uid() = user_id);

-- Bill Reminders Policies
CREATE POLICY "Users can view their own bill reminders"
  ON bill_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bill reminders"
  ON bill_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bill reminders"
  ON bill_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bill reminders"
  ON bill_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Expense Tracking Policies
CREATE POLICY "Users can view their own expenses"
  ON expense_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
  ON expense_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON expense_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON expense_tracking FOR DELETE
  USING (auth.uid() = user_id);

-- Government Services Policies (Public Read)
CREATE POLICY "Anyone can view active government services"
  ON government_services FOR SELECT
  USING (is_active = TRUE);

-- Exchange Rates Policies (Public Read)
CREATE POLICY "Anyone can view current exchange rates"
  ON exchange_rates FOR SELECT
  USING (
    valid_from <= NOW() AND 
    (valid_until IS NULL OR valid_until >= NOW())
  );

-- Insert some initial government services data
INSERT INTO government_services (service_name, category, description, url, phone, sort_order, is_active) VALUES
('Unemployment Insurance Fund (UIF)', 'uif', 'Apply for UIF benefits, check contribution status, and manage claims', 'https://www.ufiling.co.za', '012 337 1997', 1, TRUE),
('South African Revenue Service (SARS)', 'sars', 'Tax returns, refunds, and compliance', 'https://www.sars.gov.za', '0800 00 7277', 2, TRUE),
('Department of Home Affairs', 'home_affairs', 'ID documents, passports, birth certificates', 'https://www.dha.gov.za', '0800 60 11 90', 3, TRUE),
('Department of Trade and Industry', 'department_trade', 'Import/export permits, tariff information', 'https://www.thedtic.gov.za', '012 394 9500', 4, TRUE),
('Universities South Africa', 'education', 'University applications and APS requirements', 'https://www.usaf.ac.za', '012 431 6604', 5, TRUE),
('National Student Financial Aid Scheme (NSFAS)', 'education', 'Student funding and bursaries', 'https://www.nsfas.org.za', '08000 67327', 6, TRUE),
('South African Social Security Agency (SASSA)', 'social', 'Social grants and assistance', 'https://www.sassa.gov.za', '0800 60 10 11', 7, TRUE)
ON CONFLICT DO NOTHING;

-- Insert some initial exchange rates (example data - should be updated regularly)
INSERT INTO exchange_rates (from_currency, to_currency, rate, source, valid_from) VALUES
('USD', 'ZAR', 18.50, 'manual', NOW()),
('EUR', 'ZAR', 20.20, 'manual', NOW()),
('GBP', 'ZAR', 23.40, 'manual', NOW()),
('ZAR', 'USD', 0.054, 'manual', NOW()),
('ZAR', 'EUR', 0.050, 'manual', NOW()),
('ZAR', 'GBP', 0.043, 'manual', NOW())
ON CONFLICT DO NOTHING;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_saved_calculations_updated_at
    BEFORE UPDATE ON saved_calculations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bill_reminders_updated_at
    BEFORE UPDATE ON bill_reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_tracking_updated_at
    BEFORE UPDATE ON expense_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_government_services_updated_at
    BEFORE UPDATE ON government_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exchange_rates_updated_at
    BEFORE UPDATE ON exchange_rates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE calculation_history IS 'Stores all calculator usage history for analytics and user reference';
COMMENT ON TABLE saved_calculations IS 'Stores user-saved calculations for quick access';
COMMENT ON TABLE bill_reminders IS 'Manages bill payment reminders linked to municipal bills';
COMMENT ON TABLE expense_tracking IS 'Tracks personal and household expenses';
COMMENT ON TABLE government_services IS 'Directory of South African government services and contact information';
COMMENT ON TABLE exchange_rates IS 'Currency exchange rates for import/export calculations';
