import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
  // Simple admin authentication check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      // Get all training codes from database
      const { data: codes, error } = await supabaseAdmin
        .from('training_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to fetch training codes' });
      }

      res.status(200).json(codes || []);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      // Create new training code
      const { code, description, maxUses, expiresAt, isActive } = req.body;

      if (!code || !description) {
        return res.status(400).json({ error: 'Code and description are required' });
      }

      // Check if code already exists
      const { data: existingCode } = await supabaseAdmin
        .from('training_codes')
        .select('id')
        .eq('code', code)
        .single();

      if (existingCode) {
        return res.status(400).json({ error: 'Code already exists' });
      }

      // Insert new code
      const { data: newCode, error } = await supabaseAdmin
        .from('training_codes')
        .insert([{
          code,
          description,
          max_uses: maxUses || null,
          expires_at: expiresAt || null,
          is_active: isActive !== false,
          current_uses: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to create training code' });
      }

      res.status(201).json(newCode);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}