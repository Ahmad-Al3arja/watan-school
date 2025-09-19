import { useState, useEffect } from 'react';
import { 
  loadDataStructureCache, 
  saveDataStructureCache, 
  isOnline, 
  onNetworkChange 
} from '../components/util/offlineCache';
import quizData from '../pages/data.json';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { isOnQuizPage } from './useExamState';

// Function to fetch data structure directly from Supabase
async function fetchDataFromSupabase() {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not properly configured - missing environment variables');
    }

    // Check if Supabase client is available
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Fetching questions from Supabase
    
    // Fetch all data using optimized pagination like the admin dashboard
    const pageSize = 1000;
    const maxPages = 20; // Allow up to 20k questions

    // First, get a count to determine exact number of pages needed
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });

    const totalPages = Math.ceil(count / pageSize);
    const actualPages = Math.min(totalPages, maxPages);

    // Total questions in database: ${count}

    // Fetch multiple pages concurrently for better performance
    const pagePromises = [];
    for (let page = 0; page < actualPages; page++) {
      pagePromises.push(
        supabase
          .from('questions')
          .select('*')
          .order('category', 'subcategory', 'exam_number', 'position')
          .range(page * pageSize, (page + 1) * pageSize - 1)
      );
    }

    // Execute all queries concurrently
    const results = await Promise.all(pagePromises);

    // Check for errors in any of the results
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      // Supabase errors occurred
      throw new Error(`Failed to fetch questions: ${errors[0].error.message}`);
    }

    // Combine all results
    const questions = results.flatMap(result => result.data || []);

    if (!questions || questions.length === 0) {
      throw new Error('No questions found in database');
    }


    // Debug: Log the first few questions to see the structure
    
    // Debug: Show category breakdown
    const categoryBreakdown = questions.reduce((acc, q) => {
      const key = `${q.category}-${q.subcategory}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    // Check if nTeoria exists in Supabase data
    const nTeoriaQuestions = questions.filter(q => q.category === 'nTeoria');
    if (nTeoriaQuestions.length > 0) {
    }

        // Create a lightweight structure summary for caching (without full question data)
        const structureSummary = {};
        const questionCounts = {};

        questions.forEach(question => {
          const { category, subcategory, exam_number } = question;

          if (!structureSummary[category]) {
            structureSummary[category] = {};
          }

          if (!structureSummary[category][subcategory]) {
            structureSummary[category][subcategory] = {};
          }

          if (!structureSummary[category][subcategory][exam_number]) {
            structureSummary[category][subcategory][exam_number] = [];
            questionCounts[`${category}-${subcategory}-${exam_number}`] = 0;
          }

          // Just store the question ID and basic info for structure
          const questionData = {
            id: question.original_id || question.id,
            question: question.question,
            a: question.option_a,
            b: question.option_b,
            answer: question.correct_answer.toString()
          };

          // Only add c and d if they exist and are not empty
          if (question.option_c && question.option_c.trim() !== '') {
            questionData.c = question.option_c;
          }
          if (question.option_d && question.option_d.trim() !== '') {
            questionData.d = question.option_d;
          }

          structureSummary[category][subcategory][exam_number].push(questionData);
        });

        // Debug: Log the final data structure

        // Merge with static data to ensure all categories are available
        const mergedDataStructure = { ...quizData, ...structureSummary };


        return mergedDataStructure;
  } catch (error) {
    // Error fetching data from Supabase
    throw error;
  }
}

export function useQuizData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  // Define fetchData function outside useEffect so it can be accessed by other useEffects
  const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load cached data as fallback
        const cachedData = await loadDataStructureCache();
        
        // If online, try to fetch fresh data from Supabase first
        if (isOnline()) {
          try {
            const result = await fetchDataFromSupabase();
            
              // Save to cache for offline use (only if data is not too large)
              try {
                const dataSize = JSON.stringify(result).length;
                
                if (dataSize < 5 * 1024 * 1024) { // Only cache if less than 5MB
                  await saveDataStructureCache(result);
                } else {
                }
              } catch (cacheError) {
                // Failed to cache data
              }
            
            // Update state with fresh data
            setData(result);
            setIsFromCache(false);
            setLoading(false);
            return; // Exit early with fresh data
          } catch (fetchError) {
            // Failed to fetch fresh data from Supabase
          }
        }
        
        // Fallback to cached data if available
        if (cachedData) {
          setData(cachedData);
          setIsFromCache(true);
        } else {
          // Use static data as final fallback
          setData(quizData);
          setIsFromCache(false);
          
            // Save static data to cache for offline use (only if not too large)
            try {
              const dataSize = JSON.stringify(quizData).length;
              if (dataSize < 5 * 1024 * 1024) { // Only cache if less than 5MB
                await saveDataStructureCache(quizData);
              }
            } catch (cacheError) {
              // Failed to cache static data
            }
        }
      } catch (err) {
        // Error in fetchData
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Listen for network changes and app state changes
  useEffect(() => {
    // Initialize offline state
    setIsOffline(!isOnline());

    const cleanup = onNetworkChange((online) => {
      setIsOffline(!online);

      // If we just came online, always try to refresh data
      if (online) {
        // Network restored, refreshing data
        fetchData();
      }
    });

    // Listen for app state changes (foreground/background)
    const handleAppStateChange = () => {
      if (document.visibilityState === 'visible' && isOnline()) {
        // Don't refresh if user is currently on a quiz page
        if (isOnQuizPage()) {
          // App came to foreground, but skipping refresh - user on quiz page
          return;
        }
        
        // App came to foreground, refreshing data
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleAppStateChange);

    return () => {
      cleanup();
      document.removeEventListener('visibilitychange', handleAppStateChange);
    };
  }, [data, isFromCache]);

  // Periodic refresh when online (every 10 seconds for faster updates)
  useEffect(() => {
    if (!isOnline()) return;

    const interval = setInterval(() => {
      // Don't refresh if user is currently on a quiz page
      if (isOnQuizPage()) {
        // Periodic refresh skipped - user on quiz page
        return;
      }
      
      // Periodic refresh triggered
      // Call the fetchData function that's defined in the useEffect above
      fetchData();
    }, 10000); // 10 seconds for faster updates

    return () => clearInterval(interval);
  }, [isOnline()]);

  // Function to manually refresh data
  const refreshData = async () => {
    // Manual refresh triggered
    await fetchData();
  };

  return {
    data,
    loading,
    error,
    isOffline,
    isFromCache,
    refreshData
  };
}

export function useQuestions(category, subcategory, examNumber) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    if (!category || !subcategory || !examNumber) {
      setLoading(false);
      return;
    }

    async function fetchQuestions() {
      try {
        setLoading(true);
        setError(null);
        
        // First, try to get questions from the cached data structure
        const cachedDataStructure = await loadDataStructureCache();
        
        if (cachedDataStructure) {
          const cachedQuestions = cachedDataStructure[category]?.[subcategory]?.[examNumber];
          if (cachedQuestions && cachedQuestions.length > 0) {
            setQuestions(cachedQuestions);
            setIsFromCache(true);
            setLoading(false);
            return;
          }
        }
        
        // Use static data as fallback
        const staticQuestions = quizData[category]?.[subcategory]?.[examNumber];
        if (staticQuestions && staticQuestions.length > 0) {
          setQuestions(staticQuestions);
          setIsFromCache(false);
          setLoading(false);
          return;
        }
        
        // If online, try to fetch fresh questions from Supabase
        if (isOnline()) {
          try {
            
            if (!isSupabaseConfigured()) {
              throw new Error('Supabase not properly configured - missing environment variables');
            }

            if (!supabase) {
              throw new Error('Supabase client not available');
            }

            const { data: questions, error } = await supabase
              .from('questions')
              .select('*')
              .eq('category', category)
              .eq('subcategory', subcategory)
              .eq('exam_number', examNumber)
              .order('id');

            if (error) {
              // Supabase query error
              throw error;
            }

            if (questions && questions.length > 0) {
              setQuestions(questions);
              setIsFromCache(false);
              return;
            } else {
            }
          } catch (fetchError) {
            // Failed to fetch fresh questions from Supabase
          }
        }
        
        // If no questions found anywhere
        setError('No questions available for this exam');
        setQuestions([]);
      } catch (err) {
        // Error in fetchQuestions
        setError(err.message);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [category, subcategory, examNumber]);

  // Listen for network changes
  useEffect(() => {
    // Initialize offline state
    setIsOffline(!isOnline());
    
    const cleanup = onNetworkChange((online) => {
      setIsOffline(!online);
      
      // If we just came online and have cached questions, try to refresh
      if (online && questions.length > 0 && isFromCache) {
        // Network restored, refreshing questions
        fetchQuestions();
      }
    });

    return cleanup;
  }, [questions, isFromCache, category, subcategory, examNumber]);

  return { 
    questions, 
    loading, 
    error, 
    isOffline, 
    isFromCache 
  };
}