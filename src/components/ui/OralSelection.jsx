import React from "react";
import { Box, Container } from "@mui/material";
import ActionAreaCard from "@/components/ui/Card";
import { typesData } from "@/components/data/typesData";

export default function OralSelection() {
  return (
    <Container sx={{ py: 4, direction: "rtl" }}>
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
        {/* Only show private and light truck options */}
        {typesData
          .filter(type => type.title === 'خصوصي' || type.title === 'شحن خفيف')
          .map((type, index) => (
          <Box
            key={index}
            data-aos="fade-up"
            data-aos-delay={index * 50}
          >
            <ActionAreaCard
              title={`${type.title} شفوي`}
              image={type.image}
              path={type.title === 'خصوصي' ? '/teoria/cTeoria/private-oral' : '/teoria/cTeoria/light-oral'}
              alt={`صورة ${type.title}`}
            />
          </Box>
        ))}
      </Box>
    </Container>
  );
}
