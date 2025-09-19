import { useState } from 'react';
import { useLicenseData, useLicenseProcedures } from '../hooks/useLicenseData';
import { Box, Typography, Card, CardContent, Button, Chip, Accordion, AccordionSummary, AccordionDetails, Grid, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function LicenseInfo() {
  const { data, loading, error } = useLicenseData();
  const { procedures } = useLicenseProcedures();
  const [selectedType, setSelectedType] = useState(null);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography>جاري تحميل البيانات...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">خطأ في تحميل البيانات: {error}</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>لا توجد بيانات متاحة</Typography>
      </Box>
    );
  }

  const { licenseTypes } = data;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold', color: '#2e7d32' }}>
        إجراءات الحصول على رخصة القيادة
      </Typography>

      {/* License Types Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {licenseTypes.map((type) => (
          <Grid item xs={12} md={6} lg={4} key={type.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
              onClick={() => setSelectedType(selectedType?.id === type.id ? null : type)}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#2e7d32' }}>
                  {type.name_ar}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                  {type.name_en}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    label={`الفحص: ${type.min_age_exam} سنة`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`الرخصة: ${type.min_age_license} سنة`} 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                </Box>
                {type.description_ar && (
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {type.description_ar}
                  </Typography>
                )}
                <Button 
                  variant="contained" 
                  size="small" 
                  sx={{ mt: 2, width: '100%' }}
                >
                  عرض التفاصيل
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Selected License Type Details */}
      {selectedType && (
        <Box sx={{ mb: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#2e7d32' }}>
                {selectedType.name_ar} - {selectedType.name_en}
              </Typography>
              
              {/* Requirements */}
              {selectedType.requirements && selectedType.requirements.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    الوثائق المطلوبة:
                  </Typography>
                  {selectedType.requirements
                    .filter(req => req.requirement_type === 'document')
                    .map((req, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 1, pl: 2 }}>
                        – {req.title_ar}
                        {req.description_ar && ` (${req.description_ar})`}
                      </Typography>
                    ))}
                </Box>
              )}

              {/* Conditions */}
              {selectedType.requirements && selectedType.requirements.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    الشروط:
                  </Typography>
                  {selectedType.requirements
                    .filter(req => req.requirement_type === 'condition')
                    .map((req, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 1, pl: 2 }}>
                        – {req.title_ar}
                        {req.description_ar && ` (${req.description_ar})`}
                      </Typography>
                    ))}
                </Box>
              )}

              {/* Notes */}
              {selectedType.requirements && selectedType.requirements.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  {selectedType.requirements
                    .filter(req => req.requirement_type === 'note')
                    .map((req, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 1, pl: 2, fontStyle: 'italic', color: '#666' }}>
                        ملاحظة: {req.title_ar}
                        {req.description_ar && ` (${req.description_ar})`}
                      </Typography>
                    ))}
                </Box>
              )}

              {/* Pricing */}
              {selectedType.pricing && selectedType.pricing.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    الأسعار:
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedType.pricing.map((price, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                              {price.currency} {price.price}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              {price.description_ar || price.price_type}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Procedures */}
      {procedures && (
        <Box>
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold', color: '#2e7d32' }}>
            إجراءات الحصول على رخصة القيادة
          </Typography>
          
          {Object.entries(procedures).map(([type, procedureList]) => (
            <Box key={type} sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#2e7d32' }}>
                {getProcedureTypeName(type)}
              </Typography>
              
              {procedureList.map((procedure, index) => (
                <Accordion key={index} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {procedure.title_ar}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {procedure.description_ar && (
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {procedure.description_ar}
                      </Typography>
                    )}
                    
                    {procedure.location_ar && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          الموقع:
                        </Typography>
                        <Typography variant="body2">
                          {procedure.location_ar}
                        </Typography>
                      </Box>
                    )}
                    
                    {procedure.schedule_ar && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          المواعيد:
                        </Typography>
                        <Typography variant="body2">
                          {procedure.schedule_ar}
                        </Typography>
                      </Box>
                    )}
                    
                    {procedure.requirements_ar && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          المتطلبات:
                        </Typography>
                        <Typography variant="body2">
                          {procedure.requirements_ar}
                        </Typography>
                      </Box>
                    )}
                    
                    {procedure.notes_ar && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          ملاحظات:
                        </Typography>
                        <Typography variant="body2">
                          {procedure.notes_ar}
                        </Typography>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

function getProcedureTypeName(type) {
  const typeNames = {
    'health': 'دائرة الصحة',
    'theory': 'النظرية',
    'practical': 'العملي',
    'license_collection': 'استلام الرخصة'
  };
  return typeNames[type] || type;
}
