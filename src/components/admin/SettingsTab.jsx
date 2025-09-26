import { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress 
} from '@mui/material';

export default function SettingsTab({ getAuthHeaders }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقتين');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('تم تغيير كلمة المرور بنجاح');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'فشل في تغيير كلمة المرور');
      }
    } catch (err) {
      setError('خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        إعدادات المدير
      </Typography>
      
      <Box component="form" onSubmit={handlePasswordChange} sx={{ maxWidth: 500, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          تغيير كلمة المرور
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <TextField
          margin="normal"
          required
          fullWidth
          name="currentPassword"
          label="كلمة المرور الحالية"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={loading}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="newPassword"
          label="كلمة المرور الجديدة"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="تأكيد كلمة المرور الجديدة"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'تغيير كلمة المرور'}
        </Button>
      </Box>
    </Box>
  );
}
