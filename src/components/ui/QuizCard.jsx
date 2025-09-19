// components/ui/QuizCard.js
import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Link from "next/link";
import GradeProgress from "./GradeProgress";
export default function ActionAreaCard({
  quizName,
  quizNumber,
  type,
  grade = 0,
  total = 0,
  qType,
  isOral = false,
}) {
  return (
    <Card
      data-aos="fade-in"
      sx={{
        position: "relative",
        overflow: "visible",
        borderTop: "8px solid var(--primary1)", // Initial border color
        transition:
          "border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          borderTop: "8px solid var(--primary2)", // Border color on hover
          transform: "translateY(-4px)", // Slight lift on hover
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)", // Enhanced shadow on hover
          // Target the number circle when the card is hovered
          "& .numberCircle": {
            backgroundColor: "var(--primary2)", // Circle background on hover
            borderColor: "var(--primary2)", // Circle border on hover
          },
        },
        // Make the card responsive
        width: "100%", // Allow the card to take full width of its
      }}
    >
      <Link href={isOral ? `/teoria/${qType}/${type}-oral/${quizNumber}` : `/teoria/${qType}/${type}/${quizNumber}`}>
        <CardActionArea>
          {/* Circle for quiz number */}
          <Box
            className="numberCircle" // Assign a class for targeting
            sx={{
              position: "absolute",
              top: "-25px", // Adjusted to position the circle centered on the top border
              left: "50%",
              transform: "translateX(-50%)",
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              border: "5px solid var(--primary1)", // Initial border color
              backgroundColor: "var(--primary1)", // Initial circle color
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: {
                xs: "1rem",
                sm: "1.2rem",
              },
              fontWeight: "bold",
              zIndex: 1, // Ensure the circle appears above the card
              transition: "background-color 0.3s ease, border-color 0.3s ease",
            }}
          >
            {quizNumber}
          </Box>

          <CardContent
            sx={{
              padding: "3px",
              paddingTop: "27px", // Adjust to accommodate the circle
            }}
          >
            <Typography
              gutterBottom
              variant="h6"
              component="div"
              textAlign={"center"}
              sx={{
                fontSize: {
                  xs: "1.1rem",
                  sm: "1.1rem",
                  md: "1.1rem",
                },
              }}
            >
              {quizName}
            </Typography>
            <Box
              display="flex"
              justifyContent="center"
              alignItems={"center"}
              flexDirection={"column"}
              paddingBottom={1}
            >
              <Typography
                gutterBottom
                component="div"
                textAlign={"center"}
                fontSize={13}
              >
                علامة آخر محاولة
              </Typography>
              <GradeProgress grade={grade} total={total} />
            </Box>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  );
}
