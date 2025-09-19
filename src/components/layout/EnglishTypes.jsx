import React, { useState, useEffect } from "react";
import { Box, Container, CircularProgress, Typography } from "@mui/material";
import ActionAreaCard from "../ui/Card";
import { useQuizData } from "../../hooks/useQuizData";

export default function EnglishTypes() {
  const { data, loading, error } = useQuizData();
  const [availableTypes, setAvailableTypes] = useState([]);

  useEffect(() => {
    if (data && data.english_teoria) {
      const types = [];
      const englishData = data.english_teoria;

      Object.keys(englishData).forEach(subcategory => {
        const exams = englishData[subcategory];
        if (exams && Object.keys(exams).length > 0) {
          const typeMapping = {
            'private': {
              title: 'Private License',
              image: '/images/private.png'
            },
            'taxi': {
              title: 'Taxi License',
              image: '/images/taxi.png'
            },
            'light': {
              title: 'Light Truck License',
              image: '/images/light.png'
            },
            'heavy': {
              title: 'Heavy Truck License',
              image: '/images/heavy.png'
            },
            'motorcycle': {
              title: 'Motorcycle License',
              image: '/images/motocycle.png'
            },
            'tractor': {
              title: 'Tractor License',
              image: '/images/tractor.png'
            }
          };

          const typeInfo = typeMapping[subcategory] || {
            title: subcategory.charAt(0).toUpperCase() + subcategory.slice(1),
            image: '/images/private.png'
          };

          types.push({
            title: typeInfo.title,
            image: typeInfo.image,
            path: `/teoria/english_teoria/${subcategory}`,
            subcategory: subcategory
          });
        }
      });

      setAvailableTypes(types);
    }
  }, [data]);

  if (loading) {
    return (
      <Container sx={{ px: { xs: 2.5, sm: 4, md: 6 } }} maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ px: { xs: 2.5, sm: 4, md: 6 } }} maxWidth="sm">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="error">Error loading data: {error}</Typography>
        </Box>
      </Container>
    );
  }

  if (availableTypes.length === 0) {
    return (
      <Container sx={{ px: { xs: 2.5, sm: 4, md: 6 } }} maxWidth="sm">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>No English theory questions available yet.</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ px: { xs: 2.5, sm: 4, md: 6 } }} maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          "& > div": {
            flex: "1 1 100%",
          },
          "@media (min-width: 600px)": {
            "& > div": {
              flex: "1 1 calc(50% - 24px)",
            },
          },
          "@media (min-width: 900px)": {
            "& > div": {
              flex: "1 1 calc(33.333% - 24px)",
            },
          },
        }}
      >
        {availableTypes.map((type, index) => (
          <Box
            key={index}
            data-aos="fade-up"
            data-aos-delay={index * 50}
          >
            <ActionAreaCard
              title={type.title}
              image={type.image}
              path={type.path}
              alt={`صورة ${type.title}`}
            />
          </Box>
        ))}
      </Box>
    </Container>
  );
}