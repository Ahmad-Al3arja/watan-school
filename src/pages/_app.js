// pages/_app.js
import { Cairo } from "next/font/google";
import { useEffect, useState } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useRouter } from "next/router";
import AOS from "aos";
import "aos/dist/aos.css";
import Providers from "../components/layout/Providers";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "./globals.css";
import "../styles/hero.css";
import "../styles/Navigation.css";
import "../styles/signs.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import ConfirmExitDialog from "../components/layout/Exit";
import OfflineIndicator from "../components/ui/OfflineIndicator";
import backgroundSync from "../components/util/backgroundSync";
import '../components/layout/GallerySwiper.css';


// Initialize the Cairo font
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["200", "300", "400", "500", "600", "700", "800","900"],
});

function App({ Component, pageProps }) {
  const router = useRouter();
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  // Initialize AOS animations - DISABLED ON SMALL MOBILE ONLY
  useEffect(() => {
    // Check if it's a small mobile device (phones only) - only on client side
    if (typeof window !== 'undefined') {
      const isSmallMobile = window.innerWidth <= 480;

      if (!isSmallMobile) {
        AOS.init({
          duration: 500,
          once: true,
          offset: -80,
          easing: "ease-in-out",
          disable: false, // Ensure AOS is enabled for tablets and desktops
        });
      }
    }
  }, []);

  // Fix scroll position on route change
  useEffect(() => {
    const handleRouteChange = () => {
      // Use setTimeout to ensure content is rendered before scrolling
      setTimeout(() => {
        // Scroll to top when route changes - use multiple methods for better compatibility
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // For mobile devices, also try scrolling the main element
        const mainElement = document.querySelector('main');
        if (mainElement) {
          mainElement.scrollTop = 0;
        }
        
        // Force scroll to top with smooth behavior disabled
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
      }, 300); // Longer delay to ensure content is fully rendered
    };

    // Listen for route changes
    router.events.on('routeChangeComplete', handleRouteChange);
    
    // Also listen for route change start to scroll immediately
    router.events.on('routeChangeStart', () => {
      window.scrollTo(0, 0);
    });
    
    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('routeChangeStart', () => {
        window.scrollTo(0, 0);
      });
    };
  }, [router.events]);

  // Initialize background sync
  useEffect(() => {
    backgroundSync.start();
    
    return () => {
      backgroundSync.stop();
    };
  }, []);

  // Listen for the Android hardware back button
  useEffect(() => {
    let backButtonListener;
    if (Capacitor.isNativePlatform()) {
      backButtonListener = CapacitorApp.addListener("backButton", () => {
        if (router.pathname === "/") {
          setExitDialogOpen(true);
        } else {
          router.back();
        }
      });
    }
    return () => {
      if (
        backButtonListener &&
        typeof backButtonListener.remove === "function"
      ) {
        backButtonListener.remove();
      }
    };
  }, [router]);

  const handleConfirmExit = () => {
    CapacitorApp.exitApp();
  };

  const handleCancelExit = () => {
    setExitDialogOpen(false);
  };

  return (
    <div className={cairo.variable} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <OfflineIndicator />
      <Providers>
          <Header />
          <main style={{ flex: 1, position: "relative", zIndex: 1 }}>
            {/* Fixed scrolling issues - no more jumping */}
            <Component {...pageProps} />
          </main>
          <Footer />
      </Providers>
      <ConfirmExitDialog
        open={exitDialogOpen}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </div>
  );
}

export default App;
