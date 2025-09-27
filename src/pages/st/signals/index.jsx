import React, { useState, useEffect } from "react";

import SignalCard from "@/components/ui/SignalCard";
import {
  Container,
  Grid,
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { supabase } from "../../../../lib/supabase";

export default function SignalsPage() {
  const [signalsData, setSignalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define type names for each signal type
  const typeNames = [
    " أ- اشارات التحذير ",
    "ب- اشارات الإرشاد",
    "ج- اشارات الاستعلامات",
    "د- اشارات سطح الطريق",
    "هـ- الآلات الضوئية",
    "و- الاشارات المساعدة",
  ];

  // Fetch signals data from Supabase with immediate caching
  useEffect(() => {
    const fetchSignals = async () => {
      try {
        // Check for cached data first
        const cachedData = localStorage.getItem('signals_data');
        const cacheTimestamp = localStorage.getItem('signals_cache_timestamp');
        const isOffline = !navigator.onLine;
        
        // Use cached data if offline or if cache is less than 24 hours old
        const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;
        const isCacheValid = cacheAge < 24 * 60 * 60 * 1000; // 24 hours
        
        // Show cached data immediately if available
        if (cachedData && (isOffline || isCacheValid)) {
          console.log('Using cached signals data');
          const parsedData = JSON.parse(cachedData);
          setSignalsData(parsedData);
          setLoading(false);
          
          // If offline, don't try to fetch new data
          if (isOffline) {
            return;
          }
        }

        // If offline and no cache, show appropriate message
        if (isOffline && !cachedData) {
          setError('لا توجد بيانات محفوظة. يرجى الاتصال بالإنترنت لتحميل الإشارات.');
          setLoading(false);
          return;
        }

        // Always fetch fresh data from Supabase (even if we have cache)
        console.log('Fetching fresh signals data from Supabase...');
        const { data, error } = await supabase
          .from('signals')
          .select('*')
          .order('type_index', { ascending: true })
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Error fetching signals:', error);
          
          // If we have cached data, use it instead of showing error
          if (cachedData) {
            console.log('Using cached data due to fetch error');
            const parsedData = JSON.parse(cachedData);
            setSignalsData(parsedData);
            setLoading(false);
            return;
          }
          
          setError('فشل في تحميل الإشارات. يرجى التحقق من اتصال الإنترنت.');
          return;
        }

        // Group signals by type_index to match the original structure
        const groupedSignals = [];
        data.forEach(signal => {
          if (!groupedSignals[signal.type_index]) {
            groupedSignals[signal.type_index] = [];
          }
          groupedSignals[signal.type_index].push({
            title: signal.title,
            image: signal.image,
            content: signal.content
          });
        });

        // Update state with fresh data
        setSignalsData(groupedSignals);
        
        // Immediately cache the fresh data
        try {
          localStorage.setItem('signals_data', JSON.stringify(groupedSignals));
          localStorage.setItem('signals_cache_timestamp', Date.now().toString());
          console.log('Fresh signals data cached successfully');
        } catch (cacheError) {
          console.warn('Failed to cache signals data:', cacheError);
        }
        
      } catch (err) {
        console.error('Error fetching signals:', err);
        
        // Try to use cached data if available
        const cachedData = localStorage.getItem('signals_data');
        if (cachedData) {
          console.log('Using cached data due to connection error');
          const parsedData = JSON.parse(cachedData);
          setSignalsData(parsedData);
          setLoading(false);
          return;
        }
        
        setError('خطأ في الاتصال');
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, []);

  // Helper function to scroll smoothly to section (mobile-optimized)
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      // Calculate target position with offset for sticky navigation
      const offset = 120; // Reduced offset for mobile
      const targetPosition = Math.max(0, section.offsetTop - offset);
      
      // Mobile-optimized scrolling approach
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // For mobile/Capacitor: Use direct scroll with animation
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 500; // Animation duration in ms
        let startTime = null;
        
        const animateScroll = (currentTime) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          
          // Easing function for smooth animation
          const easeInOutCubic = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          const currentPosition = startPosition + (distance * easeInOutCubic);
          
          // Use multiple scroll methods for better mobile compatibility
          window.scrollTo(0, currentPosition);
          document.documentElement.scrollTop = currentPosition;
          document.body.scrollTop = currentPosition;
          
          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        };
        
        requestAnimationFrame(animateScroll);
      } else {
        // For desktop: Use native smooth scrolling
        section.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
        
        // Apply offset after scroll
        setTimeout(() => {
          window.scrollTo({ 
            top: targetPosition, 
            behavior: "smooth" 
          });
        }, 100);
      }
    }
  };

  // Responsive check using theme
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      {/* Navigation Container */}
      <Box
        sx={{
          position: "sticky",
          top: 88,
          zIndex: 1000,
          backgroundColor: "background.paper",
          py: 1,
          mb: 4,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {isMdUp ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "nowrap",
              gap: 1,
            }}
          >
            {signalsData.map((_, index) => (
              <Button
                key={index}
                variant="contained"
                sx={{
                  minWidth: 150,
                  color: "white",
                  backgroundColor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
                onClick={() => scrollToSection(`type-${index}`)}
              >
                <Box
                  component="img"
                  src={`/images/signals/icons/${index + 1}.png`}
                  alt={`Icon for ${typeNames[index] || `نوع ${index + 1}`}`}
                  sx={{ width: 35, height: 35 }}
                />
                {typeNames[index] || `نوع ${index + 1}`}
              </Button>
            ))}
          </Box>
        ) : (
          <Swiper
            slidesPerView="auto"
            spaceBetween={16}
            freeMode={true}
            style={{
              paddingLeft: "calc(50vw - 200px)",
              paddingRight: "calc(50vw - 180px)",
            }}
          >
            {signalsData.map((_, index) => (
              <SwiperSlide key={index} style={{ width: "auto" }}>
                <Button
                  variant="contained"
                  sx={{
                    minWidth: 150,
                    color: "white",
                    backgroundColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                  onClick={() => scrollToSection(`type-${index}`)}
                >
                  <Box
                    component={"img"}
                    src={`/images/signals/icons/${index + 1}.png`}
                    alt={`Icon for ${typeNames[index] || `نوع ${index + 1}`}`}
                    width={35}
                    height={35}
                    style={{ objectFit: "contain" }} // Optional for better scaling
                  />
                  {typeNames[index] || `نوع ${index + 1}`}
                </Button>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </Box>

      {/* Content Container */}
      <Container sx={{ py: 4 }}>
        {signalsData.map((typeSignals, index) => (
          <Box 
            id={`type-${index}`} 
            sx={{ mb: 8 }} 
            key={index}
            data-section-index={index}
          >
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              fontWeight={700}
              textAlign="center"
              mb={0}
              sx={{ bgcolor: "white" }}
              p={2}
              borderRadius={3}
            >
              {typeNames[index] || `نوع ${index + 1}`}
            </Typography>
            <Grid container spacing={2}>
              {typeSignals.map((signal, i) => (
                <Grid item xs={12} sm={6} lg={4} key={i}>
                  <SignalCard
                    title={signal.title}
                    imageUrl={signal.image}
                    content={signal.content}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Container>
    </>
  );
}
