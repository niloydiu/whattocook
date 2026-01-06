"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, Clock, Users, ChefHat, Flag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ReportModal from "./ReportModal";

type Locale = "en" | "bn";

type ApiRecipe = {
  id: number;
  slug: string;
  title_en: string;
  title_bn: string;
  image: string;
  cuisine: string;
  category: string;
  foodCategory?: string;
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
  const [showReport, setShowReport] = useState(false);
  const title = locale === "bn" ? recipe.title_bn : recipe.title_en;
  const totalTime = recipe.prep_time + recipe.cook_time;
  const difficultyColor =
    recipe.difficulty === "Easy"
      ? "text-emerald-600 bg-emerald-50"
      : recipe.difficulty === "Medium"
      ? "text-amber-600 bg-amber-50"
      : "text-rose-600 bg-rose-50";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-[1.5rem] overflow-hidden flex flex-col h-full group transition-all duration-300 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50"
    >
      <div className="relative h-56 overflow-hidden">
        <Link href={`/recipes/${recipe.slug}`}>
          <img
            src={recipe.image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Difficulty badge */}
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${difficultyColor} backdrop-blur-md bg-white/90 shadow-sm`}
        >
          {recipe.difficulty}
        </div>

        {/* Report Button (Now absolute on image) */}
        <button
          onClick={() => setShowReport(true)}
          title={locale === "en" ? "Report recipe" : "রিপোর্ট করুন"}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-slate-400 opacity-0 group-hover:opacity-100 hover:text-rose-600 transition-all shadow-sm"
        >
          <Flag size={12} />
          <span className="sr-only">Report</span>
        </button>

        {/* Food Category badge */}
        {recipe.foodCategory && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
            {recipe.foodCategory}
          </div>
        )}
      </div>

      <div className="flex-1 p-5 flex flex-col">
        <div className="flex-1">
          <Link href={`/recipes/${recipe.slug}`}>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight">
              {title}
            </h3>
          </Link>

          {/* New Stats Bar */}
          <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
            <div className="flex items-center gap-1.5" title={locale === "en" ? "Cooking Time" : "রান্নার সময়"}>
              <Clock size={12} className="text-red-500" />
              <span>
                <span className="text-[8px] text-slate-400 mr-0.5">{locale === "en" ? "TIME:" : "সময়:"}</span>
                {locale === "bn" ? toBengaliNumber(totalTime) : totalTime}m
              </span>
            </div>
            <div className="flex items-center gap-1.5" title={locale === "en" ? "Servings" : "পরিবেশন"}>
              <Users size={12} className="text-red-500" />
              <span>
                <span className="text-[8px] text-slate-400 mr-0.5">{locale === "en" ? "SERVINGS:" : "জন:"}</span>
                {locale === "bn" ? toBengaliNumber(recipe.servings) : recipe.servings}
              </span>
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              <ChefHat size={12} className="text-red-500" />
              <span className="truncate max-w-[60px]">{recipe.cuisine}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
             <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black uppercase tracking-tighter">
                {recipe.category}
             </span>
             {recipe.foodCategory && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[9px] font-black uppercase tracking-tighter">
                   {recipe.foodCategory}
                </span>
             )}
          </div>

          {/* Ingredients preview - minimalist style */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.slice(0, 3).map((ing, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md border border-slate-100"
                  >
                    {locale === "bn" ? ing.ingredient.name_bn : ing.ingredient.name_en}
                  </span>
                ))}
                {recipe.ingredients.length > 3 && (
                  <span className="text-[10px] font-bold text-slate-300">
                    +{recipe.ingredients.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <Link href={`/recipes/${recipe.slug}`} className="mt-auto">
          <button className="w-full py-3 bg-slate-900 hover:bg-red-600 text-white rounded-xl font-bold text-xs transition-all tracking-widest uppercase active:scale-[0.98]">
            {locale === "en" ? "View Full Recipe" : "পুরো রেসিপি দেখুন"}
          </button>
        </Link>
        {showReport && <ReportModal recipeId={recipe.id} onClose={() => setShowReport(false)} />}
      </div>
    </motion.article>
  );
}
