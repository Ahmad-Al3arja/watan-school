import React from "react";
import { useRouter } from "next/router";
import { CircularProgress, Box, Container, Typography } from "@mui/material";

import Quiz from "@/components/ui/quizPage/Quiz";
import { useQuestions, useQuizData } from "@/hooks/useQuizData";

const QuizPage = () => {
  const router = useRouter();
  const { qType, type, quizNumber } = router.query;

  const { data: quizData, loading: dataLoading } = useQuizData();
  const { questions: quiz, loading: questionsLoading } = useQuestions(qType, type, quizNumber);

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
    <Quiz qType={qType} type={type} quizNumber={quizNumber} quiz={quiz} quizData={quizData} />
  );
};

export default QuizPage;

export async function getStaticPaths() {
  // Use fallback: 'blocking' to allow dynamic generation of new exams
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps() {
  return { props: {} };
}

