-- Create training codes table for securing access to training section
CREATE TABLE IF NOT EXISTS training_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    max_uses INTEGER DEFAULT NULL, -- NULL means unlimited uses
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- NULL means never expires
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'admin'
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_training_codes_code ON training_codes(code);
CREATE INDEX IF NOT EXISTS idx_training_codes_active ON training_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_training_codes_expires ON training_codes(expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_training_codes_updated_at BEFORE UPDATE
    ON training_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample training codes for testing
INSERT INTO training_codes (code, description, max_uses, expires_at) VALUES
('TRAINING2024', 'رمز تدريب عام لعام 2024', NULL, NULL),
('ADMIN123', 'رمز مؤقت للمديرين', 50, NOW() + INTERVAL '30 days'),
('STUDENT2024', 'رمز خاص للطلاب', 100, NOW() + INTERVAL '60 days')
ON CONFLICT (code) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE training_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Enable all access for authenticated users" ON training_codes
    FOR ALL USING (true);

-- Grant necessary permissions
GRANT ALL ON training_codes TO authenticated;
GRANT ALL ON training_codes TO service_role;