import Navbar from "@/components/Navbar";
import { useTheme } from "@/contexts/ThemeContext";
function NavbarWrapper() {
  const { darkMode, toggleDark } = useTheme();
  return <Navbar darkMode={darkMode} onToggleDark={toggleDark} />;
}
import { Suspense, lazy, useEffect, useLayoutEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { instantScrollToTop } from "@/lib/instantScrollToTop";
import ScrollUpRail from "@/components/ScrollUpRail";

const Index = lazy(() => import("./pages/Index.tsx"));
const Trips = lazy(() => import("./pages/Trips.tsx"));

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { key } = useLocation();

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    window.history.scrollRestoration = "manual";
  }, []);

  // useLayoutEffect fires before paint — guaranteed to run before the browser shows the new page
  useLayoutEffect(() => {
    instantScrollToTop();
  }, [key]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <NavbarWrapper />
              <ScrollUpRail />
              <Suspense
                fallback={
                  <div
                    className="min-h-screen bg-background"
                    aria-hidden="true"
                  />
                }
              >
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/trips" element={<Trips />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </MotionConfig>
  </QueryClientProvider>
);

export default App;
