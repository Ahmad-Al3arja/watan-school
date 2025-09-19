import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { Container, Typography, CircularProgress } from "@mui/material";
import Quiz from "@/components/ui/quizPage/Quiz"; // Reusing the extracted component
import quizData from "@/pages/data.json";
import { loadExamProgress, isProgressValid, isProgressRecent } from "@/components/util/quizStorage";

const RandomQuizPage = () => {
  const router = useRouter();
  const { qType, type } = router.query;
  const [randomQuiz, setRandomQuiz] = useState(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const generateRandomQuiz = () => {
    const quizzesByNumber = quizData[qType][type];
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
    if (!router.isReady || !qType || !type) return;

    if (!quizData[qType] || !quizData[qType][type]) {
      setIsLoadingProgress(false);
      return;
    }

    // Check for existing progress first
    const initializeRandomQuiz = async () => {
      try {
        const savedProgress = await loadExamProgress(qType, type, 'random');

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
        // Error loading random quiz progress
        const newRandomQuiz = generateRandomQuiz();
        setRandomQuiz(newRandomQuiz);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    initializeRandomQuiz();
  }, [router.isReady, qType, type]);

  if (!router.isReady || isLoadingProgress || !randomQuiz) {
    return (
        <Container sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {isLoadingProgress ? 'جاري التحقق من التقدم المحفوظ...' : 'جاري إنشاء الامتحان ...'}
          </Typography>
        </Container>
    );
  }

  // Callback to update quiz content when resuming random quiz
  const handleQuizContentUpdate = (newQuizContent) => {
    // Updating random quiz content from saved progress
    setRandomQuiz(newQuizContent);
  };

  return (
      <Quiz
        qType={qType}
        type={type}
        quizNumber="random"
        quiz={randomQuiz}
        onQuizContentUpdate={handleQuizContentUpdate}
      />
  );
};

export default RandomQuizPage;
