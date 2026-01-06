"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChefHat,
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
      try { sub.subscription.unsubscribe(); } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (!user || !user.id) {
      // If not logged in, check local favorites fallback
      try {
        const raw = localStorage.getItem("wtc_local_favorites_v1");
        const arr = raw ? JSON.parse(raw) as number[] : [];
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
          const found = json.favorites.find((f: any) => f.recipeId === Number(recipe.id));
          setIsFav(!!found);
        }

        // Sync any local favorites to server (one-time sync)
        const raw = localStorage.getItem("wtc_local_favorites_v1");
        const localArr = raw ? JSON.parse(raw) as number[] : [];
        if (Array.isArray(localArr) && localArr.length > 0) {
          for (const rid of localArr) {
            // skip if already favorited on server
            if (json && Array.isArray(json.favorites) && json.favorites.find((f: any) => f.recipeId === rid)) continue;
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
          setAllergies(json.allergies.map((a: any) => (a.name_en || "").toLowerCase()));
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [user, recipe.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      }
      return;
    }

    // Local fallback: toggle in localStorage
    try {
      const raw = localStorage.getItem("wtc_local_favorites_v1");
      let arr = raw ? JSON.parse(raw) as number[] : [];
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
      const matches = normalized.filter((ing) => allergies.some((a) => ing.includes(a) || a.includes(ing)));
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
      whileHover={{ y: -4 }}
      className="bg-white rounded-[1.5rem] overflow-hidden flex flex-col h-full group transition-all duration-300 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden bg-slate-50">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
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
              {locale === 'en' ? 'Allergy Alert' : 'অ্যালার্জি সতর্কতা'}
            </div>
            <div className="mt-1 text-xs bg-white/90 text-red-600 rounded p-1 max-w-xs">
              {locale === 'en' ? 'Contains:' : 'উপাদান:'} {allergyMatches.slice(0,3).join(', ')}
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        {recipe.youtubeId && (
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 bg-white text-red-600 rounded-full flex items-center justify-center shadow-xl cursor-pointer backdrop-blur-sm bg-white/90"
              onClick={() => onOpenVideo(recipe.youtubeId!)}
            >
              <Play fill="currentColor" size={24} className="ml-1" />
            </motion.div>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1" onClick={() => recipe.youtubeId && onOpenVideo(recipe.youtubeId)}>
        <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
          {title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
           <div className="flex items-center gap-1.5" title={locale === "en" ? "Match Count" : "মিলের সংখ্যা"}>
              <CheckCircle2 size={12} className={pct > 80 ? "text-emerald-500" : "text-amber-500"} />
              <span>
                <span className="text-[8px] text-slate-400 mr-0.5">{locale === "en" ? "HAVE:" : "মিল:"}</span>
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
            {missing.map((ing, idx) => (
              <span key={idx} className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md">
                +{ing}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
            {locale === "en" ? "Watch Video" : "ভিডিও দেখুন"}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </span>
          <div className="flex items-center gap-3">
            <button onClick={toggleFavorite} className="text-slate-300 hover:text-red-500 transition-colors" title={locale === 'en' ? 'Add to favorites' : 'প্রিয়তে যোগ করুন'} onMouseDown={(e)=>e.stopPropagation()}>
              {isFav ? <HeartIcon size={16} className="text-red-500" /> : <HeartIcon size={16} className="text-slate-300" />}
            </button>
            {recipe.youtubeUrl && (
               <a 
                 href={recipe.youtubeUrl} 
                 target="_blank" 
                 className="text-slate-300 hover:text-red-500 transition-colors"
                 onClick={(e) => e.stopPropagation()}
               >
                 <ExternalLink size={14} />
               </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
