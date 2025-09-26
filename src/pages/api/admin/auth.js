import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Try to get password from Supabase first
    let storedPassword = process.env.ADMIN_PASSWORD; // fallback to env var
    
    try {
      const { data: adminSettings, error: fetchError } = await supabaseAdmin
        .from('admin_settings')
        .select('*')
        .eq('key', 'admin_password')
        .single();

      if (!fetchError && adminSettings?.value) {
        storedPassword = adminSettings.value;
      }
    } catch (error) {
      console.log('Using environment variable password as fallback');
    }

    if (password !== storedPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Simple JWT-like token (in production, use proper JWT)
    const token = Buffer.from(`admin:${Date.now()}`).toString('base64');

    res.status(200).json({
      success: true,
      token,
      message: 'Authentication successful'
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}