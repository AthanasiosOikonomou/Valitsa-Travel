import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AdminSidebar } from "@/admin/components/AdminSidebar";
import { AdminErrorBoundary } from "@/admin/components/AdminErrorBoundary";

export function AdminLayout() {
  const loc = useLocation();
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
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
  );
}
