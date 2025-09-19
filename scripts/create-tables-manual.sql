-- Run this SQL in your Supabase SQL Editor

-- Create license types table
CREATE TABLE IF NOT EXISTS license_types (
  id SERIAL PRIMARY KEY,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  type_key VARCHAR(50) UNIQUE NOT NULL,
  min_age_exam INTEGER NOT NULL,
  min_age_license INTEGER NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create license requirements table
CREATE TABLE IF NOT EXISTS license_requirements (
  id SERIAL PRIMARY KEY,
  license_type_id INTEGER REFERENCES license_types(id) ON DELETE CASCADE,
  requirement_type VARCHAR(50) NOT NULL,
  title_ar VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  description_ar TEXT,
  description_en TEXT,
  is_required BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create license pricing table
CREATE TABLE IF NOT EXISTS license_pricing (
  id SERIAL PRIMARY KEY,
  license_type_id INTEGER REFERENCES license_types(id) ON DELETE CASCADE,
  price_type VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT '₪',
  description_ar VARCHAR(200),
  description_en VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create license procedures table
CREATE TABLE IF NOT EXISTS license_procedures (
  id SERIAL PRIMARY KEY,
  procedure_type VARCHAR(50) NOT NULL,
  title_ar VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  description_ar TEXT,
  description_en TEXT,
  location_ar VARCHAR(200),
  location_en VARCHAR(200),
  schedule_ar TEXT,
  schedule_en TEXT,
  requirements_ar TEXT,
  requirements_en TEXT,
  notes_ar TEXT,
  notes_en TEXT,
  step_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_license_requirements_type_id ON license_requirements(license_type_id);
CREATE INDEX IF NOT EXISTS idx_license_pricing_type_id ON license_pricing(license_type_id);
CREATE INDEX IF NOT EXISTS idx_license_procedures_type ON license_procedures(procedure_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_license_types_updated_at ON license_types;
CREATE TRIGGER update_license_types_updated_at BEFORE UPDATE ON license_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_license_requirements_updated_at ON license_requirements;
CREATE TRIGGER update_license_requirements_updated_at BEFORE UPDATE ON license_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_license_pricing_updated_at ON license_pricing;
CREATE TRIGGER update_license_pricing_updated_at BEFORE UPDATE ON license_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_license_procedures_updated_at ON license_procedures;
CREATE TRIGGER update_license_procedures_updated_at BEFORE UPDATE ON license_procedures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
