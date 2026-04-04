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
import { AdminGuard } from "@/admin/components/AdminGuard";
import { AdminLayout } from "@/admin/components/AdminLayout";

const Index = lazy(() => import("./pages/Index.tsx"));
const Trips = lazy(() => import("./pages/Trips.tsx"));
const AdminLoginPage = lazy(() => import("./admin/pages/AdminLoginPage.tsx"));
const AdminDashboardPage = lazy(() => import("./admin/pages/AdminDashboardPage.tsx"));
const AdminTripsPage = lazy(() => import("./admin/pages/AdminTripsPage.tsx"));
const AdminLeadsPage = lazy(() => import("./admin/pages/AdminLeadsPage.tsx"));

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { key } = useLocation();

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    window.history.scrollRestoration = "manual";
  }, []);

  useLayoutEffect(() => {
    instantScrollToTop();
  }, [key]);

  return null;
};

function PublicChrome() {
  const { pathname } = useLocation();
  const hide = pathname.startsWith("/admin");
  return (
    <>
      {!hide && <NavbarWrapper />}
      {!hide && <ScrollUpRail />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <PublicChrome />
              <Suspense
                fallback={
                  <div className="min-h-screen bg-background" aria-hidden="true" />
                }
              >
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/trips" element={<Trips />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/admin" element={<AdminGuard />}>
                    <Route element={<AdminLayout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<AdminDashboardPage />} />
                      <Route path="trips" element={<AdminTripsPage />} />
                      <Route path="leads" element={<AdminLeadsPage />} />
                    </Route>
                  </Route>
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
