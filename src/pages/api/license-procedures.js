import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { procedure_type } = req.query;
      
      let query = supabaseAdmin
        .from('license_procedures')
        .select('*')
        .eq('is_active', true)
        .order('step_order');

      if (procedure_type) {
        query = query.eq('procedure_type', procedure_type);
      }

      const { data, error } = await query;

      if (error) throw error;

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error fetching license procedures:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { 
        procedure_type, 
        title_ar, 
        title_en, 
        description_ar, 
        description_en, 
        location_ar, 
        location_en, 
        schedule_ar, 
        schedule_en, 
        requirements_ar, 
        requirements_en, 
        notes_ar, 
        notes_en, 
        step_order, 
        is_active 
      } = req.body;

      const { data, error } = await supabaseAdmin
        .from('license_procedures')
        .insert([{
          procedure_type,
          title_ar,
          title_en,
          description_ar,
          description_en,
          location_ar,
          location_en,
          schedule_ar,
          schedule_en,
          requirements_ar,
          requirements_en,
          notes_ar,
          notes_en,
          step_order,
          is_active
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('Error creating license procedure:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, ...updateData } = req.body;

      const { data, error } = await supabaseAdmin
        .from('license_procedures')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error updating license procedure:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      const { error } = await supabaseAdmin
        .from('license_procedures')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting license procedure:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
