"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Languages,
  Youtube,
  X,
  Settings,
  Plus,
  Loader2,
  Search,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import RecipeCard from "../components/RecipeCardClean";
import RecipeCardApi from "../components/RecipeCardApi";
import IngredientMatchRecipeCard from "../components/IngredientMatchRecipeCard";
import useLanguage from "../hooks/useLanguage";
import recipeDataRaw from "../lib/recipeData.json";
import Hero from "../components/Hero";
import { importRecipeFromYoutube } from "./actions/importer";
import Link from "next/link";

type Locale = "en" | "bn";

type Recipe = {
  id: string;
  youtubeId?: string;
  title: { en: string; bn: string };
  ingredients: { en: string[]; bn: string[] };
  instructions?: { en?: string; bn?: string } | string;
};

type ApiRecipe = {
  id: number;
  slug: string;
  title_en: string;
  title_bn: string;
  image: string;
  cuisine: string;
  category: string;
  difficulty: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  createdAt: string;
};

function toBengaliNumber(n: number) {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n)
    .split("")
    .map((d) => map[+d] ?? d)
    .join("");
}

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

  // API Recipes State
  const [apiRecipes, setApiRecipes] = useState<ApiRecipe[]>([]);
  const [apiRecipesLoading, setApiRecipesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
  const [ingredientSearchResults, setIngredientSearchResults] = useState<any[]>([]);
  const [ingredientSearchLoading, setIngredientSearchLoading] = useState(false);
  const [searchActivated, setSearchActivated] = useState(false);

  // Admin State
  const [showAdmin, setShowAdmin] = useState(false);
  const [importId, setImportId] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedPantry(pantry.slice()), 200);
    return () => clearTimeout(id);
  }, [pantry]);

  // Fetch API recipes on mount and when search changes
  useEffect(() => {
    const fetchApiRecipes = async () => {
      setApiRecipesLoading(true);
      try {
        const params = new URLSearchParams();

        // Detect simple food category tokens in the query and send as `foodCategory`.
        // e.g. "chicken dessert" => search=chicken&foodCategory=Dessert
        const FOOD_CATEGORIES = [
          "savory", "sweet", "spicy", "sour",
          "dessert", "drinks", "appetizer", "soup", "salad",
          "breakfast", "lunch", "dinner", "snack", "main course", "side dish"
        ];

        let freeText = debouncedSearchQuery?.trim() || "";
        let detectedCategory: string | null = selectedCategory;

        if (freeText) {
          const parts = freeText.split(/\s+/);
          const remaining: string[] = [];
          for (const p of parts) {
            const token = p.replace(/[:]/g, "").toLowerCase();
            if (FOOD_CATEGORIES.includes(token)) {
              detectedCategory = token.charAt(0).toUpperCase() + token.slice(1);
            } else if (token.startsWith("category:") || token.startsWith("cat:")) {
              const val = token.split(":")[1];
              if (val && FOOD_CATEGORIES.includes(val)) {
                detectedCategory = val.charAt(0).toUpperCase() + val.slice(1);
              }
            } else {
              remaining.push(p);
            }
          }

          if (remaining.length > 0) params.append("search", remaining.join(" "));
        }

        if (detectedCategory) params.append("foodCategory", detectedCategory);

        const response = await fetch(`/api/recipes?${params.toString()}`);
        const data = await response.json();

        // Append featured recipes to the bottom when a search is active.
        let combined: ApiRecipe[] = data.recipes || [];
        if ((debouncedSearchQuery || params.has("foodCategory")) && Array.isArray(data.featured)) {
          const existingIds = new Set(combined.map((r) => r.id));
          const toAppend = data.featured.filter((f: ApiRecipe) => !existingIds.has(f.id));
          combined = [...combined, ...toAppend];
        }

        setApiRecipes(combined);
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
      } finally {
        setApiRecipesLoading(false);
      }
    };

    fetchApiRecipes();
  }, [debouncedSearchQuery, selectedCategory]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/recipes/categories");
        const data = await res.json();
        setCategoryStats(data.categories || []);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  // Track whether the user has performed a search or used the Find button.
  useEffect(() => {
    setSearchActivated(Boolean(debouncedSearchQuery));
  }, [debouncedSearchQuery]);

  // Debounce search query
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  // Autocomplete suggestions
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/recipes/autocomplete?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
      }
    };
    const id = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(id);
  }, [searchQuery]);

  function addPantryItem(raw: string) {
    const v = normalizeStr(raw);
    if (!v) return;
    if (pantry.map(normalizeStr).includes(v)) return;
    setPantry((p) => [...p, raw.trim()]);
  }

  function removePantryItem(idx: number) {
    setPantry((p) => p.filter((_, i) => i !== idx));
  }

  // Trigger search immediately (used for Enter key)
  function handleSearchEnter() {
    // apply current searchQuery immediately and mark search activated
    setDebouncedSearchQuery(searchQuery);
    setSearchActivated(Boolean(searchQuery));
    
    // Scroll to results section after a short delay to allow state update
    setTimeout(() => {
      const el = document.getElementById("results-section") || document.getElementById("recipes-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
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

  // All API recipes now come from server-side search
  const displayedRecipes = apiRecipes;

  function handleFind() {
    setSearchActivated(true);
    setLoading(true);
    setIngredientSearchLoading(true);
    
    // Call API to search by ingredients
    fetch("/api/recipes/search-by-ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: pantry }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIngredientSearchResults(data.recipes || []);
        setIngredientSearchLoading(false);
        setLoading(false);
        const el = document.getElementById("results-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      })
      .catch((error) => {
        console.error("Error searching recipes:", error);
        setIngredientSearchLoading(false);
        setLoading(false);
      });
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
        // The API/prisma object shape differs from the client `Recipe` type.
        // Cast via `unknown` first to satisfy TypeScript during production build.
        setRecipeData((prev) => [...prev, res.recipe as unknown as Recipe]);
      }
    } else {
      setImportMsg("Error: " + ((res as any).message || "Unknown error"));
    }
  }

  return (
    <div className="min-h-screen selection:bg-red-100 selection:text-red-600 bg-[#fafafa]">
      {/* Navigation */}
      <nav className="sticky top-0 z-[110] glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 group">
            <Link href="/" className="flex items-center gap-2 md:gap-3 cursor-pointer">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover:rotate-12 transition-transform duration-300">
                <ChefHat size={20} className="md:w-6 md:h-6" />
              </div>
              <div className="flex items-center leading-tight">
                <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                  whatto<span className="text-red-600">Cook?</span>
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Search Bar */}
            <div className="hidden md:flex relative items-center bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl px-4 py-2 max-w-xs group focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
              <Search size={18} className="text-slate-400 mr-3" />
              <input
                type="text"
                placeholder={
                  locale === "en" ? "Search recipes..." : "রেসিপি খুঁজুন..."
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchEnter();
                    setShowSuggestions(false);
                  }
                }}
                className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder-slate-400"
              />
              <button
                onClick={handleSearchEnter}
                className="ml-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                <ArrowRight size={14} />
              </button>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[120]"
                  >
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (s.type === "category") {
                            setSearchQuery(s.label);
                            setDebouncedSearchQuery(s.label);
                            setSelectedCategory(s.label);
                            setSearchActivated(true);
                          } else {
                            window.location.href = `/recipes/${s.slug}`;
                          }
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                      >
                        {s.type === "category" ? (
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                            <Plus size={16} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                            <ChefHat size={16} />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">
                            {locale === "en" ? s.label : (s.label_bn || s.label)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                            {s.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Request Recipe Button */}
            <Link
              href="/request-recipe"
              className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm hover:from-red-700 hover:to-orange-700 transition-all shadow-lg shadow-red-600/20"
            >
              <ClipboardList size={16} className="md:w-5 md:h-5" />
              <span className="hidden md:inline">
                {locale === "en" ? "Request Recipe" : "রেসিপি অনুরোধ"}
              </span>
            </Link>

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
        totalRecipes={displayedRecipes.length}
      />

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-6">
        <div className="flex relative items-center bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl px-4 py-3">
          <Search size={18} className="text-slate-400 mr-3" />
          <input
            type="text"
            placeholder={
              locale === "en" ? "Search recipes..." : "রেসিপি খুঁজুন..."
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchEnter();
                setShowSuggestions(false);
              }
            }}
            className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder-slate-400"
          />
          <button
            onClick={handleSearchEnter}
            className="ml-2 p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
          >
            <ArrowRight size={18} />
          </button>

          {/* Suggestions Dropdown (Mobile) */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[120]"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (s.type === "category") {
                        setSearchQuery(s.label);
                        setDebouncedSearchQuery(s.label);
                        setSelectedCategory(s.label);
                        setSearchActivated(true);
                      } else {
                        window.location.href = `/recipes/${s.slug}`;
                      }
                      setShowSuggestions(false);
                    }}
                    className="w-full px-5 py-4 text-left hover:bg-slate-50 flex items-center gap-4 transition-colors border-b border-slate-50 last:border-0"
                  >
                    {s.type === "category" ? (
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                        <Plus size={20} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                        <ChefHat size={20} />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">
                        {locale === "en" ? s.label : (s.label_bn || s.label)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        {s.type}
                      </span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-24">
        {searchActivated ? (
          <>
            {/* Pantry Matching Results (shown above Featured when a search/find occurred) */}
            <section id="results-section">
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
              ) : ingredientSearchResults.length > 0 ? (
                <motion.div
                  key="ingredient-results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                      {locale === "en" ? "Recipes You Can Make" : "আপনি যা রান্না করতে পারেন"}
                    </h2>
                    <p className="text-slate-600 font-medium">
                      {locale === "en"
                        ? `Found ${ingredientSearchResults.length} recipes matching your ingredients`
                        : `আপনার উপকরণের সাথে ${ingredientSearchResults.length}টি রেসিপি পাওয়া গেছে`}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ingredientSearchResults.map((result) => (
                      <IngredientMatchRecipeCard
                        key={result.recipe.id}
                        recipe={result.recipe}
                        matchPercent={result.matchPercent}
                        matchedCount={result.matchedCount}
                        totalIngredients={result.totalIngredients}
                        missingCount={result.missingCount}
                        locale={locale}
                      />
                    ))}
                  </div>
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
            </section>

            {/* Recipes Section (Featured) */}
            <section id="recipes-section" className="mb-16 mt-12 md:mt-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                    {locale === "en" ? "Featured Recipes" : "নির্বাচিত রেসিপি"}
                  </h2>
                  <p className="text-slate-600 font-medium">
                    {locale === "en"
                      ? "Discover delicious recipes from around the world"
                      : "বিশ্বের বিভিন্ন প্রান্ত থেকে সুস্বাদু রেসিপি আবিষ্কার করুন"}
                  </p>
                </div>
                
                {/* Category Filter - desktop chips + mobile select */}
                <div className="flex items-center gap-3 max-w-2xl w-full">
                  <div className="hidden md:flex gap-2 overflow-x-auto py-1 scrollbar-hidden">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        selectedCategory === null
                          ? "bg-slate-900 text-white shadow-lg"
                          : "bg-white text-slate-600 border border-slate-200 hover:border-red-200 hover:text-red-600"
                      }`}
                    >
                      {locale === "en" ? "All" : "সব"}
                    </button>
                    {categoryStats.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`whitespace-nowrap px-3 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                          selectedCategory === cat.name
                            ? "bg-red-600 text-white shadow-md"
                            : "bg-white text-slate-600 border border-slate-200 hover:border-red-200 hover:text-red-600"
                        }`}
                      >
                        <span className="capitalize">{cat.name}</span>
                        <span className={`ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] ${
                          selectedCategory === cat.name ? "bg-white/20" : "bg-slate-100"
                        }`}>
                          {locale === "en" ? cat.count : toBengaliNumber(cat.count)}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="md:hidden w-full">
                    <select
                      value={selectedCategory ?? ""}
                      onChange={(e) => setSelectedCategory(e.target.value || null)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                    >
                      <option value="">{locale === "en" ? "All" : "সব"}</option>
                      {categoryStats.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name} ({locale === "en" ? cat.count : toBengaliNumber(cat.count)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {debouncedSearchQuery && (
                  <div className="text-sm text-slate-500 font-medium">
                    {locale === "en"
                      ? `${displayedRecipes.length} recipes found`
                      : `${displayedRecipes.length}টি রেসিপি পাওয়া গেছে`}
                  </div>
                )}
              </div>

              {apiRecipesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
                </div>
              ) : displayedRecipes.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {displayedRecipes.map((recipe) => (
                    <RecipeCardApi
                      key={recipe.id}
                      recipe={recipe}
                      locale={locale}
                    />
                  ))}
                </motion.div>
              ) : debouncedSearchQuery ? (
                <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-[2rem] border border-dashed border-slate-200 px-6">
                  <Search size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    {locale === "en"
                      ? "No recipes found"
                      : "কোনো রেসিপি পাওয়া যায়নি"}
                  </h3>
                  <p className="text-slate-500">
                    {locale === "en"
                      ? "Try searching with different keywords"
                      : "ভিন্ন কীওয়ার্ড দিয়ে খুঁজে দেখুন"}
                  </p>
                </div>
              ) : null}
            </section>
          </>
        ) : (
          <>
            {/* Recipes Section */}
            <section id="recipes-section" className="mb-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                    {locale === "en" ? "Featured Recipes" : "নির্বাচিত রেসিপি"}
                  </h2>
                  <p className="text-slate-600 font-medium">
                    {locale === "en"
                      ? "Discover delicious recipes from around the world"
                      : "বিশ্বের বিভিন্ন প্রান্ত থেকে সুস্বাদু রেসিপি আবিষ্কার করুন"}
                  </p>
                </div>

                {/* Category Filter - desktop chips + mobile select */}
                <div className="flex items-center gap-3 max-w-2xl w-full">
                  <div className="hidden md:flex gap-2 overflow-x-auto py-1 scrollbar-hidden">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        selectedCategory === null
                          ? "bg-slate-900 text-white shadow-lg"
                          : "bg-white text-slate-600 border border-slate-200 hover:border-red-200 hover:text-red-600"
                      }`}
                    >
                      {locale === "en" ? "All" : "সব"}
                    </button>
                    {categoryStats.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`whitespace-nowrap px-3 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                          selectedCategory === cat.name
                            ? "bg-red-600 text-white shadow-md"
                            : "bg-white text-slate-600 border border-slate-200 hover:border-red-200 hover:text-red-600"
                        }`}
                      >
                        <span className="capitalize">{cat.name}</span>
                        <span className={`ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] ${
                          selectedCategory === cat.name ? "bg-white/20" : "bg-slate-100"
                        }`}>
                          {locale === "en" ? cat.count : toBengaliNumber(cat.count)}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="md:hidden w-full">
                    <select
                      value={selectedCategory ?? ""}
                      onChange={(e) => setSelectedCategory(e.target.value || null)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                    >
                      <option value="">{locale === "en" ? "All" : "সব"}</option>
                      {categoryStats.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name} ({locale === "en" ? cat.count : toBengaliNumber(cat.count)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {debouncedSearchQuery && (
                  <div className="text-sm text-slate-500 font-medium">
                    {locale === "en"
                      ? `${displayedRecipes.length} recipes found`
                      : `${displayedRecipes.length}টি রেসিপি পাওয়া গেছে`}
                  </div>
                )}
              </div>

              {apiRecipesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
                </div>
              ) : displayedRecipes.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {displayedRecipes.map((recipe) => (
                    <RecipeCardApi
                      key={recipe.id}
                      recipe={recipe}
                      locale={locale}
                    />
                  ))}
                </motion.div>
              ) : debouncedSearchQuery ? (
                <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-[2rem] border border-dashed border-slate-200 px-6">
                  <Search size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    {locale === "en"
                      ? "No recipes found"
                      : "কোনো রেসিপি পাওয়া যায়নি"}
                  </h3>
                  <p className="text-slate-500">
                    {locale === "en"
                      ? "Try searching with different keywords"
                      : "ভিন্ন কীওয়ার্ড দিয়ে খুঁজে দেখুন"}
                  </p>
                </div>
              ) : null}
            </section>

            {/* Pantry Matching Results */}
            <section id="results-section">
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
              ) : ingredientSearchResults.length > 0 ? (
                <motion.div
                  key="ingredient-results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                      {locale === "en" ? "Recipes You Can Make" : "আপনি যা রান্না করতে পারেন"}
                    </h2>
                    <p className="text-slate-600 font-medium">
                      {locale === "en"
                        ? `Found ${ingredientSearchResults.length} recipes matching your ingredients`
                        : `আপনার উপকরণের সাথে ${ingredientSearchResults.length}টি রেসিপি পাওয়া গেছে`}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ingredientSearchResults.map((result) => (
                      <IngredientMatchRecipeCard
                        key={result.recipe.id}
                        recipe={result.recipe}
                        matchPercent={result.matchPercent}
                        matchedCount={result.matchedCount}
                        totalIngredients={result.totalIngredients}
                        missingCount={result.missingCount}
                        locale={locale}
                      />
                    ))}
                  </div>
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
            </section>
          </>
        )}
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
          <p className="text-slate-600 text-sm font-bold mb-2">
            Created by <a href="https://niloykm.vercel.app" target="_blank" className="text-red-600 hover:underline">Niloy Kumar Mohonta</a>
          </p>
          <p className="text-slate-500 text-xs mb-4">
            Contact: <a href="mailto:niloykumarmohonta@gmail.com" className="hover:text-red-600">niloykumarmohonta@gmail.com</a>
          </p>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
            © 2026 whattoCook.{" "}
            {locale === "en"
              ? "All rights reserved."
              : "সর্বস্বত্ব সংরক্ষিত।"}
          </p>
        </div>
      </footer>
    </div>
  );
}
