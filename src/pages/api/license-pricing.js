import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { license_type_id } = req.query;
      
      let query = supabaseAdmin
        .from('license_pricing')
        .select('*')
        .eq('is_active', true)
        .order('price_type');

      if (license_type_id) {
        query = query.eq('license_type_id', license_type_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error fetching license pricing:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { license_type_id, price_type, price, currency, description_ar, description_en, is_active } = req.body;

      const { data, error } = await supabaseAdmin
        .from('license_pricing')
        .insert([{
          license_type_id,
          price_type,
          price,
          currency,
          description_ar,
          description_en,
          is_active
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('Error creating license pricing:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, ...updateData } = req.body;

      const { data, error } = await supabaseAdmin
        .from('license_pricing')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error updating license pricing:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      const { error } = await supabaseAdmin
        .from('license_pricing')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting license pricing:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
