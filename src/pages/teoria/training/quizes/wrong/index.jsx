import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Typography, Box, CircularProgress } from "@mui/material";
import Quiz from "@/components/ui/quizPage/Quiz";
import { loadWrongAnswers } from "@/components/util/quizStorage";

const WrongTrainingQuestionsPage = () => {
  const router = useRouter();
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('trainingToken');
    const expiry = localStorage.getItem('trainingTokenExpiry');

    if (!token || !expiry || Date.now() >= parseInt(expiry)) {
      router.push('/teoria/training');
      return;
    }

    setIsAuthenticated(true);
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadWrong = async () => {
      try {
        const wrong = await loadWrongAnswers('training', 'quizes');
        setWrongQuestions(wrong || []);
      } catch (error) {
        console.error('Error loading wrong answers:', error);
        setWrongQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadWrong();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!wrongQuestions || wrongQuestions.length === 0) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6">لا توجد أسئلة خاطئة</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            قم بحل بعض الامتحانات أولاً لترى الأسئلة التي أخطأت فيها
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Quiz 
      qType="training" 
      type="quizes" 
      quizNumber="wrong" 
      quiz={wrongQuestions} 
      quizData={{ training: { quizes: { wrong: wrongQuestions } } }} 
    />
  );
};

export default WrongTrainingQuestionsPage;
