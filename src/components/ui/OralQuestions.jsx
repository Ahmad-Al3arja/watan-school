import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import ProgressBar from "@/components/ui/quizPage/ProgressBar";
import QuestionComponent from "@/components/ui/quizPage/Question";
import QuestionNavigation from "@/components/ui/quizPage/QuestionNavigation";
import { typesData } from "@/components/data/typesData";
import { useQuizData } from "@/hooks/useQuizData";

// Quiz Numbers Bar Component (same as cTeoria)
function QuizNumbersBar({ selectedType, currentQuizNumber, onQuizNumberChange, quizData }) {
  if (!selectedType || currentQuizNumber === "random") return null;

  const cTeoriaData = quizData?.cTeoria?.[selectedType];
  const quizNumbers = cTeoriaData ? Object.keys(cTeoriaData).sort((a, b) => a - b) : [];

  return (
    <Box sx={{ mb: 2, textAlign: "center" }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        اختر رقم الامتحان:
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
        {quizNumbers.map((number) => (
          <Button
            key={number}
            variant={currentQuizNumber === number ? "contained" : "outlined"}
            onClick={() => onQuizNumberChange(number)}
            sx={{
              minWidth: 40,
              fontWeight: currentQuizNumber === number ? 700 : 500,
            }}
          >
            {number}
          </Button>
        ))}
      </Box>
    </Box>
  );
}

// Memoize components to prevent unnecessary re-renders
const MemoizedQuestion = React.memo(QuestionComponent);
const MemoizedNavigation = React.memo(QuestionNavigation);

export default function OralQuestions() {
  const router = useRouter();
  const questionTitleRef = useRef(null);
  const headerHeight = 100;

  // Fetch quiz data from Supabase
  const { data: quizData, loading: quizDataLoading } = useQuizData();

  // State management (same as cTeoria)
  const [selectedType, setSelectedType] = useState(null);
  const [currentQuizNumber, setCurrentQuizNumber] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [visited, setVisited] = useState([]);
  const [showAnswers, setShowAnswers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Load questions when type or quiz number changes
  useEffect(() => {
    if (!selectedType || !currentQuizNumber || !quizData) return;

    const cTeoriaData = quizData.cTeoria?.[selectedType];
    if (cTeoriaData && cTeoriaData[currentQuizNumber]) {
      const quizQuestions = cTeoriaData[currentQuizNumber];
      setQuiz(quizQuestions);
      setUserAnswers(Array(quizQuestions.length).fill(null));
      setVisited([0]);
      setShowAnswers(Array(quizQuestions.length).fill(false));
      setCurrentIndex(0);
    }
  }, [selectedType, currentQuizNumber, quizData]);

  // Mark current question as visited
  useEffect(() => {
    setVisited((prev) =>
      prev.includes(currentIndex) ? prev : [...prev, currentIndex]
    );
  }, [currentIndex]);

  // TTS Functions
  const speakText = (text) => {
    if (!speechSynthesis) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopSpeech();
    } else {
      const currentQuestion = quiz[currentIndex];
      if (currentQuestion) {
        const textToSpeak = `${currentQuestion.question} ${currentQuestion.a} ${currentQuestion.b || ''}`;
        speakText(textToSpeak);
      }
    }
  };

  // Navigation functions (same as cTeoria) - COMPLETELY DISABLED
  const scrollToQuestion = useCallback(() => {
    // COMPLETELY DISABLED - NO SCROLLING AT ALL
    return;
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      // Removed setTimeout(scrollToQuestion, 100) to prevent jumping
    }
  }, [currentIndex, quiz.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      // Removed setTimeout(scrollToQuestion, 100) to prevent jumping
    }
  }, [currentIndex]);

  const handleQuizNumberChange = useCallback((number) => {
    setCurrentQuizNumber(number);
    stopSpeech();
  }, [stopSpeech]);

  const handleAnswerSelect = useCallback((answer) => {
    setUserAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentIndex] = answer;
      return newAnswers;
    });
  }, [currentIndex]);

  const handleShowAnswer = useCallback(() => {
    setShowAnswers((prev) => {
      const newShowAnswers = [...prev];
      newShowAnswers[currentIndex] = true;
      return newShowAnswers;
    });
  }, [currentIndex]);

  const handleQuestionClick = useCallback((index) => {
    setCurrentIndex(index);
    stopSpeech();
    // Removed setTimeout(scrollToQuestion, 100) to prevent jumping
  }, [stopSpeech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  if (!isClient) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (quizDataLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: "center" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          جاري تحميل الأسئلة...
        </Typography>
        <CircularProgress />
      </Container>
    );
  }

  if (!selectedType) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: "center", fontWeight: 700 }}>
          أسئلة التؤوريا الشفوية
        </Typography>
        
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          {Object.entries(typesData).map(([key, type]) => (
            <Paper
              key={key}
              sx={{
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => setSelectedType(key)}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {type.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {type.description}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    );
  }

  if (!currentQuizNumber) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => setSelectedType(null)}
            sx={{ mb: 2 }}
          >
            العودة لاختيار النوع
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {typesData[selectedType]?.title}
          </Typography>
        </Box>

        <QuizNumbersBar
          selectedType={selectedType}
          currentQuizNumber={currentQuizNumber}
          onQuizNumberChange={handleQuizNumberChange}
          quizData={quizData}
        />
      </Container>
    );
  }

  if (quiz.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          لم يتم العثور على أسئلة لهذا الامتحان
        </Alert>
        <Button
          variant="contained"
          onClick={() => setCurrentQuizNumber(null)}
        >
          العودة
        </Button>
      </Container>
    );
  }

  const currentQuestion = quiz[currentIndex];
  const progress = ((currentIndex + 1) / quiz.length) * 100;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, direction: "rtl" }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          أسئلة التؤوريا الشفوية
        </Typography>
        <Typography variant="h6" sx={{ color: "text.secondary" }}>
          {typesData[selectedType]?.title} - امتحان رقم {currentQuizNumber}
        </Typography>
        <ProgressBar progress={progress} />
      </Paper>

      {/* Quiz Numbers Bar */}
      <QuizNumbersBar
        selectedType={selectedType}
        currentQuizNumber={currentQuizNumber}
        onQuizNumberChange={handleQuizNumberChange}
        quizData={quizData}
      />

      {/* Question Navigation */}
      <MemoizedNavigation
        questions={quiz}
        currentIndex={currentIndex}
        visited={visited}
        onQuestionClick={handleQuestionClick}
        userAnswers={userAnswers}
        showAnswers={showAnswers}
      />

      {/* Main Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            ref={questionTitleRef}
            sx={{
              p: 3,
              mb: 2,
              backgroundColor: "background.paper",
              borderRadius: 3,
              boxShadow: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "primary.main",
                textAlign: "center",
              }}
            >
              السؤال {currentIndex + 1} من {quiz.length}
            </Typography>

            <MemoizedQuestion
              question={currentQuestion}
              userAnswer={userAnswers[currentIndex]}
              showAnswer={showAnswers[currentIndex]}
              onAnswerSelect={handleAnswerSelect}
              onShowAnswer={handleShowAnswer}
            />

            {/* TTS Controls */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 2,
                backgroundColor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                mt: 2,
              }}
            >
              <Button
                variant="contained"
                startIcon={
                  isPlaying ? <Pause /> : <PlayArrow />
                }
                onClick={toggleAudio}
                sx={{
                  backgroundColor: "#87CEEB",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#5ebbe0"
                  },
                  fontWeight: "700",
                  minWidth: '160px'
                }}
              >
                {isPlaying ? "إيقاف الصوت" : "تشغيل السؤال"}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </AnimatePresence>

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
            fontWeight: 800,
            color: "white",
            bgcolor: "#2196F3",
            "&:hover": { backgroundColor: "#1976D2" },
          }}
          onClick={() => router.push("/teoria/oral")}
        >
          إنهاء الامتحان
        </Button>

        <Button
          variant="contained"
          onClick={handleNext}
          disabled={currentIndex === quiz.length - 1}
          sx={{
            fontWeight: 800,
            color: "white",
            bgcolor: "#4CAF50",
            "&:hover": { backgroundColor: "#45a049" },
          }}
        >
          التالي
        </Button>
      </Box>
    </Container>
  );
}