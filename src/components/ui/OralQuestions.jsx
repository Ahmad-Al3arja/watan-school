import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, Button, Container, Skeleton, Alert, LinearProgress, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { PlayArrow, Pause, VolumeUp, Settings } from "@mui/icons-material";

import SectionHero from "@/components/layout/SectionHero";
import ActionAreaCard from "@/components/ui/Card";
import ProgressBar from "@/components/ui/quizPage/ProgressBar";
import QuestionComponent from "@/components/ui/quizPage/Question";
import QuestionNavigation from "@/components/ui/quizPage/QuestionNavigation";
import { typesData } from "@/components/data/typesData";
import { useQuizData } from "@/hooks/useQuizData";
import elevenLabsService, { ACCESS_LEVELS } from "@/components/util/elevenLabsService";

// Quiz Numbers Bar Component (same as cTeoria)
function QuizNumbersBar({ selectedType, currentQuizNumber, onQuizNumberChange, quizData }) {
  if (!selectedType || currentQuizNumber === "random") return null;

  const cTeoriaData = quizData?.cTeoria?.[selectedType];
  if (!cTeoriaData) return null;

  const quizNumbers = Object.keys(cTeoriaData);

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          overflowX: "auto",
          whiteSpace: "nowrap",
          display: "flex",
          gap: 0,
          px: 0,
          py: 1,
          mb: 2,
        }}
      >
        {quizNumbers.map((num) => (
          <Button
            key={num}
            variant={num === currentQuizNumber ? "contained" : "outlined"}
            onClick={() => onQuizNumberChange(num)}
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
  const [ttsMethod, setTtsMethod] = useState('elevenlabs'); // 'elevenlabs' or 'webspeech'
  const [accessLevel, setAccessLevel] = useState('FREE');
  const [usageStats, setUsageStats] = useState(null);
  const [showUsageAlert, setShowUsageAlert] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize speech synthesis and ElevenLabs service
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }

    // Set access level for ElevenLabs service
    elevenLabsService.setAccessLevel(accessLevel);

    // Update usage stats
    const stats = elevenLabsService.getUsageStats();
    setUsageStats(stats);
  }, [accessLevel]);

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
  const speakTextWebSpeech = (text) => {
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

  const speakTextElevenLabs = async (text) => {
    try {
      // Starting ElevenLabs TTS
      setIsGenerating(true);
      setIsPlaying(true);

      await elevenLabsService.smartSpeak(text, {
        voiceId: ACCESS_LEVELS[accessLevel].voiceId,
        model: ACCESS_LEVELS[accessLevel].model,
        outputFormat: ACCESS_LEVELS[accessLevel].outputFormat
      });

      // ElevenLabs TTS completed successfully

      // Update usage stats after successful generation
      const stats = elevenLabsService.getUsageStats();
      setUsageStats(stats);

      // Show usage alert if approaching limits
      if (stats.daily.percentage > 80 || stats.monthly.percentage > 80) {
        setShowUsageAlert(true);
      }

    } catch (error) {
      // ElevenLabs TTS error, falling back to Web Speech API
      // Fallback to Web Speech API
      speakTextWebSpeech(text);
    } finally {
      setIsGenerating(false);
      setIsPlaying(false);
    }
  };

  const stopSpeech = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsGenerating(false);
  };

  const toggleAudio = async () => {
    if (isPlaying || isGenerating) {
      stopSpeech();
    } else {
      const currentQuestion = quiz[currentIndex];
      if (currentQuestion) {
        const textToSpeak = `${currentQuestion.question} ${currentQuestion.a} ${currentQuestion.b || ''}`;

        // TTS playback
        if (ttsMethod === 'elevenlabs') {
          await speakTextElevenLabs(textToSpeak);
        } else {
          speakTextWebSpeech(textToSpeak);
        }
      }
    }
  };

  // Navigation functions (same as cTeoria)
  const scrollToQuestion = useCallback(() => {
    if (questionTitleRef.current) {
      const elementPosition = questionTitleRef.current.offsetTop - headerHeight;
      window.scrollTo({ top: elementPosition, behavior: "smooth" });
    }
  }, [headerHeight]);

  const handleNext = useCallback(() => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      scrollToQuestion();
      stopSpeech();
    }
  }, [currentIndex, quiz, scrollToQuestion]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      scrollToQuestion();
      stopSpeech();
    }
  }, [currentIndex, scrollToQuestion]);

  const handleSelect = useCallback(
    (option) => {
      setUserAnswers((prev) => {
        const newAnswers = [...prev];
        const isCorrect = option === quiz[currentIndex].answer;
        newAnswers[currentIndex] = { answer: option, isCorrect };
        return newAnswers;
      });
    },
    [currentIndex, quiz]
  );

  const handleShowAnswer = useCallback(() => {
    setShowAnswers((prev) => {
      const newShow = [...prev];
      newShow[currentIndex] = true;
      return newShow;
    });
  }, [currentIndex]);

  // Type mapping (same as cTeoria)
  const mapTypes = {
    private: "خصوصي",
    light: "شحن خفيف",
    heavy: "شحن ثقيل",
    taxi: "عمومي",
    motorcycle: "دراجة نارية",
    tractor: "تراكتور",
  };

  // Show loading state until client-side hydration is complete and data is loaded
  if (!isClient || quizDataLoading || !quizData) {
    return (
      <Container sx={{ py: 4, direction: "rtl" }}>
        <SectionHero title="تحميل..." subTitle="" />
        <Box display="flex" justifyContent="center" gap={2}>
          <Skeleton variant="rounded" width={200} height={120} />
          <Skeleton variant="rounded" width={200} height={120} />
        </Box>
      </Container>
    );
  }

  // If no type is selected, show type selection (same as cTeoria structure)
  if (!selectedType) {
    return (
      <Container sx={{ py: 4, direction: "rtl" }}>
        <SectionHero 
          title="الأسئلة الشفوية للتؤوريا" 
          subTitle="اختر نوع الرخصة لدراسة الأسئلة الشفوية مع إمكانية الاستماع للأسئلة" 
        />
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            "& > div": {
              flex: "1 1 100%",
            },
            "@media (min-width: 600px)": {
              "& > div": {
                flex: "1 1 calc(50% - 24px)",
              },
            },
            "@media (min-width: 900px)": {
              "& > div": {
                flex: "1 1 calc(33.333% - 24px)",
              },
            },
          }}
        >
          {/* Only show private and light truck options */}
          {typesData
            .filter(type => type.title === 'خصوصي' || type.title === 'شحن خفيف')
            .map((type, index) => (
            <Box
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 50}
            >
              <ActionAreaCard
                title={`${type.title} شفوي`}
                image={type.image}
                onClick={() => {
                  if (!quizData) return;
                  const typeKey = type.title === 'خصوصي' ? 'private' : 'light';
                  setSelectedType(typeKey);
                  // Set first available quiz number
                  const cTeoriaData = quizData.cTeoria?.[typeKey];
                  if (cTeoriaData) {
                    const firstQuizNumber = Object.keys(cTeoriaData)[0];
                    setCurrentQuizNumber(firstQuizNumber);
                  }
                }}
                alt={`صورة ${type.title}`}
              />
            </Box>
          ))}
        </Box>
      </Container>
    );
  }

  // If no quiz is loaded
  if (!quiz || quiz.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <h2>لا يوجد أسئلة لهذا الامتحان</h2>
      </Box>
    );
  }

  // Main quiz interface (exact same structure as cTeoria)
  return (
    <>
      {/* MAIN HERO - same as cTeoria */}
      <SectionHero
        title={`أسئلة تؤوريا ${mapTypes[selectedType]} شفوي (${currentQuizNumber})`}
      />

      {/* Quiz Numbers Bar - same as cTeoria */}
      <QuizNumbersBar
        selectedType={selectedType}
        currentQuizNumber={currentQuizNumber}
        onQuizNumberChange={setCurrentQuizNumber}
        quizData={quizData}
      />

      <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4, p: 2 }}>
        {/* Progress Bar - same as cTeoria */}
        <ProgressBar
          questionTitleRef={questionTitleRef}
          answeredQuestions={userAnswers.filter(Boolean).length}
          total={quiz.length}
          timeLeft={0} // No timer for oral questions
          autoNext={false}
          setAutoNext={() => {}}
        />
        
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mt: 2,
          }}
        >
          {/* Main Question Area - same as cTeoria */}
          <Box sx={{ flex: 2 }}>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <MemoizedQuestion
                question={quiz[currentIndex].question}
                options={{
                  a: quiz[currentIndex].a,
                  b: quiz[currentIndex].b,
                  c: quiz[currentIndex].c,
                  d: quiz[currentIndex].d,
                }}
                correctAnswer={quiz[currentIndex].answer}
                userAnswer={userAnswers[currentIndex]?.answer}
                showAnswer={showAnswers[currentIndex]}
                questionNumber={currentIndex + 1}
                type={selectedType}
                qType="oral"
                quizNumber={currentQuizNumber}
                questionIndex={currentIndex}
                onSelect={handleSelect}
              />
            </motion.div>

            {/* TTS Controls - enhanced for ElevenLabs */}
            <Box sx={{ mt: 2, textAlign: "center" }}>
              {/* Usage Alert */}
              {showUsageAlert && usageStats && (
                <Alert
                  severity="warning"
                  sx={{ mb: 2 }}
                  onClose={() => setShowUsageAlert(false)}
                >
                  تحذير: اقتربت من حدود الاستخدام اليومية ({usageStats.daily.percentage.toFixed(1)}%)
                </Alert>
              )}

              {/* TTS Method Selector */}
              <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant={ttsMethod === 'elevenlabs' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<VolumeUp />}
                  onClick={() => setTtsMethod('elevenlabs')}
                  sx={{ minWidth: '120px' }}
                >
                  ElevenLabs
                </Button>
                <Button
                  variant={ttsMethod === 'webspeech' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<Settings />}
                  onClick={() => setTtsMethod('webspeech')}
                  sx={{ minWidth: '120px' }}
                >
                  Web Speech
                </Button>
              </Box>

              {/* Access Level Selector (only for ElevenLabs) */}
              {ttsMethod === 'elevenlabs' && (
                <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {Object.keys(ACCESS_LEVELS).map((level) => (
                    <Button
                      key={level}
                      variant={accessLevel === level ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setAccessLevel(level)}
                      sx={{
                        minWidth: '80px',
                        fontSize: '0.75rem',
                        bgcolor: accessLevel === level ?
                          (level === 'FREE' ? '#gray' : level === 'BASIC' ? '#4caf50' : '#ff9800') :
                          'transparent'
                      }}
                    >
                      {level}
                    </Button>
                  ))}
                </Box>
              )}

              {/* Usage Stats (only for ElevenLabs) */}
              {ttsMethod === 'elevenlabs' && usageStats && (
                <Box sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
                  <Typography variant="caption" display="block" gutterBottom>
                    الاستخدام اليومي: {usageStats.daily.used} / {usageStats.daily.limit} حرف
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={usageStats.daily.percentage}
                    sx={{ mb: 1, height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" display="block">
                    الاستخدام الشهري: {usageStats.monthly.used} / {usageStats.monthly.limit} حرف
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={usageStats.monthly.percentage}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              )}

              {/* Main TTS Button */}
              <Button
                variant="contained"
                startIcon={
                  isGenerating ? <VolumeUp className="animate-pulse" /> :
                  isPlaying ? <Pause /> : <PlayArrow />
                }
                onClick={toggleAudio}
                disabled={isGenerating}
                sx={{
                  backgroundColor: ttsMethod === 'elevenlabs' ? "#ff6b35" : "#87CEEB",
                  color: "white",
                  "&:hover": {
                    backgroundColor: ttsMethod === 'elevenlabs' ? "#e55a2b" : "#5ebbe0"
                  },
                  fontWeight: "700",
                  minWidth: '160px'
                }}
              >
                {isGenerating ? "جاري التوليد..." :
                 isPlaying ? "إيقاف الصوت" :
                 `تشغيل السؤال (${ttsMethod === 'elevenlabs' ? 'ElevenLabs AI' : 'Web Speech'})`}
              </Button>

              {/* Debug/Test Button for ElevenLabs */}
              {ttsMethod === 'elevenlabs' && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    const testText = "هذا اختبار لصوت ElevenLabs";
                    // Testing ElevenLabs TTS
                    await speakTextElevenLabs(testText);
                  }}
                  sx={{ mt: 1, fontSize: '0.8rem' }}
                >
                  اختبار ElevenLabs
                </Button>
              )}
            </Box>

            {/* Navigation Controls - same as cTeoria */}
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
                color="primary"
                sx={{
                  fontWeight: 800,
                  color: "white",
                  p: "10px 20px",
                  "&:hover": { backgroundColor: "#a37729" },
                }}
                onClick={handleNext}
                disabled={currentIndex === quiz.length - 1}
              >
                {currentIndex < quiz.length - 1 ? "التالي" : "إنهاء"}
              </Button>
            </Box>
          </Box>

          {/* Side Navigation - same as cTeoria */}
          <Box sx={{ flex: 1 }}>
            <MemoizedNavigation
              totalQuestions={quiz.length}
              currentIndex={currentIndex}
              userAnswers={userAnswers}
              visited={visited}
              showAnswers={showAnswers}
              onNavigate={(index) => {
                setCurrentIndex(index);
                scrollToQuestion();
                stopSpeech();
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}
