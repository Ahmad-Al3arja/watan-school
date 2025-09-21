import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";

export default function StreetSigns() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generate array of image numbers from s1 to s140
  const imageNumbers = Array.from({ length: 140 }, (_, i) => i + 1);

  const handleImageClick = (index) => {
    setSelectedImage(index);
    setCurrentIndex(index);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : imageNumbers.length - 1;
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < imageNumbers.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
  };

  return (
    <Box sx={{ overflow: "hidden" }}>
      <Container maxWidth="lg" className="section" sx={{ overflow: "hidden" }}>
        <Box sx={{ mb: 4 }}>
          <Link href="/st" style={{ textDecoration: "none" }}>
            <Button
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              sx={{ mb: 2 }}
            >
              العودة إلى صفحة الدراسة
            </Button>
          </Link>
        </Box>

        <SectionTitle
          title="دراسة جميع أنواع الإشارات مع الإشارات على الشارع ومعانيها"
          subTitle="تعرف على الإشارات المرورية في الواقع وكيفية التعامل معها"
        />

        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            mb: 4,
            color: "text.secondary",
            maxWidth: 800,
            mx: "auto",
          }}
        >
          هذه المجموعة تحتوي على صور حقيقية للإشارات المرورية في الشوارع. 
          اضغط على أي صورة لرؤيتها بحجم أكبر وتعلم كيفية التعرف عليها في الواقع.
        </Typography>

        <Grid container spacing={4}>
          {imageNumbers.map((num, index) => (
            <Grid item xs={12} sm={6} md={6} lg={6} key={num}>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleImageClick(index)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={`/images/inthestreet_images/s${num}.jpg`}
                  alt={`إشارة مرورية ${num}`}
                  sx={{
                    objectFit: "contain",
                    backgroundColor: "#f5f5f5",
                  }}
                  onError={(e) => {
                    // Try JPG extension if jpg fails
                    e.target.src = `/images/inthestreet_images/s${num}.JPG`;
                  }}
                />
                <CardContent sx={{ p: 2, textAlign: "center" }}>
                  <Chip
                    label={`إشارة ${num}`}
                    size="medium"
                    color="primary"
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Image Dialog */}
        <Dialog
          open={selectedImage !== null}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              backgroundColor: "background.paper",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              إشارة مرورية {currentIndex + 1} من {imageNumbers.length}
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box 
                sx={{ 
                  position: "relative", 
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <img
                  src={`/images/inthestreet_images/s${currentIndex + 1}.jpg`}
                  alt={`إشارة مرورية ${currentIndex + 1}`}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    height: "auto",
                    width: "auto",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                  onError={(e) => {
                    e.target.src = `/images/inthestreet_images/s${currentIndex + 1}.JPG`;
                  }}
                />
              </Box>
              
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handlePrevious}
                >
                  السابق
                </Button>
                <Chip
                  label={`${currentIndex + 1} / ${imageNumbers.length}`}
                  color="primary"
                />
                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                >
                  التالي
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}
