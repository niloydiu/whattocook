"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Users, ChefHat, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

type Locale = "en" | "bn";

interface Recipe {
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
}

export default function IngredientMatchRecipeCard({
  recipe,
  matchPercent,
  matchedCount,
  totalIngredients,
  missingCount,
  locale = "en",
}: {
  recipe: Recipe;
  matchPercent: number;
  matchedCount: number;
  totalIngredients: number;
  missingCount: number;
  locale?: Locale;
}) {
  const isComplete = matchPercent === 1;
  const totalTime = recipe.prep_time + recipe.cook_time;

  return (
    <Link href={`/recipes/${recipe.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        className="group relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/60 cursor-pointer"
      >
        {/* Match Badge */}
        <div className="absolute top-4 left-4 z-10">
          {isComplete ? (
            <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full font-black text-xs shadow-lg">
              <CheckCircle2 size={16} />
              <span>{locale === "en" ? "100% Match" : "১০০% মিল"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full font-black text-xs shadow-lg">
              <span>
                {Math.round(matchPercent * 100)}%{" "}
                {locale === "en" ? "Match" : "মিল"}
              </span>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative h-56 overflow-hidden bg-slate-100">
          <img
            src={recipe.image}
            alt={locale === "en" ? recipe.title_en : recipe.title_bn}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
            {locale === "en" ? recipe.title_en : recipe.title_bn}
          </h3>

          {/* Match Info */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 text-sm font-bold">
              <CheckCircle2
                size={16}
                className={isComplete ? "text-green-500" : "text-orange-500"}
              />
              <span className={isComplete ? "text-green-600" : "text-orange-600"}>
                {matchedCount}/{totalIngredients}{" "}
                {locale === "en" ? "ingredients" : "উপকরণ"}
              </span>
            </div>
            {missingCount > 0 && (
              <div className="flex items-center gap-1 text-sm font-bold text-slate-400">
                <XCircle size={16} />
                <span>
                  {missingCount} {locale === "en" ? "missing" : "নেই"}
                </span>
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-4">
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>
                {totalTime} {locale === "en" ? "min" : "মিনিট"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} />
              <span>
                {recipe.servings} {locale === "en" ? "servings" : "পরিবেশন"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ChefHat size={14} />
              <span>{recipe.difficulty}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
              {recipe.cuisine}
            </span>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
              {recipe.category}
            </span>
          </div>
        </div>

        {/* Hover Indicator */}
        <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
          <ChefHat size={20} />
        </div>
      </motion.div>
    </Link>
  );
}
