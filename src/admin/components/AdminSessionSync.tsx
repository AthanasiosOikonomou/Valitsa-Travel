import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { setAdminUnauthorizedHandler } from "@/lib/adminApi";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Registers global handler for 401/403 on /api/admin/* (via adminFetch).
 * Must render inside LanguageProvider.
 */
export function AdminSessionSync() {
  const { t } = useLanguage();
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    const handler = () => {
      void (async () => {
        await supabase.auth.signOut();
        toast.error(tRef.current("admin.sessionExpiredToast"));
        const path = window.location.pathname;
        if (!path.startsWith("/admin/login")) {
          window.location.assign("/admin/login");
        }
      })();
    };

    setAdminUnauthorizedHandler(handler);
    return () => setAdminUnauthorizedHandler(null);
  }, []);

  return null;
}
