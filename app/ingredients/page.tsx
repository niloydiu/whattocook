"use client";

import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

export default function IngredientsPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser((data as any)?.session?.user ?? null);
      } catch (e) {}
    })();
    const sub = supabase.auth.onAuthStateChange((_e: any, session: any) => {
      setUser(session?.user ?? null);
    });
    return () => {
      try {
        sub.subscription.unsubscribe();
      } catch (e) {}
    };
  }, []);

  const search = async (term: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ingredients?search=${encodeURIComponent(term)}&limit=50`
      );
      const json = await res.json();
      if (!json.error && Array.isArray(json.ingredients))
        setResults(json.ingredients);
      else setResults([]);
    } catch (e) {
      setResults([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      search(q.trim());
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const addToWishlist = async (ingredient: any) => {
    // local fallback key
    const key = "wtc_local_wishlist_v1";
    if (user && user.id && supabase) {
      try {
        const { data: sessionResp } = await supabase.auth.getSession();
        const token = (sessionResp as any)?.session?.access_token;
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        await fetch(`/api/user/wishlist`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            ingredientId: ingredient.id,
            name_en: ingredient.name_en,
          }),
        });
        return;
      } catch (e) {
        // fallback to local
      }
    }

    // local fallback store by name_en
    try {
      const raw = localStorage.getItem(key);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      if (!arr.includes(ingredient.name_en)) {
        arr.push(ingredient.name_en);
        localStorage.setItem(key, JSON.stringify(arr));
      }
    } catch (e) {}
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ingredients</h1>
      <div className="mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ingredients"
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      {loading && <div>Loading…</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {results.map((ing) => (
          <div
            key={ing.id}
            className="p-3 border rounded-md flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <img
                src={ing.img || `/images/placeholder-ingredient.png`}
                alt={ing.name_en}
                className="w-8 h-8 object-cover rounded"
              />
              <div>
                <div className="font-semibold">{ing.name_en}</div>
                {ing.name_bn && (
                  <div className="text-xs text-slate-500">{ing.name_bn}</div>
                )}
              </div>
            </div>
            <div>
              <button
                onClick={() => addToWishlist(ing)}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
