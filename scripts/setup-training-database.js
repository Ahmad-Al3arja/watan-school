const { createClient } = require('@supabase/supabase-js');

// Use your Supabase configuration
const supabaseUrl = 'https://qsouiaoznytroebxuchm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzb3VpYW96bnl0cm9lYnh1Y2htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYxNjQyOCwiZXhwIjoyMDczMTkyNDI4fQ.IKXwX8RC8WVeqo39HQT7yurtlQm7GQbieYocRtZuXJg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTrainingDatabase() {
  console.log('Setting up training codes database...');

  try {
    // Create the table using raw SQL
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create training codes table
        CREATE TABLE IF NOT EXISTS training_codes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            code VARCHAR(50) UNIQUE NOT NULL,
            description TEXT NOT NULL,
            max_uses INTEGER DEFAULT NULL,
            current_uses INTEGER DEFAULT 0,
            expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by VARCHAR(100) DEFAULT 'admin'
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_training_codes_code ON training_codes(code);
        CREATE INDEX IF NOT EXISTS idx_training_codes_active ON training_codes(is_active);
        CREATE INDEX IF NOT EXISTS idx_training_codes_expires ON training_codes(expires_at);

        -- Enable RLS
        ALTER TABLE training_codes ENABLE ROW LEVEL SECURITY;

        -- Create policy
        DROP POLICY IF EXISTS "Enable all access for authenticated users" ON training_codes;
        CREATE POLICY "Enable all access for authenticated users" ON training_codes
            FOR ALL USING (true);
      `
    });

    if (createError) {
      console.error('Error creating table:', createError);
      // Try alternative approach - direct table creation
      const { error: altError } = await supabase
        .from('training_codes')
        .select('id')
        .limit(1);

      if (altError && altError.code === '42P01') {
        console.log('Table does not exist. Please run the SQL manually in your Supabase dashboard.');
        console.log('SQL to run:');
        console.log(`
          CREATE TABLE training_codes (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              code VARCHAR(50) UNIQUE NOT NULL,
              description TEXT NOT NULL,
              max_uses INTEGER DEFAULT NULL,
              current_uses INTEGER DEFAULT 0,
              expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
              is_active BOOLEAN DEFAULT true,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              created_by VARCHAR(100) DEFAULT 'admin'
          );
        `);
        return;
      }
    }

    // Insert sample codes
    const { data: sampleCodes, error: insertError } = await supabase
      .from('training_codes')
      .upsert([
        {
          code: 'TRAINING2024',
          description: 'رمز تدريب عام لعام 2024',
          max_uses: null,
          expires_at: null,
          is_active: true
        },
        {
          code: 'ADMIN123',
          description: 'رمز مؤقت للمديرين',
          max_uses: 50,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          is_active: true
        },
        {
          code: 'STUDENT2024',
          description: 'رمز خاص للطلاب',
          max_uses: 100,
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
          is_active: true
        }
      ], {
        onConflict: 'code',
        ignoreDuplicates: true
      })
      .select();

    if (insertError) {
      console.error('Error inserting sample codes:', insertError);
    } else {
      console.log('✅ Training codes table set up successfully!');
      console.log('Sample codes created:');
      sampleCodes?.forEach(code => {
        console.log(`  - ${code.code}: ${code.description}`);
      });
    }

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

// Run the setup
setupTrainingDatabase();