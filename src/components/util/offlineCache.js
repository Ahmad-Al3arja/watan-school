import { Preferences } from "@capacitor/preferences";

// Cache keys
const QUESTIONS_CACHE_KEY = "questions_cache";
const DATA_STRUCTURE_CACHE_KEY = "data_structure_cache";
const CACHE_TIMESTAMP_KEY = "cache_timestamp";
const CACHE_VERSION_KEY = "cache_version";

// Cache duration (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * Check if cached data is still valid
 */
async function isCacheValid() {
  try {
    const { value: timestamp } = await Preferences.get({ key: CACHE_TIMESTAMP_KEY });
    if (!timestamp) return false;
    
    const cacheTime = parseInt(timestamp);
    const now = Date.now();
    
    return (now - cacheTime) < CACHE_DURATION;
  } catch (error) {
    // Error checking cache validity
    return false;
  }
}

/**
 * Save questions data to local cache
 */
export async function saveQuestionsCache(questionsData) {
  try {
    const now = Date.now();
    
    await Promise.all([
      Preferences.set({
        key: QUESTIONS_CACHE_KEY,
        value: JSON.stringify(questionsData)
      }),
      Preferences.set({
        key: CACHE_TIMESTAMP_KEY,
        value: now.toString()
      }),
      Preferences.set({
        key: CACHE_VERSION_KEY,
        value: (Date.now()).toString()
      })
    ]);
    
    // Questions cached successfully
  } catch (error) {
    // Error saving questions cache
  }
}

/**
 * Save data structure to local cache
 */
export async function saveDataStructureCache(dataStructure) {
  try {
    const now = Date.now();
    
    await Promise.all([
      Preferences.set({
        key: DATA_STRUCTURE_CACHE_KEY,
        value: JSON.stringify(dataStructure)
      }),
      Preferences.set({
        key: CACHE_TIMESTAMP_KEY,
        value: now.toString()
      })
    ]);
    
    // Data structure cached successfully
  } catch (error) {
    // Error saving data structure cache
  }
}

/**
 * Load questions from cache
 */
export async function loadQuestionsCache() {
  try {
    if (!(await isCacheValid())) {
      // Cache is invalid or expired
      return null;
    }
    
    const { value } = await Preferences.get({ key: QUESTIONS_CACHE_KEY });
    if (!value) return null;
    
    const cachedData = JSON.parse(value);
    // Questions loaded from cache
    return cachedData;
  } catch (error) {
    // Error loading questions cache
    return null;
  }
}

/**
 * Load data structure from cache
 */
export async function loadDataStructureCache() {
  try {
    if (!(await isCacheValid())) {
      // Cache is invalid or expired
      return null;
    }
    
    const { value } = await Preferences.get({ key: DATA_STRUCTURE_CACHE_KEY });
    if (!value) return null;
    
    const cachedData = JSON.parse(value);
    // Data structure loaded from cache
    return cachedData;
  } catch (error) {
    // Error loading data structure cache
    return null;
  }
}

/**
 * Clear all cached data
 */
export async function clearCache() {
  try {
    await Promise.all([
      Preferences.remove({ key: QUESTIONS_CACHE_KEY }),
      Preferences.remove({ key: DATA_STRUCTURE_CACHE_KEY }),
      Preferences.remove({ key: CACHE_TIMESTAMP_KEY }),
      Preferences.remove({ key: CACHE_VERSION_KEY })
    ]);
    
    // Cache cleared successfully
  } catch (error) {
    // Error clearing cache
  }
}

/**
 * Get cache info (timestamp, size, etc.)
 */
export async function getCacheInfo() {
  try {
    const { value: timestamp } = await Preferences.get({ key: CACHE_TIMESTAMP_KEY });
    const { value: version } = await Preferences.get({ key: CACHE_VERSION_KEY });
    
    if (!timestamp) {
      return { hasCache: false };
    }
    
    const cacheTime = parseInt(timestamp);
    const now = Date.now();
    const age = now - cacheTime;
    const isValid = age < CACHE_DURATION;
    
    return {
      hasCache: true,
      timestamp: cacheTime,
      age: age,
      isValid: isValid,
      version: version,
      expiresIn: Math.max(0, CACHE_DURATION - age)
    };
  } catch (error) {
    // Error getting cache info
    return { hasCache: false };
  }
}

/**
 * Check if device is online
 */
export function isOnline() {
  if (typeof window === 'undefined') return true; // Server-side: assume online
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function onNetworkChange(callback) {
  if (typeof window === 'undefined') {
    return () => {}; // Server-side: return empty cleanup function
  }
  
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
