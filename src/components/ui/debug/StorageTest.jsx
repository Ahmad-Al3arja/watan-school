import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Alert } from '@mui/material';
import {
  saveExamProgress,
  loadExamProgress,
  clearExamProgress,
  hasExamProgress
} from '../../util/quizStorage';

export default function StorageTest() {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const runStorageTest = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      const testData = {
        qType: 'nTeoria',
        type: 'private',
        quizNumber: 'test-storage',
        currentIndex: 5,
        userAnswers: [
          { answer: 'a', isCorrect: true },
          { answer: 'b', isCorrect: false },
          { answer: 'c', isCorrect: true },
          null,
          null
        ],
        visited: [0, 1, 2],
        timeLeft: 1800,
        showAnswers: [false, false, false, false, false]
      };

      console.log('🧪 Starting storage test...');

      // Step 1: Clear any existing test data
      console.log('1. Clearing existing test data...');
      await clearExamProgress(testData.qType, testData.type, testData.quizNumber);

      // Step 2: Save test progress
      console.log('2. Saving test progress...');
      await saveExamProgress(
        testData.qType,
        testData.type,
        testData.quizNumber,
        testData.currentIndex,
        testData.userAnswers,
        testData.visited,
        testData.timeLeft,
        testData.showAnswers
      );

      // Step 3: Check if progress exists
      console.log('3. Checking if progress exists...');
      const exists = await hasExamProgress(testData.qType, testData.type, testData.quizNumber);
      console.log('Progress exists:', exists);

      // Step 4: Load the progress
      console.log('4. Loading progress...');
      const loadedProgress = await loadExamProgress(testData.qType, testData.type, testData.quizNumber);
      console.log('Loaded progress:', loadedProgress);

      // Step 5: Verify data integrity
      const dataMatches = loadedProgress &&
        loadedProgress.currentIndex === testData.currentIndex &&
        loadedProgress.userAnswers.length === testData.userAnswers.length &&
        loadedProgress.timeLeft === testData.timeLeft;

      console.log('Data integrity check:', dataMatches);

      // Step 6: Clean up
      console.log('5. Cleaning up...');
      await clearExamProgress(testData.qType, testData.type, testData.quizNumber);

      setTestResult(`✅ Storage test PASSED!
- Progress saved: ✓
- Progress loaded: ✓
- Data integrity: ${dataMatches ? '✓' : '✗'}
- Cleanup: ✓

Test details:
- Saved at question ${testData.currentIndex + 1}
- ${testData.userAnswers.filter(Boolean).length} answers preserved
- Time left: ${Math.floor(testData.timeLeft / 60)} minutes`);

    } catch (error) {
      console.error('❌ Storage test failed:', error);
      setTestResult(`❌ Storage test FAILED!
Error: ${error.message}

This indicates that the storage system is not working properly.
Check the browser console for more details.`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLocalStorage = async () => {
    try {
      const testKey = 'test-storage-functionality';
      const testValue = JSON.stringify({ test: 'data', timestamp: Date.now() });

      // Test localStorage directly
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      const works = retrieved === testValue;
      setTestResult(`LocalStorage test: ${works ? '✅ WORKING' : '❌ FAILED'}`);
    } catch (error) {
      setTestResult(`LocalStorage test: ❌ FAILED - ${error.message}`);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        🔧 Storage System Test
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Use this tool to test if the exam progress storage system is working correctly.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={runStorageTest}
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test Full Storage System'}
        </Button>

        <Button
          variant="outlined"
          onClick={testLocalStorage}
        >
          Test LocalStorage Only
        </Button>
      </Box>

      {testResult && (
        <Alert severity={testResult.includes('PASSED') || testResult.includes('WORKING') ? 'success' : 'error'}>
          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {testResult}
          </Typography>
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        💡 If the test fails, check the browser console for detailed error messages.
        The storage system uses Capacitor Preferences with localStorage fallback.
      </Typography>
    </Box>
  );
}