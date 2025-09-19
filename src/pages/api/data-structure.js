import { supabase } from '../../../lib/supabase';

// Cache for the data structure (10 seconds for development, 1 minute for production)
let dataCache = null;
let cacheTimestamp = 0;
let cacheVersion = 0;
const CACHE_DURATION = process.env.NODE_ENV === 'production' ? 60 * 1000 : 10 * 1000; // 1 minute in production, 10 seconds in development

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

    // Allow clearing cache with a special parameter
    if (req.query.clear_cache === 'true') {
      dataCache = null;
      cacheTimestamp = 0;
      cacheVersion++;
      return res.status(200).json({ message: 'Cache cleared successfully', version: cacheVersion });
    }

  try {
    // Check cache first (but skip if cache_bust parameter is provided)
    const now = Date.now();
    const { cache_bust, version } = req.query;
    
    // Check cache first (but skip if cache_bust parameter is provided)
    if (!cache_bust && dataCache && (now - cacheTimestamp) < CACHE_DURATION && (!version || version == cacheVersion)) {
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json({ ...dataCache, _cacheVersion: cacheVersion });
    }
    
    // Fetch all data using optimized pagination with concurrent requests
    const pageSize = 1000;
    const maxPages = 16; // We know we have ~14k records, so max 15 pages

    // First, get a count to determine exact number of pages needed
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });

    const totalPages = Math.ceil(count / pageSize);
    const actualPages = Math.min(totalPages, maxPages);

    // Fetch multiple pages concurrently for better performance
    const pagePromises = [];
    for (let page = 0; page < actualPages; page++) {
      pagePromises.push(
        supabase
          .from('questions')
          .select('original_id, category, subcategory, exam_number, question, option_a, option_b, option_c, option_d, correct_answer')
          .order('category', 'subcategory', 'exam_number', 'original_id')
          .range(page * pageSize, (page + 1) * pageSize - 1)
      );
    }

    // Execute all queries concurrently
    const results = await Promise.all(pagePromises);

    // Check for errors and combine data
    const allData = [];
    for (const result of results) {
      if (result.error) {
        return res.status(500).json({ error: 'Failed to fetch questions' });
      }
      allData.push(...result.data);
    }

    const data = allData;

    // Rebuild the original data structure
    const result = {};
    const examCounts = {};

    data.forEach(question => {
      const { category, subcategory, exam_number, original_id, question: q, option_a, option_b, option_c, option_d, correct_answer } = question;

      if (!result[category]) {
        result[category] = {};
      }

      if (!result[category][subcategory]) {
        result[category][subcategory] = {};
      }

      if (!result[category][subcategory][exam_number]) {
        result[category][subcategory][exam_number] = [];
        // Track exam creation
        const examKey = `${category}/${subcategory}/${exam_number}`;
        examCounts[examKey] = 0;
      }

      // Count questions per exam
      const examKey = `${category}/${subcategory}/${exam_number}`;
      examCounts[examKey]++;

      const questionObj = {
        id: original_id,
        question: q,
        a: option_a,
        b: option_b,
        answer: correct_answer.toString()
      };

      // Add options c and d if they exist
      if (option_c) {
        questionObj.c = option_c;
      }
      if (option_d) {
        questionObj.d = option_d;
      }

      result[category][subcategory][exam_number].push(questionObj);
    });


    // Cache the result
    dataCache = result;
    cacheTimestamp = now;

    // Set cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ ...result, _cacheVersion: cacheVersion });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}