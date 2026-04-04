import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const loadRole = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
    setRole(data?.role ?? null);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!alive) return;
      setSession(s);
      if (s?.user) await loadRole(s.user.id);
      setReady(true);
    })();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_evt, s) => {
      setSession(s);
      if (s?.user) await loadRole(s.user.id);
      else setRole(null);
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [loadRole]);

  const isAdmin = role === "admin";
  const user: User | null = session?.user ?? null;

  return { ready, session, user, role, isAdmin };
}
