// components/ui/quizPage/OralQuiz.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, Button } from "@mui/material";
import { motion } from "framer-motion";
import { PlayArrow, Pause } from "@mui/icons-material";

import SectionHero from "@/components/layout/SectionHero";
import ProgressBar from "@/components/ui/quizPage/ProgressBar";
import TimeUpModal from "@/components/ui/quizPage/TimeUpModal";
import Score from "@/components/ui/quizPage/Score";
import QuestionComponent from "@/components/ui/quizPage/Question";
import QuestionNavigation from "@/components/ui/quizPage/QuestionNavigation";
import {
  recordWrongAnswerTypeLevel,
  recordLastScore,
} from "@/components/util/quizStorage";
import tts from "@/components/util/textToSpeech";

// 1) IMPORT your quizData. Adjust the path if needed
import quizData from "@/pages/data.json";

// 2) A small helper component to show a horizontally scrollable bar
function QuizNumbersBar({ qType, type, currentQuizNumber }) {
  const router = useRouter();

  // Hide the bar if we're on the "random" route
  if (currentQuizNumber === "random") return null;

  // Safely get all quiz numbers for this qType/type
  const quizNumbersObject = quizData[qType]?.[type];
  if (!quizNumbersObject) return null;

  // Turn the object keys (quiz numbers) into an array
  const quizNumbers = Object.keys(quizNumbersObject);

  return (
    <Box sx={{display: "flex", justifyContent: "center"}}>
      <Box
        sx={{
          overflowX: "auto",
          whiteSpace: "nowrap",
          display: "flex",
          gap: 0,
          px: 0,
          py: 1,
          mb: 2,
          // justifyContent: "center",
        }}
      >
        {quizNumbers.map((num) => (
          <Button
            key={num}
            variant={num === currentQuizNumber ? "contained" : "outlined"}
            onClick={() => router.push(`/teoria/${qType}/${type}-oral/${num}`)}
            sx={{
              minWidth: "50px",
              fontWeight: "bold",
              flexShrink: 0,
              borderRadius: 0,
            }}
          >
            {num}
          </Button>
        ))}
      </Box>
    </Box>
  );
}

// Memoize to prevent unnecessary re-renders
const MemoizedQuestion = React.memo(QuestionComponent);
const MemoizedNavigation = React.memo(QuestionNavigation);

export default function OralQuiz({ qType, type, quizNumber, quiz }) {
  const router = useRouter();
  const questionTitleRef = useRef(null);
  const headerHeight = 100;

  // Simple state management without progress persistence
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [visited, setVisited] = useState([0]);
  const [timeLeft, setTimeLeft] = useState(40 * 60);
  const [showAnswers, setShowAnswers] = useState([]);
  const [wrongRecordedQuestions, setWrongRecordedQuestions] = useState(new Set());
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [autoNext, setAutoNext] = useState(false);

  // Initialize state when quiz changes
  useEffect(() => {
    if (quiz && quiz.length > 0) {
      setCurrentIndex(0);
      setUserAnswers(Array(quiz.length).fill(null));
      setVisited([0]);
      setTimeLeft(40 * 60);
      setShowAnswers(Array(quiz.length).fill(false));
      setWrongRecordedQuestions(new Set());
      setScoreModalOpen(false);
      setModalOpen(false);
      setAutoNext(false);
    }
  }, [quiz]);

  // Mark current question as visited
  useEffect(() => {
    setVisited((prev) =>
      prev.includes(currentIndex) ? prev : [...prev, currentIndex]
    );
  }, [currentIndex]);

  // TTS specific states
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize TTS
  useEffect(() => {
    tts.setStateChangeCallback(setIsPlaying);
    return () => {
      tts.stop();
    };
  }, []);

  // Timer logic – counts down every second and shows "Time Up" modal when finished
  useEffect(() => {
    if (!quiz) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setModalOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz]);

  // TTS Functions
  const toggleAudio = async () => {
    const currentQuestion = quiz[currentIndex];
    if (currentQuestion) {
      const textToSpeak = `${currentQuestion.question} ${currentQuestion.a} ${currentQuestion.b || ''}`;
      await tts.toggle(textToSpeak);
    }
  };

  // Scroll the view so that the question is at the top - COMPLETELY DISABLED
  const scrollToQuestion = useCallback(() => {
    // COMPLETELY DISABLED - NO SCROLLING AT ALL
    return;
  }, []);

  // Evaluate quiz answers, record wrong, show final score
  const handleFinish = useCallback(async () => {
    const evaluatedAnswers = quiz.map((q, index) => {
      const userAnswer = userAnswers[index];
      return {
        answer: userAnswer?.answer || null,
        isCorrect: userAnswer?.answer === q.answer,
      };
    });

    setUserAnswers(evaluatedAnswers);

    // Record wrong answers
    const newWrongKeys = [];
    for (const [index, answer] of evaluatedAnswers.entries()) {
      const currentQuestion = quiz[index];
      const effectiveQuizNumber =
        quizNumber === "random"
          ? currentQuestion._originalQuizNumber
          : quizNumber;
      const effectiveQuestionIndex =
        quizNumber === "random"
          ? currentQuestion._originalQuestionIndex
          : index;
      const key = `${effectiveQuizNumber}-${effectiveQuestionIndex}`;
      if (!answer.isCorrect && !wrongRecordedQuestions.has(key)) {
        try {
          await recordWrongAnswerTypeLevel(
            qType,
            type,
            effectiveQuizNumber,
            effectiveQuestionIndex
          );
          newWrongKeys.push(key);
        } catch (err) {
          // Error recording wrong answer
        }
      }
    }
    setWrongRecordedQuestions((prev) => new Set([...prev, ...newWrongKeys]));

    // Calculate & record score
    const score = evaluatedAnswers.filter((a) => a.isCorrect).length;
    if (quizNumber !== "random") {
      await recordLastScore(qType, type, quizNumber, score, quiz.length);
    }
    setShowAnswers(Array(quiz.length).fill(true));
    setScoreModalOpen(true);
  }, [quiz, userAnswers, wrongRecordedQuestions, quizNumber, type, qType]);

  // Go to next question, or finish if this is the last
  const handleNext = useCallback(() => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // Removed scrollToQuestion() call to prevent jumping
      tts.stop();
    } else {
      setTimeout(() => {
        handleFinish();
      }, 0);
    }
  }, [currentIndex, quiz, scrollToQuestion, handleFinish]);

  // Go to previous question
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      // Removed scrollToQuestion() call to prevent jumping
      tts.stop();
    }
  }, [currentIndex, scrollToQuestion]);

  // When user selects an option
  const handleSelect = useCallback(
    (option) => {
      setUserAnswers((prev) => {
        const newAnswers = [...prev];
        const isCorrect = option === quiz[currentIndex].answer;
        newAnswers[currentIndex] = { answer: option, isCorrect };
        return newAnswers;
      });

      // Disabled autoNext to prevent jumping
      // if (autoNext && currentIndex < quiz.length - 1) {
      //   setTimeout(handleNext, 250);
      // }
    },
    [autoNext, currentIndex, quiz, handleNext]
  );

  // Check the answer & record wrong if needed
  const handleShowAnswer = useCallback(async () => {
    setShowAnswers((prev) => {
      const newShow = [...prev];
      newShow[currentIndex] = true;
      return newShow;
    });

    const answer = userAnswers[currentIndex];
    if (!answer) return;

    let effectiveQuizNumber = quizNumber;
    let effectiveQuestionIndex = currentIndex;

    if (quizNumber === "random") {
      const currentQuestion = quiz[currentIndex];
      effectiveQuizNumber = currentQuestion._originalQuizNumber;
      effectiveQuestionIndex = currentQuestion._originalQuestionIndex;
    }
    const key = `${effectiveQuizNumber}-${effectiveQuestionIndex}`;
    if (!answer.isCorrect && !wrongRecordedQuestions.has(key)) {
      try {
        await recordWrongAnswerTypeLevel(
          qType,
          type,
          effectiveQuizNumber,
          effectiveQuestionIndex
        );
        setWrongRecordedQuestions((prev) => new Set([...prev, key]));
      } catch (err) {
        // Error recording wrong answer
      }
    }
    // Disabled autoNext to prevent jumping
    // if (autoNext && currentIndex < quiz.length - 1) {
    //   setTimeout(handleNext, 250);
    // }
  }, [
    currentIndex,
    userAnswers,
    wrongRecordedQuestions,
    quizNumber,
    quiz,
    qType,
    type,
    autoNext,
    handleNext,
  ]);

  // Restart the quiz
  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setUserAnswers(Array(quiz.length).fill(null));
    setVisited([0]);
    setTimeLeft(40 * 60);
    setShowAnswers(Array(quiz.length).fill(false));
    setWrongRecordedQuestions(new Set());
    setScoreModalOpen(false);
    setModalOpen(false);
    setAutoNext(false);
  }, [quiz]);

  // Map type keys to user-friendly names
  const mapTypes = {
    private: "خصوصي",
    light: "شحن خفيف",
    heavy: "شحن ثقيل",
    taxi: "عمومي",
    motorcycle: "دراجة نارية",
    tractor: "تراكتور",
    quizes: "تدريب سياقة",
  };

  const isNumeric = !isNaN(quizNumber);

  // If for some reason there's no quiz data at all
  if (!quiz || quiz.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <h2>لا يوجد أسئلة لهذا الامتحان</h2>
      </Box>
    );
  }

  return (
    <>
      {/* MAIN HERO */}
      <SectionHero
        title={`أسئلة تؤوريا ${mapTypes[type]} شفوي (${
          isNumeric ? quizNumber : "إختبار"
        })`}
      />

      <QuizNumbersBar
        qType={qType}
        type={type}
        currentQuizNumber={quizNumber}
      />

      <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4, p: 2 }}>
        <ProgressBar
          questionTitleRef={questionTitleRef}
          answeredQuestions={userAnswers.filter(answer => answer !== null && answer !== undefined && answer.answer).length}
          total={quiz.length}
          timeLeft={timeLeft}
          autoNext={autoNext}
          setAutoNext={setAutoNext}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mt: 2
          }}
        >
          {/* Main Question Area */}
          <Box sx={{ flex: 2 }}>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {(() => {
                // If random, show underlying original quiz number/index
                const currentQ = quiz[currentIndex];
                const effectiveQuizNumber =
                  quizNumber === "random"
                    ? currentQ._originalQuizNumber
                    : quizNumber;
                const effectiveQuestionIndex =
                  quizNumber === "random"
                    ? currentQ._originalQuestionIndex
                    : currentIndex;

                return (
                  <MemoizedQuestion
                    question={currentQ.question}
                    options={{
                      a: currentQ.a,
                      b: currentQ.b,
                      c: currentQ.c,
                      d: currentQ.d,
                    }}
                    correctAnswer={currentQ.answer}
                    userAnswer={userAnswers[currentIndex]?.answer}
                    showAnswer={showAnswers[currentIndex]}
                    questionNumber={currentIndex + 1}
                    type={type}
                    qType={qType}
                    quizNumber={effectiveQuizNumber}
                    questionIndex={effectiveQuestionIndex}
                    onSelect={handleSelect}
                  />
                );
              })()}
            </motion.div>

            {/* TTS Button - added for oral questions */}
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                variant="contained"
                startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                onClick={toggleAudio}
                sx={{
                  backgroundColor: "#87CEEB",
                  color: "white",
                  "&:hover": { backgroundColor: "#5ebbe0" },
                  fontWeight: "700",
                }}
              >
                {isPlaying ? "إيقاف الصوت" : "تشغيل السؤال"}
              </Button>
            </Box>

            {/* Navigation Controls */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
                mt: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                sx={{
                  fontWeight: 800,
                  color: "white",
                  bgcolor: "#737373",
                  "&:hover": { backgroundColor: "#5c5c5c" },
                }}
              >
                السابق
              </Button>

              <Button
                variant="contained"
                color="secondary"
                sx={{
                  fontWeight: "700",
                  bgcolor: "#87CEEB",
                  color: "white",
                  "&:hover": { bgcolor: "#5ebbe0" },
                }}
                onClick={handleShowAnswer}
                disabled={showAnswers[currentIndex]}
              >
                التحقق من الإجابة
              </Button>

              <Button
                variant="contained"
                color={currentIndex === quiz.length - 1 ? "success" : "primary"}
                sx={{
                  fontWeight: 800,
                  color: "white",
                  p: "10px 20px",
                  "&:hover": { backgroundColor: "#a37729" },
                }}
                onClick={handleNext}
              >
                {currentIndex < quiz.length - 1 ? "التالي" : "إنهاء"}
              </Button>
            </Box>
          </Box>

          {/* Side Navigation */}
          <Box sx={{ flex: 1 }}>
            <MemoizedNavigation
              totalQuestions={quiz.length}
              currentIndex={currentIndex}
              userAnswers={userAnswers}
              visited={visited}
              showAnswers={showAnswers}
              onNavigate={(index) => {
                setCurrentIndex(index);
                // Removed scrollToQuestion() call to prevent jumping
                tts.stop();
              }}
            />
          </Box>
        </Box>


        {/* Time Up Modal */}
        <TimeUpModal
          open={modalOpen}
          onContinue={() => setModalOpen(false)}
          onFinish={handleFinish}
        />

        {/* Score Modal */}
        <Score
          open={scoreModalOpen}
          score={userAnswers.filter((a) => a?.isCorrect).length}
          total={quiz.length}
          onRestart={handleRestart}
          onClose={() => setScoreModalOpen(false)}
        />
      </Box>
    </>
  );
}
