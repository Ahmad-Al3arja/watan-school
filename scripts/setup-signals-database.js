// Use dynamic import for ES modules
async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import('../lib/supabase.js');
  return supabaseAdmin;
}

async function setupSignalsDatabase() {
  try {
    console.log('Setting up signals database...');
    
    const supabaseAdmin = await getSupabaseAdmin();
    
    // Read the SQL file
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, 'create-signals-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error setting up signals database:', error);
      return;
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
