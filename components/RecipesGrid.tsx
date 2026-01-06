"use client";

import React from "react";
import { motion } from "framer-motion";
import RecipeCardApi from "./RecipeCardApi";
import { Search } from "lucide-react";

type Recipe = {
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

type RecipesGridProps = {
  recipes: Recipe[];
  loading: boolean;
  locale: "en" | "bn";
  searchQuery?: string;
};

export default function RecipesGrid({
  recipes,
  loading,
  locale,
  searchQuery,
}: RecipesGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100/80 animate-pulse"
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200" />
            <div className="p-6 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-24 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-100/80 shadow-sm">
        <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Search
            size={40}
            className="text-red-600"
          />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">
          {locale === "en" ? "No recipes found" : "কোনো রেসিপি পাওয়া যায়নি"}
        </h3>
        <p className="text-slate-600 font-medium">
          {locale === "en"
            ? "Try searching with different keywords"
            : "ভিন্ন কীওয়ার্ড দিয়ে খুঁজে দেখুন"}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
    >
      {recipes.map((recipe, index) => (
        <motion.div
          key={recipe.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <RecipeCardApi recipe={recipe} locale={locale} />
        </motion.div>
      ))}
    </motion.div>
  );
}
