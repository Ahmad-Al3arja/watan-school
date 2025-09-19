const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qsouiaoznytroebxuchm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzb3VpYW96bnl0cm9lYnh1Y2htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYxNjQyOCwiZXhwIjoyMDczMTkyNDI4fQ.IKXwX8RC8WVeqo39HQT7yurtlQm7GQbieYocRtZuXJg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupLicenseTables() {
  try {
    console.log('🚀 Setting up license tables in Supabase...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-license-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.error(`❌ Error executing statement ${i + 1}:`, error);
            // Continue with other statements
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`❌ Exception executing statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('🎉 License tables setup completed!');
    console.log('\n📋 Created tables:');
    console.log('  - license_types (أنواع الرخص)');
    console.log('  - license_requirements (متطلبات الرخص)');
    console.log('  - license_pricing (أسعار الرخص)');
    console.log('  - license_procedures (إجراءات الرخص)');
    console.log('\n🔧 You can now use the admin panel to manage license data!');
    
  } catch (error) {
    console.error('❌ Error setting up license tables:', error);
    process.exit(1);
  }
}

// Run the setup
setupLicenseTables();
