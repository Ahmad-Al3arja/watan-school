import { supabaseAdmin } from '../../../../lib/supabase';

// Cache for admin stats (5 minutes)
let statsCache = null;
let statsCacheTimestamp = 0;
const STATS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Check cache first
    const now = Date.now();
    if (statsCache && (now - statsCacheTimestamp) < STATS_CACHE_DURATION) {
      res.setHeader('Cache-Control', 'private, s-maxage=300');
      return res.status(200).json(statsCache);
    }

    // Get total counts by category (optimized query)
    const { data: allQuestions, error } = await supabaseAdmin
      .from('questions')
      .select('category, subcategory, exam_number')
      .limit(20000);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }

    // Group by category -> subcategory -> exam_number
    const stats = {};

    allQuestions.forEach(q => {
      if (!stats[q.category]) stats[q.category] = {};
      if (!stats[q.category][q.subcategory]) stats[q.category][q.subcategory] = {};
      if (!stats[q.category][q.subcategory][q.exam_number]) {
        stats[q.category][q.subcategory][q.exam_number] = 0;
      }
      stats[q.category][q.subcategory][q.exam_number]++;
    });

    const result = {
      totalQuestions: allQuestions.length,
      structure: stats,
      categories: Object.keys(stats),
      summary: Object.entries(stats).map(([category, subcats]) => ({
        category,
        subcategoriesCount: Object.keys(subcats).length,
        examsCount: Object.values(subcats).reduce((total, exams) => total + Object.keys(exams).length, 0),
        questionsCount: Object.values(subcats).reduce((total, exams) =>
          total + Object.values(exams).reduce((subTotal, count) => subTotal + count, 0), 0
        )
      }))
    };

    // Cache the result
    statsCache = result;
    statsCacheTimestamp = now;

    res.setHeader('Cache-Control', 'private, s-maxage=300');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}