import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Typography, CircularProgress, Box } from "@mui/material";
import Quiz from "@/components/ui/quizPage/Quiz";
import quizData from "@/pages/data.json";
import { loadExamProgress, isProgressValid, isProgressRecent } from "@/components/util/quizStorage";

const RandomTrainingQuizPage = () => {
  const router = useRouter();
  const [randomQuiz, setRandomQuiz] = useState(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const generateRandomQuiz = () => {
    const quizzesByNumber = quizData.training.quizes;
    let allQuestions = [];
    // Attach original quiz number and question index to each question
    Object.entries(quizzesByNumber).forEach(([quizNumber, quizArray]) => {
      quizArray.forEach((question, index) => {
        allQuestions.push({
          ...question,
          _originalQuizNumber: quizNumber,
          _originalQuestionIndex: index,
        });
      });
    });
    // Shuffle using Fisher-Yates shuffle
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    // Select the first 30 questions (or all if there are less than 30)
    return allQuestions.slice(0, 30);
  };

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

    if (!quizData.training || !quizData.training.quizes) {
      setIsLoadingProgress(false);
      return;
    }

    // Check for existing progress first
    const initializeRandomQuiz = async () => {
      try {
        const savedProgress = await loadExamProgress('training', 'quizes', 'random');

        if (savedProgress &&
            savedProgress.quizContent &&
            isProgressValid(savedProgress, savedProgress.quizContent.length, true) &&
            isProgressRecent(savedProgress)) {

          // Found saved random quiz progress, using saved quiz content
          setRandomQuiz(savedProgress.quizContent);
        } else {
          // No valid saved progress, generating new random quiz
          const newRandomQuiz = generateRandomQuiz();
          setRandomQuiz(newRandomQuiz);
        }
      } catch (error) {
        console.error('Error initializing random quiz:', error);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    initializeRandomQuiz();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (isLoadingProgress) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!randomQuiz || randomQuiz.length === 0) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6">لا توجد أسئلة متاحة للامتحان العشوائي</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Quiz 
      qType="training" 
      type="quizes" 
      quizNumber="random" 
      quiz={randomQuiz} 
      quizData={quizData} 
    />
  );
};

export default RandomTrainingQuizPage;
