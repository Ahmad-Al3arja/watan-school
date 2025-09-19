import React, { useState, useEffect } from 'react';
import TrainingCodeAuth from '@/components/ui/TrainingCodeAuth';
import { Container, Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import { useRouter } from 'next/router';
import { School as SchoolIcon, Quiz as QuizIcon, Assessment as AssessmentIcon } from '@mui/icons-material';

const TrainingSection = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user has valid training token
    const token = localStorage.getItem('trainingToken');
    const expiry = localStorage.getItem('trainingTokenExpiry');

    if (token && expiry && Date.now() < parseInt(expiry)) {
      setIsAuthenticated(true);
    } else {
      // Clear expired tokens
      localStorage.removeItem('trainingToken');
      localStorage.removeItem('trainingTokenExpiry');
    }

    setLoading(false);
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('trainingToken');
    localStorage.removeItem('trainingTokenExpiry');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>تحميل...</Typography>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return <TrainingCodeAuth onAuthenticated={handleAuthenticated} />;
  }

  // Training options for authenticated users
  const trainingOptions = [
    {
      title: 'امتحانات التدريب',
      description: 'امتحانات تدريبية شاملة لتطوير مهارات القيادة المهنية',
      icon: <QuizIcon sx={{ fontSize: 40 }} />,
      path: '/teoria/training/quizes',
      color: '#2196f3'
    },
    {
      title: 'أسئلة عشوائية',
      description: 'مجموعة متنوعة من الأسئلة العشوائية للتدريب المكثف',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      path: '/teoria/training/quizes/random',
      color: '#ff9800'
    },
    {
      title: 'الأسئلة المحفوظة',
      description: 'مراجعة الأسئلة التي قمت بحفظها سابقاً',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      path: '/teoria/training/quizes/saved',
      color: '#4caf50'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          قسم التدريب المهني
        </Typography>
        <Button
          variant="outlined"
          onClick={handleLogout}
          color="error"
        >
          تسجيل الخروج
        </Button>
      </Box>

      <Typography variant="body1" paragraph color="text.secondary" mb={4}>
        مرحباً بك في قسم التدريب المهني. هنا يمكنك الوصول إلى جميع امتحانات وأسئلة التدريب المتخصصة
      </Typography>

      <Grid container spacing={3}>
        {trainingOptions.map((option, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  elevation: 4
                }
              }}
              onClick={() => router.push(option.path)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  sx={{
                    color: option.color,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  {option.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {option.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={4} p={3} sx={{ backgroundColor: 'background.default', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          ملاحظات مهمة:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>جميع الأسئلة في هذا القسم مخصصة للتدريب المهني</li>
          <li>تأكد من قراءة كل سؤال بعناية قبل الإجابة</li>
          <li>يمكنك حفظ الأسئلة المهمة للمراجعة اللاحقة</li>
          <li>جلسة الوصول صالحة لمدة 24 ساعة</li>
        </Typography>
      </Box>
    </Container>
  );
};

export default TrainingSection;