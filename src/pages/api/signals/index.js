import { supabase } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('type_index', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching signals:', error);
        return res.status(500).json({ error: 'Failed to fetch signals' });
      }

      // Group signals by type_index to match the original structure
      const groupedSignals = [];
      data.forEach(signal => {
        if (!groupedSignals[signal.type_index]) {
          groupedSignals[signal.type_index] = [];
        }
        groupedSignals[signal.type_index].push({
          title: signal.title,
          image: signal.image,
          content: signal.content
        });
      });

      res.status(200).json(groupedSignals);
    } catch (error) {
      console.error('Error in signals API:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
