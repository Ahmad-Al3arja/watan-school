import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  MenuItem,
  Alert,
  Chip
} from '@mui/material';
import { Edit, Delete, Add, Image as ImageIcon } from '@mui/icons-material';

// Signal Types
const SIGNAL_TYPES = [
  { index: 0, name: "أ- اشارات التحذير" },
  { index: 1, name: "ب- اشارات الإرشاد" },
  { index: 2, name: "ج- اشارات الاستعلامات" },
  { index: 3, name: "د- اشارات سطح الطريق" },
  { index: 4, name: "هـ- الآلات الضوئية" },
  { index: 5, name: "و- الاشارات المساعدة" }
];

// Signals Tab Component
function SignalsTab({ getAuthHeaders }) {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSignal, setEditingSignal] = useState(null);
  const [selectedType, setSelectedType] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSignals();
  }, []);

  const loadSignals = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/signals', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setSignals(data);
      } else {
        setError('فشل في تحميل الإشارات');
      }
    } catch (error) {
      console.error('Error loading signals:', error);
      setError('خطأ في الاتصال');
    }
    setLoading(false);
  };

  const handleCreateSignal = () => {
    setEditingSignal(null);
    setShowForm(true);
  };

  const handleEditSignal = (signal) => {
    setEditingSignal(signal);
    setShowForm(true);
  };

  const handleDeleteSignal = async (signalId) => {
    if (confirm('هل أنت متأكد من حذف هذه الإشارة؟')) {
      try {
        const response = await fetch(`/api/admin/signals/${signalId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (response.ok) {
          setMessage('تم حذف الإشارة بنجاح');
          loadSignals();
        } else {
          setError('فشل في حذف الإشارة');
        }
      } catch (error) {
        console.error('Error deleting signal:', error);
        setError('خطأ في الاتصال');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const method = editingSignal ? 'PUT' : 'POST';
      const url = editingSignal
        ? `/api/admin/signals/${editingSignal.id}`
        : '/api/admin/signals';

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage(editingSignal ? 'تم تحديث الإشارة بنجاح' : 'تم إنشاء الإشارة بنجاح');
        setShowForm(false);
        loadSignals();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'فشل في حفظ الإشارة');
      }
    } catch (error) {
      console.error('Error saving signal:', error);
      setError('خطأ في الاتصال');
    }
  };

  const getSignalsByType = (typeIndex) => {
    return signals.filter(signal => signal.type_index === typeIndex);
  };

  const getNextOrderIndex = (typeIndex) => {
    const typeSignals = getSignalsByType(typeIndex);
    return typeSignals.length;
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          إدارة الإشارات
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateSignal}
          sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
        >
          إضافة إشارة جديدة
        </Button>
      </Box>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Type Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          تصفية حسب النوع:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {SIGNAL_TYPES.map((type) => (
            <Chip
              key={type.index}
              label={`${type.name} (${getSignalsByType(type.index).length})`}
              onClick={() => setSelectedType(type.index)}
              color={selectedType === type.index ? 'primary' : 'default'}
              variant={selectedType === type.index ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {getSignalsByType(selectedType).map((signal) => (
            <Grid item xs={12} sm={6} md={4} key={signal.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ImageIcon sx={{ mr: 1, color: '#666' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                      {signal.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                    {signal.content}
                  </Typography>
                  
                  <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                    مسار الصورة: {signal.image}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={SIGNAL_TYPES[signal.type_index]?.name || `النوع ${signal.type_index}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleEditSignal(signal)}
                    sx={{ color: '#1976d2' }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteSignal(signal.id)}
                    sx={{ color: '#f44336' }}
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {showForm && (
        <SignalForm
          signal={editingSignal}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
          getNextOrderIndex={getNextOrderIndex}
        />
      )}
    </Box>
  );
}

// Signal Form Component
function SignalForm({ signal, onClose, onSubmit, getNextOrderIndex }) {
  const [formData, setFormData] = useState({
    title: signal?.title || '',
    image: signal?.image || '',
    content: signal?.content || '',
    type_index: signal?.type_index || 0,
    order_index: signal?.order_index || 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Set order_index if creating new signal
    if (!signal) {
      formData.order_index = getNextOrderIndex(formData.type_index);
    }
    
    onSubmit(formData);
  };

  const handleTypeChange = (newTypeIndex) => {
    setFormData({
      ...formData,
      type_index: newTypeIndex,
      order_index: signal ? formData.order_index : getNextOrderIndex(newTypeIndex)
    });
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        {signal ? 'تعديل الإشارة' : 'إضافة إشارة جديدة'}
      </DialogTitle>
      
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="عنوان الإشارة"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="نوع الإشارة"
                value={formData.type_index}
                onChange={(e) => handleTypeChange(parseInt(e.target.value))}
                required
                sx={{ mb: 2 }}
              >
                {SIGNAL_TYPES.map((type) => (
                  <MenuItem key={type.index} value={type.index}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="مسار الصورة"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
                sx={{ mb: 2 }}
                placeholder="/images/signals/1.jpg"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="محتوى الإشارة"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            إلغاء
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {signal ? 'تحديث' : 'إنشاء'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default SignalsTab;
