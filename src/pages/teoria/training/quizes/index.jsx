import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Grid, Box, Skeleton, Button } from '@mui/material';

import SectionHero from '@/components/layout/SectionHero';
import QuizCard from '@/components/ui/QuizCard';
import SkeletonQuizCard from '@/components/skeleton/SkeletonQuizCard';
import StatisticsCard from '@/components/ui/StatisticsCard';
import { useQuizData } from '@/hooks/useQuizData';

import {
  countAllBookmarks,
  countAllWrongAnswers,
  loadAllTypeScores,
} from '@/components/util/quizStorage';

const TrainingQuizesPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [numberOfSaved, setNumberOfSaved] = useState(0);
  const [numberOfWrong, setNumberOfWrong] = useState(0);
  const [lastScores, setLastScores] = useState({});
  const router = useRouter();

  const { data: quizData, loading: quizDataLoading } = useQuizData();

  const fetchStatistics = async () => {
    try {
      const [totalSaved, totalWrong, scoresObj] = await Promise.all([
        countAllBookmarks('training', 'quizes'),
        countAllWrongAnswers('training', 'quizes'),
        loadAllTypeScores('training', 'quizes'),
      ]);

      setNumberOfSaved(totalSaved);
      setNumberOfWrong(totalWrong);
      setLastScores(scoresObj || {});
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    // Check if user has valid training token
    const token = localStorage.getItem('trainingToken');
    const expiry = localStorage.getItem('trainingTokenExpiry');

    if (token && expiry && Date.now() < parseInt(expiry)) {
      setIsAuthenticated(true);
      // Load statistics when authenticated
      fetchStatistics();
    } else {
      // Redirect to training section for authentication
      router.push('/teoria/training');
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading || quizDataLoading || !quizData) {
    return (
      <>
        <SectionHero title="تحميل..." subTitle="" />
        <Container sx={{ py: "30px", overflow: "hidden" }}>
          <Box display="flex" justifyContent="center" mb={6} gap={1.4}>
            {[1, 2].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={200}
                height={120}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
          <Grid container spacing={3} justifyContent="right">
            {[1, 2, 3, 4].map((i) => (
              <Grid item key={i} xs={12} sm={6} md={4} lg={3}>
                <SkeletonQuizCard />
              </Grid>
            ))}
          </Grid>
        </Container>
      </>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (!quizData.training || !quizData.training.quizes) {
    return (
      <Container sx={{ textAlign: "center", py: 4 }}>
        <h1>لا يوجد امتحانات تدريب متاحة حالياً.</h1>
      </Container>
    );
  }

  const quizNumbersObject = quizData.training.quizes;
  const quizNumbers = Object.keys(quizNumbersObject);

  if (quizNumbers.length === 0) {
    return (
      <Container sx={{ textAlign: "center", py: 4 }}>
        <h1>لا يوجد امتحانات لهذه الفئة.</h1>
      </Container>
    );
  }

  return (
    <>
      <SectionHero title="أسئلة التؤوريا تدريب سياقة" subTitle="" />
      <Container sx={{ py: "30px", overflow: "hidden" }}>
        <Box display="flex" justifyContent="center" mb={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/teoria/training/quizes/random')}
            sx={{
              fontWeight: "700",
              p: "10px 20px",
              "&:hover": { backgroundColor: "var(--primary2)" },
            }}
          >
            اختبر نفسك
          </Button>
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          mb={6}
          gap={1.4}
        >
          <StatisticsCard
            title="الأسئلة المحفوظة"
            image="/images/bookmark.png"
            alt="صورة علامة الحفظ"
            path="/teoria/training/quizes/saved"
            description={`عددها : ${numberOfSaved}`}
          />
          <StatisticsCard
            title="الأسئلة الأكثر خطأ"
            image="/images/incorrect.png"
            alt="صورة علامة الخطأ"
            path="/teoria/training/quizes/wrong"
            description={`عددها : ${numberOfWrong}`}
          />
        </Box>
        <Grid container spacing={3} justifyContent="right">
          {quizNumbers.map((quizNumber) => {
            const quizDataForNumber = quizNumbersObject[quizNumber];
            if (!quizDataForNumber) {
              console.warn(
                `Skipping quiz #${quizNumber}: data is null/undefined.`
              );
              return null;
            }
            const scoreObj = lastScores[quizNumber] || {};
            const { grade = 0, total = 0 } = scoreObj;
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={quizNumber}>
                <QuizCard
                  quizName="أسئلة التؤوريا تدريب سياقة"
                  quizNumber={quizNumber}
                  type="quizes"
                  qType="training"
                  grade={grade}
                  total={total}
                />
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </>
  );
};

export default TrainingQuizesPage;