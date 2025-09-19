import { supabase } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { params } = req.query;

    if (!params || params.length < 3) {
      return res.status(400).json({ error: 'Invalid parameters. Expected: /api/questions/[category]/[subcategory]/[exam_number]' });
    }

    const [category, subcategory, examNumber] = params;

    const { data, error } = await supabase
      .from('questions')
      .select('original_id, question, option_a, option_b, option_c, option_d, correct_answer')
      .eq('category', category)
      .eq('subcategory', subcategory)
      .eq('exam_number', examNumber)
      .order('position');

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