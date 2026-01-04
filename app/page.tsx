"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Languages, Github, Youtube, X } from "lucide-react";
import RecipeCard from "../components/RecipeCardClean";
import useLanguage from "../hooks/useLanguage";
import recipeDataRaw from "../lib/recipeData.json";
import Hero from "../components/Hero";

type Locale = "en" | "bn";

type Recipe = {
  id: string;
  youtubeId?: string;
  title: { en: string; bn: string };
  ingredients: { en: string[]; bn: string[] };
  instructions?: { en?: string; bn?: string } | string;
};

function normalizeStr(s?: string) {
  if (!s) return "";
  const banglaDigits = "০১২৩৪৫৬৭৮৯";
  const latinDigits = "0123456789";
  let out = s
    .toLowerCase()
    .trim()
    .replace(/[.,()\[\]"']/g, "")
    .replace(/–|—/g, "-")
    .replace(/\s+/g, " ");
  out = out
    .split("")
    .map((c) => {
      const idx = banglaDigits.indexOf(c);
      return idx >= 0 ? latinDigits[idx] : c;
    })
    .join("");
  return out;
}

function itemMatches(a: string, b: string) {
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

export default function Page() {
  const { locale, setLocale, t } = useLanguage();
  const recipeData = recipeDataRaw as Recipe[];

  const indexed = useMemo(() => {
    return recipeData.map((r) => {
      const en = (r.ingredients?.en || []).map((s) => normalizeStr(s));
      const bn = (r.ingredients?.bn || []).map((s) => normalizeStr(s));
      const combined = Array.from(new Set([...en, ...bn]));
      return {
        recipe: r,
        normIngredients: combined,
        total: combined.length || 1,
      };
    });
  }, [recipeData]);

  const [pantry, setPantry] = useState<string[]>([]);
  const [debouncedPantry, setDebouncedPantry] = useState<string[]>(pantry);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedPantry(pantry.slice()), 200);
    return () => clearTimeout(id);
  }, [pantry]);

  function addPantryItem(raw: string) {
    const v = normalizeStr(raw);
    if (!v) return;
    if (pantry.map(normalizeStr).includes(v)) return;
    setPantry((p) => [...p, raw.trim()]);
  }

  function removePantryItem(idx: number) {
    setPantry((p) => p.filter((_, i) => i !== idx));
  }

  const results = useMemo(() => {
    const pantryNorm = debouncedPantry.map(normalizeStr).filter(Boolean);
    if (pantryNorm.length === 0) return [];

    const out = indexed.map(({ recipe, normIngredients, total }) => {
      let have = 0;
      for (const p of pantryNorm) {
        for (const rIng of normIngredients) {
          if (itemMatches(rIng, p)) {
            have += 1;
            break;
          }
        }
      }
      const matchedUnique = Math.min(have, total);
      const matchPercent = matchedUnique / total;
      const missing = total - matchedUnique;
      return { recipe, matchPercent, have: matchedUnique, missing, total };
    });

    return out
      .filter(r => r.matchPercent > 0)
      .sort((a, b) => {
        if ((a.matchPercent === 1) !== (b.matchPercent === 1))
          return a.matchPercent === 1 ? -1 : 1;
        if (b.matchPercent !== a.matchPercent)
          return b.matchPercent - a.matchPercent;
        if (a.missing !== b.missing) return a.missing - b.missing;
        return a.recipe.title.en.localeCompare(b.recipe.title.en);
      });
  }, [indexed, debouncedPantry]);

  function handleFind() {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
    // Scroll to results
    const el = document.getElementById("results-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen selection:bg-red-100 selection:text-red-600">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-red-600/20">
              <ChefHat size={20} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              whatto<span className="text-red-600">Cook?</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setLocale("en")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  locale === "en" ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale("bn")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  locale === "bn" ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                বাংলা
              </button>
            </div>
            <a 
              href="https://github.com/niloydiu/whattocook" 
              target="_blank" 
              className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </nav>

      <Hero 
        pantry={pantry} 
        onAdd={addPantryItem} 
        onRemove={removePantryItem} 
        onFind={handleFind} 
        locale={locale} 
      />

      <main id="results-section" className="max-w-7xl mx-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-medium">
                {locale === "en" ? "Finding the best recipes for you..." : "আপনার জন্য সেরা রেসিপি খোঁজা হচ্ছে..."}
              </p>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {results.map((r, idx) => (
                <RecipeCard
                  key={r.recipe.id}
                  recipe={r.recipe}
                  matchPercent={r.matchPercent}
                  have={r.have}
                  total={r.total}
                  locale={locale}
                  onOpenVideo={(id) => setSelectedVideo(id)}
                  pantry={pantry}
                />
              ))}
            </motion.div>
          ) : pantry.length > 0 ? (
            <motion.div 
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-slate-200"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <ChefHat size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {locale === "en" ? "No exact matches found" : "কোনো মিল পাওয়া যায়নি"}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {locale === "en" 
                  ? "Try adding more common ingredients like oil, salt, or onion to see more results." 
                  : "আরও কিছু সাধারণ উপকরণ যেমন তেল, লবণ বা পেঁয়াজ যোগ করে দেখুন।"}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                title="YouTube player"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-12 border-t border-slate-100 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white">
              <ChefHat size={14} />
            </div>
            <span className="font-bold text-slate-900">whattoCook?</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 whattoCook. {locale === "en" ? "Made with love for foodies." : "ভোজনরসিকদের জন্য ভালোবাসা দিয়ে তৈরি।"}
          </p>
        </div>
      </footer>
    </div>
  );
}
