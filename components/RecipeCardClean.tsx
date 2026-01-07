"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Loader2,
} from "lucide-react";
import { Heart as HeartIcon } from "lucide-react";
import supabase from "@/lib/supabaseClient";
import ingredientsData from "../lib/ingredients.json";

type Locale = "en" | "bn";

type Recipe = {
  id: string;
  youtubeId?: string;
  youtubeUrl?: string;
  title: { en: string; bn: string };
  thumbnail?: string;
  ingredients: { en: string[]; bn: string[] };
};

function toBengaliNumber(n: number) {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n)
    .split("")
    .map((d) => map[+d] ?? d)
    .join("");
}

function getYoutubeThumbnail(id?: string) {
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

function getIngredientIcon(name: string) {
  const ingredients = ingredientsData as any[];
  const found = ingredients.find(
    (i) => i.name_en === name || i.name_bn === name
  );
  if (found) return found.img;

  // TheMealDB uses capitalized names for icons
  const formatted = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  return `https://www.themealdb.com/images/ingredients/${formatted}-Small.png`;
}

export default function RecipeCardClean({
  recipe,
  matchPercent,
  have,
  total,
  locale = "en",
  onOpenVideo,
  pantry = [],
}: {
  recipe: Recipe;
  matchPercent: number;
  have: number;
  total: number;
  locale?: Locale;
  onOpenVideo: (id: string) => void;
  pantry?: string[];
}) {
  const [user, setUser] = useState<any>(null);
  const [isFav, setIsFav] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyMatches, setAllergyMatches] = useState<string[]>([]);
  const [addedWishlist, setAddedWishlist] = useState<string[]>([]);
  const [isFavLoading, setIsFavLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser((data as any)?.session?.user ?? null);
      } catch (e) {}
    })();

    const sub = supabase.auth.onAuthStateChange((_e: string, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      try {
        sub.subscription.unsubscribe();
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (!user || !user.id) {
      // If not logged in, check local favorites fallback
      try {
        const raw = localStorage.getItem("wtc_local_favorites_v1");
        const arr = raw ? (JSON.parse(raw) as number[]) : [];
        setIsFav(arr.includes(Number(recipe.id)));
      } catch (e) {
        setIsFav(false);
      }
      return;
    }

    (async () => {
      try {
        const { data: sessionResp } = await supabase.auth.getSession();
        const token = (sessionResp as any)?.session?.access_token;
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // Fetch server favorites
        const res = await fetch(`/api/user/favorites`, { headers });
        const json = await res.json();
        if (!json.error && Array.isArray(json.favorites)) {
          const found = json.favorites.find(
            (f: any) => f.recipeId === Number(recipe.id)
          );
          setIsFav(!!found);
        }

        // Sync any local favorites to server (one-time sync)
        const raw = localStorage.getItem("wtc_local_favorites_v1");
        const localArr = raw ? (JSON.parse(raw) as number[]) : [];
        if (Array.isArray(localArr) && localArr.length > 0) {
          for (const rid of localArr) {
            // skip if already favorited on server
            if (
              json &&
              Array.isArray(json.favorites) &&
              json.favorites.find((f: any) => f.recipeId === rid)
            )
              continue;
            await fetch(`/api/user/favorites`, {
              method: "POST",
              headers,
              body: JSON.stringify({ recipeId: Number(rid) }),
            }).catch(() => null);
          }
          // optionally clear local favorites after sync
          localStorage.removeItem("wtc_local_favorites_v1");
        }
      } catch (e) {
        // ignore
      }
    })();

    // load allergies only from server when user is logged in
    (async () => {
      try {
        if (!user || !user.id) {
          setAllergies([]);
          return;
        }

        const { data: sessionResp } = await supabase.auth.getSession();
        const token = (sessionResp as any)?.session?.access_token;
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`/api/user/allergies`, { headers });
        const json = await res.json();
        if (!json.error && Array.isArray(json.allergies)) {
          setAllergies(
            json.allergies.map((a: any) => (a.name_en || "").toLowerCase())
          );
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [user, recipe.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavLoading(true);
    // If user is present and supabase configured, call server API. Otherwise use localStorage fallback.
    if (user && user.id && supabase) {
      try {
        const { data: sessionResp } = await supabase.auth.getSession();
        const token = (sessionResp as any)?.session?.access_token;
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        if (!isFav) {
          const res = await fetch(`/api/user/favorites`, {
            method: "POST",
            headers,
            body: JSON.stringify({ recipeId: Number(recipe.id) }),
          });
          const json = await res.json();
          if (!json.error) setIsFav(true);
        } else {
          const res = await fetch(`/api/user/favorites`, {
            method: "DELETE",
            headers,
            body: JSON.stringify({ recipeId: Number(recipe.id) }),
          });
          const json = await res.json();
          if (!json.error) setIsFav(false);
        }
      } catch (e) {
        console.warn("favorite action failed", e);
      } finally {
        setIsFavLoading(false);
      }
      return;
    }

    // Local fallback: toggle in localStorage
    try {
      const raw = localStorage.getItem("wtc_local_favorites_v1");
      let arr = raw ? (JSON.parse(raw) as number[]) : [];
      const idn = Number(recipe.id);
      if (!arr) arr = [];
      if (!isFav) {
        if (!arr.includes(idn)) arr.push(idn);
        setIsFav(true);
      } else {
        arr = arr.filter((x) => x !== idn);
        setIsFav(false);
      }
      localStorage.setItem("wtc_local_favorites_v1", JSON.stringify(arr));
      // show transient notice? left to UI
    } catch (e) {
      console.warn("local favorite action failed", e);
    } finally {
      setIsFavLoading(false);
    }
  };

  const toggleWishlistIngredient = async (
    name: string,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    const key = "wtc_local_wishlist_v1";

    setWishlistLoading((prev) => ({ ...prev, [name]: true }));
    if (user && user.id && supabase) {
      try {
        const { data: sessionResp } = await supabase.auth.getSession();
        const token = (sessionResp as any)?.session?.access_token;
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        await fetch(`/api/user/wishlist`, {
          method: "POST",
          headers,
          body: JSON.stringify({ name_en: name }),
        });
        setAddedWishlist((s) => Array.from(new Set([...s, name])));
        return;
      } catch (e) {
        // fallback to local
      } finally {
        setWishlistLoading((prev) => ({ ...prev, [name]: false }));
      }
    }

    try {
      const raw = localStorage.getItem(key);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      if (!arr.includes(name)) {
        arr.push(name);
        localStorage.setItem(key, JSON.stringify(arr));
      }
      setAddedWishlist((s) => Array.from(new Set([...s, name])));
    } catch (e) {
      console.warn("local wishlist action failed", e);
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [name]: false }));
    }
  };
  const title = recipe.title[locale] || recipe.title.en;
  const thumbnail = recipe.youtubeId
    ? getYoutubeThumbnail(recipe.youtubeId)
    : recipe.thumbnail;
  const pct = Math.round(matchPercent * 100);

  const recipeIngredients = recipe.ingredients[locale];
  useEffect(() => {
    try {
      const normalized = recipeIngredients.map((r) => r.toLowerCase().trim());
      const matches = normalized.filter((ing) =>
        allergies.some((a) => ing.includes(a) || a.includes(ing))
      );
      setAllergyMatches(Array.from(new Set(matches)));
    } catch (e) {
      setAllergyMatches([]);
    }
  }, [allergies, recipeIngredients]);
  const missing = recipeIngredients
    .filter((ing) => {
      const normalizedIng = ing.toLowerCase().trim();
      return !pantry.some(
        (p) =>
          normalizedIng.includes(p.toLowerCase().trim()) ||
          p.toLowerCase().trim().includes(normalizedIng)
      );
    })
    .slice(0, 4);

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-100/80 transition-all duration-300 group"
    >
      <div className="relative h-56 overflow-hidden bg-slate-50">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-100">
            <ChefHat size={48} strokeWidth={1} />
          </div>
        )}

        {/* Match Badge Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <div
            className={`px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider shadow-lg transition-all duration-500 ${
              pct > 80
                ? "bg-emerald-500 text-white"
                : pct > 50
                ? "bg-amber-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {pct}% {locale === "en" ? "Match" : "মিল"}
          </div>
        </div>

        {/* Allergy badge */}
        {allergyMatches.length > 0 && (
          <div className="absolute top-4 right-4 z-20">
            <div className="px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider shadow-lg bg-red-600 text-white">
              {locale === "en" ? "Allergy Alert" : "অ্যালার্জি সতর্কতা"}
            </div>
            <div className="mt-1 text-xs bg-white/90">
              {locale === "en" ? "Contains:" : "উপাদান:"}{" "}
              {allergyMatches.slice(0, 3).join(", ")}
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        {recipe.youtubeId && (
          <div className="absolute inset-0 bg-black/10">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border-2 border-white/50 cursor-pointer"
              onClick={() => onOpenVideo(recipe.youtubeId!)}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                <Play
                  fill="currentColor"
                  size={20}
                  className="ml-1 text-white"
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <div
        className="p-5 flex flex-col flex-1"
        onClick={() => recipe.youtubeId && onOpenVideo(recipe.youtubeId)}
      >
        <h3 className="text-lg font-bold text-slate-900 hover:text-red-600 transition-colors mb-3">
          {title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-slate-400">
          <div
            className="flex items-center gap-1.5"
            title={locale === "en" ? "Match Count" : "মিলের সংখ্যা"}
          >
            <CheckCircle2
              size={12}
              className={pct > 80 ? "text-emerald-500" : "text-amber-500"}
            />
            <span>
              <span className="text-[8px] text-slate-400">
                {locale === "en" ? "HAVE:" : "মিল:"}
              </span>
              {have}/{total}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat size={12} className="text-red-500" />
            <span>Youtube</span>
          </div>
        </div>

        {/* Missing Ingredients Snippet */}
        {missing.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
            {missing.map((ing, idx) => {
              const added = addedWishlist.includes(ing.toLowerCase());
              const loading = wishlistLoading[ing.toLowerCase()];
              return (
                <button
                  key={idx}
                  onClick={(e) =>
                    toggleWishlistIngredient(ing.toLowerCase(), e)
                  }
                  disabled={loading}
                  className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                    added
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-50/80 text-slate-600 hover:bg-yellow-50"
                  } ${loading ? "opacity-70" : ""}`}
                >
                  {loading ? (
                    <Loader2 size={8} className="animate-spin" />
                  ) : added ? (
                    "✓ "
                  ) : (
                    "+ "
                  )}
                  {ing}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 flex items-center gap-1.5 group-hover:text-red-700 transition-colors">
              {locale === "en" ? "Watch Video" : "ভিডিও দেখুন"}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:translate-x-1 transition-transform"
              >
                <path d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFavorite}
                disabled={isFavLoading}
                className="p-2 rounded-xl hover:bg-red-50 transition-all active:scale-95 border-2 border-transparent hover:border-red-200 disabled:opacity-70"
                title={
                  locale === "en" ? "Add to favorites" : "প্রিয়তে যোগ করুন"
                }
                onMouseDown={(e) => e.stopPropagation()}
              >
                {isFavLoading ? (
                  <Loader2 size={18} className="animate-spin text-red-600" />
                ) : isFav ? (
                  <HeartIcon size={18} className="text-red-600 fill-red-600" />
                ) : (
                  <HeartIcon
                    size={18}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  />
                )}
              </button>
              {recipe.youtubeUrl && (
                <a
                  href={recipe.youtubeUrl}
                  target="_blank"
                  className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all active:scale-95 border-2 border-transparent hover:border-red-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
