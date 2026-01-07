"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, ChefHat, X } from "lucide-react";
import Navbar from "./Navbar";
import CategoryFilters from "./CategoryFilters";
import RecipesGrid from "./RecipesGrid";
import useLanguage from "../hooks/useLanguage";
import { getRecipes } from "../app/actions/recipes";
import { API_PATHS } from "../lib/api-paths";

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

export default function AllRecipesClient({
  initialRecipes,
  initialCategories,
  initialTotal,
}: {
  initialRecipes: ApiRecipe[];
  initialCategories: {
    name: string;
    count: number;
    type: "category" | "foodCategory";
  }[];
  initialTotal: number;
}) {
  const { locale, setLocale } = useLanguage();
  const [recipes, setRecipes] = useState<ApiRecipe[]>(initialRecipes);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / 12));
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Read URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get("search");
    const categoryParam = urlParams.get("category");
    const foodCategoryParam = urlParams.get("foodCategory");

    if (searchParam) {
      // Check if the search term matches a category name
      const matchingCategory = initialCategories.find(
        (cat) => cat.name.toLowerCase() === searchParam.toLowerCase()
      );

      if (matchingCategory) {
        // If it matches a category, select that category instead of searching
        setSelectedCategory(matchingCategory.name);
        setSearchQuery(""); // Clear search query
      } else {
        // Otherwise, set it as a search query
        setSearchQuery(searchParam);
      }
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else if (foodCategoryParam) {
      setSelectedCategory(foodCategoryParam);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to page 1 on search
    }, 400);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        let cat = selectedCategory;
        let foodCat = null;

        // Find the selected category in initialCategories to determine its type
        const selectedCatObj = initialCategories.find((c) => c.name === cat);
        if (selectedCatObj && selectedCatObj.type === "foodCategory") {
          foodCat = cat;
          cat = null;
        }

        const data = await getRecipes({
          search: debouncedSearchQuery,
          category: cat || undefined,
          foodCategory: foodCat || undefined,
          page,
          limit: 12,
        });

        setRecipes(data.recipes);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
  }, [debouncedSearchQuery, selectedCategory, page]);

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSelectedCategory(null);
    setPage(1);
    // Update URL to remove query parameters
    window.history.replaceState({}, "", "/recipes");
  };

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

  const t = (en: string, bn: string) => (locale === "en" ? en : bn);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar
        locale={locale}
        setLocale={setLocale}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        handleSearchEnter={() => {
          // Trigger a search on this page: apply the current searchQuery
          // and reset to page 1. Also update the URL so refresh/bookmark works.
          setDebouncedSearchQuery(searchQuery);
          setPage(1);
          const params = new URLSearchParams(window.location.search);
          if (searchQuery) params.set("search", searchQuery);
          else params.delete("search");
          // Keep category/foodCategory if present
          const newUrl = `/recipes?${params.toString()}`;
          window.history.replaceState({}, "", newUrl);
        }}
        onSelectSuggestion={(s) => {
          if (s.type === "category") {
            setSearchQuery(s.label);
            setSelectedCategory(s.label);
            setPage(1);
            const params = new URLSearchParams(window.location.search);
            params.set("category", s.label);
            window.history.replaceState(
              {},
              "",
              `/recipes?${params.toString()}`
            );
          } else {
            window.location.href = `/recipes/${s.slug}`;
          }
          setShowSuggestions(false);
        }}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        <header className="mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-2">
            {t("Explore All Recipes", "সব রেসিপি অন্বেষণ করুন")}
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            {t(
              "Browse our collection of delicious AI-powered recipes",
              "আমাদের সুস্বাদু এআই-চালিত রেসিপি সংগ্রহ দেখুন"
            )}
          </p>
        </header>

        <section className="mb-8 sm:mb-10 lg:mb-12">
          <div className="md:hidden mb-4 sm:mb-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder={t("Search recipes...", "রেসিপি খুঁজুন...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // Check if the search term matches a category name
                    const matchingCategory = initialCategories.find(
                      (cat) =>
                        cat.name.toLowerCase() === searchQuery.toLowerCase()
                    );

                    if (matchingCategory) {
                      // If it matches a category, select that category
                      setSelectedCategory(matchingCategory.name);
                      setSearchQuery(""); // Clear search query
                      setPage(1);
                    } else {
                      // Otherwise, trigger text search
                      setDebouncedSearchQuery(searchQuery);
                      setPage(1);
                    }
                  }
                }}
                className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all min-h-[48px]"
              />
            </div>
          </div>

          <CategoryFilters
            locale={locale}
            categoryStats={initialCategories}
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
              setPage(1);
            }}
            showChipCounts={true} // Show counts on this page as requested
            clearFilters={clearFilters}
          />

          <RecipesGrid recipes={recipes} loading={loading} locale={locale} />
        </section>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 mt-8 sm:mt-10 lg:mt-12 px-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-2.5 sm:p-3 bg-white rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm hover:shadow-md min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                // Basic pagination logic: show current, first, last, and neighbors
                if (
                  p === 1 ||
                  p === totalPages ||
                  (p >= page - 1 && p <= page + 1)
                ) {
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-bold transition-all border-2 shadow-sm hover:shadow-md active:scale-95 text-sm sm:text-base ${
                        page === p
                          ? "bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-600 shadow-lg"
                          : "bg-white border-slate-200 text-slate-700 hover:border-red-300 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                } else if (p === page - 2 || p === page + 2) {
                  return (
                    <span
                      key={p}
                      className="text-slate-400 text-sm sm:text-base"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="p-2.5 sm:p-3 bg-white rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm hover:shadow-md min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        )}
      </main>

      <footer className="py-8 sm:py-12 lg:py-16 border-t border-slate-200/60 bg-gradient-to-b from-white/80 to-slate-50/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-black text-xl sm:text-2xl text-slate-900">
              whattoCook?
            </span>
          </div>
          <p className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-bold">
            © 2026 whattoCook.{" "}
            {locale === "en" ? "All rights reserved." : "সর্বস্বত্ব সংরক্ষিত।"}
          </p>
        </div>
      </footer>
    </div>
  );
}
