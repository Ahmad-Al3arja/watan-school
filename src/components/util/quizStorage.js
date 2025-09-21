import { Preferences } from "@capacitor/preferences";

// Fallback storage for browser environments
const browserStorage = {
  async get(options) {
    try {
      const value = localStorage.getItem(options.key);
      return { value };
    } catch (error) {
      return { value: null };
    }
  },
  async set(options) {
    try {
      localStorage.setItem(options.key, options.value);
    } catch (error) {
      // Silent fail for localStorage
    }
  }
};

// Smart storage that tries Capacitor first, then falls back to localStorage
const storage = {
  async get(options) {
    try {
      return await Preferences.get(options);
    } catch (error) {
      return await browserStorage.get(options);
    }
  },
  async set(options) {
    try {
      await Preferences.set(options);
    } catch (error) {
      await browserStorage.set(options);
    }
  }
};

/* --------------------------------------------------------------------------
   HELPER: Ensure Nested Object
   -------------------------------------------------------------------------- */
function ensureNestedObject(obj, ...keys) {
  let current = obj;
  for (const key of keys) {
    if (typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  return current;
}

/* --------------------------------------------------------------------------
   WRONG ANSWERS
   -------------------------------------------------------------------------- */
const WRONG_ANSWERS_KEY = "wrongAnswers";

async function loadAllWrongAnswers() {
  const { value } = await storage.get({ key: WRONG_ANSWERS_KEY });
  return value ? JSON.parse(value) : {};
}

async function saveAllWrongAnswers(allWrongAnswers) {
  await storage.set({
    key: WRONG_ANSWERS_KEY,
    value: JSON.stringify(allWrongAnswers),
  });
}

/**
 * Load the wrong answer counts for a *single quiz* (qType, type, quizNumber).
 * Returns an object mapping questionIndex (as a string) to count.
 * e.g. { "0": 2, "3": 1 }
 */
export async function loadQuizWrongAnswers(qType, type, quizNumber) {
  const all = await loadAllWrongAnswers();
  return all[qType]?.[type]?.[quizNumber] ?? {};
}

/**
 * Record a wrong answer for one quiz.
 * Increases the count for the given questionIndex.
 */
export async function recordWrongAnswerTypeLevel(
  qType,
  type,
  quizNumber,
  questionIndex
) {
  const all = await loadAllWrongAnswers();
  ensureNestedObject(all, qType, type);
  if (
    typeof all[qType][type][quizNumber] !== "object" ||
    all[qType][type][quizNumber] === null
  ) {
    all[qType][type][quizNumber] = {};
  }
  const quizWrongAnswers = all[qType][type][quizNumber];
  const qKey = String(questionIndex);
  if (quizWrongAnswers[qKey] === undefined) {
    quizWrongAnswers[qKey] = 1;
  } else {
    quizWrongAnswers[qKey] += 1;
  }
  await saveAllWrongAnswers(all);
}

/**
 * Remove a wrong answer for one quiz.
 * Decrements the count for the given questionIndex. If the count reaches 0, the key is removed.
 */
export async function removeWrongAnswerTypeLevel(
  qType,
  type,
  quizNumber,
  questionIndex
) {
  const all = await loadAllWrongAnswers();
  const quizWrongAnswers = all[qType]?.[type]?.[quizNumber];
  if (typeof quizWrongAnswers === "object" && quizWrongAnswers !== null) {
    const qKey = String(questionIndex);
    if (quizWrongAnswers[qKey] !== undefined) {
      quizWrongAnswers[qKey] -= 1;
      if (quizWrongAnswers[qKey] <= 0) {
        delete quizWrongAnswers[qKey];
      }
      await saveAllWrongAnswers(all);
    }
  }
}

/**
 * Load **all** wrong answers for qType + type.
 * Returns an object: { "quizNumber": { "questionIndex": count, ... }, ... }
 */
export async function loadAllTypeWrongAnswers(qType, type) {
  const all = await loadAllWrongAnswers();
  return all[qType]?.[type] ?? {};
}

/* --------------------------------------------------------------------------
   BOOKMARKS
   -------------------------------------------------------------------------- */
const BOOKMARKS_KEY = "bookmarks";

async function loadAllBookmarks() {
  const { value } = await storage.get({ key: BOOKMARKS_KEY });
  return value ? JSON.parse(value) : {};
}

async function saveAllBookmarks(allBookmarks) {
  await storage.set({
    key: BOOKMARKS_KEY,
    value: JSON.stringify(allBookmarks),
  });
}

/**
 * Load bookmarks for a *single quiz* (qType, type, quizNumber).
 * Returns an array of question indices.
 */
export async function loadQuizBookmarks(qType, type, quizNumber) {
  const all = await loadAllBookmarks();
  return all[qType]?.[type]?.[quizNumber] ?? [];
}

/**
 * Save bookmarks for a single quiz (qType, type, quizNumber).
 */
export async function saveQuizBookmarks(
  qType,
  type,
  quizNumber,
  bookmarksArray
) {
  const all = await loadAllBookmarks();
  ensureNestedObject(all, qType, type);
  all[qType][type][quizNumber] = bookmarksArray;
  await saveAllBookmarks(all);
}

/**
 * Add a bookmark for a single quiz if not already present.
 */
export async function bookmarkQuestionTypeLevel(
  qType,
  type,
  quizNumber,
  questionIndex
) {
  const all = await loadAllBookmarks();
  ensureNestedObject(all, qType, type);
  if (!Array.isArray(all[qType][type][quizNumber])) {
    all[qType][type][quizNumber] = [];
  }
  const arr = all[qType][type][quizNumber];
  if (!arr.includes(questionIndex)) {
    arr.push(questionIndex);
  }
  await saveAllBookmarks(all);
}

/**
 * Remove a bookmark from a single quiz.
 */
export async function unbookmarkQuestionTypeLevel(
  qType,
  type,
  quizNumber,
  questionIndex
) {
  const all = await loadAllBookmarks();
  const arr = all[qType]?.[type]?.[quizNumber];
  if (Array.isArray(arr)) {
    all[qType][type][quizNumber] = arr.filter((idx) => idx !== questionIndex);
    await saveAllBookmarks(all);
  }
}

/**
 * Load **all** bookmarks for qType + type.
 * Returns an object like: { "quizNumber": [questionIndices], ... }
 */
export async function loadAllTypeBookmarks(qType, type) {
  const all = await loadAllBookmarks();
  return all[qType]?.[type] ?? {};
}

/* --------------------------------------------------------------------------
   LAST SCORES
   -------------------------------------------------------------------------- */
const LAST_SCORES_KEY = "lastScores";

async function loadAllScores() {
  const { value } = await storage.get({ key: LAST_SCORES_KEY });
  return value ? JSON.parse(value) : {};
}

async function saveAllScores(allScores) {
  await storage.set({
    key: LAST_SCORES_KEY,
    value: JSON.stringify(allScores),
  });
}

/**
 * Load the last score for a *single quiz* (qType, type, quizNumber).
 */
export async function loadQuizScore(qType, type, quizNumber) {
  const all = await loadAllScores();
  return all[qType]?.[type]?.[quizNumber] ?? null;
}

/**
 * Record the last score for a single quiz (qType, type, quizNumber).
 */
export async function recordLastScore(
  qType,
  type,
  quizNumber,
  grade,
  total,
  time
) {
  const nowISO = new Date().toISOString();
  const finalTime = time || nowISO;
  const scoreData = { grade, total, time: finalTime };

  const all = await loadAllScores();
  ensureNestedObject(all, qType, type);

  all[qType][type][quizNumber] = scoreData;
  await saveAllScores(all);
}

/**
 * Load **all** scores for qType + type.
 * Returns an object like: { "quizNumber": { grade, total, time }, ... }
 */
export async function loadAllTypeScores(qType, type) {
  const all = await loadAllScores();
  return all[qType]?.[type] ?? {};
}

/* --------------------------------------------------------------------------
   CONVENIENCE METHODS: COUNT BOOKMARKS & WRONG ANSWERS
   -------------------------------------------------------------------------- */

/**
 * Returns the total number of bookmarked questions for (qType, type).
 */
export async function countAllBookmarks(qType, type) {
  const allBookmarks = await loadAllTypeBookmarks(qType, type);
  return Object.values(allBookmarks).reduce((sum, arr) => sum + arr.length, 0);
}

/**
 * Returns the total number of wrong answers for (qType, type).
 * Sums all counts across all quizzes.
 */
export async function countAllWrongAnswers(qType, type) {
  const allWrongs = await loadAllTypeWrongAnswers(qType, type);
  let total = 0;
  for (const quiz in allWrongs) {
    // Count each question only once regardless of the number of mistakes
    total += Object.keys(allWrongs[quiz]).length;
  }
  return total;
}

/* --------------------------------------------------------------------------
   EXAM PROGRESS
   -------------------------------------------------------------------------- */
const EXAM_PROGRESS_KEY = "examProgress";

async function loadAllExamProgress() {
  const { value } = await storage.get({ key: EXAM_PROGRESS_KEY });
  return value ? JSON.parse(value) : {};
}

async function saveAllExamProgress(allProgress) {
  await storage.set({
    key: EXAM_PROGRESS_KEY,
    value: JSON.stringify(allProgress),
  });
}

/**
 * Save exam progress for a specific quiz
 */
export async function saveExamProgress(
  qType,
  type,
  quizNumber,
  currentIndex,
  userAnswers,
  visited,
  timeLeft,
  showAnswers,
  quizContent = null
) {
  const all = await loadAllExamProgress();
  const key = `${qType}-${type}-${quizNumber}`;
  
  const progressData = {
    currentIndex,
    userAnswers,
    visited,
    timeLeft,
    showAnswers,
    timestamp: new Date().toISOString(),
    quizContent
  };
  
  all[key] = progressData;
  await saveAllExamProgress(all);
}

/**
 * Load exam progress for a specific quiz
 */
export async function loadExamProgress(qType, type, quizNumber) {
  const all = await loadAllExamProgress();
  const key = `${qType}-${type}-${quizNumber}`;
  return all[key] || null;
}

/**
 * Check if exam progress exists for a specific quiz
 */
export async function hasExamProgress(qType, type, quizNumber) {
  const progress = await loadExamProgress(qType, type, quizNumber);
  return progress !== null;
}

/**
 * Clear exam progress for a specific quiz
 */
export async function clearExamProgress(qType, type, quizNumber) {
  const all = await loadAllExamProgress();
  const key = `${qType}-${type}-${quizNumber}`;
  delete all[key];
  await saveAllExamProgress(all);
}

/**
 * Get all exam progress entries
 */
export async function getAllExamProgress() {
  return await loadAllExamProgress();
}

/**
 * Validate exam progress data
 */
export function isProgressValid(progress, expectedTotal, isRandom = false) {
  if (!progress) return false;
  
  // Check required fields
  if (typeof progress.currentIndex !== 'number' ||
      !Array.isArray(progress.userAnswers) ||
      !Array.isArray(progress.visited) ||
      typeof progress.timeLeft !== 'number' ||
      !Array.isArray(progress.showAnswers)) {
    return false;
  }
  
  // Check bounds
  if (progress.currentIndex < 0 || progress.currentIndex >= expectedTotal) {
    return false;
  }
  
  // Check array lengths
  if (progress.userAnswers.length !== expectedTotal ||
      progress.showAnswers.length !== expectedTotal) {
    return false;
  }
  
  // For random quizzes, check if quiz content exists
  if (isRandom && (!progress.quizContent || !Array.isArray(progress.quizContent))) {
    return false;
  }
  
  return true;
}

/**
 * Check if exam progress is recent (within 24 hours)
 */
export function isProgressRecent(progress) {
  if (!progress || !progress.timestamp) return false;
  
  const progressTime = new Date(progress.timestamp);
  const now = new Date();
  const hoursDiff = (now - progressTime) / (1000 * 60 * 60);
  
  return hoursDiff < 24; // Progress is valid for 24 hours
}

/* --------------------------------------------------------------------------
   ALIASES FOR LOADING ALL QUIZZES (Instead of single quiz)
   -------------------------------------------------------------------------- */
export const loadTypeWrongAnswers = loadAllTypeWrongAnswers;
export const loadTypeBookmarks = loadAllTypeBookmarks;
export const loadTypeScores = loadAllTypeScores;

/* --------------------------------------------------------------------------
   SAVED QUESTIONS (BOOKMARKS)
   -------------------------------------------------------------------------- */

/**
 * Load saved questions (bookmarks) for a specific quiz type and level
 * @param {string} qType - The quiz type (e.g., 'training', 'private', etc.)
 * @param {string} type - The quiz level (e.g., 'quizes', 'oral', etc.)
 * @returns {Promise<Array>} Array of saved question objects
 */
export async function loadSavedQuestions(qType, type) {
  try {
    const bookmarks = await loadAllTypeBookmarks(qType, type);
    if (!bookmarks || Object.keys(bookmarks).length === 0) {
      return [];
    }

    // Load the quiz data to get the actual questions
    const quizData = await import('@/pages/data.json');
    const questions = [];
    
    // Get all quiz numbers for this type
    const quizNumbers = Object.keys(quizData.default[qType]?.[type] || {});
    
    for (const quizNumber of quizNumbers) {
      const quizQuestions = quizData.default[qType][type][quizNumber];
      const bookmarkedIndices = bookmarks[quizNumber] || [];
      
      if (Array.isArray(quizQuestions) && Array.isArray(bookmarkedIndices)) {
        // Add questions that are bookmarked
        bookmarkedIndices.forEach((questionIndex) => {
          if (quizQuestions[questionIndex]) {
            questions.push({
              ...quizQuestions[questionIndex],
              _originalQuizNumber: quizNumber,
              _originalQuestionIndex: questionIndex,
            });
          }
        });
      }
    }
    
    return questions;
  } catch (error) {
    console.error('Error loading saved questions:', error);
    return [];
  }
}

/**
 * Load wrong answers for a specific quiz type and level
 * @param {string} qType - The quiz type (e.g., 'training', 'private', etc.)
 * @param {string} type - The quiz level (e.g., 'quizes', 'oral', etc.)
 * @returns {Promise<Array>} Array of wrong answer question objects
 */
export async function loadWrongAnswers(qType, type) {
  try {
    const wrongAnswers = await loadAllTypeWrongAnswers(qType, type);
    console.log('Debug - wrongAnswers for', qType, type, ':', wrongAnswers);
    
    if (!wrongAnswers || Object.keys(wrongAnswers).length === 0) {
      console.log('Debug - No wrong answers found');
      return [];
    }

    // Load the quiz data to get the actual questions
    const quizData = await import('@/pages/data.json');
    const questions = [];
    
    // Get all quiz numbers for this type
    const quizNumbers = Object.keys(quizData.default[qType]?.[type] || {});
    console.log('Debug - Available quiz numbers:', quizNumbers);
    
    for (const quizNumber of quizNumbers) {
      const quizQuestions = quizData.default[qType][type][quizNumber];
      const wrongQuestionsObj = wrongAnswers[quizNumber] || {};
      console.log(`Debug - Quiz ${quizNumber} wrong answers:`, wrongQuestionsObj);
      
      if (Array.isArray(quizQuestions) && typeof wrongQuestionsObj === 'object') {
        // Add questions that have wrong answers
        Object.keys(wrongQuestionsObj).forEach((questionIndexStr) => {
          const questionIndex = parseInt(questionIndexStr);
          if (quizQuestions[questionIndex]) {
            questions.push({
              ...quizQuestions[questionIndex],
              _originalQuizNumber: quizNumber,
              _originalQuestionIndex: questionIndex,
              _wrongCount: wrongQuestionsObj[questionIndexStr],
            });
          }
        });
      }
    }
    
    console.log('Debug - Final questions array:', questions);
    return questions;
  } catch (error) {
    console.error('Error loading wrong answers:', error);
    return [];
  }
}

