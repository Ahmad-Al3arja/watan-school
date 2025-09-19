import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { CircularProgress, Box, Container, Typography } from "@mui/material";

import Quiz from "@/components/ui/quizPage/Quiz";
import { useQuestions, useQuizData } from "@/hooks/useQuizData";

const TrainingQuizPage = () => {
  const router = useRouter();
  const { quizId } = router.query;
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: quizData, loading: dataLoading } = useQuizData();
  const { questions: quiz, loading: questionsLoading } = useQuestions('training', 'quizes', quizId);

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

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (!router.isReady || dataLoading || questionsLoading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!quiz || quiz.length === 0) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6">لم يتم العثور على أسئلة</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Quiz qType="training" type="quizes" quizNumber={quizId} quiz={quiz} quizData={quizData} />
  );
};

export default TrainingQuizPage;
