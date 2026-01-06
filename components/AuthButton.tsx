"use client";

import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    if (!supabase) {
      // If Supabase isn't configured, allow a local dev fallback using localStorage
      if (isDev) {
        const raw = localStorage.getItem("wtc_dev_user");
        if (raw) {
          try {
            setUser(JSON.parse(raw));
          } catch (e) {}
        }
      }
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser((data as any)?.session?.user ?? null);
      } catch (e) {}
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => { mounted = false; try { sub.subscription.unsubscribe(); } catch (e) {} };
  }, []);

  const signIn = async () => {
    if (!supabase) {
      if (isDev) {
        // Local dev mock sign-in to allow UI testing without Supabase configured
        const fake = { email: "dev@local" };
        setUser(fake);
        try { localStorage.setItem("wtc_dev_user", JSON.stringify(fake)); } catch (e) {}
        return;
      }
      alert("Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth.");
      return;
    }
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
  };

  const signOut = async () => {
    if (!supabase) {
      if (isDev) {
        try { localStorage.removeItem("wtc_dev_user"); } catch (e) {}
        setUser(null);
        setOpen(false);
      }
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
  };

  return (
    <div className="fixed right-4 top-3 md:top-5 z-[130]">
      {!user ? (
        <button
          onClick={signIn}
          title="Sign in"
          aria-label="Sign in"
          className="w-10 h-10 md:w-10 md:h-10 flex items-center justify-center bg-white text-slate-800 rounded-full shadow-md hover:shadow-lg"
        >
          <LogIn size={18} />
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setOpen((s) => !s)}
            className="h-10 px-3 rounded-full flex items-center gap-2 bg-white text-slate-800 shadow-md hover:shadow-lg"
          >
            <span className="text-sm font-medium">{user.email?.split("@")[0]}</span>
            <span className="text-xs text-slate-400">▼</span>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg py-1">
              <Link href="/user/favorites" className="block px-3 py-2 hover:bg-slate-50">My Favorites</Link>
              <Link href="/user/allergies" className="block px-3 py-2 hover:bg-slate-50">My Allergies</Link>
              <Link href="/profile" className="block px-3 py-2 hover:bg-slate-50">Profile</Link>
              <button onClick={signOut} className="w-full text-left px-3 py-2 hover:bg-slate-50">Sign out</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
