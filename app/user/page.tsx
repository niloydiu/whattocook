"use client";

import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { useActiveUser } from "@/hooks/useActiveUser";
import { getFavoriteRecipes, getUserWishlist } from "@/app/actions/user";
import Link from "next/link";
import {
  Users,
  Heart,
  ShoppingCart,
  AlertTriangle,
  Loader2,
  Pencil,
} from "lucide-react";

export default function UserProfilePage() {
  const { user, loading: authLoading } = useActiveUser();
  const [loading, setLoading] = useState(true);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [allergiesCount, setAllergiesCount] = useState(0);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setName(
      user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email ||
        ""
    );

    (async () => {
      try {
        const favs = await getFavoriteRecipes(user.id);
        setFavoritesCount(Array.isArray(favs) ? favs.length : 0);

        const w = await getUserWishlist(user.id);
        setWishlistCount(Array.isArray(w) ? w.length : 0);

        // allergies via API (server route)
        const { data: sessionResp } = await supabase.auth.getSession();
        const token = (sessionResp as any)?.session?.access_token;
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`/api/user/allergies`, { headers });
        const json = await res.json();
        setAllergiesCount(
          Array.isArray(json.allergies) ? json.allergies.length : 0
        );
      } catch (e) {
        setFavoritesCount(0);
        setWishlistCount(0);
        setAllergiesCount(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const saveName = async () => {
    if (!user) return;
    setSavingName(true);
    try {
      await supabase.auth.updateUser({ data: { full_name: name } } as any);
    } catch (e) {
      console.warn("Failed to save name", e);
    } finally {
      setSavingName(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-slate-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
          <Users size={48} className="text-indigo-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3 text-center">
          Sign in to view your profile
        </h1>
        <p className="text-slate-600 font-medium mb-8 text-center max-w-md">
          Your favorites, wishlist and allergies are available once you sign in.
        </p>
        <Link
          href="/"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shadow-md text-white text-2xl font-black">
              {user.user_metadata?.full_name?.[0] || user.email?.[0] || "U"}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                {user.user_metadata?.full_name || user.email}
              </h1>
              <p className="text-slate-600 mt-1">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  if (supabase) {
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  } else {
                    try {
                      localStorage.removeItem("wtc_dev_user");
                      localStorage.removeItem("wtc_local_allergies_v1");
                    } catch (e) {}
                    window.location.href = "/";
                  }
                } catch (e) {
                  console.warn("Sign out failed", e);
                }
              }}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80 mb-6">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Pencil size={18} /> Edit Display Name
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={saveName}
                disabled={savingName}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50"
              >
                {savingName ? "Saving..." : "Save"}
              </button>
              <Link
                href="/user/favorites"
                className="px-4 py-3 border rounded-xl text-sm font-semibold"
              >
                View Favorites
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/user/favorites"
            className="bg-white rounded-2xl p-5 shadow-md border border-slate-100/80 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                <Heart className="text-red-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Favorites</div>
                <div className="font-bold text-xl">{favoritesCount}</div>
              </div>
            </div>
          </Link>

          <Link
            href="/user/wishlist"
            className="bg-white rounded-2xl p-5 shadow-md border border-slate-100/80 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                <ShoppingCart className="text-green-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Wishlist</div>
                <div className="font-bold text-xl">{wishlistCount}</div>
              </div>
            </div>
          </Link>

          <Link
            href="/user/allergies"
            className="bg-white rounded-2xl p-5 shadow-md border border-slate-100/80 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                <AlertTriangle className="text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Allergies</div>
                <div className="font-bold text-xl">{allergiesCount}</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-lg mb-3">Quick Actions</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/user/wishlist"
              className="flex-1 px-4 py-3 bg-white rounded-xl border border-slate-100 hover:shadow-md text-center"
            >
              Manage Wishlist
            </Link>
            <Link
              href="/user/favorites"
              className="flex-1 px-4 py-3 bg-white rounded-xl border border-slate-100 hover:shadow-md text-center"
            >
              Manage Favorites
            </Link>
            <Link
              href="/user/allergies"
              className="flex-1 px-4 py-3 bg-white rounded-xl border border-slate-100 hover:shadow-md text-center"
            >
              Edit Allergies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
