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
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {

    const { category, subcategory, exam_number } = req.body;

    if (!category || !subcategory || !exam_number) {
      return res.status(400).json({ error: 'Missing required fields: category, subcategory, exam_number' });
    }

    // First, get all questions in this exam to show count
    const { data: questions, error: fetchError } = await supabaseAdmin
      .from('questions')
      .select('id, original_id, question')
      .eq('category', category)
      .eq('subcategory', subcategory)
      .eq('exam_number', parseInt(exam_number));

    if (fetchError) {
      return res.status(500).json({ error: 'فشل في جلب بيانات الامتحان' });
    }

    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: 'الامتحان غير موجود أو فارغ' });
    }

    // Delete all questions in this exam
    const { error: deleteError } = await supabaseAdmin
      .from('questions')
      .delete()
      .eq('category', category)
      .eq('subcategory', subcategory)
      .eq('exam_number', parseInt(exam_number));

    if (deleteError) {
      return res.status(500).json({ error: 'فشل في حذف أسئلة الامتحان' });
    }

    // Clear the data structure cache
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      await fetch(`${baseUrl}/api/data-structure?clear_cache=true`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Admin-Exam-Deletion',
          'Accept': 'application/json'
        }
      });
    } catch (cacheError) {
      // Cache clear failed, but exam deletion was successful
    }

    res.status(200).json({ 
      message: 'تم حذف الامتحان بنجاح',
      deletedQuestions: questions.length,
      exam: {
        category,
        subcategory,
        exam_number
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
}
