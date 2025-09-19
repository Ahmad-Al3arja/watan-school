import React from "react";

import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  styled,
  alpha,
  Box,
  Avatar,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { useLicenseData } from "@/hooks/useLicenseData";

const StyledCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-5px)",
  },
  background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
  borderRadius: "15px",
  overflow: "visible",
}));

const LicenseSection = () => {
  const { data, loading, error } = useLicenseData();
  
  // SEO meta variables
  const pageTitle =
    " مدرسة الوطن | الحصول على الرخصة  ";
  const pageDescription =
    "تعرف على الوثائق المطلوبة، العمر الأدنى، والشروط اللازمة للحصول على رخصة سياقة في فلسطين وفقاً للمعايير الرسمية لوزارة النقل والمواصلات.";
  const pageKeywords =
    "رخصة سياقة, وثائق, متطلبات, شروط, الحصول على الرخصة, فلسطين, دليل سياقة";
  const canonicalUrl = "https://alqudss.com/license-requirements";

  // Helper function to get icon path based on license type
  const getIconPath = (typeKey) => {
    const iconMap = {
      private: "/images/private.png",
      motorcycle: "/images/motocycle.png",
      light_truck: "/images/light.png",
      heavy_truck: "/images/heavy.png",
      trailer: "/images/trailer.png",
      public_taxi: "/images/taxi.png",
      public_bus: "/images/bus.png",
    };
    return iconMap[typeKey] || "/images/private.png";
  };

  // Helper function to transform license data to display format
  const transformLicenseData = (licenseType, requirements) => {
    const documentRequirements = requirements
      .filter(req => req.requirement_type === 'document')
      .map(req => `– ${req.title_ar}`);
    
    const ageRequirements = requirements
      .filter(req => req.requirement_type === 'condition' && req.title_ar.includes('العمر'))
      .map(req => req.description_ar);
    
    const conditions = requirements
      .filter(req => req.requirement_type === 'condition' && req.title_ar.includes('الشروط'))
      .map(req => `– ${req.description_ar}`);
    
    const notes = requirements
      .filter(req => req.requirement_type === 'note')
      .map(req => req.description_ar);

    return {
      img: getIconPath(licenseType.type_key),
      title: licenseType.name_ar,
      requirements: documentRequirements,
      ages: ageRequirements,
      conditions: conditions.length > 0 ? conditions : undefined,
      note: notes.length > 0 ? notes[0] : undefined,
    };
  };

  const theme = useTheme();

  if (loading) {
    return (
      <Box
        sx={{
          py: 8,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          py: 8,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            خطأ في تحميل البيانات
          </Typography>
          <Typography variant="body2">
            {error.message || "حدث خطأ أثناء تحميل متطلبات الرخص. يرجى المحاولة مرة أخرى."}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!data || !data.licenseTypes || data.licenseTypes.length === 0) {
    return (
      <Box
        sx={{
          py: 8,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Alert severity="info" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            لا توجد بيانات متاحة
          </Typography>
          <Typography variant="body2">
            لم يتم العثور على متطلبات الرخص. يرجى المحاولة مرة أخرى لاحقاً.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Transform license data to display format
  const licenses = data.licenseTypes.map(licenseType => {
    const requirements = (data.licenseRequirements || []).filter(req => req.license_type_id === licenseType.id);
    return transformLicenseData(licenseType, requirements);
  });

  return (
      <Box
        sx={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          py: 8,
          direction: "rtl",
            overflow: "hidden"
        }}
      >
        <Container maxWidth="sm">
          <Grid container spacing={10}>
            {licenses.map((license, index) => (
              <Grid item xs={12} key={index}>
                <StyledCard>
                  <Box sx={{ display: "flex", justifyContent: "center", mt: -1 }}>
                    <Avatar
                      src={license.img}
                      sx={{
                        width: 100,
                        height: 100,
                        border: "3px solid white",
                        borderRadius: 5,
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                        textAlign: "center",
                        mb: 1,
                      }}
                    >
                      {license.title}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography sx={{ mb: 1, color: "black", opacity: 0.6 }}>
                      <strong>الوثائق المطلوبة:</strong>
                    </Typography>
                    <List dense>
                      {license.requirements.map((item, i) => (
                        <ListItem key={i}>
                          <ListItemText
                            primary={item}
                            sx={{ direction: "rtl", textAlign: "right" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 1 }} />
                    <Typography sx={{ color: "black", opacity: 0.6, mb: 1 }}>
                      <strong>العمر الأدنى:</strong>
                    </Typography>
                    <List dense>
                      {license.ages.map((age, i) => (
                        <ListItem key={i}>
                          <ListItemText
                            primary={age}
                            sx={{ direction: "rtl", textAlign: "right" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    {license.conditions && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography sx={{ color: "black", mb: 1, opacity: 0.6 }}>
                          <strong>الشروط:</strong>
                        </Typography>
                        <List dense>
                          {license.conditions.map((condition, i) => (
                            <ListItem key={i}>
                              <ListItemText
                                primary={condition}
                                sx={{ direction: "rtl", textAlign: "right" }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                    {license.note && (
                      <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                        <Typography variant="body2">{license.note}</Typography>
                      </Alert>
                    )}
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
  );
};

export default LicenseSection;
