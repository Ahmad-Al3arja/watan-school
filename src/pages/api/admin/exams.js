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
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'POST':
        return await handlePost(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePost(req, res) {
  const { category, subcategory, exam_number } = req.body;

  // Validate required fields
  if (!category || !subcategory || !exam_number) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }

  // Check if exam already exists
  const { data: existingExam, error: checkError } = await supabaseAdmin
    .from('questions')
    .select('id')
    .eq('category', category)
    .eq('subcategory', subcategory)
    .eq('exam_number', exam_number)
    .limit(1);

  if (checkError) {
    return res.status(500).json({ error: 'خطأ في فحص الامتحان الموجود' });
  }

  if (existingExam && existingExam.length > 0) {
    return res.status(400).json({ error: 'الامتحان موجود بالفعل' });
  }

  // Create a placeholder question to establish the exam structure
  // This ensures the exam appears in the data structure
  const questionData = {
    original_id: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 10000),
    category,
    subcategory,
    exam_number: parseInt(exam_number),
    position: 0,
    question: 'سؤال تجريبي - يمكن حذفه',
    option_a: 'خيار أ',
    option_b: 'خيار ب',
    option_c: null,
    option_d: null,
    correct_answer: 1
  };

  const { data: newQuestion, error: insertError } = await supabaseAdmin
    .from('questions')
    .insert(questionData)
    .select()
    .single();

  if (insertError) {
    return res.status(500).json({ error: 'فشل في إنشاء الامتحان' });
  }

  // Clear the data structure cache by making a direct request
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/data-structure?clear_cache=true`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Admin-Exam-Creation',
        'Accept': 'application/json'
      }
    });
  } catch (cacheError) {
    // Cache clear failed, but exam creation was successful
  }

  res.status(201).json({
    success: true,
    message: 'تم إنشاء الامتحان بنجاح',
    exam: {
      category,
      subcategory,
      exam_number: parseInt(exam_number),
      question_id: newQuestion.id
    }
  });
}
