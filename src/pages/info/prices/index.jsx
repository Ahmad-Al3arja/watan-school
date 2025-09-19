import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Avatar,
  alpha,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import SectionTitle from "@/components/ui/SectionTitle";
import { useLicenseData } from "@/hooks/useLicenseData";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

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

// Helper function to transform license data to plan format
const transformLicenseToPlan = (licenseType, pricing) => {
  const lessonPrice = pricing.find(p => p.price_type === 'lesson');
  const firstTestPrice = pricing.find(p => p.price_type === 'first_test');
  const retestPrice = pricing.find(p => p.price_type === 'retest');
  
  const tests = [];
  if (firstTestPrice) tests.push(`${firstTestPrice.currency} ${firstTestPrice.price} ${firstTestPrice.description_ar}`);
  if (retestPrice) tests.push(`${retestPrice.currency} ${retestPrice.price} ${retestPrice.description_ar}`);
  
  return {
    title: licenseType.name_ar,
    icon: getIconPath(licenseType.type_key),
    price: lessonPrice ? `${lessonPrice.currency} ${lessonPrice.price}` : "₪ 0",
    tests: tests,
    age: `${licenseType.min_age_exam} سنة`,
    color: "linear-gradient(135deg, #2d7a2d 0%, #4db84d 100%)",
    typeKey: licenseType.type_key,
  };
};

const PricingCard = ({ plan }) => {
  const theme = useTheme();

  return (
    <Grid item xs={12} sm={6} md={4} lg={4}>
      <Card
        sx={{
          position: "relative",
          background: `linear-gradient(145deg, ${alpha("#ffffff", 0.9)} 0%, ${alpha("#f8fafc", 0.8)} 100%)`,
          border: `1px solid ${alpha("#36a336", 0.1)}`,
          borderRadius: 6,
          overflow: "hidden",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: `0 4px 20px ${alpha("#36a336", 0.08)}`,
          "&:hover": {
            transform: "translateY(-12px) scale(1.02)",
            boxShadow: `0 20px 40px ${alpha("#36a336", 0.15)}`,
            border: `1px solid ${alpha("#36a336", 0.2)}`,
            "& .card-icon": {
              transform: "scale(1.1) rotate(5deg)",
            },
            "& .price-text": {
              color: "#36a336",
            },
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: plan.color,
            zIndex: 1,
          },
        }}
      >
        <CardContent sx={{ textAlign: "center", pt: 6, pb: 4, px: 3 }}>
          {/* Icon with enhanced styling */}
          <Box
            className="card-icon"
            sx={{
              position: "relative",
              display: "inline-block",
              transition: "all 0.3s ease",
              mb: 3,
            }}
          >
            <Avatar
              src={plan.icon}
              sx={{
                width: 100,
                height: 100,
                background: plan.color,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: `0 8px 25px ${alpha("#36a336", 0.3)}`,
                p: 2,
                border: `4px solid ${alpha("#ffffff", 0.9)}`,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: -4,
                  left: -4,
                  right: -4,
                  bottom: -4,
                  borderRadius: "50%",
                  background: `linear-gradient(45deg, ${alpha("#36a336", 0.1)}, ${alpha("#4db84d", 0.1)})`,
                  zIndex: -1,
                },
              }}
            />
          </Box>

          {/* Title with enhanced styling */}
          <Typography 
            variant="h5" 
            fontWeight={700} 
            sx={{ 
              mb: 2,
              color: "#1a202c",
              fontSize: "1.5rem",
            }}
          >
            {plan.title}
          </Typography>

          {/* Age chip */}
          <Chip
            label={`العمر الأدنى: ${plan.age}`}
            sx={{
              mb: 3,
              background: alpha("#36a336", 0.1),
              color: "#36a336",
              fontWeight: 600,
              border: `1px solid ${alpha("#36a336", 0.2)}`,
            }}
          />

          {/* Price with enhanced styling */}
          <Box sx={{ my: 3 }}>
            <Typography
              className="price-text"
              variant="h3"
              fontWeight={800}
              sx={{ 
                color: "#2d7a2d",
                fontSize: "2.5rem",
                mb: 1,
                transition: "color 0.3s ease",
              }}
            >
              {plan.price}
            </Typography>
            <Typography 
              component="span" 
              variant="body1" 
              sx={{ 
                color: alpha("#36a336", 0.7),
                fontWeight: 500,
                fontSize: "1rem",
              }}
            >
              / الدرس الواحد
            </Typography>
          </Box>

          {/* Tests with enhanced styling */}
          <Box sx={{ my: 3 }}>
            {plan.tests.map((test, idx) => (
              <Box
                key={idx}
                sx={{
                  background: alpha("#36a336", 0.05),
                  borderRadius: 2,
                  p: 2,
                  mb: 1.5,
                  border: `1px solid ${alpha("#36a336", 0.1)}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: alpha("#36a336", 0.08),
                    transform: "translateX(-4px)",
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ 
                    color: "#2d7a2d",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  {test}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Decorative element */}
          <Box
            sx={{
              width: "60px",
              height: "4px",
              background: plan.color,
              borderRadius: 2,
              mx: "auto",
              mt: 3,
            }}
          />
        </CardContent>
      </Card>
    </Grid>
  );
};

const PricingSection = () => {
  const { data, loading, error } = useLicenseData();

  if (loading) {
    return (
      <Box
        sx={{
          py: 10,
          px: { xs: 2, md: 6 },
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
          py: 10,
          px: { xs: 2, md: 6 },
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
            {error.message || "حدث خطأ أثناء تحميل أسعار الرخص. يرجى المحاولة مرة أخرى."}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!data || !data.licenseTypes || data.licenseTypes.length === 0) {
    return (
      <Box
        sx={{
          py: 10,
          px: { xs: 2, md: 6 },
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
            لم يتم العثور على بيانات الأسعار. يرجى المحاولة مرة أخرى لاحقاً.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Transform license data to plan format
  const plans = data.licenseTypes.map(licenseType => {
    const pricing = (data.licensePricing || []).filter(p => p.license_type_id === licenseType.id);
    return transformLicenseToPlan(licenseType, pricing);
  });

  return (
    <>
      <Box
        sx={{
          py: 10,
          px: { xs: 2, md: 6 },
          background: `linear-gradient(135deg, ${alpha("#f8fafc", 0.8)} 0%, ${alpha("#e2e8f0", 0.6)} 50%, ${alpha("#f1f5f9", 0.8)} 100%)`,
          overflow: "hidden",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 80%, ${alpha("#36a336", 0.05)} 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, ${alpha("#4db84d", 0.05)} 0%, transparent 50%)`,
            zIndex: 0,
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <SectionTitle
            title="الأسعار"
            subTitle={"أسعار الدروس والتسات  وفقاً لوزارة النقل ومواصلات"}
          />

          <Grid container spacing={4} justifyContent="center" sx={{ mt: 6 }}>
            {plans.map((plan, index) => (
              <PricingCard key={plan.typeKey || index} plan={plan} />
            ))}
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default PricingSection;
