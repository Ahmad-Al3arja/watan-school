import {   Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Container, } from "@mui/material";
import BookIcon from "@mui/icons-material/Book";
import SignpostIcon from "@mui/icons-material/Signpost";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";
import Hero from "../components/layout/Hero";
import Types from "../components/layout/Types";
import Gallery from "@/components/layout/Gallery";
import ActionAreaCard from "@/components/ui/Card";
import Exam from "@/components/ui/Exam";
export default function Home() {
  return (
    <>
      <Hero />
      <Container sx={{ py: 8, overflowX: "hidden", px: { xs: 2, sm: 3, md: 4 } }} maxWidth="lg">
        <SectionTitle
          title="المحتوى الرئيسي"
          subTitle="اختر نوع الرخصة والمادة للدراسة منها"
        />
        
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Box data-aos="fade-up">
              <ActionAreaCard
                title="خصوصي"
                path="/teoria/nTeoria/private"
                image="/images/private.png"
                alt="صورة خصوصي"
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Box data-aos="fade-up">
              <ActionAreaCard
                title="شحن ثقيل"
                path="/teoria/nTeoria/heavy"
                image="/images/heavy.png"
                alt="صورة شحن ثقيل"
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Box data-aos="fade-up">
              <ActionAreaCard
                title="شحن خفيف"
                path="/teoria/nTeoria/light"
                image="/images/light.png"
                alt="صورة شحن خفيف"
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Link href="/st/signals" style={{ textDecoration: "none" }}>
              <Card
                sx={{
                  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: (theme) => theme.shadows[10],
                  },
                }}
                data-aos="fade-up"
              >
                <CardActionArea>
                  <div style={{ backgroundColor: "var(--primary1)", padding: "2rem" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100px",
                        height: "100px",
                        margin: "0 auto",
                      }}
                    >
                       <SignpostIcon sx={{ fontSize: 60, color: "common.black" }} />
                    </Box>
                  </div>
                  <CardContent>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      textAlign="center"
                    >
                      الاشارات
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Link href="/st/street-signs" style={{ textDecoration: "none" }}>
              <Card
                sx={{
                  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: (theme) => theme.shadows[10],
                  },
                }}
                data-aos="fade-up"
              >
                <CardActionArea>
                  <div style={{ backgroundColor: "var(--primary1)", padding: "2rem" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100px",
                        height: "100px",
                        margin: "0 auto",
                      }}
                    >
                       <SignpostIcon sx={{ fontSize: 60, color: "common.black" }} />
                    </Box>
                  </div>
                  <CardContent>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      textAlign="center"
                    >
                      الاشارات على الشارع
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          </Grid>
        </Grid>

          <Grid container spacing={4} justifyContent="center" overflow={"hidden"}>
            <Grid item xs={11} md={6}>
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
        </Grid>
        <Box sx={{ overflow: "hidden", mt: 10 }}></Box>
        <SectionTitle
          title="أسئلة الاستكمالي والتدريب"
          subTitle="اختر نوع الرخصة للدراسة الأسئلة الخاصة بها"
        />
        <Grid
          container
          spacing={4}
          sx={{ overflow: "hidden", paddingBottom: "50px" }}
        >
          <Grid item xs={12} sm={6}>
            <Box data-aos="fade-up">
              <ActionAreaCard
                title={"أسئلة تؤوريا استكمالي"}
                path={"/teoria/cTeoria"}
                image={"/images/c.png"}
                alt={`صورة استكمالي`}
                      />
                    </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box data-aos="fade-up">
              <ActionAreaCard
                title={"أسئلة تدريب سياقة وإدارة مهنية"}
                path={"/teoria/training/quizes/"}
                image={"/images/training.png"}
                alt={`صورة تدريب`}
              />
            </Box>
            </Grid>
          </Grid>
        </Container>
      <Gallery />
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Exam />
      </Box>
    </>
  );
}
