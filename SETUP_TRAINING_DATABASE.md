# Training Database Setup Instructions

The training codes feature requires a database table. Please follow these steps to set it up:

## 1. Go to your Supabase Dashboard

1. Open https://supabase.com/dashboard
2. Go to your project: **qsouiaoznytroebxuchm**
3. Click on **SQL Editor** in the left sidebar

## 2. Run this SQL

Copy and paste the following SQL into the SQL Editor and click **RUN**:

```sql
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

-- Create indexes for better performance
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
DROP TRIGGER IF EXISTS update_training_codes_updated_at ON training_codes;
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
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON training_codes;
CREATE POLICY "Enable all access for authenticated users" ON training_codes
    FOR ALL USING (true);

-- Grant necessary permissions
GRANT ALL ON training_codes TO authenticated;
GRANT ALL ON training_codes TO service_role;
```

## 3. Verify the setup

After running the SQL, you should see:
- ✅ Table `training_codes` created
- ✅ 3 sample codes inserted
- ✅ Indexes and triggers created

## 4. Test the codes

The following codes are now available for testing:

| Code | Description | Max Uses | Expires |
|------|-------------|----------|---------|
| `TRAINING2024` | رمز تدريب عام لعام 2024 | Unlimited | Never |
| `ADMIN123` | رمز مؤقت للمديرين | 50 uses | 30 days |
| `STUDENT2024` | رمز خاص للطلاب | 100 uses | 60 days |

## 5. Admin Management

After the table is created, you can:
- Add more codes through the admin dashboard
- Edit existing codes
- Monitor usage statistics
- Set expiration dates and usage limits

## Troubleshooting

If you encounter any issues:
1. Make sure you're running the SQL in the correct Supabase project
2. Check that your user has the necessary permissions
3. Verify the table was created by going to **Database** > **Tables** in Supabase dashboard

Once the table is set up, the training security system will work perfectly!