"use client";

import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import Link from "next/link";
import { LogIn, Heart, ShoppingCart } from "lucide-react";

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

  const signIn = async () => {
    if (!supabase) {
      if (isDev) {
        // Local dev mock sign-in to allow UI testing without Supabase configured
        const fake = { email: "dev@local" };
        setUser(fake);
        try {
          localStorage.setItem("wtc_dev_user", JSON.stringify(fake));
        } catch (e) {}
        return;
      }
      alert(
        "Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth."
      );
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
  };

  const signOut = async () => {
    if (!supabase) {
      if (isDev) {
        try {
          localStorage.removeItem("wtc_dev_user");
        } catch (e) {}
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
          className="w-10 h-10 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg border border-slate-200/60 text-slate-700 hover:text-red-600 hover:border-red-300 transition-all active:scale-95"
        >
          <LogIn size={18} />
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setOpen((s) => !s)}
            className="h-10 px-4 rounded-full flex items-center gap-2 bg-white shadow-md hover:shadow-lg border border-slate-200/60 text-slate-700 hover:border-red-300 transition-all active:scale-95"
          >
            <span className="text-sm font-semibold">
              {user.email?.split("@")[0]}
            </span>
            <span className="text-xs text-slate-400">
              ▼
            </span>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100/80 backdrop-blur-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Account
                </p>
                <p className="text-sm font-bold text-slate-700 truncate">
                  {user.email}
                </p>
              </div>
              <Link
                href="/user/favorites"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-red-50/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                  <Heart size={16} fill="currentColor" />
                </div>
                My Favorites
              </Link>
              <Link
                href="/user/wishlist"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-orange-50/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                  <ShoppingCart size={16} />
                </div>
                My Wishlist
              </Link>
              <div className="h-px bg-slate-100 my-1" />
              <button
                onClick={signOut}
                className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
