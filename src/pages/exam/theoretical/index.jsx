import Image from "next/image";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";

// Styled Components
const HeaderSection = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(4, 0),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  marginBottom: theme.spacing(4),
}));

export default function TheoreticalExamPage() {
  const [isMobileApp, setIsMobileApp] = useState(false);

  useEffect(() => {
    // Check if we're in a mobile app environment
    setIsMobileApp(typeof window !== 'undefined' && (window.Capacitor || window.cordova));
  }, []);

  const openInBrowser = () => {
    if (typeof window !== 'undefined') {
      window.open('https://www.mot.gov.ps/mot_Ser/Exam.aspx', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, direction: "rtl" }}>
      {/* Header */}
      <HeaderSection>
        <Image
          src="/images/logo.png"
          alt="الشعار"
          width={120}
          height={120}
          priority
        />
        <Typography
          variant="h3"
          component="h1"
          sx={{ mt: 3, fontWeight: 700, color: "primary.main" }}
        >
          مدرسة الوطن
        </Typography>
        <Typography
          variant="h5"
          sx={{ mt: 1, color: "text.secondary", fontWeight: 500 }}
        >
          نتيجة الامتحان النظري (تؤوريا)
        </Typography>
      </HeaderSection>

      {/* Ministry of Transport Direct Inquiry */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "primary.main", textAlign: "center" }}
        >
          الاستعلام المباشر من موقع الوزارة
        </Typography>

        {isMobileApp ? (
          // Mobile app: Show button to open in browser
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              للاستعلام عن نتيجة الامتحان النظري، انقر على الزر أدناه لفتح موقع وزارة المواصلات
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={openInBrowser}
              startIcon={<OpenInNewIcon />}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              فتح موقع الوزارة
            </Button>
            <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
              سيتم فتح الموقع في متصفح الجهاز
            </Typography>
          </Box>
        ) : (
          // Web: Show iframe
          <div id="mot_iframe_container" style={{ marginTop: "16px" }}>
            <iframe
              src="https://www.mot.gov.ps/mot_Ser/Exam.aspx"
              width="100%"
              height="600"
              style={{ border: "1px solid #ccc", borderRadius: "8px" }}
              title="استعلام وزارة المواصلات"
            />
          </div>
        )}
      </Paper>
    </Container>
  );
}