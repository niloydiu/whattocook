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
      <motion.article
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        className="bg-white rounded-[1.5rem] overflow-hidden flex flex-col h-full group transition-all duration-300 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 cursor-pointer"
      >
        {/* Match Badge */}
        <div className="absolute top-4 left-4 z-10">
          {isComplete ? (
            <div className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider shadow-lg">
              <CheckCircle2 size={12} />
              <span>{locale === "en" ? "100% Match" : "১০০% মিল"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider shadow-lg">
              <span>
                {Math.round(matchPercent * 100)}%{" "}
                {locale === "en" ? "Match" : "মিল"}
              </span>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative h-56 overflow-hidden bg-slate-50">
          <img
            src={recipe.image}
            alt={locale === "en" ? recipe.title_en : recipe.title_bn}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
            {locale === "en" ? recipe.title_en : recipe.title_bn}
          </h3>

          {/* Match Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider">
              <CheckCircle2
                size={14}
                className={isComplete ? "text-emerald-500" : "text-amber-500"}
              />
              <span className={isComplete ? "text-emerald-600" : "text-amber-600"}>
                {matchedCount}/{totalIngredients}{" "}
                {locale === "en" ? "ingredients" : "উপকরণ"}
              </span>
            </div>
            {missingCount > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-300">
                <XCircle size={14} />
                <span>
                  {missingCount} {locale === "en" ? "missing" : "নেই"}
                </span>
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-auto bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
            <div className="flex items-center gap-1.5" title={locale === "en" ? "Cooking Time" : "রান্নার সময়"}>
              <Clock size={12} className="text-red-500" />
              <span>
                <span className="text-[8px] text-slate-400 mr-0.5">{locale === "en" ? "TIME:" : "সময়:"}</span>
                {totalTime}m
              </span>
            </div>
            <div className="flex items-center gap-1.5" title={locale === "en" ? "Servings" : "পরিবেশন"}>
              <Users size={12} className="text-red-500" />
              <span>
                <span className="text-[8px] text-slate-400 mr-0.5">{locale === "en" ? "SERVINGS:" : "জন:"}</span>
                {recipe.servings}
              </span>
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              <ChefHat size={12} className="text-red-500" />
              <span className="truncate max-w-[60px]">{recipe.difficulty}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
             <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black uppercase tracking-tighter">
                {recipe.category}
             </span>
             <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-tighter">
                {recipe.cuisine}
             </span>
          </div>

          <div className="mt-2 pt-4 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
              {locale === "en" ? "Full Recipe" : "পুরো রেসিপি"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
