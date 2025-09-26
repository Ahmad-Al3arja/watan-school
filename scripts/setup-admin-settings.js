const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qsouiaoznytroebxuchm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzb3VpYW96bnl0cm9lYnh1Y2htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYxNjQyOCwiZXhwIjoyMDczMTkyNDI4fQ.IKXwX8RC8WVeqo39HQT7yurtlQm7GQbieYocRtZuXJg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdminSettings() {
  try {
    console.log('Setting up admin settings table...');

    // First, try to create the table by inserting a test record
    const { error: insertError } = await supabase
      .from('admin_settings')
      .insert([
        { key: 'admin_password', value: 'admin123' }
      ]);

    if (insertError && insertError.code === 'PGRST204') {
      // Table doesn't exist, we need to create it manually
      console.log('Table does not exist. Please run the SQL script manually:');
      console.log(`
        CREATE TABLE admin_settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_admin_settings_key ON admin_settings(key);
        
        INSERT INTO admin_settings (key, value) 
        VALUES ('admin_password', 'admin123');
      `);
      return;
    }

    if (insertError && insertError.code === '23505') {
      // Record already exists
      console.log('✅ Admin settings table already exists!');
      console.log('✅ Default admin password is set.');
    } else if (!insertError) {
      console.log('✅ Admin settings table created successfully!');
      console.log('✅ Default admin password set to: admin123');
    } else {
      console.error('Error setting up admin settings:', insertError);
      return;
    }

    console.log('You can now change the password through the admin panel.');

  } catch (error) {
    console.error('Error setting up admin settings:', error);
  }
}

setupAdminSettings();
