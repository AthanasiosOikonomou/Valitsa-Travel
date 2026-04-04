import Navbar from "@/components/Navbar";
import { useTheme } from "next-themes";
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
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { THEME_STORAGE_KEY } from "@/lib/themeStorage";
import { useResolvedDarkMode } from "@/hooks/useResolvedDarkMode";

function NavbarWrapper() {
  const darkMode = useResolvedDarkMode();
  const { setTheme } = useTheme();
  const toggleDark = () => setTheme(darkMode ? "light" : "dark");
  return <Navbar darkMode={darkMode} onToggleDark={toggleDark} />;
}
import { instantScrollToTop } from "@/lib/instantScrollToTop";
import ScrollUpRail from "@/components/ScrollUpRail";
import { AdminGuard } from "@/admin/components/AdminGuard";
import { AdminSessionSync } from "@/admin/components/AdminSessionSync";
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
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey={THEME_STORAGE_KEY}
        disableTransitionOnChange
      >
        <LanguageProvider>
          <AdminSessionSync />
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
                  <div className="min-h-screen bg-slate-50 dark:bg-zinc-950" aria-hidden="true" />
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
      </NextThemesProvider>
    </MotionConfig>
  </QueryClientProvider>
);

export default App;
