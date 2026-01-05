"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Languages,
  Github,
  Youtube,
  X,
  Settings,
  Plus,
  Loader2,
} from "lucide-react";
import RecipeCard from "../components/RecipeCardClean";
import useLanguage from "../hooks/useLanguage";
import recipeDataRaw from "../lib/recipeData.json";
import Hero from "../components/Hero";
import { importRecipeFromYoutube } from "./actions/importer";

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
  const [recipeData, setRecipeData] = useState<Recipe[]>(
    recipeDataRaw as Recipe[]
  );

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

  // Admin State
  const [showAdmin, setShowAdmin] = useState(false);
  const [importId, setImportId] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");

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
      .filter((r) => r.matchPercent > 0)
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
    const el = document.getElementById("results-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  async function handleImport() {
    if (!importId) return;
    setImporting(true);
    setImportMsg("");
    const res = await importRecipeFromYoutube(importId);
    setImporting(false);
    if (res.success) {
      setImportMsg("Successfully imported!");
      setImportId("");
      // Refresh local data (in a real app we'd re-fetch from API)
      if (res.recipe) {
        setRecipeData((prev) => [...prev, res.recipe as Recipe]);
      }
    } else {
      setImportMsg("Error: " + res.message);
    }
  }

  return (
    <div className="min-h-screen selection:bg-red-100 selection:text-red-600 bg-[#fafafa]">
      {/* Navigation */}
      <nav className="sticky top-0 z-[110] glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 md:gap-3 cursor-pointer group"
            onClick={() => setShowAdmin(!showAdmin)}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover:rotate-12 transition-transform duration-300">
              <ChefHat size={20} className="md:w-6 md:h-6" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
              whatto<span className="text-red-600">Cook?</span>
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center bg-slate-100/50 p-1 rounded-xl md:rounded-2xl backdrop-blur-sm border border-slate-200/50">
              <button
                onClick={() => setLocale("en")}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all duration-300 ${
                  locale === "en"
                    ? "bg-white text-red-600 shadow-md"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale("bn")}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all duration-300 ${
                  locale === "bn"
                    ? "bg-white text-red-600 shadow-md"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                বাংলা
              </button>
            </div>
            <a
              href="https://github.com/niloydiu/whattocook"
              target="_blank"
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-slate-900 text-white hover:bg-red-600 transition-colors shadow-lg shadow-slate-900/10"
            >
              <Github size={18} className="md:w-5 md:h-5" />
            </a>
          </div>
        </div>
      </nav>

      {/* Admin Panel */}
      <AnimatePresence>
        {showAdmin && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900 text-white overflow-hidden border-b border-slate-800"
          >
            <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-500">
                  <Settings size={18} />
                </div>
                <h2 className="font-black uppercase tracking-[0.2em] text-sm">
                  Recipe Importer
                </h2>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                    <Youtube size={20} />
                  </div>
                  <input
                    value={importId}
                    onChange={(e) => setImportId(e.target.value)}
                    placeholder="Paste YouTube Video ID or URL"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium"
                  />
                </div>
                <button
                  onClick={handleImport}
                  disabled={importing || !importId}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-600 px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-600/20 active:scale-95"
                >
                  {importing ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                  {importing ? "IMPORTING..." : "IMPORT RECIPE"}
                </button>
              </div>
              {importMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-xl border ${
                    importMsg.includes("Error")
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : "bg-green-500/10 border-green-500/20 text-green-400"
                  } text-sm font-bold flex items-center gap-2`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      importMsg.includes("Error")
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  />
                  {importMsg}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                {locale === "en"
                  ? "Finding the best recipes for you..."
                  : "আপনার জন্য সেরা রেসিপি খোঁজা হচ্ছে..."}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 md:py-32 bg-white/40 backdrop-blur-md rounded-[2rem] md:rounded-[3rem] border border-dashed border-slate-200 shadow-inner px-6"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 text-slate-300 shadow-sm">
                <ChefHat
                  size={32}
                  className="md:w-12 md:h-12"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 md:mb-4">
                {locale === "en"
                  ? "No exact matches found"
                  : "কোনো মিল পাওয়া যায়নি"}
              </h3>
              <p className="text-sm md:text-lg text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                {locale === "en"
                  ? "Try adding more common ingredients like oil, salt, or onion to see more results."
                  : "আরও কিছু সাধারণ উপকরণ যেমন তেল, লবণ বা পেঁয়াজ যোগ করে দেখুন।"}
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="mt-8 md:mt-10 px-6 py-3 md:px-8 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10 hover:shadow-red-600/20"
              >
                {locale === "en"
                  ? "ADD MORE INGREDIENTS"
                  : "আরও উপকরণ যোগ করুন"}
              </button>
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
            © 2026 whattoCook.{" "}
            {locale === "en"
              ? "Made with love for foodies."
              : "ভোজনরসিকদের জন্য ভালোবাসা দিয়ে তৈরি।"}
          </p>
        </div>
      </footer>
    </div>
  );
}
