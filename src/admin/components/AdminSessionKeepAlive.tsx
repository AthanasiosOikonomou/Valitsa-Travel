import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  markAthensSessionRefreshed,
  msUntilNextAthens5AM,
  readLastAthensRefresh,
  shouldRefreshAthensSession,
} from "@/admin/lib/athensSessionSchedule";

async function refreshAthensSessionIfNeeded(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;

  const last = readLastAthensRefresh();
  if (!shouldRefreshAthensSession(last)) return;

  const { error } = await supabase.auth.refreshSession();
  if (error) {
    console.warn("[admin] Athens session refresh failed:", error.message);
    return;
  }
  markAthensSessionRefreshed();
}

/**
 * Schedules silent refreshSession at 05:00 Europe/Athens and when tab becomes visible past that boundary.
 */
export function AdminSessionKeepAlive() {
  const { pathname } = useLocation();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAdminRoute =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  useEffect(() => {
    if (!isAdminRoute) return;

    const scheduleNext = () => {
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      const delay = msUntilNextAthens5AM();
      timeoutRef.current = setTimeout(() => {
        void refreshAthensSessionIfNeeded().finally(scheduleNext);
      }, delay);
    };

    void refreshAthensSessionIfNeeded();

    scheduleNext();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshAthensSessionIfNeeded();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isAdminRoute]);

  return null;
}
