import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, TextField, Alert, LinearProgress } from '@mui/material';
import { PlayArrow, Pause, VolumeUp, Settings } from '@mui/icons-material';
import elevenLabsService, { ACCESS_LEVELS } from '@/components/util/elevenLabsService';

export default function TTSDemo() {
  const [text, setText] = useState('مرحبا بكم في موقع وطن سكول للتؤوريا');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ttsMethod, setTtsMethod] = useState('elevenlabs');
  const [accessLevel, setAccessLevel] = useState('FREE');
  const [usageStats, setUsageStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    elevenLabsService.setAccessLevel(accessLevel);
    const stats = elevenLabsService.getUsageStats();
    setUsageStats(stats);
  }, [accessLevel]);

  const speakTextWebSpeech = (textToSpeak) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const speakTextElevenLabs = async (textToSpeak) => {
    try {
      setIsGenerating(true);
      setIsPlaying(true);
      setError('');

      await elevenLabsService.smartSpeak(textToSpeak, {
        voiceId: ACCESS_LEVELS[accessLevel].voiceId,
        model: ACCESS_LEVELS[accessLevel].model,
        outputFormat: ACCESS_LEVELS[accessLevel].outputFormat
      });

      const stats = elevenLabsService.getUsageStats();
      setUsageStats(stats);

    } catch (error) {
      setError(error.message);
      console.error('ElevenLabs TTS error:', error);
      speakTextWebSpeech(textToSpeak);
    } finally {
      setIsGenerating(false);
      setIsPlaying(false);
    }
  };

  const handlePlay = async () => {
    if (isPlaying || isGenerating) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setIsGenerating(false);
      return;
    }

    if (ttsMethod === 'elevenlabs') {
      await speakTextElevenLabs(text);
    } else {
      speakTextWebSpeech(text);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, direction: 'rtl' }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        اختبار خدمة التحويل إلى كلام
      </Typography>

      <Box sx={{ mt: 4 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Text Input */}
        <TextField
          fullWidth
          multiline
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          label="النص المراد تحويله إلى كلام"
          sx={{ mb: 3 }}
        />

        {/* TTS Method Selector */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Button
            variant={ttsMethod === 'elevenlabs' ? 'contained' : 'outlined'}
            startIcon={<VolumeUp />}
            onClick={() => setTtsMethod('elevenlabs')}
            sx={{ minWidth: '150px' }}
          >
            ElevenLabs TTS
          </Button>
          <Button
            variant={ttsMethod === 'webspeech' ? 'contained' : 'outlined'}
            startIcon={<Settings />}
            onClick={() => setTtsMethod('webspeech')}
            sx={{ minWidth: '150px' }}
          >
            Web Speech API
          </Button>
        </Box>

        {/* Access Level Selector (only for ElevenLabs) */}
        {ttsMethod === 'elevenlabs' && (
          <Box sx={{ mb: 3, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ width: '100%', textAlign: 'center', mb: 1 }}>
              مستوى الوصول:
            </Typography>
            {Object.keys(ACCESS_LEVELS).map((level) => (
              <Button
                key={level}
                variant={accessLevel === level ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setAccessLevel(level)}
                sx={{
                  minWidth: '80px',
                  bgcolor: accessLevel === level ?
                    (level === 'FREE' ? '#9e9e9e' : level === 'BASIC' ? '#4caf50' : '#ff9800') :
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
          <Box sx={{ mb: 3, maxWidth: 500, mx: 'auto', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom textAlign="center">
              إحصائيات الاستخدام
            </Typography>

            <Typography variant="body2" gutterBottom>
              الاستخدام اليومي: {usageStats.daily.used} / {usageStats.daily.limit} حرف
            </Typography>
            <LinearProgress
              variant="determinate"
              value={usageStats.daily.percentage}
              sx={{ mb: 2, height: 8, borderRadius: 4 }}
            />

            <Typography variant="body2" gutterBottom>
              الاستخدام الشهري: {usageStats.monthly.used} / {usageStats.monthly.limit} حرف
            </Typography>
            <LinearProgress
              variant="determinate"
              value={usageStats.monthly.percentage}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* Play Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={
              isGenerating ? <VolumeUp className="animate-pulse" /> :
              isPlaying ? <Pause /> : <PlayArrow />
            }
            onClick={handlePlay}
            disabled={isGenerating || !text.trim()}
            sx={{
              backgroundColor: ttsMethod === 'elevenlabs' ? '#ff6b35' : '#87CEEB',
              color: 'white',
              '&:hover': {
                backgroundColor: ttsMethod === 'elevenlabs' ? '#e55a2b' : '#5ebbe0'
              },
              fontWeight: 700,
              minWidth: '200px',
              fontSize: '1.1rem'
            }}
          >
            {isGenerating ? 'جاري التوليد...' :
             isPlaying ? 'إيقاف الصوت' :
             'تشغيل الصوت'}
          </Button>
        </Box>

        {/* Method Info */}
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            الطريقة الحالية: {ttsMethod === 'elevenlabs' ? 'ElevenLabs AI' : 'Web Speech API'}
            {ttsMethod === 'elevenlabs' && ` (${accessLevel})`}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
            {ttsMethod === 'elevenlabs' ?
              'جودة صوت عالية مع ذكاء اصطناعي متقدم' :
              'تقنية مدمجة في المتصفح (مجانية)'}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}