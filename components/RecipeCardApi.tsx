"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, Clock, Users, ChefHat } from "lucide-react";
import Link from "next/link";

type Locale = "en" | "bn";

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
  ingredients?: Array<{
    id: number;
    ingredient_id: number;
    quantity: string;
    unit_en: string;
    unit_bn: string;
    notes_en: string | null;
    notes_bn: string | null;
    ingredient: {
      id: number;
      name_en: string;
      name_bn: string;
      img: string;
    };
  }>;
};

function toBengaliNumber(n: number) {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n)
    .split("")
    .map((d) => map[+d] ?? d)
    .join("");
}

export default function RecipeCardApi({
  recipe,
  locale = "en",
}: {
  recipe: ApiRecipe;
  locale?: Locale;
}) {
  const title = locale === "bn" ? recipe.title_bn : recipe.title_en;
  const totalTime = recipe.prep_time + recipe.cook_time;
  const difficultyColor =
    recipe.difficulty === "Easy"
      ? "text-green-600 bg-green-50"
      : recipe.difficulty === "Medium"
      ? "text-yellow-600 bg-yellow-50"
      : "text-red-600 bg-red-50";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="glass-card rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col h-full group transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(239,68,68,0.15)] border border-white/50"
    >
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src={recipe.image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link href={`/recipes/${recipe.slug}`}>
            <div className="w-16 h-16 bg-red-600/90 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 hover:scale-110">
              <Play size={24} fill="currentColor" />
            </div>
          </Link>
        </div>

        {/* Difficulty badge */}
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${difficultyColor}`}
        >
          {recipe.difficulty}
        </div>

        {/* Cuisine/Category */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
          {recipe.cuisine}
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8">
        <h3 className="text-lg md:text-xl font-black text-slate-900 mb-3 md:mb-4 line-clamp-2 leading-tight">
          {title}
        </h3>

        {/* Recipe stats */}
        <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock size={16} />
            <span className="font-medium">
              {locale === "bn" ? toBengaliNumber(totalTime) : totalTime}min
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={16} />
            <span className="font-medium">
              {locale === "bn"
                ? toBengaliNumber(recipe.servings)
                : recipe.servings}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ChefHat size={16} />
            <span className="font-medium">{recipe.category}</span>
          </div>
        </div>

        {/* Ingredients preview */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="mb-4 md:mb-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {locale === "en" ? "Key Ingredients" : "প্রধান উপকরণ"}
            </p>
            <div className="flex flex-wrap gap-2">
              {recipe.ingredients.slice(0, 4).map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2 py-1 text-xs font-medium text-slate-700"
                >
                  <img
                    src={ing.ingredient.img}
                    alt={ing.ingredient.name_en}
                    className="w-4 h-4 rounded object-cover"
                  />
                  <span>
                    {locale === "bn"
                      ? ing.ingredient.name_bn
                      : ing.ingredient.name_en}
                  </span>
                </div>
              ))}
              {recipe.ingredients.length > 4 && (
                <div className="bg-slate-50 rounded-lg px-2 py-1 text-xs font-medium text-slate-500">
                  +{recipe.ingredients.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Recipe Button */}
        <Link href={`/recipes/${recipe.slug}`}>
          <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-sm transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/30 active:scale-95">
            {locale === "en" ? "View Recipe" : "রেসিপি দেখুন"}
          </button>
        </Link>
      </div>
    </motion.article>
  );
}
