import React from "react";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Container,
  styled,
  Box,
  alpha,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ExpandMore,
  MedicalInformation,
  DriveEta,
  Description,
  AssignmentInd,
} from "@mui/icons-material";
import { useLicenseData } from "@/hooks/useLicenseData";

const theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: "cairo",
    h4: {
      fontWeight: 700,
      color: "#241a00",
    },
    h6: {
      fontWeight: 600,
      color: "#241a00",
    },
  },
  palette: {
    primary: {
      main: "#36a336",
    },
    secondary: {
      main: "#27ae60",
    },
  },
});

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  margin: "16px 0",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  "&:before": {
    display: "none",
  },
  "&.Mui-expanded": {
    margin: "16px 0",
  },
}));

const ProcessStep = ({ title, icon, children }) => (
  <StyledAccordion>
    <AccordionSummary
      expandIcon={<ExpandMore sx={{ color: "primary.main" }} />}
      sx={{
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        "&:hover": {
          backgroundColor: "#f1f2f6",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {icon}
        <Typography variant="h6">{title}</Typography>
      </Box>
    </AccordionSummary>
    <AccordionDetails
      sx={{ backgroundColor: "#fff", borderRadius: "0 0 8px 8px" }}
    >
      {children}
    </AccordionDetails>
  </StyledAccordion>
);

const LicenseProcess = () => {
  const { data, loading, error } = useLicenseData();

  // Helper function to get icon based on procedure type
  const getProcedureIcon = (procedureType) => {
    const iconMap = {
      health: <MedicalInformation color="primary" sx={{ fontSize: 28 }} />,
      theory: <Description color="primary" sx={{ fontSize: 28 }} />,
      practical: <DriveEta color="primary" sx={{ fontSize: 28 }} />,
      license_collection: <AssignmentInd color="primary" sx={{ fontSize: 28 }} />,
    };
    return iconMap[procedureType] || <Description color="primary" sx={{ fontSize: 28 }} />;
  };

  // Helper function to get step number based on procedure type
  const getStepNumber = (procedureType) => {
    const stepMap = {
      health: "1",
      theory: "2", 
      practical: "3",
      license_collection: "4",
    };
    return stepMap[procedureType] || "1";
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ padding: 6 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
            }}
          >
            <CircularProgress size={60} />
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ padding: 6 }}>
          <Box
            sx={{
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
                {error.message || "حدث خطأ أثناء تحميل إجراءات الرخص. يرجى المحاولة مرة أخرى."}
              </Typography>
            </Alert>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  if (!data || !data.licenseProcedures || data.licenseProcedures.length === 0) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ padding: 6 }}>
          <Box
            sx={{
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
                لم يتم العثور على إجراءات الرخص. يرجى المحاولة مرة أخرى لاحقاً.
              </Typography>
            </Alert>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  // Sort procedures by step_order
  const sortedProcedures = [...(data.licenseProcedures || [])].sort((a, b) => a.step_order - b.step_order);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ padding: 6 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h4" gutterBottom sx={{ position: "relative" }}>
            <Box
              component="span"
              sx={{
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 200,
                height: 4,
                backgroundColor: "primary.main",
                borderRadius: 2,
              }}
            />
            إجراءات الحصول على رخصة القيادة
          </Typography>
        </Box>

        {sortedProcedures.map((procedure, index) => (
          <ProcessStep
            key={procedure.id}
            title={`${getStepNumber(procedure.procedure_type)}) ${procedure.title_ar}`}
            icon={getProcedureIcon(procedure.procedure_type)}
          >
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {procedure.location_ar}
            </Typography>
            
            {procedure.description_ar && (
              <Typography variant="body1" paragraph>
                {procedure.description_ar}
              </Typography>
            )}

            {procedure.schedule_ar && (
              <List dense sx={{ py: 0 }}>
                {procedure.schedule_ar.split('،').map((text, idx) => (
                  <ListItem key={idx} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          backgroundColor: "primary.main",
                          borderRadius: "50%",
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={text.trim()}
                      primaryTypographyProps={{
                        variant: "body1",
                        textAlign: "right",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}

            {procedure.requirements_ar && (
              <Box sx={{ bgcolor: "#f8f9fa", p: 3, borderRadius: 2, mt: 2 }}>
                <Typography variant="body1" paragraph>
                  {procedure.requirements_ar}
                </Typography>
              </Box>
            )}

            {procedure.notes_ar && (
              <Typography
                variant="body1"
                sx={{ mt: 2, color: "#e74c3c" }}
                fontWeight={500}
              >
                ملاحظة: {procedure.notes_ar}
              </Typography>
            )}
          </ProcessStep>
        ))}
      </Container>
    </ThemeProvider>
  );
};

export default LicenseProcess;
