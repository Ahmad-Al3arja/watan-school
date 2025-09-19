import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

const TrainingCodeAuth = ({ onAuthenticated }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('يرجى إدخال رمز الوصول');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/training-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token in localStorage
        localStorage.setItem('trainingToken', data.token);
        localStorage.setItem('trainingTokenExpiry', (Date.now() + 24 * 60 * 60 * 1000).toString()); // 24 hours
        onAuthenticated();
      } else {
        setError(data.error || 'رمز غير صحيح');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
              قسم التدريب المهني
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary">
              يتطلب الوصول إلى أسئلة التدريب المهني رمز خاص يوفره المشرف
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="رمز الوصول"
              variant="outlined"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              margin="normal"
              autoFocus
              disabled={loading}
              error={!!error}
              sx={{
                direction: 'rtl',
                '& .MuiInputBase-input': {
                  textAlign: 'center',
                  fontSize: '1.2rem',
                  letterSpacing: '2px',
                }
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'دخول'
              )}
            </Button>
          </form>

          <Box mt={3} p={2} sx={{ backgroundColor: 'background.default', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
              💡 لا تملك رمز الوصول؟ تواصل مع مشرف التدريب للحصول على الرمز المطلوب
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TrainingCodeAuth;