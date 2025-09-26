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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get current admin settings from Supabase
    const { data: adminSettings, error: fetchError } = await supabaseAdmin
      .from('admin_settings')
      .select('*')
      .eq('key', 'admin_password')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching admin settings:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch admin settings' });
    }

    // Check current password
    const storedPassword = adminSettings?.value || process.env.ADMIN_PASSWORD;
    if (currentPassword !== storedPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('admin_settings')
      .upsert({
        key: 'admin_password',
        value: newPassword,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (updateError) {
      console.error('Error updating password:', updateError);
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}