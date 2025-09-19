import { supabaseAdmin } from '../../../../../lib/supabase';

export default async function handler(req, res) {
  // Simple admin authentication check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      // Update training code
      const { code, description, maxUses, expiresAt, isActive } = req.body;

      if (!code || !description) {
        return res.status(400).json({ error: 'Code and description are required' });
      }

      // Check if code already exists (excluding current record)
      const { data: existingCode } = await supabaseAdmin
        .from('training_codes')
        .select('id')
        .eq('code', code)
        .neq('id', id)
        .single();

      if (existingCode) {
        return res.status(400).json({ error: 'Code already exists' });
      }

      // Update the code
      const { data: updatedCode, error } = await supabaseAdmin
        .from('training_codes')
        .update({
          code,
          description,
          max_uses: maxUses || null,
          expires_at: expiresAt || null,
          is_active: isActive !== false
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to update training code' });
      }

      if (!updatedCode) {
        return res.status(404).json({ error: 'Training code not found' });
      }

      res.status(200).json(updatedCode);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }

  } else if (req.method === 'DELETE') {
    try {
      // Delete training code
      const { error } = await supabaseAdmin
        .from('training_codes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to delete training code' });
      }

      res.status(200).json({
        message: 'Training code deleted successfully'
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }

  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}