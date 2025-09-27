const { createClient } = require('@supabase/supabase-js');
const signalsData = require('../src/pages/signals.json');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qsouiaoznytroebxuchm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzb3VpYW96bnl0cm9lYnh1Y2htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYxNjQyOCwiZXhwIjoyMDczMTkyNDI4fQ.IKXwX8RC8WVeqo39HQT7yurtlQm7GQbieYocRtZuXJg';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function migrateSignalsData() {
  try {
    console.log('Starting signals data migration...');
    
    // First, clear existing data
    const { error: deleteError } = await supabaseAdmin
      .from('signals')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.error('Error clearing existing signals:', deleteError);
      return;
    }
    
    console.log('Cleared existing signals data');
    
    // Insert new data
    const signalsToInsert = [];
    
    signalsData.forEach((typeSignals, typeIndex) => {
      typeSignals.forEach((signal, orderIndex) => {
        signalsToInsert.push({
          title: signal.title,
          image: signal.image,
          content: signal.content,
          type_index: typeIndex,
          order_index: orderIndex
        });
      });
    });
    
    // Insert in batches to avoid payload size limits
    const batchSize = 50;
    for (let i = 0; i < signalsToInsert.length; i += batchSize) {
      const batch = signalsToInsert.slice(i, i + batchSize);
      
      const { error: insertError } = await supabaseAdmin
        .from('signals')
        .insert(batch);
      
      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        return;
      }
      
      console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(signalsToInsert.length / batchSize)}`);
    }
    
    console.log(`Successfully migrated ${signalsToInsert.length} signals to database!`);
    
    // Verify the migration
    const { data: count, error: countError } = await supabaseAdmin
      .from('signals')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error verifying migration:', countError);
    } else {
      console.log(`Total signals in database: ${count}`);
    }
    
  } catch (error) {
    console.error('Error in migrateSignalsData:', error);
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateSignalsData();
}

module.exports = { migrateSignalsData };
