import { useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [roleResolved, setRoleResolved] = useState(false);
  const [ready, setReady] = useState(false);
  const roleRequestId = useRef(0);

  useEffect(() => {
    let alive = true;

    const applySession = async (s: Session | null) => {
      if (!alive) return;
      const rid = ++roleRequestId.current;

      if (!s?.user) {
        setSession(null);
        setRole(null);
        setRoleResolved(true);
        return;
      }

      setSession(s);
      setRole(null);
      setRoleResolved(false);

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", s.user.id)
        .maybeSingle();

      if (!alive || roleRequestId.current !== rid) return;
      setRole(data?.role ?? null);
      setRoleResolved(true);
    };

    void (async () => {
      const {
        data: { session: initial },
      } = await supabase.auth.getSession();
      await applySession(initial);
      if (alive) setReady(true);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      void (async () => {
        await applySession(next);
        if (alive) setReady(true);
      })();
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = role === "admin";
  const user: User | null = session?.user ?? null;

  return { ready, session, user, role, isAdmin, roleResolved };
}
