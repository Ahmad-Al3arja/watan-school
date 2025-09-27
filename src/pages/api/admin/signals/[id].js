import { supabaseAdmin } from '../../../../../lib/supabase';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('signals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching signal:', error);
        return res.status(500).json({ error: 'Failed to fetch signal' });
      }

      if (!data) {
        return res.status(404).json({ error: 'Signal not found' });
      }

      res.status(200).json(data);
    } catch (error) {
      console.error('Error in admin signal GET API:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, image, content, type_index, order_index } = req.body;

      if (!title || !image || !content || type_index === undefined || order_index === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabaseAdmin
        .from('signals')
        .update({
          title,
          image,
          content,
          type_index: parseInt(type_index),
          order_index: parseInt(order_index)
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating signal:', error);
        return res.status(500).json({ error: 'Failed to update signal' });
      }

      if (!data) {
        return res.status(404).json({ error: 'Signal not found' });
      }

      res.status(200).json(data);
    } catch (error) {
      console.error('Error in admin signal PUT API:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { error } = await supabaseAdmin
        .from('signals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting signal:', error);
        return res.status(500).json({ error: 'Failed to delete signal' });
      }

      res.status(200).json({ message: 'Signal deleted successfully' });
    } catch (error) {
      console.error('Error in admin signal DELETE API:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
