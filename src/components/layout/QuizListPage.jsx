import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SectionHero from "@/components/layout/SectionHero";
import QuizCard from "@/components/ui/QuizCard";
import SkeletonQuizCard from "@/components/skeleton/SkeletonQuizCard"; // Add this import
import { Container, Grid, Box, Skeleton } from "@mui/material"; // Add Skeleton import
import { useQuizData } from "@/hooks/useQuizData";
import StatisticsCard from "@/components/ui/StatisticsCard";
import {
  loadTypeBookmarks,
  loadTypeWrongAnswers,
  loadTypeScores,
} from "@/components/util/quizStorage";

export default function QuizTypePage({ qType }) {
  const params = useParams();
  const [type, setQuizType] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [numberOfSaved, setNumberOfSaved] = useState(0);
  const [numberOfWrong, setNumberOfWrong] = useState(0);
  const [lastScores, setLastScores] = useState({});

  const { data: quizData, loading: quizDataLoading } = useQuizData();

  useEffect(() => {
    if (params && params.type) {
      setQuizType(params.type);
    }
  }, [params]);

  useEffect(() => {
    if (!type) return;

    const fetchStatistics = async () => {
      try {
        const savedQuestions = await loadTypeBookmarks(type);
        const savedCount = Object.values(savedQuestions).reduce(
          (acc, arr) => acc + arr.length,
          0
        );
        setNumberOfSaved(savedCount);

        const wrongAnswers = await loadTypeWrongAnswers(type);
        const wrongCount = Object.keys(wrongAnswers).length;
        setNumberOfWrong(wrongCount);

        const scoresObj = await loadTypeScores(type);
        setLastScores(scoresObj);

        setIsLoading(false); // Update loading state when data is ready
      } catch (error) {
        // Error loading statistics or scores
        setIsLoading(false); // Ensure loading state is updated even if there's an error
      }
    };

    fetchStatistics();
  }, [type]);

  // Show skeletons while loading
  if (isLoading || quizDataLoading || !quizData) {
    return (
      <>
        <SectionHero title="تحميل..." subTitle="" />
        <Container
          sx={{
            paddingY: "30px",
            overflow: "hidden",
          }}
        >
          {/* Skeleton Statistics Cards */}
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

          {/* Skeleton Quiz Cards */}
          <Grid container spacing={3} justifyContent="right">
            {[1, 2, 3, 4].map((i) => (
              <Grid item key={i} xs={12} sm={6} md={4} lg={3} xl={3}>
                <SkeletonQuizCard />
              </Grid>
            ))}
          </Grid>
        </Container>
      </>
    );
  }

  // Existing validations
  if (!quizData?.[qType]?.[type]) {
    return <div>الصفحة غير موجودة</div>;
  }

  // Rest of your existing code...
  const quizNumbers = Object.keys(quizData[qType][type]);
  const mapTypes = {
    private: qType == "cTeoria" ? "استكمالي" : qType == "english_teoria" ? "Private License" : "خصوصي",
    light: qType == "english_teoria" ? "Light Truck License" : "شحن خفيف",
    heavy: qType == "english_teoria" ? "Heavy Truck License" : "شحن ثقيل",
    taxi: qType == "english_teoria" ? "Taxi License" : "عمومي",
    motorcycle: qType == "english_teoria" ? "Motorcycle License" : "دراجة نارية",
    tractor: qType == "english_teoria" ? "Tractor License" : "تراكتور",
  };
  return (
    <>
      <SectionHero title={qType == "english_teoria" ? `English Theory Questions - ${mapTypes[type]}` : `أسئلة تؤوريا ${mapTypes[type]}`} subTitle="" />
      <Container
        sx={{
          paddingY: "30px",
          overflow: "hidden",
        }}
      >
        {/* Statistics Cards - Now shown only when loaded */}
        <Box display="flex" justifyContent="center" mb={6} gap={1.4}>
          <StatisticsCard
            title={"الأسئلة المحفوظة"}
            image={"/images/bookmark.png"}
            path={`/teoria/${type}/saved`}
            description={`عددها : ${numberOfSaved}`}
          />
          <StatisticsCard
            title={"الأسئلة الأكثر خطأ"}
            image={"/images/incorrect.png"}
            path={`/teoria/${type}/wrong`}
            description={`عددها : ${numberOfWrong}`}
          />
        </Box>

        {/* Actual Quiz Cards - Now shown only when loaded */}
        <Grid container spacing={3} justifyContent="right">
          {quizNumbers.map((quizNumber) => {
            const scoreObj = lastScores[quizNumber] || {};
            const grade = scoreObj.grade || 0;
            const total = scoreObj.total || 0;

            return (
              <Grid item key={quizNumber} xs={12} sm={6} md={4} lg={3} xl={3}>
                <QuizCard
                  quizName={qType == "english_teoria" ? `English Theory - ${mapTypes[type]}` : `أسئلة تؤوريا ${mapTypes[type]}`}
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
