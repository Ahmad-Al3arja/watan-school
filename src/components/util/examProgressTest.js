// Test file for exam progress functionality
import {
  saveExamProgress,
  loadExamProgress,
  clearExamProgress,
  hasExamProgress,
  isProgressValid,
  isProgressRecent,
  getAllExamProgress
} from './quizStorage';

/**
 * Test the exam progress functionality
 */
export async function testExamProgress() {
  console.log('🧪 Testing Exam Progress Functionality...');

  const testQType = 'nTeoria';
  const testType = 'private';
  const testQuizNumber = '1';

  try {
    // Test 1: Clear any existing progress
    console.log('Test 1: Clearing existing progress...');
    await clearExamProgress(testQType, testType, testQuizNumber);

    // Test 2: Check if progress exists (should be false)
    console.log('Test 2: Checking for non-existent progress...');
    const hasProgress1 = await hasExamProgress(testQType, testType, testQuizNumber);
    console.log('Has progress (should be false):', hasProgress1);

    // Test 3: Save sample progress
    console.log('Test 3: Saving sample progress...');
    const sampleProgress = {
      currentIndex: 15,
      userAnswers: new Array(30).fill(null).map((_, i) =>
        i < 15 ? { answer: 'a', isCorrect: Math.random() > 0.5 } : null
      ),
      visited: Array.from({ length: 16 }, (_, i) => i), // 0-15
      timeLeft: 1800, // 30 minutes
      showAnswers: new Array(30).fill(false)
    };

    await saveExamProgress(
      testQType,
      testType,
      testQuizNumber,
      sampleProgress.currentIndex,
      sampleProgress.userAnswers,
      sampleProgress.visited,
      sampleProgress.timeLeft,
      sampleProgress.showAnswers
    );

    // Test 4: Check if progress exists (should be true)
    console.log('Test 4: Checking for existing progress...');
    const hasProgress2 = await hasExamProgress(testQType, testType, testQuizNumber);
    console.log('Has progress (should be true):', hasProgress2);

    // Test 5: Load the saved progress
    console.log('Test 5: Loading saved progress...');
    const loadedProgress = await loadExamProgress(testQType, testType, testQuizNumber);
    console.log('Loaded progress:', {
      currentIndex: loadedProgress.currentIndex,
      answeredQuestions: loadedProgress.userAnswers.filter(Boolean).length,
      timeLeft: loadedProgress.timeLeft,
      visited: loadedProgress.visited.length
    });

    // Test 6: Validate the progress
    console.log('Test 6: Validating progress...');
    const isValid = isProgressValid(loadedProgress, 30);
    const isRecent = isProgressRecent(loadedProgress);
    console.log('Is valid:', isValid);
    console.log('Is recent:', isRecent);

    // Test 7: Test invalid progress
    console.log('Test 7: Testing invalid progress validation...');
    const invalidProgress = { ...loadedProgress, currentIndex: 50 }; // Out of bounds
    const isInvalid = isProgressValid(invalidProgress, 30);
    console.log('Invalid progress should be false:', isInvalid);

    // Test 8: Get all progress
    console.log('Test 8: Getting all exam progress...');
    const allProgress = await getAllExamProgress();
    console.log('All progress entries:', Object.keys(allProgress).length);

    // Test 9: Clear progress
    console.log('Test 9: Clearing progress...');
    await clearExamProgress(testQType, testType, testQuizNumber);
    const hasProgress3 = await hasExamProgress(testQType, testType, testQuizNumber);
    console.log('Has progress after clearing (should be false):', hasProgress3);

    console.log('✅ All tests completed successfully!');

    return {
      success: true,
      message: 'All exam progress tests passed',
      details: {
        progressSaved: hasProgress2,
        progressLoaded: !!loadedProgress,
        validationWorks: isValid && !isInvalid,
        progressCleared: !hasProgress3
      }
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      message: 'Exam progress test failed',
      error: error.message
    };
  }
}

/**
 * Test random quiz progress functionality
 */
export async function testRandomQuizProgress() {
  console.log('🧪 Testing Random Quiz Progress Functionality...');

  const testQType = 'nTeoria';
  const testType = 'private';
  const testQuizNumber = 'random';

  try {
    // Test 1: Clear any existing progress
    console.log('Test 1: Clearing existing random quiz progress...');
    await clearExamProgress(testQType, testType, testQuizNumber);

    // Test 2: Create mock random quiz content
    console.log('Test 2: Creating mock random quiz content...');
    const mockRandomQuiz = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      question: `Random question ${i + 1}`,
      a: 'Option A',
      b: 'Option B',
      c: 'Option C',
      d: 'Option D',
      answer: 'a',
      _originalQuizNumber: Math.floor(i / 5) + 1,
      _originalQuestionIndex: i % 5
    }));

    // Test 3: Save random quiz progress
    console.log('Test 3: Saving random quiz progress...');
    const sampleProgress = {
      currentIndex: 12,
      userAnswers: new Array(30).fill(null).map((_, i) =>
        i < 12 ? { answer: 'a', isCorrect: Math.random() > 0.5 } : null
      ),
      visited: Array.from({ length: 13 }, (_, i) => i), // 0-12
      timeLeft: 1500, // 25 minutes
      showAnswers: new Array(30).fill(false)
    };

    await saveExamProgress(
      testQType,
      testType,
      testQuizNumber,
      sampleProgress.currentIndex,
      sampleProgress.userAnswers,
      sampleProgress.visited,
      sampleProgress.timeLeft,
      sampleProgress.showAnswers,
      mockRandomQuiz // Include quiz content for random quiz
    );

    // Test 4: Load the saved progress
    console.log('Test 4: Loading saved random quiz progress...');
    const loadedProgress = await loadExamProgress(testQType, testType, testQuizNumber);
    console.log('Loaded random quiz progress:', {
      currentIndex: loadedProgress.currentIndex,
      answeredQuestions: loadedProgress.userAnswers.filter(Boolean).length,
      timeLeft: loadedProgress.timeLeft,
      hasQuizContent: !!loadedProgress.quizContent,
      quizContentLength: loadedProgress.quizContent?.length
    });

    // Test 5: Validate random quiz progress
    console.log('Test 5: Validating random quiz progress...');
    const isValid = isProgressValid(loadedProgress, 30, true);
    const isRecent = isProgressRecent(loadedProgress);
    console.log('Random quiz progress is valid:', isValid);
    console.log('Random quiz progress is recent:', isRecent);

    // Test 6: Verify quiz content is preserved
    console.log('Test 6: Verifying quiz content preservation...');
    const quizContentMatches = loadedProgress.quizContent &&
      loadedProgress.quizContent.length === mockRandomQuiz.length &&
      loadedProgress.quizContent[0].question === mockRandomQuiz[0].question;
    console.log('Quiz content preserved correctly:', quizContentMatches);

    // Test 7: Clear progress
    console.log('Test 7: Clearing random quiz progress...');
    await clearExamProgress(testQType, testType, testQuizNumber);
    const hasProgress = await hasExamProgress(testQType, testType, testQuizNumber);
    console.log('Has progress after clearing (should be false):', hasProgress);

    console.log('✅ All random quiz tests completed successfully!');

    return {
      success: true,
      message: 'All random quiz progress tests passed',
      details: {
        progressSaved: !!loadedProgress,
        validationWorks: isValid,
        quizContentPreserved: quizContentMatches,
        progressCleared: !hasProgress
      }
    };

  } catch (error) {
    console.error('❌ Random quiz test failed:', error);
    return {
      success: false,
      message: 'Random quiz progress test failed',
      error: error.message
    };
  }
}

// Export for manual testing
export default testExamProgress;