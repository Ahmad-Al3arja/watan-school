import { supabaseAdmin } from '../../../../lib/supabase';

function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return false;
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.startsWith('admin:');
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {

    // Get all questions from the database
    const { data: questions, error } = await supabaseAdmin
      .from('questions')
      .select('*')
      .order('id');

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    // Group questions by their content (question text + options + correct answer)
    const questionGroups = {};
    
    questions.forEach(question => {
      // Create a unique key based on question content
      const contentKey = JSON.stringify({
        question: question.question,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_answer: question.correct_answer
      });

      if (!questionGroups[contentKey]) {
        questionGroups[contentKey] = [];
      }
      questionGroups[contentKey].push(question);
    });

    // Filter out non-duplicates and organize by frequency
    const duplicates = {};
    
    Object.values(questionGroups).forEach(group => {
      if (group.length > 1) {
        const frequency = group.length.toString();
        if (!duplicates[frequency]) {
          duplicates[frequency] = [];
        }
        duplicates[frequency].push(group);
      }
    });

    // Calculate statistics
    const stats = {
      totalQuestions: questions.length,
      uniqueQuestions: Object.keys(questionGroups).length,
      duplicateGroups: Object.values(questionGroups).filter(group => group.length > 1).length,
      totalDuplicates: Object.values(questionGroups)
        .filter(group => group.length > 1)
        .reduce((sum, group) => sum + group.length, 0)
    };

    res.status(200).json({
      duplicates,
      stats,
      success: true
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
