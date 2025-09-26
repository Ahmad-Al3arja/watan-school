const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qsouiaoznytroebxuchm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzb3VpYW96bnl0cm9lYnh1Y2htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYxNjQyOCwiZXhwIjoyMDczMTkyNDI4fQ.IKXwX8RC8WVeqo39HQT7yurtlQm7GQbieYocRtZuXJg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertAdminPassword() {
  try {
    console.log('Inserting initial admin password...');

    // Insert the initial admin password
    const { data, error } = await supabase
      .from('admin_settings')
      .upsert([
        { key: 'admin_password', value: 'admin123' }
      ], {
        onConflict: 'key'
      });

    if (error) {
      console.error('Error inserting admin password:', error);
      return;
    }

    console.log('✅ Admin password inserted successfully!');
    console.log('✅ Default password: admin123');
    console.log('You can now login and change the password through the admin panel.');

  } catch (error) {
    console.error('Error inserting admin password:', error);
  }
}

insertAdminPassword();
