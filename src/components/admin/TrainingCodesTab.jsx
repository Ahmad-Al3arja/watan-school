import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField
} from '@mui/material';

// Training Codes Tab Component
function TrainingCodesTab({ getAuthHeaders }) {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/training-codes', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setCodes(data);
      }
    } catch (error) {
      console.error('Error loading training codes:', error);
    }
    setLoading(false);
  };

  const handleCreateCode = () => {
    setEditingCode(null);
    setShowForm(true);
  };

  const handleEditCode = (code) => {
    setEditingCode(code);
    setShowForm(true);
  };

  const handleDeleteCode = async (codeId) => {
    if (confirm('هل أنت متأكد من حذف هذا الرمز؟')) {
      try {
        const response = await fetch(`/api/admin/training-codes/${codeId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (response.ok) {
          loadCodes();
        }
      } catch (error) {
        console.error('Error deleting code:', error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const method = editingCode ? 'PUT' : 'POST';
      const url = editingCode
        ? `/api/admin/training-codes/${editingCode.id}`
        : '/api/admin/training-codes';

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingCode(null);
        loadCodes();
      }
    } catch (error) {
      console.error('Error saving code:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          إدارة رموز التدريب
        </Typography>
        <Button
          variant="contained"
          onClick={handleCreateCode}
          sx={{ fontWeight: 'bold' }}
        >
          إضافة رمز جديد
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        إدارة رموز الوصول لقسم التدريب المهني. يحتاج المتدربون إلى هذه الرموز للوصول إلى أسئلة التدريب.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {codes.length === 0 ? (
            <Typography variant="body1" textAlign="center" color="text.secondary">
              لا توجد رموز تدريب حالياً
            </Typography>
          ) : (
            codes.map((code) => (
              <Box
                key={code.id}
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  p: 3,
                  backgroundColor: code.is_active ? '#fff' : '#f5f5f5'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: code.is_active ? '#1976d2' : '#666' }}>
                      {code.code}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {code.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                      <Typography variant="caption">
                        <strong>الاستخدامات:</strong> {code.current_uses || 0}
                        {code.max_uses ? ` / ${code.max_uses}` : ' (غير محدود)'}
                      </Typography>
                      {code.expires_at && (
                        <Typography variant="caption">
                          <strong>ينتهي في:</strong> {new Date(code.expires_at).toLocaleDateString('ar')}
                        </Typography>
                      )}
                      <Typography variant="caption">
                        <strong>تم الإنشاء:</strong> {new Date(code.created_at).toLocaleDateString('ar')}
                      </Typography>
                      <Typography variant="caption">
                        <strong>الحالة:</strong> {code.is_active ? 'نشط' : 'غير نشط'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => handleEditCode(code)}
                      sx={{ minWidth: 'auto' }}
                    >
                      تعديل
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCode(code.id)}
                      sx={{ minWidth: 'auto' }}
                    >
                      حذف
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </Box>
      )}

      {showForm && (
        <TrainingCodeForm
          code={editingCode}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </Box>
  );
}

// Training Code Form Component
function TrainingCodeForm({ code, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    code: code?.code || '',
    description: code?.description || '',
    maxUses: code?.max_uses || '',
    expiresAt: code?.expires_at ? code.expires_at.split('T')[0] : '',
    isActive: code?.is_active !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
    });
  };

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1300
    }}>
      <Box sx={{
        backgroundColor: 'white',
        borderRadius: 3,
        p: 4,
        maxWidth: '500px',
        width: '90vw',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3 }}>
          {code ? 'تعديل رمز التدريب' : 'إضافة رمز تدريب جديد'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="رمز الوصول"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            margin="normal"
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="وصف الرمز"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            required
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="الحد الأقصى للاستخدامات (اختياري)"
            type="number"
            value={formData.maxUses}
            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
            margin="normal"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="تاريخ انتهاء الصلاحية (اختياري)"
            type="date"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>الرمز نشط</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>إلغاء</Button>
            <Button type="submit" variant="contained">حفظ</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default TrainingCodesTab;