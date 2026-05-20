import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AdminSidebar, AdminNavLinks } from "@/admin/components/AdminSidebar";
import { AdminHeader } from "@/admin/components/AdminHeader";
import { AdminErrorBoundary } from "@/admin/components/AdminErrorBoundary";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AdminEditingProvider } from "@/admin/context/AdminEditingContext";

export function AdminLayout() {
  const loc = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <AdminEditingProvider>
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100">
      <AdminSidebar />
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent className="w-[min(100vw,20rem)] max-w-[85vw] border-slate-200 dark:border-white/10">
          <SheetHeader className="border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 shrink-0 text-primary" aria-hidden />
              <SheetTitle className="text-left text-slate-900 dark:text-zinc-100">Admin</SheetTitle>
            </div>
          </SheetHeader>
          <AdminNavLinks onNavigate={() => setMobileNavOpen(false)} className="flex-1" />
        </SheetContent>
      </Sheet>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader onMobileNavOpen={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-auto">
          <AdminErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={loc.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto w-full max-w-6xl px-6 py-10"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
    </AdminEditingProvider>
  );
}
