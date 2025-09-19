// Service to fetch theoretical exam results from MOT website
export const fetchTheoreticalExamResult = async (searchId) => {
  try {
    // Fetching from MOT website via server-side API
    
    const response = await fetch('/api/mot-exam', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchId }),
    });

    const result = await response.json();
    
    // MOT Service - Response received

    if (!response.ok) {
      throw new Error(result.message || 'حدث خطأ أثناء جلب البيانات من موقع وزارة المواصلات. يرجى المحاولة لاحقاً.');
    }

    // Check if the API returned an error in the response body
    if (result.success === false) {
      throw new Error(result.message || 'حدث خطأ أثناء جلب البيانات من موقع وزارة المواصلات. يرجى المحاولة لاحقاً.');
    }

    return result;
  } catch (error) {
    // MOT fetch error
    throw error;
  }
};