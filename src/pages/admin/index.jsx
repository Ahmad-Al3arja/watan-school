import { useState, useEffect } from 'react';
import { Box, Container, Typography, TextField, Button, Alert, CircularProgress, MenuItem, Tooltip, Portal } from '@mui/material';
import TrainingCodesTab from '@/components/admin/TrainingCodesTab';
import SettingsTab from '@/components/admin/SettingsTab';

// Sign Renderer Component
function SignRenderer({ text }) {
  if (!text) return null;

  const parseText = (text) => {
    const regex = /\[\[([a-zA-Z0-9]+)\]\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Push the text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Extract the className from the match
      const className = match[1];

      // Push the <i> element (same as exam pages)
      parts.push(<i key={match.index} className={`signal ${className}`}></i>);

      // Update the lastIndex
      lastIndex = regex.lastIndex;
    }

    // Push the remaining text after the last match
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return <span>{parseText(text)}</span>;
}

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          تسجيل دخول المدير
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="كلمة مرور المدير"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'تسجيل الدخول'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('exams');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [examStructure, setExamStructure] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedExamNumber, setSelectedExamNumber] = useState('');
  const [duplicates, setDuplicates] = useState(null);
  const [duplicatesLoading, setDuplicatesLoading] = useState(false);

  const logout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
    'Content-Type': 'application/json',
  });

  const loadExamStructure = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data-structure');
      const data = await response.json();

      setExamStructure(data);
    } catch (err) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/questions?page=${page}&search=${searchTerm}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (selectedSubcategory) url += `&subcategory=${selectedSubcategory}`;
      if (selectedExamNumber) url += `&exam_number=${selectedExamNumber}`;

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setQuestions(data.questions || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const loadDuplicates = async () => {
    setDuplicatesLoading(true);
    try {
      const response = await fetch('/api/admin/duplicates', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setDuplicates(data.duplicates || {});
    } catch (err) {
    } finally {
      setDuplicatesLoading(false);
    }
  };


  useEffect(() => {
    if (activeTab === 'exams') {
      loadExamStructure();
    } else if (activeTab === 'questions') {
      loadQuestions();
    } else if (activeTab === 'duplicates') {
      loadDuplicates();
    }
  }, [activeTab, page, searchTerm, selectedCategory, selectedSubcategory, selectedExamNumber]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            لوحة التحكم
          </Typography>
          <Button variant="outlined" onClick={logout}>
تسجيل الخروج
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant={activeTab === 'exams' ? 'contained' : 'text'}
              onClick={() => setActiveTab('exams')}
            >
              تصفح الامتحانات
            </Button>
            <Button
              variant={activeTab === 'questions' ? 'contained' : 'text'}
              onClick={() => setActiveTab('questions')}
            >
              إدارة الأسئلة
            </Button>
            <Button
              variant={activeTab === 'duplicates' ? 'contained' : 'text'}
              onClick={() => setActiveTab('duplicates')}
            >
              الأسئلة المكررة
            </Button>
            <Button
              variant={activeTab === 'license-types' ? 'contained' : 'text'}
              onClick={() => setActiveTab('license-types')}
            >
              أنواع الرخص
            </Button>
            <Button
              variant={activeTab === 'license-requirements' ? 'contained' : 'text'}
              onClick={() => setActiveTab('license-requirements')}
            >
              متطلبات الرخص
            </Button>
            <Button
              variant={activeTab === 'license-pricing' ? 'contained' : 'text'}
              onClick={() => setActiveTab('license-pricing')}
            >
              أسعار الرخص
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'contained' : 'text'}
              onClick={() => setActiveTab('settings')}
            >
              الإعدادات
            </Button>
            <Button
              variant={activeTab === 'license-procedures' ? 'contained' : 'text'}
              onClick={() => setActiveTab('license-procedures')}
            >
              إجراءات الرخص
            </Button>
            <Button
              variant={activeTab === 'training-codes' ? 'contained' : 'text'}
              onClick={() => setActiveTab('training-codes')}
            >
              رموز التدريب
            </Button>
          </Box>
        </Box>

        {activeTab === 'exams' && (
          <ExamsTab
            examStructure={examStructure}
            loading={loading}
            onExamSelect={(category, subcategory, examNumber) => {
              setSelectedCategory(category);
              setSelectedSubcategory(subcategory);
              setSelectedExamNumber(examNumber);
              setActiveTab('questions');
            }}
            getAuthHeaders={getAuthHeaders}
            onReload={loadExamStructure}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionsTab
            questions={questions}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            onReload={loadQuestions}
            getAuthHeaders={getAuthHeaders}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            selectedExamNumber={selectedExamNumber}
            onClearFilters={() => {
              setSelectedCategory('');
              setSelectedSubcategory('');
              setSelectedExamNumber('');
            }}
          />
        )}

        {activeTab === 'duplicates' && (
          <DuplicatesTab
            duplicates={duplicates}
            loading={duplicatesLoading}
            onReload={loadDuplicates}
            getAuthHeaders={getAuthHeaders}
          />
        )}

        {activeTab === 'license-types' && (
          <LicenseTypesTab
            getAuthHeaders={getAuthHeaders}
          />
        )}

        {activeTab === 'license-requirements' && (
          <LicenseRequirementsTab
            getAuthHeaders={getAuthHeaders}
          />
        )}

        {activeTab === 'license-pricing' && (
          <LicensePricingTab
            getAuthHeaders={getAuthHeaders}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            getAuthHeaders={getAuthHeaders}
          />
        )}

        {activeTab === 'license-procedures' && (
          <LicenseProceduresTab
            getAuthHeaders={getAuthHeaders}
          />
        )}
        {activeTab === 'training-codes' && (
          <TrainingCodesTab
            getAuthHeaders={getAuthHeaders}
          />
        )}

      </Box>
    </Container>
  );
}

function ExamsTab({ examStructure, loading, onExamSelect, getAuthHeaders, onReload }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [showAddExamForm, setShowAddExamForm] = useState(false);
  const [quickAccessCategory, setQuickAccessCategory] = useState('');
  const [quickAccessSubcategory, setQuickAccessSubcategory] = useState('');
  const [quickAccessExam, setQuickAccessExam] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Initialize quick access dropdowns when examStructure loads
  useEffect(() => {
    if (examStructure && Object.keys(examStructure).length > 0) {
      const firstCategory = Object.keys(examStructure)[0];
      setQuickAccessCategory(firstCategory);

      if (examStructure[firstCategory]) {
        const firstSubcategory = Object.keys(examStructure[firstCategory])[0];
        setQuickAccessSubcategory(firstSubcategory);

        if (examStructure[firstCategory][firstSubcategory]) {
          const firstExam = Object.keys(examStructure[firstCategory][firstSubcategory])[0];
          setQuickAccessExam(firstExam);
        }
      }
    }
  }, [examStructure]);

  const categoryNames = {
    'cTeoria': 'استكمالي',
    'nTeoria': 'نظري جديد',
    'training': 'تدريب',
    'english_teoria': 'انجليزي'
  };

  const subcategoryNames = {
    'heavy': 'Heavy (شحن ثقيل)',
    'light': 'Light (شحن خفيف)',
    'private': 'Private (خصوصي)',
    'taxi': 'Taxi (عمومي)',
    'motorcycle': 'Motorcycle (دراجة نارية)',
    'tractor': 'Tractor (تراكتور)',
    'quizes': 'Quizzes'
  };

  const handleDeleteExam = (category, subcategory, examNumber, questionCount) => {
    setExamToDelete({
      category,
      subcategory,
      examNumber,
      questionCount
    });
    setShowDeleteDialog(true);
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;
    
    setDeleting(true);
    try {
      const response = await fetch('/api/admin/delete-exam', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          category: examToDelete.category,
          subcategory: examToDelete.subcategory,
          exam_number: examToDelete.examNumber
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`تم حذف الامتحان بنجاح! تم حذف ${result.deletedQuestions} سؤال.`);
        setShowDeleteDialog(false);
        setExamToDelete(null);
        onReload(); // Reload the exam structure
      } else {
        const error = await response.json();
        alert(error.error || 'فشل في حذف الامتحان');
      }
    } catch (err) {
      alert('خطأ في حذف الامتحان');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  if (!examStructure) {
    return (
      <Box>
        <Typography>لا توجد بيانات امتحانات متاحة</Typography>
      </Box>
    );
  }


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            تصفح الامتحانات حسب الفئة والنوع
          </Typography>
          <Typography variant="body2" color="text.secondary">
            انقر على أي امتحان لإدارة أسئلته مباشرة
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setShowAddExamForm(true)}
          sx={{
            background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
            }
          }}
        >
          إضافة امتحان جديد
        </Button>
      </Box>


      {/* Quick Access Section */}
      <Box sx={{ 
        mb: 4, 
        p: 4, 
        background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
              الوصول السريع للامتحانات
        </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              انتقل مباشرة إلى أي امتحان باستخدام المحدد المبسط
        </Typography>
        </Box>
      </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          alignItems: 'flex-end', 
          flexWrap: 'wrap',
          mb: 3
        }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="body2" sx={{ color: 'white', mb: 1, fontWeight: 'medium' }}>
              الفئة
        </Typography>
          <TextField
            select
              fullWidth
            value={quickAccessCategory}
            onChange={(e) => {
              setQuickAccessCategory(e.target.value);
              // Reset subcategory and exam when category changes
              const availableSubcategories = Object.keys(examStructure[e.target.value] || {});
              if (availableSubcategories.length > 0) {
                setQuickAccessSubcategory(availableSubcategories[0]);
                const availableExams = Object.keys(examStructure[e.target.value][availableSubcategories[0]] || {});
                if (availableExams.length > 0) {
                  setQuickAccessExam(availableExams[0]);
                }
              } else {
                setQuickAccessSubcategory('');
                setQuickAccessExam('');
              }
            }}
            sx={{
              backgroundColor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
              }}
            SelectProps={{
              native: false
            }}
          >
            {Object.keys(examStructure).map((category) => (
              <MenuItem key={category} value={category}>
                {categoryNames[category] || category}
              </MenuItem>
            ))}
          </TextField>
          </Box>

          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="body2" sx={{ color: 'white', mb: 1, fontWeight: 'medium' }}>
              النوع
            </Typography>
          <TextField
            select
              fullWidth
            value={quickAccessSubcategory}
            onChange={(e) => {
              setQuickAccessSubcategory(e.target.value);
              // Reset exam when subcategory changes
              const availableExams = Object.keys(examStructure[quickAccessCategory]?.[e.target.value] || {});
              if (availableExams.length > 0) {
                setQuickAccessExam(availableExams[0]);
              } else {
                setQuickAccessExam('');
              }
            }}
            sx={{
              backgroundColor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
              }}
            SelectProps={{
              native: false
            }}
            disabled={!examStructure[quickAccessCategory]}
          >
            {Object.keys(examStructure[quickAccessCategory] || {}).map((subcategory) => (
              <MenuItem key={subcategory} value={subcategory}>
                {subcategoryNames[subcategory] || subcategory}
              </MenuItem>
            ))}
          </TextField>
          </Box>

          <Box sx={{ flex: 0.8, minWidth: 150 }}>
            <Typography variant="body2" sx={{ color: 'white', mb: 1, fontWeight: 'medium' }}>
              الامتحان
            </Typography>
          <TextField
            select
              fullWidth
            value={quickAccessExam}
            onChange={(e) => setQuickAccessExam(e.target.value)}
            sx={{
              backgroundColor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
              }}
            SelectProps={{
              native: false
            }}
            disabled={!examStructure[quickAccessCategory]?.[quickAccessSubcategory]}
          >
            {Object.keys(examStructure[quickAccessCategory]?.[quickAccessSubcategory] || {}).map((examNum) => (
              <MenuItem key={examNum} value={examNum}>
                Exam {examNum}
              </MenuItem>
            ))}
          </TextField>
          </Box>

          <Button
            variant="contained"
            onClick={() => onExamSelect(quickAccessCategory, quickAccessSubcategory, quickAccessExam)}
            disabled={!quickAccessExam || !examStructure[quickAccessCategory]?.[quickAccessSubcategory]?.[quickAccessExam]}
            sx={{ 
              minWidth: 140, 
              height: 56,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
              boxShadow: '0 4px 16px rgba(76,175,80,0.3)',
              fontWeight: 'bold',
              fontSize: '1rem',
              '&:hover': {
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                boxShadow: '0 6px 20px rgba(76,175,80,0.4)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                background: 'rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.6)',
                boxShadow: 'none'
              }
            }}
          >
انتقل للامتحان
          </Button>
        </Box>

        {/* Enhanced selected exam info */}
        {quickAccessCategory && quickAccessSubcategory && quickAccessExam &&
         examStructure[quickAccessCategory]?.[quickAccessSubcategory]?.[quickAccessExam] && (
          <Box sx={{ 
            mt: 3, 
            p: 3, 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                تفاصيل الامتحان المحدد
            </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: 1.5,
                flex: 1,
                minWidth: 200
              }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5 }}>
                  الفئة
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 'medium' }}>
                  {categoryNames[quickAccessCategory]}
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: 1.5,
                flex: 1,
                minWidth: 200
              }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5 }}>
                  النوع
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 'medium' }}>
                  {subcategoryNames[quickAccessSubcategory]}
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: 1.5,
                flex: 1,
                minWidth: 200
              }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5 }}>
                  رقم الامتحان
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 'medium' }}>
                  Exam {quickAccessExam}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'rgba(76, 175, 80, 0.2)', 
              borderRadius: 1.5,
              border: '1px solid rgba(76, 175, 80, 0.3)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mr: 1 }}>
                  إجمالي الأسئلة:
                </Typography>
                <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {examStructure[quickAccessCategory][quickAccessSubcategory][quickAccessExam].length}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {Object.entries(examStructure).map(([category, subcategories]) => (
        <Box key={category} sx={{ mb: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
          <Button
            fullWidth
            sx={{
              justifyContent: 'space-between',
              p: 2,
              backgroundColor: expandedCategory === category ? 'primary.light' : 'transparent',
              color: expandedCategory === category ? 'white' : 'inherit'
            }}
            onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
          >
            <Typography variant="h6">
              {categoryNames[category] || category} ({Object.keys(subcategories).length} أنواع)
            </Typography>
            <Typography>{expandedCategory === category ? '▼' : '▶'}</Typography>
          </Button>

          {expandedCategory === category && (
            <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
              {Object.entries(subcategories).map(([subcategory, exams]) => (
                <Box key={subcategory} sx={{ mb: 2 }}>
                  <Button
                    fullWidth
                    sx={{
                      justifyContent: 'space-between',
                      backgroundColor: expandedSubcategory === `${category}-${subcategory}` ? 'secondary.light' : 'white',
                      border: 1,
                      borderColor: 'grey.300'
                    }}
                    onClick={() => setExpandedSubcategory(
                      expandedSubcategory === `${category}-${subcategory}`
                        ? null
                        : `${category}-${subcategory}`
                    )}
                  >
                    <Typography>
                      {subcategoryNames[subcategory] || subcategory} ({Object.keys(exams).length} امتحانات)
                    </Typography>
                    <Typography>
                      {expandedSubcategory === `${category}-${subcategory}` ? '▼' : '▶'}
                    </Typography>
                  </Button>

                  {expandedSubcategory === `${category}-${subcategory}` && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {Object.entries(exams).map(([examNumber, questions]) => (
                        <Box key={examNumber} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => onExamSelect(category, subcategory, examNumber)}
                            sx={{ minWidth: '80px' }}
                          >
                            امتحان {examNumber}
                            <br />
                            ({questions.length} أسئلة)
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            color="error"
                            onClick={() => handleDeleteExam(category, subcategory, examNumber, questions.length)}
                            sx={{ 
                              minWidth: '40px',
                              height: '32px',
                              px: 1
                            }}
                          >
                            🗑️
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ))}

      {/* Add New Exam Form Modal */}
      {showAddExamForm && (
        <AddExamForm
          onClose={() => setShowAddExamForm(false)}
          onSuccess={() => {
            setShowAddExamForm(false);
            // Reload the exam structure
            onReload();
          }}
          getAuthHeaders={getAuthHeaders}
        />
      )}

      {/* Delete Exam Confirmation Dialog */}
      {showDeleteDialog && examToDelete && (
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
          zIndex: 1400
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowDeleteDialog(false);
            setExamToDelete(null);
          }
        }}
        >
          <Box sx={{
            backgroundColor: 'white',
            borderRadius: 3,
            p: 4,
            maxWidth: '500px',
            width: '90vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            zIndex: 1401
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ color: '#d32f2f', fontWeight: 'bold', mb: 1 }}>
                ⚠️ تأكيد حذف الامتحان
              </Typography>
              <Typography variant="body1" color="text.secondary">
                هل أنت متأكد من أنك تريد حذف هذا الامتحان؟ هذا الإجراء لا يمكن التراجع عنه.
              </Typography>
            </Box>

            <Box sx={{ 
              p: 3, 
              backgroundColor: '#ffebee', 
              borderRadius: 2, 
              border: '1px solid #ffcdd2',
              mb: 3 
            }}>
              <Typography variant="h6" sx={{ color: '#d32f2f', mb: 2 }}>
                تفاصيل الامتحان المراد حذفه:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1">
                  <strong>الفئة:</strong> {categoryNames[examToDelete.category] || examToDelete.category}
                </Typography>
                <Typography variant="body1">
                  <strong>النوع الفرعي:</strong> {subcategoryNames[examToDelete.subcategory] || examToDelete.subcategory}
                </Typography>
                <Typography variant="body1">
                  <strong>رقم الامتحان:</strong> {examToDelete.examNumber}
                </Typography>
                <Typography variant="body1" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                  <strong>عدد الأسئلة:</strong> {examToDelete.questionCount} سؤال
                </Typography>
              </Box>
            </Box>

            <Box sx={{ 
              p: 2, 
              backgroundColor: '#fff3e0', 
              borderRadius: 2, 
              border: '1px solid #ffcc02',
              mb: 3 
            }}>
              <Typography variant="body2" sx={{ color: '#f57c00', fontWeight: 'medium' }}>
                ⚠️ تحذير: سيتم حذف جميع الأسئلة في هذا الامتحان نهائياً ولا يمكن استردادها.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setExamToDelete(null);
                }}
                disabled={deleting}
                sx={{ minWidth: '100px' }}
              >
                إلغاء
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={confirmDeleteExam}
                disabled={deleting}
                sx={{ 
                  minWidth: '100px',
                  background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #b71c1c, #d32f2f)'
                  }
                }}
              >
                {deleting ? <CircularProgress size={20} color="inherit" /> : 'حذف الامتحان'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function AddExamForm({ onClose, onSuccess, getAuthHeaders }) {
  const [formData, setFormData] = useState({
    category: 'cTeoria',
    subcategory: 'heavy',
    exam_number: ''
  });
  const [loading, setLoading] = useState(false);

  const categoryNames = {
    'cTeoria': 'استكمالي',
    'nTeoria': 'نظري جديد',
    'training': 'تدريب',
    'english_teoria': 'انجليزي'
  };

  const subcategoryNames = {
    'heavy': 'Heavy (شحن ثقيل)',
    'light': 'Light (شحن خفيف)',
    'private': 'Private (خصوصي)',
    'taxi': 'Taxi (عمومي)',
    'motorcycle': 'Motorcycle (دراجة نارية)',
    'tractor': 'Tractor (تراكتور)',
    'quizes': 'Quizzes'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'فشل في إنشاء الامتحان');
      }
    } catch (err) {
      alert('خطأ في إنشاء الامتحان');
    } finally {
      setLoading(false);
    }
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
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}
    >
      <Box sx={{
        backgroundColor: 'white',
        borderRadius: 3,
        p: 4,
        maxWidth: '500px',
        width: '90vw',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 1301
      }}
      onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            إضافة امتحان جديد
          </Typography>
          <Button
            onClick={onClose}
            sx={{ color: '#666', minWidth: 'auto', p: 1 }}
          >
            ✕
          </Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="الفئة"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            select
            required
            fullWidth
            SelectProps={{
              MenuProps: {
                disablePortal: false,
                disableScrollLock: true,
                container: () => document.body,
                PaperProps: {
                  sx: {
                    zIndex: 9999,
                    position: 'fixed !important',
                    '& .MuiMenuItem-root': {
                      zIndex: 9999
                    }
                  }
                }
              }
            }}
          >
            {Object.entries(categoryNames).map(([key, name]) => (
              <MenuItem key={key} value={key}>
                {name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="النوع"
            value={formData.subcategory}
            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
            select
            required
            fullWidth
            SelectProps={{
              MenuProps: {
                disablePortal: false,
                disableScrollLock: true,
                container: () => document.body,
                PaperProps: {
                  sx: {
                    zIndex: 9999,
                    position: 'fixed !important',
                    '& .MuiMenuItem-root': {
                      zIndex: 9999
                    }
                  }
                }
              }
            }}
          >
            {Object.entries(subcategoryNames).map(([key, name]) => (
              <MenuItem key={key} value={key}>
                {name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="رقم الامتحان"
            type="number"
            value={formData.exam_number}
            onChange={(e) => setFormData({ ...formData, exam_number: e.target.value })}
            required
            fullWidth
            helperText="أدخل رقم الامتحان الجديد"
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'إنشاء الامتحان'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function QuestionsTab({
  questions,
  loading,
  searchTerm,
  setSearchTerm,
  page,
  setPage,
  totalPages,
  onReload,
  getAuthHeaders,
  selectedCategory,
  selectedSubcategory,
  selectedExamNumber,
  onClearFilters
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const deleteQuestion = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/admin/questions?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        onReload();
      } else {
        alert('Failed to delete question');
      }
    } catch (err) {
      alert('Error deleting question');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {/* Current Filter Display */}
      {(selectedCategory || selectedSubcategory || selectedExamNumber) && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'primary.light', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
            عرض حالياً:
          </Typography>
          <Typography sx={{ color: 'white' }}>
            {selectedCategory && `الفئة: ${selectedCategory}`}
            {selectedSubcategory && ` → النوع: ${selectedSubcategory}`}
            {selectedExamNumber && ` → الامتحان: ${selectedExamNumber}`}
          </Typography>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={onClearFilters}
            sx={{ mt: 1 }}
          >
مسح المرشحات وعرض جميع الأسئلة
          </Button>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          label="البحث في الأسئلة"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: '300px', flex: 1 }}
        />
        <Button variant="contained" onClick={() => setShowAddForm(true)}>
إضافة سؤال
        </Button>
      </Box>

      {showAddForm && (
        <QuestionForm
          onClose={() => setShowAddForm(false)}
          onSuccess={onReload}
          getAuthHeaders={getAuthHeaders}
          defaultValues={{
            category: selectedCategory || 'cTeoria',
            subcategory: selectedSubcategory || 'heavy',
            exam_number: selectedExamNumber || '1'
          }}
        />
      )}

      {editingQuestion && (
        <QuestionForm
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSuccess={onReload}
          getAuthHeaders={getAuthHeaders}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {questions.map((question, index) => (
          <Box
            key={question.id}
            sx={{
              background: selectedExamNumber 
                ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: 3,
              p: 4,
              boxShadow: selectedExamNumber 
                ? '0 8px 32px rgba(76,175,80,0.2)'
                : '0 4px 20px rgba(0,0,0,0.08)',
              border: selectedExamNumber 
                ? '1px solid rgba(255,255,255,0.1)'
                : '1px solid rgba(76,175,80,0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: selectedExamNumber 
                  ? 'rgba(255,255,255,0.3)'
                  : 'linear-gradient(90deg, #4caf50, #66bb6a)'
              }
            }}
          >
            {/* Question Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{
                    p: 1,
                    backgroundColor: selectedExamNumber ? 'rgba(255,255,255,0.2)' : 'rgba(76,175,80,0.1)',
                    borderRadius: 2,
                    mr: 2
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: selectedExamNumber ? 'white' : '#4caf50',
                      fontWeight: 'bold'
                    }}>
                      #{index + 1}
                </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ 
                    color: selectedExamNumber ? 'white' : '#2e7d32',
                    fontWeight: 'bold'
                  }}>
                    سؤال {selectedExamNumber && `(امتحان ${selectedExamNumber})`}
                </Typography>
              </Box>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: selectedExamNumber ? 'rgba(255,255,255,0.1)' : 'rgba(76,175,80,0.05)',
                  borderRadius: 2,
                  border: selectedExamNumber ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(76,175,80,0.1)'
                }}>
                  <Typography variant="body2" sx={{ 
                    color: selectedExamNumber ? 'rgba(255,255,255,0.8)' : '#666',
                    mb: 0.5
                  }}>
                    ID: {question.original_id}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: selectedExamNumber ? 'rgba(255,255,255,0.8)' : '#666'
                  }}>
                    {question.category}/{question.subcategory}/exam-{question.exam_number}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1.5, ml: 2 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setEditingQuestion(question)}
                  sx={{
                    background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
                    color: 'white',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(76,175,80,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                      boxShadow: '0 4px 12px rgba(76,175,80,0.4)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
تعديل
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => deleteQuestion(question.id)}
                  sx={{
                    background: 'linear-gradient(45deg, #f44336, #d32f2f)',
                    color: 'white',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(244,67,54,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                      boxShadow: '0 4px 12px rgba(244,67,54,0.4)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
حذف
                </Button>
              </Box>
            </Box>

            {/* Question Content */}
            <Box sx={{ 
              backgroundColor: selectedExamNumber ? 'rgba(255,255,255,0.1)' : 'rgba(76,175,80,0.05)', 
              p: 3, 
              borderRadius: 2, 
              mb: 3,
              border: selectedExamNumber ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(76,175,80,0.1)'
            }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                fontWeight: 'bold', 
                color: selectedExamNumber ? 'white' : '#2e7d32',
                lineHeight: 1.6
              }}>
                <SignRenderer text={question.question} />
              </Typography>

              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                gap: 2 
              }}>
                {[
                  { key: 'A', value: question.option_a },
                  { key: 'B', value: question.option_b },
                  { key: 'C', value: question.option_c },
                  { key: 'D', value: question.option_d }
                ].filter(option => option.value).map((option) => (
                  <Box
                    key={option.key}
                    sx={{
                      p: 2,
                      backgroundColor: selectedExamNumber ? 'rgba(255,255,255,0.1)' : 'white',
                      borderRadius: 2,
                      border: selectedExamNumber 
                        ? '1px solid rgba(255,255,255,0.2)'
                        : '1px solid rgba(76,175,80,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: selectedExamNumber 
                          ? '0 4px 12px rgba(255,255,255,0.1)'
                          : '0 4px 12px rgba(76,175,80,0.15)'
                      }
                    }}
                  >
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: selectedExamNumber ? 'rgba(255,255,255,0.2)' : '#4caf50',
                      color: selectedExamNumber ? 'white' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      mr: 2,
                      flexShrink: 0
                    }}>
                      {option.key}
                    </Box>
                    <Typography variant="body1" sx={{ 
                      color: selectedExamNumber ? 'white' : '#333',
                      fontWeight: 'medium'
                    }}>
                      <SignRenderer text={option.value} />
                </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Correct Answer Highlight */}
            <Box sx={{
              background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
              p: 2,
              borderRadius: 2,
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(76,175,80,0.3)'
            }}>
              <Box sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: 'white',
                color: '#4caf50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                mr: 1.5
              }}>
                ✓
              </Box>
              <Typography variant="body1" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>
                الإجابة الصحيحة: الخيار {question.correct_answer}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Enhanced Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, gap: 2 }}>
        <Button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          variant="outlined"
        >
السابق ⬅️
        </Button>
        <Typography variant="body1" sx={{
          px: 3,
          py: 1,
          backgroundColor: 'primary.light',
          color: 'white',
          borderRadius: 1,
          fontWeight: 'bold'
        }}>
📄 صفحة {page} من {totalPages}
        </Typography>
        <Button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          variant="outlined"
        >
التالي ➡️
        </Button>
      </Box>

    </Box>
  );
}


function DuplicatesTab({ duplicates, loading, onReload, getAuthHeaders }) {
  const categoryNames = {
    'cTeoria': 'استكمالي',
    'nTeoria': 'نظري جديد',
    'training': 'تدريب',
    'english_teoria': 'انجليزي'
  };

  const subcategoryNames = {
    'heavy': 'Heavy (شحن ثقيل)',
    'light': 'Light (شحن خفيف)',
    'private': 'Private (خصوصي)',
    'taxi': 'Taxi (عمومي)',
    'motorcycle': 'Motorcycle (دراجة نارية)',
    'tractor': 'Tractor (تراكتور)',
    'quizes': 'Quizzes'
  };

  const deleteQuestion = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;

    try {
      const response = await fetch(`/api/admin/questions?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        onReload();
      } else {
        alert('فشل في حذف السؤال');
      }
    } catch (err) {
      alert('خطأ في حذف السؤال');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  if (!duplicates || Object.keys(duplicates).length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          لا توجد أسئلة مكررة في قاعدة البيانات
        </Typography>
        <Button
          variant="contained"
          onClick={onReload}
          sx={{ mt: 2 }}
        >
          إعادة فحص
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
          الأسئلة المكررة
        </Typography>
        <Button
          variant="contained"
          onClick={onReload}
          sx={{
            background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
            }
          }}
        >
          إعادة فحص
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        تم العثور على أسئلة مكررة في قاعدة البيانات. الأسئلة مرتبة حسب عدد التكرارات.
      </Typography>

      {Object.entries(duplicates)
        .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Sort by frequency (highest first)
        .map(([frequency, questionGroups]) => (
          <Box key={frequency} sx={{ mb: 4 }}>
            <Box sx={{
              p: 2,
              backgroundColor: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              borderRadius: 2,
              mb: 2
            }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                المجموعة {frequency}: أسئلة مكررة {frequency} مرات
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {questionGroups.length} مجموعة من الأسئلة المكررة
              </Typography>
            </Box>

            {questionGroups.map((group, groupIndex) => (
              <Box key={groupIndex} sx={{ mb: 3 }}>
                <Box sx={{
                  p: 3,
                  border: '2px solid #4caf50',
                  borderRadius: 2,
                  backgroundColor: 'rgba(76,175,80,0.05)'
                }}>
                  {/* Question Content */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 1 }}>
                      نص السؤال:
                    </Typography>
                    <Box sx={{
                      p: 2,
                      backgroundColor: 'white',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}>
                      <SignRenderer text={group[0].question} />
                    </Box>
                  </Box>

                  {/* Options */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 1 }}>
                      الخيارات:
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
                      {[
                        { key: 'A', value: group[0].option_a },
                        { key: 'B', value: group[0].option_b },
                        { key: 'C', value: group[0].option_c },
                        { key: 'D', value: group[0].option_d }
                      ].filter(option => option.value).map((option) => (
                        <Box key={option.key} sx={{
                          p: 1,
                          backgroundColor: 'white',
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}>
                          <Typography variant="body2">
                            <strong>{option.key}:</strong> <SignRenderer text={option.value} />
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Correct Answer */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                      الإجابة الصحيحة: الخيار {group[0].correct_answer}
                    </Typography>
                  </Box>

                  {/* Duplicate Locations */}
                  <Box>
                    <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 1 }}>
                      مواقع التكرار:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {group.map((question, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            backgroundColor: 'white',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0',
                            minWidth: '200px',
                            position: 'relative'
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            الموقع {index + 1}:
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>المعرف:</strong> {question.original_id}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>الفئة:</strong> {categoryNames[question.category] || question.category}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>النوع:</strong> {subcategoryNames[question.subcategory] || question.subcategory}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>الامتحان:</strong> {question.exam_number}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>رقم السؤال في الامتحان:</strong> {question.position + 1}
                          </Typography>
                          
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => deleteQuestion(question.id)}
                            sx={{ mt: 1 }}
                          >
                            حذف هذا التكرار
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ))}
    </Box>
  );
}

function QuestionForm({ question, onClose, onSuccess, getAuthHeaders, defaultValues }) {
  // Generate a unique ID if creating a new question
  const generateUniqueId = () => {
    // Generate a smaller ID that fits in database integer field
    const timestamp = Math.floor(Date.now() / 1000); // Use seconds instead of milliseconds
    const random = Math.floor(Math.random() * 10000); // 0-9999
    return timestamp + random;
  };

  const [formData, setFormData] = useState({
    original_id: question?.original_id || generateUniqueId(),
    category: question?.category || defaultValues?.category || 'cTeoria',
    subcategory: question?.subcategory || defaultValues?.subcategory || 'heavy',
    exam_number: question?.exam_number || defaultValues?.exam_number || '1',
    question: question?.question || '',
    option_a: question?.option_a || '',
    option_b: question?.option_b || '',
    option_c: question?.option_c || '',
    option_d: question?.option_d || '',
    correct_answer: question?.correct_answer || 1,
  });
  const [loading, setLoading] = useState(false);
  const [showSignSelector, setShowSignSelector] = useState(false);
  const [signSelectorField, setSignSelectorField] = useState('');
  const [signSelectorPosition, setSignSelectorPosition] = useState(0);

  // Available signs data
  const availableSigns = [
    // Category A signs
    { id: 'a1', title: 'أ-1', content: 'طريق وعرة أو مشوشة' },
    { id: 'a2', title: 'أ-2', content: 'انعطاف حاد إلى اليسار' },
    { id: 'a3', title: 'أ-3', content: 'انعطاف حاد إلى اليمين' },
    { id: 'a5', title: 'أ-5', content: 'انعطاف شديد الالتواء نحو اليمين' },
    { id: 'a7', title: 'أ-7', content: 'انعطاف إلى اليمين وثم إلى اليسار' },
    { id: 'a8', title: 'أ-8', content: 'طريق ملتوية' },
    { id: 'a9', title: 'أ-9', content: 'الطريق آخذة في الضيق' },
    { id: 'a10', title: 'أ-10', content: 'جسر ضيق' },
    { id: 'a11', title: 'أ-11', content: 'أشغال على الطريق' },
    { id: 'a12', title: 'أ-12', content: 'مفترق تقاطع طرق' },
    { id: 'a14', title: 'أ-14', content: 'مفترق تفرع طرق إلى اليمين' },
    { id: 'a15', title: 'أ-15', content: 'مفترق تفرع طرق إلى اليمين والى اليسار' },
    { id: 'a17', title: 'أ-17', content: 'مفترق تفرعات: نحو اليمين وثم نحو اليسار' },
    { id: 'a18', title: 'أ-18', content: 'حركة سير دائرية على بعد 50-150 متر' },
    { id: 'a19', title: 'أ-19', content: 'آلة ضوئية على بعد 50-150 متر' },
    { id: 'a20', title: 'أ-20', content: 'اندماج شارع فيه حق الأولوية مع طريق جانبية من اليمين' },
    { id: 'a22', title: 'أ-22', content: 'اندماج مع شارع فيه حق الأولوية' },
    { id: 'a24', title: 'أ-24', content: 'اكتظاظ في حركة السير أمامك' },
    { id: 'a25', title: 'أ-25', content: 'ملتقى سكة حديد' },
    { id: 'a28', title: 'أ-28', content: 'الاقتراب من ملتقى سكة حديد على بعد 250م' },
    { id: 'a29', title: 'أ-29', content: 'الاقتراب من ملتقى سكة حديد على بعد 170م' },
    { id: 'a30', title: 'أ-30', content: 'الاقتراب من ملتقى سكة حديد على بعد 100م' },
    { id: 'a32', title: 'أ-32', content: 'مكان ملتقى سكة حديد - أكثر من خط واحد على بعد 10م' },
    { id: 'a33', title: 'أ-33', content: 'أمامك إشارة "قف"' },
    { id: 'a34', title: 'أ-34', content: 'منحدر خطر' },
    { id: 'a35', title: 'أ-35', content: 'خطر التزحلق' },
    { id: 'a36', title: 'أ-36', content: 'أمامك ممر للمشاة' },
    { id: 'a37', title: 'أ-37', content: 'مشاة بالقرب من المكان' },
    { id: 'a38', title: 'أ-38', content: 'أمامك حركة سير بالاتجاهين' },
    { id: 'a39', title: 'أ-39', content: 'ضوضاء طائرات على ارتفاع منخفض' },
    { id: 'a40', title: 'أ-40', content: 'مكان خطر لم تُحدد له شاخصة خاصة' },
    { id: 'a43', title: 'أ-43', content: 'شاخصة للتحذير والإرشاد والمنع' },
    { id: 'a46', title: 'أ-46', content: 'مطبات أمامك' },
    
    // Category B signs
    { id: 'b1', title: 'ب-1', content: 'مغلق أمام جميع المركبات' },
    { id: 'b2', title: 'ب-2', content: 'مغلق أمام جميع المركبات (شارع باتجاه واحد)' },
    { id: 'b3', title: 'ب-3', content: 'ممنوع الاستدارة نحو اليسار' },
    { id: 'b6', title: 'ب-6', content: 'ممنوع الاستدارة إلى اليسار للسير في الاتجاه المعاكس' },
    { id: 'b7', title: 'ب-7', content: 'أعط حق الأولوية في الطريق الضيقة' },
    { id: 'b8', title: 'ب-8', content: 'ممنوع التجاوز أو العبور' },
    { id: 'b9', title: 'ب-9', content: 'نهاية مقطع الطريق الذي يسري عليه قيد التجاوز' },
    { id: 'b10', title: 'ب-10', content: 'لا يجوز لمركبة تجارية أن تتجاوز' },
    { id: 'b11', title: 'ب-11', content: 'نهاية مقطع الطريق الذي يسري عليه قيد التجاوز' },
    { id: 'b12', title: 'ب-12', content: 'ممنوع دخول المركبات الميكانيكية' },
    { id: 'b13', title: 'ب-13', content: 'ممنوع دخول الدراجات النارية' },
    { id: 'b14', title: 'ب-14', content: 'ممنوع الدخول جميع المركبات الميكانيكية' },
    { id: 'b15', title: 'ب-15', content: 'ممنوع دخول المركبات الميكانيكية التجارية' },
    { id: 'b16', title: 'ب-16', content: 'ممنوع دخول جميع المركبات التي يزيد وزنها' },
    { id: 'b17', title: 'ب-17', content: 'ممنوع دخول مركبة وحمولتها والتي يزيد عرضها' },
    { id: 'b18', title: 'ب-18', content: 'ممنوع دخول مركبة وحمولتها والتي يزيد ارتفاعها' },
    { id: 'b20', title: 'ب-20', content: 'سرعة خاصة: ممنوع السير بسرعة تزيد عن' },
    { id: 'b21', title: 'ب-21', content: 'نهاية المقطع الذي فيه السرعة الخاصة' },
    { id: 'b24', title: 'ب-24', content: 'الدخول إلى طريق أو طرق بلدية' },
    { id: 'b25', title: 'ب-25', content: 'نهاية الطريق أو الطرق البلدية' },
    { id: 'b28', title: 'ب-28', content: 'ممنوع وقوف مركبة في الطريق' },
    { id: 'b29', title: 'ب-29', content: 'ممنوع الوقوف والتوقف في الطريق' },
    { id: 'b30', title: 'ب-30', content: 'ممنوع وقوف مركبة تجارية' },
    { id: 'b31', title: 'ب-31', content: 'نهاية المنطقة التي يُمنع فيها وقوف مركبة تجارية' },
    { id: 'b32', title: 'ب-32', content: 'نهاية المنطقة التي يُمنع فيها الوقوف أو التوقف' },
    { id: 'b33', title: 'ب-33', content: 'الدخول إلى منطقة يحظر فيها دخول مركبة تعليم السواقة' },
    { id: 'b34', title: 'ب-34', content: 'نهاية المنطقة التي يحظر فيها دخول مركبة تعليم السواقة' },
    { id: 'b35', title: 'ب-35', content: 'يجوز السفر في الشارع أو في المسلك للقطار الخفيف' },
    { id: 'b36', title: 'ب-36', content: 'أعطِ حق الأولوية لحركة السير في الطريق القاطعة' },
    { id: 'b37', title: 'ب-37', content: 'قف! وأعطِ حق الأولوية لحركة السير في الطريق القاطعة' },
    { id: 'b38', title: 'ب-38', content: 'قف! (شاخصة متنقلة)' },
    { id: 'b39', title: 'ب-39', content: 'تقدم بحذر (شاخصة متنقلة)' },
    { id: 'b41', title: 'ب-41', content: 'سر إلى اليسار من أمام الشاخصة' },
    { id: 'b43', title: 'ب-43', content: 'سر إلى اليسار من خلف الشاخصة' },
    { id: 'b44', title: 'ب-44', content: 'سر إلى الأمام' },
    { id: 'b46', title: 'ب-46', content: 'سر إلى اليسار أو إلى الأمام' },
    { id: 'b47', title: 'ب-47', content: 'سر إلى اليمين أو إلى اليسار' },
    { id: 'b48', title: 'ب-48', content: 'أعطِ حق الأولوية لحركة السير القاطعة طريقك' },
    { id: 'b49', title: 'ب-49', content: 'يجوز عبور المكان الموسوم بهذه الشاخصة' },
    { id: 'b51', title: 'ب-51', content: 'اعبر المكان الموسوم بالشاخصة من جانبه الأيسر' },
    { id: 'b52', title: 'ب-52', content: 'طريق للمركبات الميكانيكية فقط' },
    { id: 'b53', title: 'ب-53', content: 'طريق للمركبات الميكانيكية التي تستطيع السير بسرعة' },
    { id: 'b54', title: 'ب-54', content: 'الدخول إلى طريق سريعة' },
    { id: 'b55', title: 'ب-55', content: 'نهاية الطريق السريعة' },
    { id: 'b57', title: 'ب-57', content: 'مكان إنزال واصعاد الركاب للصالون العمومي' },
    { id: 'b58', title: 'ب-58', content: 'محطة صالون عمومي' },
    { id: 'b59', title: 'ب-59', content: 'نهاية منطقة محطة الصالون العمومي' },
    { id: 'b60', title: 'ب-60', content: 'ممنوع دخول التراكتورات ومركبات العمل' },
    { id: 'b61', title: 'ب-61', content: 'ممنوع دخول الحيوانات أو العربات التي تجرها الحيوانات' },
    { id: 'b62', title: 'ب-62', content: 'ممنوع دخول الدراجات الهوائية' },
    { id: 'b63', title: 'ب-63', content: 'سبيل للدراجات الهوائية فقط' },
    { id: 'b63a', title: 'ب-63 أ', content: 'سبيل للدراجات الهوائية وللمشاة فقط' },
    { id: 'b63b', title: 'ب-63 ب', content: 'سبيلان منفردان للدراجات الهوائية وللمشاة فقط' },
    { id: 'b64', title: 'ب-64', content: 'ممنوع دخول المشاة بما في ذلك طرف الطريق' },
    { id: 'b65', title: 'ب-65', content: 'سبيل للمشاة فقط' },
    { id: 'b66', title: 'ب-66', content: 'ممنوع دخول مركبة تنقل مواد خطرة' },
    
    // Category C signs
    { id: 'c1', title: 'ج-1', content: 'موقف للمركبات' },
    { id: 'c4', title: 'ج-4', content: 'طريق بدون مخرج' },
    { id: 'c5', title: 'ج-5', content: 'لك حق الأولوية في الطريق الضيقة' },
    { id: 'c6', title: 'ج-6', content: 'الدخول إلى مقطع طريق فيها حركة السير باتجاه السهم فقط' },
    { id: 'c6a', title: 'ج-6 أ', content: 'حركة السير باتجاه السهم الأبيض مسموحة' },
    { id: 'c7', title: 'ج-7', content: 'مكان عبور المشاة' },
    { id: 'c28', title: 'ج-28', content: 'لافتة إرشاد قبل المفترق' },
    { id: 'c29', title: 'ج-29', content: 'لافتة إرشاد قبل محول في طريق سريعة' },
    { id: 'c38', title: 'ج-38', content: 'مكان وقوف لمركبة معاق' },
    { id: 'c39', title: 'ج-39', content: 'عدد المسالك في الشارع آخذ في التزايد' },
    { id: 'c40', title: 'ج-40', content: 'عدد المسالك في الشارع آخذ في التناقص' },
    { id: 'c44', title: 'ج-44', content: 'يجوز الوقوف على الرصيف' },
    { id: 'c45', title: 'ج-45', content: 'شارع مختلط' },
    { id: 'c46', title: 'ج-46', content: 'نهاية الشارع المختلط' },
    
    // Category D signs
    { id: 'd1', title: 'د-1', content: 'خط متقطع: خط محور الشارع' },
    { id: 'd2', title: 'د-2', content: 'خطوط متقاطعة متوازية' },
    { id: 'd3', title: 'د-3', content: 'خط متقطع مزدوج باللون الأصفر' },
    { id: 'd4', title: 'د-4', content: 'خط فاصل متواصل' },
    { id: 'd5', title: 'د-5', content: 'خط متقطع متراص (خط توجيه)' },
    { id: 'd6', title: 'د-6', content: 'خط متقطع بجانب خط فاصل متواصل' },
    { id: 'd7', title: 'د-7', content: 'خط حدود' },
    { id: 'd8', title: 'د-8', content: 'خط توقف' },
    { id: 'd9', title: 'د-9', content: 'خط مستطيلات' },
    { id: 'd10', title: 'د-10', content: 'مكان عبور للمشاة' },
    { id: 'd12', title: 'د-12', content: 'خطوط توجيه للاستدارة في المفترقات' },
    { id: 'd13', title: 'د-13', content: 'أسهم للسير في المفترق' },
    { id: 'd14', title: 'د-14', content: 'جزر سير' },
    { id: 'd15', title: 'د-15', content: 'أحجار حافة مصبوغة باللون الأحمر والأبيض' },
    { id: 'd16', title: 'د-16', content: 'مكان ممنوع الوقوف عليه' },
    { id: 'd17', title: 'د-17', content: 'مكان توقف لأنواع معينة من المركبات' },
    { id: 'd18', title: 'د-18', content: 'مكان توقف لأنواع معينة من المركبات في الخليج' },
    { id: 'd20', title: 'د-20', content: 'أحجار حافة مصبوغة بالأزرق بالتناوب' },
    { id: 'd21', title: 'د-21', content: 'أحجار حافة مصبوغة بالأحمر والأصفر' },
    
    // Category E signs (Traffic Lights)
    { id: 'e1', title: 'هـ-1', content: 'ضوء أحمر: قف!' },
    { id: 'e2', title: 'هـ-2', content: 'ضوء أحمر مع ضوء أصفر: قف!' },
    { id: 'e3', title: 'هـ-3', content: 'ضوء أخضر: تقدم!' },
    { id: 'e5', title: 'هـ-5', content: 'ضوء أصفر: قف إذا أمكن' },
    { id: 'e6', title: 'هـ-6', content: 'آلة ضوئية خاصة للمركبات قبل ممر مشاة' },
    { id: 'e7', title: 'هـ-7', content: 'آلة ضوئية خاصة للمركبات قبل ممر مشاة' },
    { id: 'e8', title: 'هـ-8', content: 'آلة ضوئية خاصة للمركبات قبل منعطف' },
    { id: 'e9', title: 'هـ-9', content: 'آلة ضوئية خاصة بالمشاة' },
    { id: 'e10', title: 'هـ-10', content: 'آلة ضوئية خاصة بالمشاة' },
    { id: 'e11', title: 'هـ-11', content: 'ضوء احمر مزدوج متقطع' },
    
    // Category F signs
    { id: 'f1', title: 'و-1', content: 'حاجز قبل ملتقى سكة حديد' },
    { id: 'f2', title: 'و-2', content: 'حاجز قبل مكان عمل' },
    { id: 'f3', title: 'و-3', content: 'أحجار الحافة مدهونة باللون الأسود والأبيض' },
    { id: 'f7', title: 'و-7', content: 'أزرار مع أو بدون عاكس ضوء' },
    { id: 'f8', title: 'و-8', content: 'حاجز لوقاية المارة' },
    { id: 'f9', title: 'و-9', content: 'شاخصة تحذير وإرشاد في ملتقى تفرع طرق' },
    { id: 'f10', title: 'و-10', content: 'شاخصة تحذير وإرشاد في ملتقى تفرع طرق' }
  ];

  const insertSign = (signId) => {
    const signCode = `[[${signId}]]`;
    const currentValue = formData[signSelectorField];
    const newValue = currentValue.slice(0, signSelectorPosition) + signCode + currentValue.slice(signSelectorPosition);
    
    setFormData({
      ...formData,
      [signSelectorField]: newValue
    });
    
    setShowSignSelector(false);
  };

  const openSignSelector = (fieldName, position) => {
    setSignSelectorField(fieldName);
    setSignSelectorPosition(position);
    setShowSignSelector(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = question ? `/api/admin/questions?id=${question.id}` : '/api/admin/questions';
      const method = question ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Failed to save question');
      }
    } catch (err) {
      alert('Error saving question');
    } finally {
      setLoading(false);
    }
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
      zIndex: 9999
    }}>
      <Box sx={{
        backgroundColor: 'white',
        borderRadius: 3,
        p: 4,
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        width: '800px'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            {question ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
          </Typography>
          <Button
            onClick={onClose}
            sx={{ color: '#666', minWidth: 'auto', p: 1 }}
          >
            ✕
          </Button>
        </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
        <TextField
            label="المعرف الأصلي (يتم توليده تلقائياً)"
          type="number"
          value={formData.original_id}
          onChange={(e) => setFormData({ ...formData, original_id: e.target.value })}
          required
            disabled={!question} // Only allow editing when editing existing question
            helperText={!question ? "يتم توليد معرف فريد تلقائياً" : "يمكن تعديل المعرف عند التعديل"}
            fullWidth
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#4caf50',
                fontWeight: 'bold'
              }
            }}
          />
          {!question && (
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setFormData({ ...formData, original_id: generateUniqueId() })}
                sx={{ 
                  background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
                  }
                }}
              >
                توليد معرف جديد
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="الفئة"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            sx={{ flex: 1 }}
          />
          <TextField
            label="النوع الفرعي"
            value={formData.subcategory}
            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
            required
            sx={{ flex: 1 }}
          />
          <TextField
            label="رقم الامتحان"
            value={formData.exam_number}
            onChange={(e) => setFormData({ ...formData, exam_number: e.target.value })}
            required
            sx={{ flex: 1 }}
          />
        </Box>

        <Box>
        <TextField
            label="السؤال"
          multiline
          rows={3}
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          required
            fullWidth
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => openSignSelector('question', formData.question.length)}
              sx={{ 
                background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
                }
              }}
            >
              إضافة إشارة للسؤال
            </Button>
          </Box>
        </Box>

        <Box>
        <TextField
            label="الخيار أ"
          value={formData.option_a}
          onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
          required
            fullWidth
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => openSignSelector('option_a', formData.option_a.length)}
              sx={{ 
                background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
                }
              }}
            >
              إضافة إشارة للخيار أ
            </Button>
          </Box>
        </Box>

        <Box>
        <TextField
            label="الخيار ب"
          value={formData.option_b}
          onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
          required
            fullWidth
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => openSignSelector('option_b', formData.option_b.length)}
              sx={{ 
                background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
                }
              }}
            >
              إضافة إشارة للخيار ب
            </Button>
          </Box>
        </Box>

        <Box>
        <TextField
            label="الخيار ج (اختياري)"
          value={formData.option_c}
          onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
            fullWidth
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => openSignSelector('option_c', formData.option_c.length)}
              sx={{ 
                background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
                }
              }}
            >
              إضافة إشارة للخيار ج
            </Button>
          </Box>
        </Box>

        <Box>
        <TextField
            label="الخيار د (اختياري)"
          value={formData.option_d}
          onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
            fullWidth
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => openSignSelector('option_d', formData.option_d.length)}
              sx={{ 
                background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
                }
              }}
            >
              إضافة إشارة للخيار د
            </Button>
          </Box>
        </Box>

        <TextField
          label="الإجابة الصحيحة (1-4)"
          type="number"
          inputProps={{ min: 1, max: 4 }}
          value={formData.correct_answer}
          onChange={(e) => setFormData({ ...formData, correct_answer: parseInt(e.target.value) })}
          required
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : (question ? 'تحديث' : 'إنشاء')}
          </Button>
          <Button onClick={onClose} disabled={loading}>
إلغاء
          </Button>
        </Box>
      </Box>

      {/* Sign Selector Modal */}
      {showSignSelector && (
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
          zIndex: 9999
        }}>
          <Box sx={{
            backgroundColor: 'white',
            borderRadius: 3,
            p: 3,
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                اختيار الإشارة
              </Typography>
              <Button
                onClick={() => setShowSignSelector(false)}
                sx={{ color: '#666' }}
              >
                ✕
              </Button>
            </Box>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: 2,
              maxHeight: '60vh',
              overflow: 'auto'
            }}>
              {availableSigns.map((sign) => {
                return (
                  <Box
                    key={sign.id}
                    onClick={() => insertSign(sign.id)}
                    sx={{
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      '&:hover': {
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76,175,80,0.05)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(76,175,80,0.15)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 70,
                        width: 70,
                        borderRadius: 1,
                        border: '1px solid #e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        flexShrink: 0,
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <i 
                        className={`signal ${sign.id}`} 
                        style={{ 
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%) scale(0.7)',
                          transformOrigin: 'center center'
                        }}
                      ></i>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ 
                        color: '#4caf50', 
                        fontWeight: 'bold',
                        mb: 0.5
                      }}>
                        {sign.title}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#666',
                        lineHeight: 1.4,
                        mb: 0.5
                      }}>
                        {sign.content}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#999',
                        fontFamily: 'monospace'
                      }}>
                        [[{sign.id}]]
                      </Typography>
      </Box>
                  </Box>
                );
              })}
            </Box>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                onClick={() => setShowSignSelector(false)}
                variant="outlined"
                sx={{
                  borderColor: '#4caf50',
                  color: '#4caf50',
                  '&:hover': {
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(76,175,80,0.05)'
                  }
                }}
              >
                إلغاء
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      </Box>
    </Box>
  );
}

// License Types Tab Component
function LicenseTypesTab({ getAuthHeaders }) {
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const loadLicenseTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/license-types', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setLicenseTypes(data.data);
      }
    } catch (err) {
      console.error('Error loading license types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLicenseTypes();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      const url = editingType ? '/api/license-types' : '/api/license-types';
      const method = editingType ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(editingType ? { id: editingType.id, ...formData } : formData),
      });

      if (response.ok) {
        loadLicenseTypes();
        setShowForm(false);
        setEditingType(null);
      } else {
        alert('فشل في حفظ البيانات');
      }
    } catch (err) {
      alert('خطأ في حفظ البيانات');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا النوع؟')) return;

    try {
      const response = await fetch(`/api/license-types?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadLicenseTypes();
      } else {
        alert('فشل في حذف النوع');
      }
    } catch (err) {
      alert('خطأ في حذف النوع');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
          إدارة أنواع الرخص
        </Typography>
        <Button
          variant="contained"
          onClick={() => setShowForm(true)}
          sx={{
            background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
            }
          }}
        >
          إضافة نوع جديد
        </Button>
      </Box>

      {showForm && (
        <LicenseTypeForm
          type={editingType}
          onClose={() => {
            setShowForm(false);
            setEditingType(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {licenseTypes.map((type) => (
          <Box
            key={type.id}
            sx={{
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  {type.name_ar}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {type.name_en} ({type.type_key})
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                  العمر الأدنى: {type.min_age_exam} سنة للفحص، {type.min_age_license} سنة للرخصة
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setEditingType(type);
                    setShowForm(true);
                  }}
                >
                  تعديل
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => handleDelete(type.id)}
                >
                  حذف
                </Button>
              </Box>
            </Box>
            {type.description_ar && (
              <Typography variant="body2" sx={{ color: '#666' }}>
                {type.description_ar}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// License Type Form Component
function LicenseTypeForm({ type, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name_ar: type?.name_ar || '',
    name_en: type?.name_en || '',
    type_key: type?.type_key || '',
    min_age_exam: type?.min_age_exam || 17,
    min_age_license: type?.min_age_license || 17,
    description_ar: type?.description_ar || '',
    description_en: type?.description_en || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            {type ? 'تعديل نوع الرخصة' : 'إضافة نوع رخصة جديد'}
          </Typography>
          <Button onClick={onClose} sx={{ color: '#666' }}>✕</Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="الاسم بالعربية"
            value={formData.name_ar}
            onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="الاسم بالإنجليزية"
            value={formData.name_en}
            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="مفتاح النوع"
            value={formData.type_key}
            onChange={(e) => setFormData({ ...formData, type_key: e.target.value })}
            required
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="الحد الأدنى للفحص"
              type="number"
              value={formData.min_age_exam}
              onChange={(e) => setFormData({ ...formData, min_age_exam: parseInt(e.target.value) })}
              required
              sx={{ flex: 1 }}
            />
            <TextField
              label="الحد الأدنى للرخصة"
              type="number"
              value={formData.min_age_license}
              onChange={(e) => setFormData({ ...formData, min_age_license: parseInt(e.target.value) })}
              required
              sx={{ flex: 1 }}
            />
          </Box>
          <TextField
            label="الوصف بالعربية"
            multiline
            rows={3}
            value={formData.description_ar}
            onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
            fullWidth
          />
          <TextField
            label="الوصف بالإنجليزية"
            multiline
            rows={3}
            value={formData.description_en}
            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={onClose}>إلغاء</Button>
            <Button type="submit" variant="contained">حفظ</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// License Requirements Tab Component
function LicenseRequirementsTab({ getAuthHeaders }) {
  const [requirements, setRequirements] = useState([]);
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [selectedLicenseType, setSelectedLicenseType] = useState('');

  const loadRequirements = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/license-requirements', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setRequirements(data.data);
      }
    } catch (err) {
      console.error('Error loading requirements:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLicenseTypes = async () => {
    try {
      const response = await fetch('/api/license-types', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setLicenseTypes(data.data);
      }
    } catch (err) {
      console.error('Error loading license types:', err);
    }
  };

  useEffect(() => {
    loadRequirements();
    loadLicenseTypes();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      const url = editingRequirement ? '/api/license-requirements' : '/api/license-requirements';
      const method = editingRequirement ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(editingRequirement ? { id: editingRequirement.id, ...formData } : formData),
      });

      if (response.ok) {
        loadRequirements();
        setShowForm(false);
        setEditingRequirement(null);
      } else {
        alert('فشل في حفظ البيانات');
      }
    } catch (err) {
      alert('خطأ في حفظ البيانات');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المتطلب؟')) return;

    try {
      const response = await fetch(`/api/license-requirements?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadRequirements();
      } else {
        alert('فشل في حذف المتطلب');
      }
    } catch (err) {
      alert('خطأ في حذف المتطلب');
    }
  };

  const filteredRequirements = selectedLicenseType 
    ? requirements.filter(req => req.license_type_id === parseInt(selectedLicenseType))
    : requirements;

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
          إدارة متطلبات الرخص
        </Typography>
        <Button
          variant="contained"
          onClick={() => setShowForm(true)}
          sx={{
            background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
            }
          }}
        >
          إضافة متطلب جديد
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="فلترة حسب نوع الرخصة"
          value={selectedLicenseType}
          onChange={(e) => setSelectedLicenseType(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">جميع الأنواع</MenuItem>
          {licenseTypes.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.name_ar}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {showForm && (
        <LicenseRequirementForm
          requirement={editingRequirement}
          licenseTypes={licenseTypes}
          onClose={() => {
            setShowForm(false);
            setEditingRequirement(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredRequirements.map((requirement) => (
          <Box
            key={requirement.id}
            sx={{
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  {requirement.title_ar}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  النوع: {requirement.requirement_type} | 
                  الرخصة: {licenseTypes.find(t => t.id === requirement.license_type_id)?.name_ar || 'غير محدد'}
                </Typography>
                {requirement.description_ar && (
                  <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                    {requirement.description_ar}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setEditingRequirement(requirement);
                    setShowForm(true);
                  }}
                >
                  تعديل
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => handleDelete(requirement.id)}
                >
                  حذف
                </Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// License Requirement Form Component
function LicenseRequirementForm({ requirement, licenseTypes, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    license_type_id: requirement?.license_type_id || '',
    requirement_type: requirement?.requirement_type || 'document',
    title_ar: requirement?.title_ar || '',
    title_en: requirement?.title_en || '',
    description_ar: requirement?.description_ar || '',
    description_en: requirement?.description_en || '',
    is_required: requirement?.is_required !== false,
    sort_order: requirement?.sort_order || 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            {requirement ? 'تعديل المتطلب' : 'إضافة متطلب جديد'}
          </Typography>
          <Button onClick={onClose} sx={{ color: '#666' }}>✕</Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="نوع الرخصة"
            value={formData.license_type_id}
            onChange={(e) => setFormData({ ...formData, license_type_id: parseInt(e.target.value) })}
            required
            fullWidth
          >
            {licenseTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name_ar}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="نوع المتطلب"
            value={formData.requirement_type}
            onChange={(e) => setFormData({ ...formData, requirement_type: e.target.value })}
            required
            fullWidth
          >
            <MenuItem value="document">وثيقة</MenuItem>
            <MenuItem value="condition">شرط</MenuItem>
            <MenuItem value="note">ملاحظة</MenuItem>
          </TextField>
          <TextField
            label="العنوان بالعربية"
            value={formData.title_ar}
            onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="العنوان بالإنجليزية"
            value={formData.title_en}
            onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
            fullWidth
          />
          <TextField
            label="الوصف بالعربية"
            multiline
            rows={3}
            value={formData.description_ar}
            onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
            fullWidth
          />
          <TextField
            label="الوصف بالإنجليزية"
            multiline
            rows={3}
            value={formData.description_en}
            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="ترتيب العرض"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
              sx={{ flex: 1 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>مطلوب</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={onClose}>إلغاء</Button>
            <Button type="submit" variant="contained">حفظ</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// License Pricing Tab Component
function LicensePricingTab({ getAuthHeaders }) {
  const [pricing, setPricing] = useState([]);
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [selectedLicenseType, setSelectedLicenseType] = useState('');

  const loadPricing = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/license-pricing', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setPricing(data.data);
      }
    } catch (err) {
      console.error('Error loading pricing:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLicenseTypes = async () => {
    try {
      const response = await fetch('/api/license-types', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setLicenseTypes(data.data);
      }
    } catch (err) {
      console.error('Error loading license types:', err);
    }
  };

  useEffect(() => {
    loadPricing();
    loadLicenseTypes();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      const url = editingPricing ? '/api/license-pricing' : '/api/license-pricing';
      const method = editingPricing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(editingPricing ? { id: editingPricing.id, ...formData } : formData),
      });

      if (response.ok) {
        loadPricing();
        setShowForm(false);
        setEditingPricing(null);
      } else {
        alert('فشل في حفظ البيانات');
      }
    } catch (err) {
      alert('خطأ في حفظ البيانات');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا السعر؟')) return;

    try {
      const response = await fetch(`/api/license-pricing?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadPricing();
      } else {
        alert('فشل في حذف السعر');
      }
    } catch (err) {
      alert('خطأ في حذف السعر');
    }
  };

  const filteredPricing = selectedLicenseType 
    ? pricing.filter(price => price.license_type_id === parseInt(selectedLicenseType))
    : pricing;

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
          إدارة أسعار الرخص
        </Typography>
        <Button
          variant="contained"
          onClick={() => setShowForm(true)}
          sx={{
            background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
            }
          }}
        >
          إضافة سعر جديد
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="فلترة حسب نوع الرخصة"
          value={selectedLicenseType}
          onChange={(e) => setSelectedLicenseType(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">جميع الأنواع</MenuItem>
          {licenseTypes.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.name_ar}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {showForm && (
        <LicensePricingForm
          pricing={editingPricing}
          licenseTypes={licenseTypes}
          onClose={() => {
            setShowForm(false);
            setEditingPricing(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredPricing.map((price) => (
          <Box
            key={price.id}
            sx={{
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  {price.description_ar || price.price_type}
                </Typography>
                <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {price.currency} {price.price}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  النوع: {price.price_type} | 
                  الرخصة: {licenseTypes.find(t => t.id === price.license_type_id)?.name_ar || 'غير محدد'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setEditingPricing(price);
                    setShowForm(true);
                  }}
                >
                  تعديل
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => handleDelete(price.id)}
                >
                  حذف
                </Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// License Pricing Form Component
function LicensePricingForm({ pricing, licenseTypes, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    license_type_id: pricing?.license_type_id || '',
    price_type: pricing?.price_type || 'lesson',
    price: pricing?.price || 0,
    currency: pricing?.currency || '₪',
    description_ar: pricing?.description_ar || '',
    description_en: pricing?.description_en || '',
    is_active: pricing?.is_active !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            {pricing ? 'تعديل السعر' : 'إضافة سعر جديد'}
          </Typography>
          <Button onClick={onClose} sx={{ color: '#666' }}>✕</Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="نوع الرخصة"
            value={formData.license_type_id}
            onChange={(e) => setFormData({ ...formData, license_type_id: parseInt(e.target.value) })}
            required
            fullWidth
          >
            {licenseTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name_ar}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="نوع السعر"
            value={formData.price_type}
            onChange={(e) => setFormData({ ...formData, price_type: e.target.value })}
            required
            fullWidth
          >
            <MenuItem value="lesson">درس</MenuItem>
            <MenuItem value="first_test">التست الأول</MenuItem>
            <MenuItem value="retest">إعادة التست</MenuItem>
          </TextField>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="السعر"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
              sx={{ flex: 1 }}
            />
            <TextField
              label="العملة"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              sx={{ flex: 1 }}
            />
          </Box>
          <TextField
            label="الوصف بالعربية"
            value={formData.description_ar}
            onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
            fullWidth
          />
          <TextField
            label="الوصف بالإنجليزية"
            value={formData.description_en}
            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            fullWidth
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>نشط</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={onClose}>إلغاء</Button>
            <Button type="submit" variant="contained">حفظ</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// License Procedures Tab Component
function LicenseProceduresTab({ getAuthHeaders }) {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState(null);

  const loadProcedures = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/license-procedures', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setProcedures(data.data);
      }
    } catch (err) {
      console.error('Error loading procedures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProcedures();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      const url = editingProcedure ? '/api/license-procedures' : '/api/license-procedures';
      const method = editingProcedure ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(editingProcedure ? { id: editingProcedure.id, ...formData } : formData),
      });

      if (response.ok) {
        loadProcedures();
        setShowForm(false);
        setEditingProcedure(null);
      } else {
        alert('فشل في حفظ البيانات');
      }
    } catch (err) {
      alert('خطأ في حفظ البيانات');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإجراء؟')) return;

    try {
      const response = await fetch(`/api/license-procedures?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadProcedures();
      } else {
        alert('فشل في حذف الإجراء');
      }
    } catch (err) {
      alert('خطأ في حذف الإجراء');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
          إدارة إجراءات الرخص
        </Typography>
        <Button
          variant="contained"
          onClick={() => setShowForm(true)}
          sx={{
            background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
            }
          }}
        >
          إضافة إجراء جديد
        </Button>
      </Box>

      {showForm && (
        <LicenseProcedureForm
          procedure={editingProcedure}
          onClose={() => {
            setShowForm(false);
            setEditingProcedure(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {procedures.map((procedure) => (
          <Box
            key={procedure.id}
            sx={{
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  {procedure.title_ar}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  النوع: {procedure.procedure_type} | الترتيب: {procedure.step_order}
                </Typography>
                {procedure.description_ar && (
                  <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                    {procedure.description_ar}
                  </Typography>
                )}
                {procedure.location_ar && (
                  <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                    <strong>الموقع:</strong> {procedure.location_ar}
                  </Typography>
                )}
                {procedure.schedule_ar && (
                  <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                    <strong>المواعيد:</strong> {procedure.schedule_ar}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setEditingProcedure(procedure);
                    setShowForm(true);
                  }}
                >
                  تعديل
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => handleDelete(procedure.id)}
                >
                  حذف
                </Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// License Procedure Form Component
function LicenseProcedureForm({ procedure, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    procedure_type: procedure?.procedure_type || 'health',
    title_ar: procedure?.title_ar || '',
    title_en: procedure?.title_en || '',
    description_ar: procedure?.description_ar || '',
    description_en: procedure?.description_en || '',
    location_ar: procedure?.location_ar || '',
    location_en: procedure?.location_en || '',
    schedule_ar: procedure?.schedule_ar || '',
    schedule_en: procedure?.schedule_en || '',
    requirements_ar: procedure?.requirements_ar || '',
    requirements_en: procedure?.requirements_en || '',
    notes_ar: procedure?.notes_ar || '',
    notes_en: procedure?.notes_en || '',
    step_order: procedure?.step_order || 0,
    is_active: procedure?.is_active !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
        maxWidth: '600px',
        width: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            {procedure ? 'تعديل الإجراء' : 'إضافة إجراء جديد'}
          </Typography>
          <Button onClick={onClose} sx={{ color: '#666' }}>✕</Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="نوع الإجراء"
            value={formData.procedure_type}
            onChange={(e) => setFormData({ ...formData, procedure_type: e.target.value })}
            required
            fullWidth
          >
            <MenuItem value="health">دائرة الصحة</MenuItem>
            <MenuItem value="theory">النظرية</MenuItem>
            <MenuItem value="practical">العملي</MenuItem>
            <MenuItem value="license_collection">استلام الرخصة</MenuItem>
          </TextField>
          <TextField
            label="العنوان بالعربية"
            value={formData.title_ar}
            onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="العنوان بالإنجليزية"
            value={formData.title_en}
            onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
            fullWidth
          />
          <TextField
            label="الوصف بالعربية"
            multiline
            rows={3}
            value={formData.description_ar}
            onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
            fullWidth
          />
          <TextField
            label="الموقع بالعربية"
            value={formData.location_ar}
            onChange={(e) => setFormData({ ...formData, location_ar: e.target.value })}
            fullWidth
          />
          <TextField
            label="المواعيد بالعربية"
            multiline
            rows={2}
            value={formData.schedule_ar}
            onChange={(e) => setFormData({ ...formData, schedule_ar: e.target.value })}
            fullWidth
          />
          <TextField
            label="المتطلبات بالعربية"
            multiline
            rows={2}
            value={formData.requirements_ar}
            onChange={(e) => setFormData({ ...formData, requirements_ar: e.target.value })}
            fullWidth
          />
          <TextField
            label="الملاحظات بالعربية"
            multiline
            rows={2}
            value={formData.notes_ar}
            onChange={(e) => setFormData({ ...formData, notes_ar: e.target.value })}
            fullWidth
          />
          <TextField
            label="ترتيب الخطوة"
            type="number"
            value={formData.step_order}
            onChange={(e) => setFormData({ ...formData, step_order: parseInt(e.target.value) })}
            sx={{ width: 200 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>نشط</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={onClose}>إلغاء</Button>
            <Button type="submit" variant="contained">حفظ</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}