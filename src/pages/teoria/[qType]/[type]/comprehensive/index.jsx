import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { Container, Typography, CircularProgress } from "@mui/material";
import Quiz from "@/components/ui/quizPage/Quiz";
import quizData from "@/pages/data.json";
import { loadExamProgress, isProgressValid, isProgressRecent } from "@/components/util/quizStorage";

const ComprehensiveQuizPage = () => {
  const router = useRouter();
  const { qType, type } = router.query;
  const [comprehensiveQuiz, setComprehensiveQuiz] = useState(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  const generateComprehensiveQuiz = () => {
    const quizzesByNumber = quizData[qType][type];
    let allQuestions = [];
    
    // Collect ALL questions from ALL exams in order
    Object.entries(quizzesByNumber).forEach(([quizNumber, quizArray]) => {
      quizArray.forEach((question, index) => {
        allQuestions.push({
          ...question,
          _originalQuizNumber: quizNumber,
          _originalQuestionIndex: index,
        });
      });
    });
    
    // Return ALL questions (no shuffling, no limiting)
    return allQuestions;
  };

  useEffect(() => {
    if (!router.isReady || !qType || !type) return;

    if (!quizData[qType] || !quizData[qType][type]) {
      setIsLoadingProgress(false);
      return;
    }

    // Check for existing progress first
    const initializeComprehensiveQuiz = async () => {
      try {
        const savedProgress = await loadExamProgress(qType, type, 'comprehensive');

        if (savedProgress &&
            savedProgress.quizContent &&
            isProgressValid(savedProgress, savedProgress.quizContent.length, true) &&
            isProgressRecent(savedProgress)) {

          // Found saved comprehensive quiz progress, using saved quiz content
          setComprehensiveQuiz(savedProgress.quizContent);
        } else {
          // No valid saved progress, generating new comprehensive quiz
          const newComprehensiveQuiz = generateComprehensiveQuiz();
          setComprehensiveQuiz(newComprehensiveQuiz);
        }
      } catch (error) {
        // Error loading comprehensive quiz progress
        const newComprehensiveQuiz = generateComprehensiveQuiz();
        setComprehensiveQuiz(newComprehensiveQuiz);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    initializeComprehensiveQuiz();
  }, [router.isReady, qType, type]);

  if (!router.isReady || isLoadingProgress || !comprehensiveQuiz) {
    return (
        <Container sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {isLoadingProgress ? 'جاري التحقق من التقدم المحفوظ...' : 'جاري إنشاء الامتحان الشامل...'}
          </Typography>
        </Container>
    );
  }

  // Callback to update quiz content when resuming comprehensive quiz
  const handleQuizContentUpdate = (newQuizContent) => {
    // Updating comprehensive quiz content from saved progress
    setComprehensiveQuiz(newQuizContent);
  };

  return (
      <Quiz
        qType={qType}
        type={type}
        quizNumber="comprehensive"
        quiz={comprehensiveQuiz}
        onQuizContentUpdate={handleQuizContentUpdate}
      />
  );
};

export default ComprehensiveQuizPage;
