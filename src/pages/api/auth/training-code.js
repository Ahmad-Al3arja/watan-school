import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  try {
    // Check if code exists and is valid
    const { data: foundCode, error } = await supabaseAdmin
      .from('training_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!foundCode) {
      return res.status(401).json({
        error: 'Invalid training code'
      });
    }

    // Check if code has expired
    if (foundCode.expires_at && new Date(foundCode.expires_at) < new Date()) {
      return res.status(401).json({
        error: 'Training code has expired'
      });
    }

    // Check if code has reached maximum uses
    if (foundCode.max_uses && foundCode.current_uses >= foundCode.max_uses) {
      return res.status(401).json({
        error: 'Training code has reached maximum usage limit'
      });
    }

    // Increment usage count
    const { error: updateError } = await supabaseAdmin
      .from('training_codes')
      .update({
        current_uses: foundCode.current_uses + 1
      })
      .eq('id', foundCode.id);

    if (updateError) {
      console.error('Failed to update usage count:', updateError);
      // Don't fail the authentication for this, just log it
    }

    // Generate a temporary session token
    const sessionToken = Buffer.from(`training_${code}_${Date.now()}`).toString('base64');

    res.status(200).json({
      success: true,
      token: sessionToken,
      message: 'Access granted to training section',
      codeInfo: {
        description: foundCode.description,
        usesRemaining: foundCode.max_uses ? foundCode.max_uses - foundCode.current_uses - 1 : null
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}