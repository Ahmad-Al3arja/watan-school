import React from "react";
import { Grid, Button, Box, Typography } from "@mui/material";

const QuestionNavigation = ({
  totalQuestions,
  currentIndex,
  userAnswers,
  onNavigate,
  visited,
  showAnswers,
}) => {
  const getButtonColor = (index) => {
    if (index === currentIndex) {
      return "#87CEEB";
    } else if (showAnswers[index]) {
      return userAnswers[index]?.isCorrect ? "success.main" : "error.main";
    } else if (userAnswers[index] !== null && userAnswers[index] !== undefined) {
      // Only show orange if answered but answer not revealed yet
      return "warning.light";
    } else if (visited.includes(index)) {
      return "grey.800";
    } else {
      return "grey.500";
    }
  };

  const getTextColor = () => "white";

  const legendItems = [
    { color: "#87CEEB", label: "السؤال الحالي" },
    { color: "#4caf50", label: "اجابة صحيحة" },
    { color: "#f44336", label: "اجابة خاطئة" },
    { color: "#ff9800", label: "تمت الاجابة" },
    { color: "#424242", label: "تمت رؤيته" },
    { color: "#9e9e9e", label: "لم يتم رؤيته" },
  ];

  return (
    <Box>
      <Grid container spacing={1} flex={1} justifyContent="center">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const bgColor = getButtonColor(index);
          const textColor = getTextColor();

          return (
            <Grid
              item
              key={index}
              sx={{
                display: "flex",
                justifyContent:
                  index >= totalQuestions - (totalQuestions % 3 || 3)
                    ? "flex-end"
                    : "center",
              }}
            >
              <Button
                variant="contained"
                onClick={() => onNavigate(index)}
                sx={{
                  bgcolor: bgColor,
                  color: textColor,
                  width: 40,
                  height: 40,
                  minWidth: 40,
                  fontSize: "0.875rem",
                  borderRadius: 1,
                  "&:hover": {
                    bgcolor: bgColor,
                    opacity: 0.9,
                  },
                  transition: "opacity 0.3s",
                }}
                aria-label={`Navigate to question ${index + 1}`}
              >
                {index + 1}
              </Button>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {legendItems.map((item, idx) => (
            <Grid item key={idx} xs={4} sm={4} md={4}>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: item.color,
                    borderRadius: "50%",
                    mr: 0.1,
                  }}
                />
                <Typography
                  variant="body2"
                  fontSize={"10px"}
                  fontWeight={600}
                  paddingRight={0.2}
                >
                  {item.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default QuestionNavigation;
