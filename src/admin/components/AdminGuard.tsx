import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";

function NonAdminRedirect() {
  const { t } = useLanguage();
  useEffect(() => {
    void supabase.auth.signOut();
    toast.error(t("admin.forbiddenAccessToast"));
  }, [t]);
  return <Navigate to="/" replace />;
}

export function AdminGuard() {
  const { ready, session, isAdmin, roleResolved } = useAdminAuth();

  if (!ready || (session && !roleResolved)) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-zinc-950"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <NonAdminRedirect />;
  }

  return <Outlet />;
}
