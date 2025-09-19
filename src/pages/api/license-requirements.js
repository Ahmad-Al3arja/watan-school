import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { license_type_id } = req.query;
      
      let query = supabaseAdmin
        .from('license_requirements')
        .select('*')
        .order('sort_order', { ascending: true });

      if (license_type_id) {
        query = query.eq('license_type_id', license_type_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error fetching license requirements:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { license_type_id, requirement_type, title_ar, title_en, description_ar, description_en, is_required, sort_order } = req.body;

      const { data, error } = await supabaseAdmin
        .from('license_requirements')
        .insert([{
          license_type_id,
          requirement_type,
          title_ar,
          title_en,
          description_ar,
          description_en,
          is_required,
          sort_order
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('Error creating license requirement:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, ...updateData } = req.body;

      const { data, error } = await supabaseAdmin
        .from('license_requirements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error updating license requirement:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      const { error } = await supabaseAdmin
        .from('license_requirements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting license requirement:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
