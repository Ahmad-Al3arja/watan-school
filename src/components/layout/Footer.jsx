import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Card,
  CardContent,
  alpha,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

// Custom TikTok Icon Component
const TikTokIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);
import { navigationData } from "../data/navigationData";
import Image from "next/image";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        backgroundColor: "black",
        color: "white",
        py: 4,
        position: "relative",
        zIndex: 1,
        overflow: "visible",
      }}
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          px: { xs: 2, sm: 3, md: 6 },
          overflow: "visible",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Grid container spacing={3} justifyContent="space-between">
          <Grid item xs={12} md={3}>
             <Card
               sx={{
                 background: `linear-gradient(135deg, ${alpha("#36a336", 0.1)} 0%, ${alpha("#36a336", 0.05)} 100%)`,
                 border: `1px solid ${alpha("#36a336", 0.2)}`,
                 borderRadius: 3,
                 mb: 3,
                 transition: "all 0.3s ease",
                 "&:hover": {
                   transform: "translateY(-2px)",
                   boxShadow: `0 8px 25px ${alpha("#36a336", 0.15)}`,
                   border: `1px solid ${alpha("#36a336", 0.3)}`,
                 },
               }}
             >
               <CardContent sx={{ p: 3, textAlign: "center" }}>
                 <Link
                   href="/"
                   style={{
                     textDecoration: "none",
                     color: "inherit",
                   }}
                 >
                   <Typography
                     variant="h5"
                     component="h2"
                     fontWeight={800}
                     sx={{
                       color: "#ffffff",
                       mb: 1,
                     }}
                   >
                     مدرسة الوطن
                   </Typography>
                   <Typography
                     variant="body2"
                     sx={{
                       color: "#ffffff",
                       fontWeight: 500,
                       mb: 2,
                       opacity: 0.9,
                     }}
                   >
                     للسياقة والتعليم
                   </Typography>
                 </Link>
                 
                 <Typography 
                   variant="body2" 
                   sx={{ 
                     color: "#ffffff",
                     opacity: 0.9,
                     mb: 2,
                     fontSize: "0.9rem",
                     lineHeight: 1.6,
                   }}
                 >
                   أفضل مكان للتحضير لامتحان التؤوريا والحصول على رخصة السياقة
                 </Typography>
                 
                 <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                   <IconButton
                     aria-label="Facebook"
                     href="https://www.facebook.com/profile.php?id=100047642302296&locale=ar_AR"
                     target="_blank"
                     rel="noopener noreferrer"
                     sx={{ 
                       color: "#ffffff",
                       backgroundColor: alpha("#ffffff", 0.1),
                       "&:hover": {
                         backgroundColor: alpha("#ffffff", 0.2),
                         transform: "scale(1.1)",
                       },
                       transition: "all 0.3s ease",
                     }}
                   >
                     <FacebookIcon />
                   </IconButton>
                   <IconButton
                     aria-label="WhatsApp"
                     href="https://wa.me/+972568099911"
                     target="_blank"
                     rel="noopener noreferrer"
                     sx={{ 
                       color: "#ffffff",
                       backgroundColor: alpha("#ffffff", 0.1),
                       "&:hover": {
                         backgroundColor: alpha("#ffffff", 0.2),
                         transform: "scale(1.1)",
                       },
                       transition: "all 0.3s ease",
                     }}
                   >
                     <WhatsAppIcon />
                   </IconButton>
                   <IconButton
                     aria-label="TikTok"
                     href="https://www.tiktok.com/@user385632226533?_t=ZS-8zmiSbkMgzM&_r=1"
                     target="_blank"
                     rel="noopener noreferrer"
                     sx={{ 
                       color: "#ffffff",
                       backgroundColor: alpha("#ffffff", 0.1),
                       "&:hover": {
                         backgroundColor: alpha("#ffffff", 0.2),
                         transform: "scale(1.1)",
                       },
                       transition: "all 0.3s ease",
                     }}
                   >
                     <TikTokIcon />
                   </IconButton>
                 </Box>
               </CardContent>
             </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              gutterBottom
              color="var(--primary1)"
              fontWeight={700}
            >
              معلومات الاتصال
            </Typography>
            <Typography variant="body1">
              الخليل دورا مخيم الفوار
            </Typography>
            <Typography variant="body1" mt={2}>
              أرقام الهاتف:
            </Typography>
            <Typography variant="body1">
              <PhoneAndroidIcon /> 0569666617
            </Typography>
            <Typography variant="body1">
              <PhoneAndroidIcon />
              0568099911
            </Typography>
            <Typography variant="body1">
              <PhoneAndroidIcon />
              0599257637
            </Typography>
            <Typography variant="body1" mt={2}>
              إدارة: أسعد ابو زنيد
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              {navigationData
                .filter((e) => e.subMenu.length > 0)
                .map((navItem, idx) => (
                  <Grid item xs={6} sm={4} md={6} key={idx}>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight={700}
                      color="var(--primary1)"
                    >
                      {navItem.title}
                    </Typography>
                    {navItem.subMenu && navItem.subMenu.length > 0 ? (
                      navItem.subMenu.map((subItem, subIdx) => (
                        <Box key={subIdx} mb={1}>
                          <Link
                            href={subItem.path}
                            underline="hover"
                            color="inherit"
                            sx={{ fontSize: "0.9rem", opacity: 0.8 }}
                          >
                            {subItem.title}
                          </Link>
                        </Box>
                      ))
                    ) : (
                      <></>
                    )}
                  </Grid>
                ))}
            </Grid>
          </Grid>
        </Grid>

        <Box mt={4} textAlign="center">
          <Typography variant="body1" color="white">
            {`© ${new Date().getFullYear()} | مدرسة الوطن | جميع الحقوق محفوظة.`}
          </Typography>
          <Typography variant="body1" color="white">
            Made by
            <Link
              href="https://wa.me/+972594262092"
              color="#36a336"
              target="_blank"
              fontSize={20}
              fontWeight={800}
              sx={{ textDecoration: "none" }}
              p={1}
            >
              Ahmad Alarjah
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
