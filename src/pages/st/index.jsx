import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Container,
} from "@mui/material";
import BookIcon from "@mui/icons-material/Book";
import SignpostIcon from "@mui/icons-material/Signpost";
import StreetviewIcon from "@mui/icons-material/Streetview";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";


export default function StudyTeoria() {
  return (
    <Box sx={{ overflow: "hidden" }}>
      <Container maxWidth="lg" className="section" sx={{ overflow: "hidden" }}>
        <SectionTitle
          title="مادة التؤوريا "
          subTitle="اختر نوع المادة للدراسة منها"
        />

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={11} md={4}>
            <Link href={"/st/book"}>
              <Card
                sx={{
                  minHeight: 300,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 8,
                  },
                  backgroundColor: (theme) => theme.palette.primary.light,
                }}
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    p: 4,
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                    }}
                  >
                    <BookIcon sx={{ fontSize: 40, color: "common.white" }} />
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: "primary.dark",
                      textAlign: "center",
                    }}
                  >
                    دراسة مادة التؤوريا النظرية
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      textAlign: "center",
                      maxWidth: 400,
                    }}
                  >
                    تعلم قوانين القيادة والطرق وأجزاء ومكونات المركبة بالتفصيل
                    لتساعدك على اجتياز الاختبار بسهولة.
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
          <Grid item xs={11} md={4}>
            <Link href={"/st/signals"}>
              <Card
                sx={{
                  minHeight: 300,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 8,
                  },
                  backgroundColor: (theme) => theme.palette.primary.light,
                }}
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    p: 4,
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                    }}
                  >
                    <SignpostIcon
                      sx={{ fontSize: 40, color: "common.white" }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: "primary.dark",
                      textAlign: "center",
                    }}
                  >
                    دراسة جميع أنواع الاشارات ومعانيها
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      textAlign: "center",
                      maxWidth: 400,
                    }}
                  >
                    تعرف على جميع أنواع إشارات المرور، معانيها، وكيفية استخدامها
                    .
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
          <Grid item xs={11} md={4}>
            <Link href={"/st/street-signs"}>
              <Card
                sx={{
                  minHeight: 300,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 8,
                  },
                  backgroundColor: (theme) => theme.palette.primary.light,
                }}
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    p: 4,
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                    }}
                  >
                    <StreetviewIcon
                      sx={{ fontSize: 40, color: "common.white" }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: "primary.dark",
                      textAlign: "center",
                    }}
                  >
                    دراسة جميع أنواع الإشارات مع الإشارات على الشارع ومعانيها
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      textAlign: "center",
                      maxWidth: 400,
                    }}
                  >
                    تعرف على الإشارات المرورية في الواقع وكيفية التعامل معها في الشوارع
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
