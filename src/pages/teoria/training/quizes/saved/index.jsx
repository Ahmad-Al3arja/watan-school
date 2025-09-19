import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Typography, Box, CircularProgress } from "@mui/material";
import Quiz from "@/components/ui/quizPage/Quiz";
import { loadSavedQuestions } from "@/components/util/quizStorage";

const SavedTrainingQuestionsPage = () => {
  const router = useRouter();
  const [savedQuestions, setSavedQuestions] = useState([]);
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

    const loadSaved = async () => {
      try {
        const saved = await loadSavedQuestions('training', 'quizes');
        setSavedQuestions(saved || []);
      } catch (error) {
        console.error('Error loading saved questions:', error);
        setSavedQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSaved();
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

  if (!savedQuestions || savedQuestions.length === 0) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6">لا توجد أسئلة محفوظة</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            قم بحفظ بعض الأسئلة أولاً من خلال الامتحانات
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Quiz 
      qType="training" 
      type="quizes" 
      quizNumber="saved" 
      quiz={savedQuestions} 
      quizData={{ training: { quizes: { saved: savedQuestions } } }} 
    />
  );
};

export default SavedTrainingQuestionsPage;
