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
  DialogActions,
  TextField
} from '@mui/material';
import { ArrowBack, Bookmark, BookmarkBorder, Shuffle } from '@mui/icons-material';

const RandomTrainingQuizPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [savedQuestions, setSavedQuestions] = useState(new Set());
  const [showResults, setShowResults] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [questionCount, setQuestionCount] = useState(20);
  const router = useRouter();

  useEffect(() => {
    // Check if user has valid training token
    const token = localStorage.getItem('trainingToken');
    const expiry = localStorage.getItem('trainingTokenExpiry');

    if (token && expiry && Date.now() < parseInt(expiry)) {
      setIsAuthenticated(true);
    } else {
      router.push('/teoria/training');
      return;
    }

    setLoading(false);
  }, [router]);

  const generateRandomQuiz = async () => {
    try {
      const response = await fetch(`/api/public/training-data?random=true&limit=${questionCount}`);
      const data = await response.json();

      if (data.questions && data.questions.length > 0) {
        setQuizData({
          title: `امتحان عشوائي - ${data.questions.length} سؤال`,
          questions: data.questions
        });

        setShowSetup(false);
        setCurrentQuestion(0);
        setAnswers({});
      } else {
        alert('لا توجد أسئلة تدريب متاحة');
      }
    } catch (error) {
      console.error('Error generating random quiz:', error);
      alert('حدث خطأ في تحميل الأسئلة');
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

  if (!isAuthenticated) {
    return null;
  }

  // Setup Dialog
  if (showSetup) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Shuffle sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                امتحان عشوائي
              </Typography>
              <Typography variant="body1" color="text.secondary">
                اختر عدد الأسئلة لإنشاء امتحان عشوائي من مجموعة أسئلة التدريب
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="عدد الأسئلة"
              type="number"
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 20)))}
              inputProps={{ min: 1, max: 50 }}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => router.push('/teoria/training/quizes')}
                sx={{ flex: 1 }}
              >
                إلغاء
              </Button>
              <Button
                variant="contained"
                onClick={generateRandomQuiz}
                sx={{ flex: 1 }}
              >
                ابدأ الامتحان
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (!quizData) {
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
        <DialogTitle textAlign="center">نتائج الامتحان العشوائي</DialogTitle>
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
                        ? 'أداء ممتاز! استمر في التدريب'
                        : 'تحتاج إلى مزيد من المراجعة'}
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
              setShowSetup(true);
            }}
          >
            امتحان عشوائي جديد
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RandomTrainingQuizPage;