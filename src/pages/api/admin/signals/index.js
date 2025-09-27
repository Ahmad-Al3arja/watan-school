import { supabaseAdmin } from '../../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('signals')
        .select('*')
        .order('type_index', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching signals:', error);
        return res.status(500).json({ error: 'Failed to fetch signals' });
      }

      res.status(200).json(data);
    } catch (error) {
      console.error('Error in admin signals API:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, image, content, type_index, order_index } = req.body;

      if (!title || !image || !content || type_index === undefined || order_index === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabaseAdmin
        .from('signals')
        .insert([{
          title,
          image,
          content,
          type_index: parseInt(type_index),
          order_index: parseInt(order_index)
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating signal:', error);
        return res.status(500).json({ error: 'Failed to create signal' });
      }

      res.status(201).json(data);
    } catch (error) {
      console.error('Error in admin signals POST API:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
