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
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req, res) {
  const { page = 1, limit = 50, search, category, subcategory, exam_number } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = supabaseAdmin
    .from('questions')
    .select('*', { count: 'exact' });

  if (search) {
    query = query.ilike('question', `%${search}%`);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (subcategory) {
    query = query.eq('subcategory', subcategory);
  }

  if (exam_number) {
    query = query.eq('exam_number', exam_number);
  }

  const { data, error, count } = await query
    .order('category', 'subcategory', 'exam_number', 'position')
    .range(offset, offset + parseInt(limit) - 1);

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }

  res.status(200).json({
    questions: data,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(count / parseInt(limit))
  });
}

async function handlePost(req, res) {
  const { original_id, category, subcategory, exam_number, question, option_a, option_b, option_c, option_d, correct_answer, position } = req.body;

  // If position is not provided, get the next position for this exam
  let finalPosition = position;
  if (finalPosition === undefined || finalPosition === null) {
    const { data: maxData } = await supabaseAdmin
      .from('questions')
      .select('position')
      .eq('category', category)
      .eq('subcategory', subcategory)
      .eq('exam_number', exam_number)
      .order('position', { ascending: false })
      .limit(1);

    finalPosition = maxData && maxData.length > 0 ? maxData[0].position + 1 : 0;
  }

  const { data, error } = await supabaseAdmin
    .from('questions')
    .insert({
      original_id,
      category,
      subcategory,
      exam_number,
      position: finalPosition,
      question,
      option_a,
      option_b,
      option_c: option_c || null,
      option_d: option_d || null,
      correct_answer: parseInt(correct_answer)
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Failed to create question' });
  }

  res.status(201).json(data);
}

async function handlePut(req, res) {
  const { id } = req.query;
  const { original_id, category, subcategory, exam_number, question, option_a, option_b, option_c, option_d, correct_answer, position } = req.body;

  const updateData = {
    original_id,
    category,
    subcategory,
    exam_number,
    question,
    option_a,
    option_b,
    option_c: option_c || null,
    option_d: option_d || null,
    correct_answer: parseInt(correct_answer)
  };

  // Only update position if provided
  if (position !== undefined && position !== null) {
    updateData.position = position;
  }

  const { data, error } = await supabaseAdmin
    .from('questions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Failed to update question' });
  }

  res.status(200).json(data);
}

async function handleDelete(req, res) {
  const { id } = req.query;

  const { error } = await supabaseAdmin
    .from('questions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Failed to delete question' });
  }

  res.status(200).json({ success: true });
}