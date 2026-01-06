"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Search, X, ArrowRight } from "lucide-react";
import RecipeCard from "../components/RecipeCardClean";
import IngredientMatchRecipeCard from "../components/IngredientMatchRecipeCard";
import useLanguage from "../hooks/useLanguage";
import recipeDataRaw from "../lib/recipeData.json";
import Hero from "../components/Hero";
import { importRecipeFromYoutube } from "../app/actions/importer";
import { getRecipes } from "../app/actions/recipes";
import Navbar from "../components/Navbar";
import AppAdminPanel from "../components/AppAdminPanel";
import CategoryFilters from "../components/CategoryFilters";
import RecipesGrid from "../components/RecipesGrid";
import { API_PATHS } from "../lib/api-paths";

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

export default function LandingPageClient({
  initialRecipes,
  initialCategories,
  totalRecipes,
}: {
  initialRecipes: ApiRecipe[];
  initialCategories: {
    name: string;
    count: number;
    type: "category" | "foodCategory";
  }[];
  totalRecipes: number;
}) {
  const { locale, setLocale, t } = useLanguage();
  const [recipeData, setRecipeData] = useState<Recipe[]>(
    recipeDataRaw as Recipe[]
  );

  // API Recipes State
  const [apiRecipes, setApiRecipes] = useState<ApiRecipe[]>(initialRecipes);
  const [apiRecipesLoading, setApiRecipesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categoryStats, setCategoryStats] = useState<any[]>(initialCategories);
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
  const [ingredientSearchResults, setIngredientSearchResults] = useState<any[]>(
    []
  );
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

  // Fetch API recipes when search or category changes
  useEffect(() => {
    const fetchApiRecipes = async () => {
      // Don't show loading on initial mount if we have initial data
      if (
        initialRecipes === apiRecipes &&
        !debouncedSearchQuery &&
        !selectedCategory
      )
        return;

      setApiRecipesLoading(true);
      try {
        let freeSearch = debouncedSearchQuery;
        let cat = selectedCategory;
        let foodCat = null;

        // Find the selected category in initialCategories to determine its type
        const selectedCatObj = initialCategories.find((c) => c.name === cat);
        if (selectedCatObj && selectedCatObj.type === "foodCategory") {
          foodCat = cat;
          cat = null;
        }

        const data = await getRecipes({
          search: freeSearch,
          category: cat || undefined,
          foodCategory: foodCat || undefined,
          limit: 6,
        });

        setApiRecipes(data.recipes || []);
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
      } finally {
        setApiRecipesLoading(false);
      }
    };

    fetchApiRecipes();
  }, [debouncedSearchQuery, selectedCategory]);

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
        const res = await fetch(
          `${API_PATHS.RECIPES_AUTOCOMPLETE}?q=${encodeURIComponent(
            searchQuery
          )}`
        );
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

  function handleSearchEnter() {
    if (searchQuery.trim()) {
      // Redirect to all recipes page with search query
      window.location.href = `/recipes?search=${encodeURIComponent(
        searchQuery.trim()
      )}`;
    }
  }

  const pantryResults = useMemo(() => {
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
    setSearchActivated(true);
    setLoading(true);
    setIngredientSearchLoading(true);

    fetch(API_PATHS.RECIPES_SEARCH_BY_INGREDIENTS, {
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
      if (res.recipe) {
        setRecipeData((prev) => [...prev, res.recipe as unknown as Recipe]);
      }
    } else {
      setImportMsg("Error: " + ((res as any).message || "Unknown error"));
    }
  }

  return (
    <div className="min-h-screen selection:bg-red-100 selection:text-red-600 bg-[#fafafa]">
      <Navbar
        locale={locale}
        setLocale={setLocale}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        handleSearchEnter={handleSearchEnter}
        onSelectSuggestion={(s) => {
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
      />

      <AnimatePresence>
        {showAdmin && (
          <AppAdminPanel
            importId={importId}
            setImportId={setImportId}
            importing={importing}
            handleImport={handleImport}
            importMsg={importMsg}
          />
        )}
      </AnimatePresence>

      <Hero
        pantry={pantry}
        onAdd={addPantryItem}
        onRemove={removePantryItem}
        onFind={handleFind}
        locale={locale}
        totalRecipes={totalRecipes}
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
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-24">
        {/* Unified Results Layout */}
        <div className="space-y-16">
          {/* Pantry Results Section */}
          <section
            id="results-section"
            className={!searchActivated && pantry.length === 0 ? "hidden" : ""}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
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
                      {locale === "en"
                        ? "Recipes You Can Make"
                        : "আপনি যা রান্না করতে পারেন"}
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
              ) : pantryResults.length > 0 ? (
                <motion.div
                  key="pantry-results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                      {locale === "en"
                        ? "Pantry Matches"
                        : "মজুদ উপকরণের সাথে মিল"}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pantryResults.map((r, idx) => (
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
                  </div>
                </motion.div>
              ) : pantry.length > 0 && searchActivated ? (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-24 bg-white/60 backdrop-blur-md rounded-3xl border-2 border-dashed border-slate-300 px-8 shadow-sm"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400 shadow-sm">
                    <ChefHat size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3">
                    {locale === "en"
                      ? "No matches found"
                      : "কোনো মিল পাওয়া যায়নি"}
                  </h3>
                  <p className="text-slate-600 font-medium max-w-md mx-auto text-lg">
                    {locale === "en"
                      ? "Try adding more common ingredients."
                      : "আরও কিছু সাধারণ উপকরণ যোগ করে দেখুন।"}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>

          {/* Featured/All Recipes Section */}
          <section id="recipes-section">
            <CategoryFilters
              locale={locale}
              categoryStats={categoryStats}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              showChipCounts={false}
              redirectToAllRecipes={false}
            />

            <RecipesGrid
              recipes={apiRecipes}
              loading={apiRecipesLoading}
              locale={locale}
            />

            <div className="mt-16 text-center">
              <Link
                href="/recipes"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:border-red-300 transition-all shadow-md hover:shadow-xl group"
              >
                {locale === "en" ? "Explore All Recipes" : "সব রেসিপি দেখুন"}
                <ArrowRight
                  size={22}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
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

      <footer className="py-16 border-t border-slate-200/60 bg-gradient-to-b from-white/80 to-slate-50/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ChefHat size={20} />
            </div>
            <span className="font-black text-2xl text-slate-900">
              whattoCook?
            </span>
          </div>
          <p className="text-slate-700 text-base font-semibold mb-3">
            Created by{" "}
            <a
              href="https://niloykm.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 font-bold transition-colors"
            >
              Niloy Kumar Mohonta
            </a>
          </p>
          <p className="text-slate-600 text-sm mb-6 font-medium">
            Contact:{" "}
            <a
              href="mailto:niloykumarmohonta@gmail.com"
              className="hover:text-red-600 transition-colors font-semibold"
            >
              niloykumarmohonta@gmail.com
            </a>
          </p>
          <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">
            © 2026 whattoCook.{" "}
            {locale === "en" ? "All rights reserved." : "সর্বস্বত্ব সংরক্ষিত।"}
          </p>
        </div>
      </footer>
    </div>
  );
}
