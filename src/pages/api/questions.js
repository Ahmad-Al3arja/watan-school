import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, subcategory, exam_number } = req.query;

    let query = supabase
      .from('questions')
      .select('original_id, question, option_a, option_b, option_c, option_d, correct_answer');

    if (category) {
      query = query.eq('category', category);
    }

    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }

    if (exam_number) {
      query = query.eq('exam_number', exam_number);
    }

    const { data, error } = await query.order('original_id');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    // Transform data to match the original format
    const transformedData = data.map(question => {
      const result = {
        id: question.original_id,
        question: question.question,
        a: question.option_a,
        b: question.option_b,
        answer: question.correct_answer.toString()
      };

      // Add options c and d if they exist
      if (question.option_c) {
        result.c = question.option_c;
      }
      if (question.option_d) {
        result.d = question.option_d;
      }

      return result;
    });

    res.status(200).json(transformedData);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}