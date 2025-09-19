import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Alert,
  IconButton
} from '@mui/material';
import { ArrowBack, BookmarkRemove, School } from '@mui/icons-material';

const SavedQuestionsPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Check if user has valid training token
    const token = localStorage.getItem('trainingToken');
    const expiry = localStorage.getItem('trainingTokenExpiry');

    if (token && expiry && Date.now() < parseInt(expiry)) {
      setIsAuthenticated(true);
      loadSavedQuestions();
    } else {
      router.push('/teoria/training');
      return;
    }

    setLoading(false);
  }, [router]);

  const loadSavedQuestions = async () => {
    try {
      // Load saved question IDs from localStorage
      const savedIds = JSON.parse(localStorage.getItem('trainingSavedQuestions') || '[]');

      if (savedIds.length === 0) {
        setSavedQuestions([]);
        return;
      }

      // Get all training questions
      const response = await fetch('/api/public/training-data');
      const data = await response.json();

      if (data.questions) {
        // Filter questions that are saved
        const saved = data.questions.filter(q => savedIds.includes(q.id));
        setSavedQuestions(saved);
      }
    } catch (error) {
      console.error('Error loading saved questions:', error);
      setSavedQuestions([]);
    }
  };

  const handleRemoveQuestion = (questionId) => {
    const savedIds = JSON.parse(localStorage.getItem('trainingSavedQuestions') || '[]');
    const updatedIds = savedIds.filter(id => id !== questionId);
    localStorage.setItem('trainingSavedQuestions', JSON.stringify(updatedIds));

    // Update the displayed questions
    setSavedQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleClearAll = () => {
    if (confirm('هل أنت متأكد من حذف جميع الأسئلة المحفوظة؟')) {
      localStorage.removeItem('trainingSavedQuestions');
      setSavedQuestions([]);
    }
  };

  const handleCreateQuiz = () => {
    // Create a quiz from saved questions
    if (savedQuestions.length === 0) {
      alert('لا توجد أسئلة محفوظة لإنشاء امتحان');
      return;
    }

    // Store the saved questions quiz in localStorage temporarily
    localStorage.setItem('tempSavedQuiz', JSON.stringify({
      title: 'امتحان الأسئلة المحفوظة',
      questions: savedQuestions
    }));

    router.push('/teoria/training/quizes/saved-quiz');
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>تحميل...</Typography>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/teoria/training/quizes')}
          sx={{ mr: 2 }}
        >
          العودة
        </Button>
        <Typography variant="h4" sx={{ flex: 1 }}>
          الأسئلة المحفوظة
        </Typography>
      </Box>

      {/* Stats and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" color="text.secondary">
          {savedQuestions.length} سؤال محفوظ
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {savedQuestions.length > 0 && (
            <>
              <Button
                variant="contained"
                onClick={handleCreateQuiz}
                startIcon={<School />}
              >
                إنشاء امتحان
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleClearAll}
              >
                حذف الكل
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Questions List */}
      {savedQuestions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              لا توجد أسئلة محفوظة
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              قم بحفظ الأسئلة المهمة أثناء حل الامتحانات لتتمكن من مراجعتها لاحقاً
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/teoria/training/quizes')}
            >
              ابدأ امتحان جديد
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {savedQuestions.map((question, index) => (
            <Card key={question.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {index + 1}. {question.text}
                  </Typography>
                  <IconButton
                    onClick={() => handleRemoveQuestion(question.id)}
                    color="error"
                    sx={{ ml: 2 }}
                  >
                    <BookmarkRemove />
                  </IconButton>
                </Box>

                {/* Options */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                  {question.options.map((option, optionIndex) => (
                    <Box
                      key={optionIndex}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: optionIndex === question.correctAnswer ? 'success.main' : 'divider',
                        borderRadius: 1,
                        backgroundColor: optionIndex === question.correctAnswer ? 'success.light' : 'transparent',
                        color: optionIndex === question.correctAnswer ? 'success.contrastText' : 'text.primary'
                      }}
                    >
                      <Typography>
                        {optionIndex === question.correctAnswer && '✓ '}
                        {option}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Explanation */}
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>التفسير:</strong> {question.explanation}
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default SavedQuestionsPage;