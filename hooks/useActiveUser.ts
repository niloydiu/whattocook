"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

export function useActiveUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    if (!supabase) {
      if (isDev) {
        const raw = localStorage.getItem("wtc_dev_user");
        if (raw) {
          try {
            setUser(JSON.parse(raw));
          } catch (e) {}
        }
      }
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        // If redirected back from OAuth, let Supabase parse the URL and return the session
        if (
          typeof window !== "undefined" &&
          supabase?.auth?.getSessionFromUrl
        ) {
          try {
            const maybe = await supabase.auth.getSessionFromUrl();
            const session = (maybe as any)?.data?.session;
            if (session) {
              if (!mounted) return;
              setUser(session.user ?? null);
              setLoading(false);
              return;
            }
          } catch (e) {
            // ignore and continue to normal getSession
          }
        }

        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser((data as any)?.session?.user ?? null);
      } catch (e) {
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: string, session: any) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      try {
        sub.subscription.unsubscribe();
      } catch (e) {}
    };
  }, []);

  return { user, loading };
}
