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

export default function QuizTypePage() {
  const router = useRouter();
  const { qType, type } = router.query;

  const [isLoading, setIsLoading] = useState(true);
  const [numberOfSaved, setNumberOfSaved] = useState(0);
  const [numberOfWrong, setNumberOfWrong] = useState(0);
  const [lastScores, setLastScores] = useState({});

  useEffect(() => {
    if (!router.isReady || !qType || !type) return;

    const fetchStatistics = async () => {
      try {
        const [totalSaved, totalWrong, scoresObj] = await Promise.all([
          countAllBookmarks(qType, type),
          countAllWrongAnswers(qType, type),
          loadAllTypeScores(qType, type),
        ]);

        setNumberOfSaved(totalSaved);
        setNumberOfWrong(totalWrong);
        setLastScores(scoresObj || {});
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [router.isReady, qType, type]);

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

  if (!quizData[qType]) {
    return (
      <Container sx={{ textAlign: "center", py: 4 }}>
        <h1>404 - لا يوجد قسم بهذا الاسم في البيانات</h1>
        <p>
          qType: <strong>{qType}</strong> غير موجود.
        </p>
      </Container>
    );
  }

  if (!quizData[qType][type]) {
    return (
      <Container sx={{ textAlign: "center", py: 4 }}>
        <h1>404 - الصفحة غير موجودة</h1>
        <p>
          type: <strong>{type}</strong> غير موجود.
        </p>
      </Container>
    );
  }

  const quizNumbersObject = quizData[qType][type];
  const quizNumbers = Object.keys(quizNumbersObject);

  if (quizNumbers.length === 0) {
    return (
      <Container sx={{ textAlign: "center", py: 4 }}>
        <h1>لا يوجد امتحانات لهذه الفئة.</h1>
      </Container>
    );
  }

  const mapTypes = {
    private: qType === "cTeoria" ? "استكمالي" : "خصوصي",
    light: "شحن خفيف",
    heavy: "شحن ثقيل",
    taxi: "عمومي",
    motorcycle: "دراجة نارية",
    tractor: "تراكتور",
    quizes: "تدريب سياقة",
  };

  const friendlyType = mapTypes[type] || type;
  return (
    <>
      <SectionHero title={`أسئلة التؤوريا ${friendlyType}`} subTitle="" />
      <Container sx={{ py: "30px", overflow: "hidden" }}>
        <Box display="flex" justifyContent="center" mb={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(`/teoria/${qType}/${type}/random`)}
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
            path={`/teoria/${qType}/${type}/saved`}
            description={`عددها : ${numberOfSaved}`}
          />
          <StatisticsCard
            title="الأسئلة الأكثر خطأ"
            image="/images/incorrect.png"
            alt="صورة علامة الخطأ"
            path={`/teoria/${qType}/${type}/wrong`}
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
                  quizName={`أسئلة التؤوريا ${friendlyType}`}
                  quizNumber={quizNumber}
                  type={type}
                  qType={qType}
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
}

export async function getStaticPaths() {
  const qTypes = ["nTeoria", "cTeoria", "oral", "training"];
  const paths = [];

  qTypes.forEach((thisQType) => {
    const subTypes = Object.keys(quizData[thisQType] || {});
    subTypes.forEach((theType) => {
      paths.push({ params: { qType: thisQType, type: theType } });
    });
  });

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps() {
  return { props: {} };
}
