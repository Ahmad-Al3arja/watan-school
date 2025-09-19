const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateData() {
  try {
    console.log('Loading data.json...');
    const data = JSON.parse(fs.readFileSync('./src/pages/data.json', 'utf8'));

    console.log('Found categories:', Object.keys(data));

    const questions = [];

    // Transform data structure
    let categoryQuestionCounts = {};
    for (const [category, subcategories] of Object.entries(data)) {
      categoryQuestionCounts[category] = 0;
      for (const [subcategory, exams] of Object.entries(subcategories)) {
        for (const [examNumber, examQuestions] of Object.entries(exams)) {
          for (let position = 0; position < examQuestions.length; position++) {
            const question = examQuestions[position];
            const answerValue = parseInt(question.answer);

            // Skip questions with empty answers (log them for fixing later)
            if (!question.answer || question.answer === "") {
              console.warn(`Skipping question ${question.id} with empty answer`);
              continue;
            }

            // Validate answer range
            if (answerValue < 1 || answerValue > 4) {
              console.warn(`Skipping question ${question.id} with invalid answer: ${question.answer}`);
              continue;
            }

            // For 2-option questions, ensure answer is only 1 or 2
            const hasOptionC = question.c && question.c.trim() !== "";
            const hasOptionD = question.d && question.d.trim() !== "";
            const is4OptionQuestion = hasOptionC || hasOptionD;

            if (!is4OptionQuestion && answerValue > 2) {
              console.warn(`Question ${question.id} has answer ${answerValue} but only 2 options available`);
              continue;
            }

            questions.push({
              original_id: question.id,
              category: category,
              subcategory: subcategory,
              exam_number: examNumber,
              position: position, // Add position to maintain original order
              question: question.question,
              option_a: question.a,
              option_b: question.b,
              option_c: question.c || null,
              option_d: question.d || null,
              correct_answer: answerValue
            });
            categoryQuestionCounts[category]++;
          }
        }
      }
    }

    console.log(`Found ${questions.length} questions to migrate...`);
    console.log('Questions per category:', categoryQuestionCounts);

    // Clear existing data
    console.log('Clearing existing questions...');
    await supabase.from('questions').delete().neq('id', 0);

    // Insert in batches of 1000
    const batchSize = 1000;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(questions.length / batchSize)}...`);

      const { error } = await supabase
        .from('questions')
        .insert(batch);

      if (error) {
        console.error('Error inserting batch:', error);
        throw error;
      }
    }

    console.log('Migration completed successfully!');

    // Verify the data
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error verifying data:', countError);
    } else {
      console.log(`Total questions in database: ${count}`);
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData();