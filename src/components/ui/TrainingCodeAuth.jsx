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
import { supabase } from '../../../lib/supabase';

const TrainingCodeAuth = ({ onAuthenticated }) => {
  const [code, setCode] = useState('ADMIN123');
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
      // Use Supabase validation for both web and mobile
      const trimmedCode = code.trim().toUpperCase();

      const { data: codeData, error: codeError } = await supabase
        .from('training_codes')
        .select('*')
        .eq('code', trimmedCode)
        .eq('is_active', true)
        .single();

      if (codeError || !codeData) {
        setError('رمز غير صحيح');
        return;
      }

      // Check if code is expired
      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        setError('هذا الرمز منتهي الصلاحية');
        return;
      }

      // Check if code has reached max uses
      if (codeData.max_uses && codeData.current_uses >= codeData.max_uses) {
        setError('تم استنفاد عدد استخدامات هذا الرمز');
        return;
      }

      // Update usage count
      const { error: updateError } = await supabase
        .from('training_codes')
        .update({ current_uses: codeData.current_uses + 1 })
        .eq('id', codeData.id);

      if (updateError) {
        console.error('Error updating code usage:', updateError);
      }

      // Store the token in localStorage
      const sessionToken = Buffer.from(`training_${trimmedCode}_${Date.now()}`).toString('base64');
      localStorage.setItem('trainingToken', sessionToken);
      localStorage.setItem('trainingTokenExpiry', (Date.now() + 24 * 60 * 60 * 1000).toString()); // 24 hours
      onAuthenticated();
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