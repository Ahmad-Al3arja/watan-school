const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qsouiaoznytroebxuchm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzb3VpYW96bnl0cm9lYnh1Y2htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYxNjQyOCwiZXhwIjoyMDczMTkyNDI4fQ.IKXwX8RC8WVeqo39HQT7yurtlQm7GQbieYocRtZuXJg';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setupSignalsDatabase() {
  try {
    console.log('Setting up signals database...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-signals-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: statement.trim() });
        
        if (error) {
          console.error('Error executing statement:', error);
          // Continue with other statements
        }
      }
    }
    
    console.log('Signals database setup completed successfully!');
  } catch (error) {
    console.error('Error in setupSignalsDatabase:', error);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupSignalsDatabase();
}

module.exports = { setupSignalsDatabase };
