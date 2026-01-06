"use client";

import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import RecipeCard from "@/components/RecipeCard";

export default function MyFavoritesPage() {
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser((data as any)?.session?.user ?? null);
    })();
    const sub = supabase.auth.onAuthStateChange((_event: string, session: any) => setUser(session?.user ?? null));
    return () => { mounted = false; try { sub.subscription.unsubscribe(); } catch (e) {} };
  }, []);

  useEffect(() => {
    (async () => {
      if (!user) {
        // show local favorites
        try {
          const raw = localStorage.getItem("wtc_local_favorites_v1");
          const arr = raw ? JSON.parse(raw) as number[] : [];
          setFavorites(arr || []);
        } catch (e) {
          setFavorites([]);
        }
        return;
      }

      try {
        const { data: sessionResp } = await supabase.auth.getSession();
        const token = (sessionResp as any)?.session?.access_token;
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/user/favorites`, { headers });
        const json = await res.json();
        if (!json.error && Array.isArray(json.favorites)) {
          setFavorites(json.favorites.map((f: any) => f.recipeId));
        }
      } catch (e) {
        setFavorites([]);
      }
    })();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">My Favorites</h1>
      {favorites.length === 0 ? (
        <p className="text-muted">No favorites yet. Click the heart icon on any recipe to save it.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((rid) => (
            <div key={rid} className="">
              {/* We'll link to recipe page; RecipeCard expects a recipe object. For now show a minimal link */}
              <a href={`/recipes/${rid}`} className="text-blue-600 underline">Recipe {rid}</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
