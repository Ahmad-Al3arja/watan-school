import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('license_types')
        .select(`
          *,
          requirements:license_requirements(*),
          pricing:license_pricing(*)
        `)
        .eq('is_active', true)
        .order('id');

      if (error) throw error;

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error fetching license types:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { name_ar, name_en, type_key, min_age_exam, min_age_license, description_ar, description_en } = req.body;

      const { data, error } = await supabaseAdmin
        .from('license_types')
        .insert([{
          name_ar,
          name_en,
          type_key,
          min_age_exam,
          min_age_license,
          description_ar,
          description_en
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('Error creating license type:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, ...updateData } = req.body;

      const { data, error } = await supabaseAdmin
        .from('license_types')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error updating license type:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      const { error } = await supabaseAdmin
        .from('license_types')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting license type:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
