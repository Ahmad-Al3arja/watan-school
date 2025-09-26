"use client";
import React, { useState, useEffect } from "react";

import { useRouter } from "next/router";
import { Container, Grid, Box, Skeleton, Button } from "@mui/material";

import SectionHero from "@/components/layout/SectionHero";
import QuizCard from "@/components/ui/QuizCard";
import SkeletonQuizCard from "@/components/skeleton/SkeletonQuizCard";
import StatisticsCard from "@/components/ui/StatisticsCard";

import quizData from "@/pages/data.json";
import {
  countAllBookmarks,
  countAllWrongAnswers,
  loadAllTypeScores,
} from "@/components/util/quizStorage";

export default function PrivateOralPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [numberOfSaved, setNumberOfSaved] = useState(0);
  const [numberOfWrong, setNumberOfWrong] = useState(0);
  const [lastScores, setLastScores] = useState({});

  useEffect(() => {
    if (!router.isReady) return;

    const fetchStatistics = async () => {
      try {
        // Set default values first
        setNumberOfSaved(0);
        setNumberOfWrong(0);
        setLastScores({});
        
        // Try to load statistics, but don't fail if they don't exist
        try {
          const [totalSaved, totalWrong, scoresObj] = await Promise.all([
            countAllBookmarks("cTeoria", "private"),
            countAllWrongAnswers("cTeoria", "private"),
            loadAllTypeScores("cTeoria", "private"),
          ]);

          setNumberOfSaved(totalSaved || 0);
          setNumberOfWrong(totalWrong || 0);
          setLastScores(scoresObj || {});
        } catch (storageError) {
          console.warn("Storage functions failed, using defaults:", storageError);
          // Keep default values
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [router.isReady]);

  if (!router.isReady || isLoading) {
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

  if (!quizData.cTeoria || !quizData.cTeoria.private) {
    return (
      <Container sx={{ textAlign: "center", py: 4 }}>
        <h1>404 - لا يوجد قسم بهذا الاسم في البيانات</h1>
      </Container>
    );
  }

  const quizNumbersObject = quizData.cTeoria.private;
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
      <SectionHero title="أسئلة التؤوريا خصوصي شفوي" subTitle="" />
      <Container sx={{ py: "30px", overflow: "hidden" }}>
        <Box display="flex" justifyContent="center" mb={2} gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(`/teoria/cTeoria/private-oral/random`)}
            sx={{
              fontWeight: "700",
              p: "10px 20px",
              "&:hover": { backgroundColor: "var(--primary2)" },
            }}
          >
            اختبر نفسك
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => router.push(`/teoria/cTeoria/private-oral/comprehensive`)}
            sx={{
              fontWeight: "700",
              p: "10px 20px",
              backgroundColor: "#FF9800",
              "&:hover": { backgroundColor: "#F57C00" },
            }}
          >
            امتحان شامل
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
            path={`/teoria/cTeoria/private-oral/saved`}
            description={`عددها : ${numberOfSaved}`}
          />
          <StatisticsCard
            title="الأسئلة الأكثر خطأ"
            image="/images/incorrect.png"
            alt="صورة علامة الخطأ"
            path={`/teoria/cTeoria/private-oral/wrong`}
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
                  quizName="أسئلة التؤوريا خصوصي شفوي"
                  quizNumber={quizNumber}
                  type="private"
                  qType="cTeoria"
                  grade={grade}
                  total={total}
                  isOral={true}
                />
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </>
  );
}

export async function getStaticProps() {
  return { 
    props: {}
  };
}
