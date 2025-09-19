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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ArrowBack, Bookmark, BookmarkBorder } from '@mui/icons-material';

const TrainingQuizPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [savedQuestions, setSavedQuestions] = useState(new Set());
  const [showResults, setShowResults] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const router = useRouter();
  const { quizId } = router.query;

  useEffect(() => {
    // Check if user has valid training token
    const token = localStorage.getItem('trainingToken');
    const expiry = localStorage.getItem('trainingTokenExpiry');

    if (token && expiry && Date.now() < parseInt(expiry)) {
      setIsAuthenticated(true);
      loadQuizData();
    } else {
      router.push('/teoria/training');
      return;
    }

    setLoading(false);
  }, [router, quizId]);

  const loadQuizData = async () => {
    try {
      const response = await fetch(`/api/public/training-data?quizId=${quizId}`);
      const data = await response.json();

      if (data.questions && data.questions.length > 0) {
        const quiz = {
          id: quizId,
          title: `امتحان تدريب ${quizId}`,
          questions: data.questions
        };
        setQuizData(quiz);
      } else {
        console.error('No questions found for quiz:', quizId);
        // Fallback or redirect to quiz list
        router.push('/teoria/training/quizes');
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
      router.push('/teoria/training/quizes');
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestion]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSaveQuestion = () => {
    const questionId = quizData.questions[currentQuestion].id;
    const newSaved = new Set(savedQuestions);

    if (newSaved.has(questionId)) {
      newSaved.delete(questionId);
    } else {
      newSaved.add(questionId);
    }

    setSavedQuestions(newSaved);

    // In production, save to localStorage or API
    localStorage.setItem('trainingSavedQuestions', JSON.stringify([...newSaved]));
  };

  const handleFinishQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: quizData.questions.length,
      percentage: Math.round((correct / quizData.questions.length) * 100)
    };
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>تحميل...</Typography>
      </Container>
    );
  }

  if (!isAuthenticated || !quizData) {
    return null;
  }

  const currentQ = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;
  const isQuestionSaved = savedQuestions.has(currentQ.id);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/teoria/training/quizes')}
          sx={{ mr: 2 }}
        >
          العودة
        </Button>
        <Typography variant="h5" sx={{ flex: 1 }}>
          {quizData.title}
        </Typography>
      </Box>

      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">
            السؤال {currentQuestion + 1} من {quizData.questions.length}
          </Typography>
          <Typography variant="body2">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} />
      </Box>

      {/* Question Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              {currentQ.text}
            </Typography>
            <Button
              onClick={handleSaveQuestion}
              sx={{ minWidth: 'auto', ml: 2 }}
            >
              {isQuestionSaved ? <Bookmark color="primary" /> : <BookmarkBorder />}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {currentQ.options.map((option, index) => (
              <Button
                key={index}
                variant={answers[currentQuestion] === index ? 'contained' : 'outlined'}
                onClick={() => handleAnswerSelect(index)}
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'right',
                  py: 2
                }}
              >
                {option}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
        >
          السؤال السابق
        </Button>

        <Typography variant="body2" color="text.secondary">
          {Object.keys(answers).length} / {quizData.questions.length} تم الإجابة عليها
        </Typography>

        {currentQuestion === quizData.questions.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleFinishQuiz}
            color="success"
          >
            إنهاء الامتحان
          </Button>
        ) : (
          <Button
            onClick={handleNextQuestion}
            variant="contained"
          >
            السؤال التالي
          </Button>
        )}
      </Box>

      {/* Results Dialog */}
      <Dialog open={showResults} maxWidth="sm" fullWidth>
        <DialogTitle textAlign="center">نتائج الامتحان</DialogTitle>
        <DialogContent>
          {showResults && (
            <Box sx={{ textAlign: 'center' }}>
              {(() => {
                const score = calculateScore();
                return (
                  <>
                    <Typography variant="h3" color="primary" gutterBottom>
                      {score.percentage}%
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {score.correct} من {score.total} إجابات صحيحة
                    </Typography>
                    <Alert
                      severity={score.percentage >= 70 ? 'success' : 'warning'}
                      sx={{ mt: 2 }}
                    >
                      {score.percentage >= 70
                        ? 'مبروك! لقد نجحت في الامتحان'
                        : 'تحتاج إلى مزيد من الدراسة'}
                    </Alert>
                  </>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => router.push('/teoria/training/quizes')}
            variant="contained"
          >
            العودة للامتحانات
          </Button>
          <Button
            onClick={() => {
              setShowResults(false);
              setCurrentQuestion(0);
              setAnswers({});
            }}
          >
            إعادة الامتحان
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TrainingQuizPage;