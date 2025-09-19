import { useLicenseData } from '../hooks/useLicenseData';
import { Box, Typography, Card, CardContent, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

export default function LicensePricing() {
  const { data, loading, error } = useLicenseData();

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
        أسعار الدروس والتستات
      </Typography>
      
      <Typography variant="h6" sx={{ textAlign: 'center', mb: 4, color: '#666' }}>
        أسعار الدروس والتسات وفقاً لوزارة النقل ومواصلات
      </Typography>

      <Grid container spacing={3}>
        {licenseTypes.map((type) => (
          <Grid item xs={12} md={6} lg={4} key={type.id}>
            <Card sx={{ height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#2e7d32', textAlign: 'center' }}>
                  {type.name_ar}
                </Typography>
                
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Chip 
                    label={`العمر الأدنى: ${type.min_age_exam} سنة`} 
                    color="primary" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                </Box>

                {type.pricing && type.pricing.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>النوع</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>السعر</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {type.pricing.map((price, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {price.description_ar || getPriceTypeName(price.price_type)}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center', fontWeight: 'bold', color: '#4caf50' }}>
                              {price.currency} {price.price}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" sx={{ textAlign: 'center', color: '#666', py: 2 }}>
                    لا توجد أسعار متاحة
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Summary Table */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center', color: '#2e7d32' }}>
          ملخص الأسعار
        </Typography>
        
        <TableContainer component={Paper} sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>نوع الرخصة</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>الدرس الواحد</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>التست الأول</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>إعادة التست</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {licenseTypes.map((type) => {
                const lessonPrice = type.pricing?.find(p => p.price_type === 'lesson');
                const firstTestPrice = type.pricing?.find(p => p.price_type === 'first_test');
                const retestPrice = type.pricing?.find(p => p.price_type === 'retest');
                
                return (
                  <TableRow key={type.id}>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {type.name_ar}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {lessonPrice ? `${lessonPrice.currency} ${lessonPrice.price}` : '-'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {firstTestPrice ? `${firstTestPrice.currency} ${firstTestPrice.price}` : '-'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {retestPrice ? `${retestPrice.currency} ${retestPrice.price}` : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

function getPriceTypeName(priceType) {
  const typeNames = {
    'lesson': 'الدرس الواحد',
    'first_test': 'التست الأول',
    'retest': 'التست الثاني وما فوق'
  };
  return typeNames[priceType] || priceType;
}
