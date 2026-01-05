"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Play,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChefHat,
} from "lucide-react";
import ingredientsData from "../lib/ingredients.json";

type Locale = "en" | "bn";

type Recipe = {
  id: string;
  youtubeId?: string;
  youtubeUrl?: string;
  title: { en: string; bn: string };
  thumbnail?: string;
  ingredients: { en: string[]; bn: string[] };
};

function toBengaliNumber(n: number) {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n)
    .split("")
    .map((d) => map[+d] ?? d)
    .join("");
}

function getYoutubeThumbnail(id?: string) {
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

function getIngredientIcon(name: string) {
  const ingredients = ingredientsData as any[];
  const found = ingredients.find(
    (i) => i.name_en === name || i.name_bn === name
  );
  if (found) return found.img;

  // TheMealDB uses capitalized names for icons
  const formatted = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  return `https://www.themealdb.com/images/ingredients/${formatted}-Small.png`;
}

export default function RecipeCardClean({
  recipe,
  matchPercent,
  have,
  total,
  locale = "en",
  onOpenVideo,
  pantry = [],
}: {
  recipe: Recipe;
  matchPercent: number;
  have: number;
  total: number;
  locale?: Locale;
  onOpenVideo: (id: string) => void;
  pantry?: string[];
}) {
  const title = recipe.title[locale] || recipe.title.en;
  const thumbnail = recipe.youtubeId
    ? getYoutubeThumbnail(recipe.youtubeId)
    : recipe.thumbnail;
  const pct = Math.round(matchPercent * 100);

  const recipeIngredients = recipe.ingredients[locale];
  const missing = recipeIngredients
    .filter((ing) => {
      const normalizedIng = ing.toLowerCase().trim();
      return !pantry.some(
        (p) =>
          normalizedIng.includes(p.toLowerCase().trim()) ||
          p.toLowerCase().trim().includes(normalizedIng)
      );
    })
    .slice(0, 4);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="glass-card rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col h-full group transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(239,68,68,0.15)] border border-white/50"
    >
      <div className="relative h-48 md:h-64 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ChefHat size={48} strokeWidth={1} />
          </div>
        )}

        {/* Match Badge Overlay */}
        <div className="absolute top-5 left-5 z-10">
          <div
            className={`px-4 py-2 rounded-2xl backdrop-blur-xl border text-xs font-black flex items-center gap-2 shadow-lg transition-all duration-500 ${
              pct > 80
                ? "bg-green-500/20 border-green-500/30 text-green-700"
                : pct > 50
                ? "bg-orange-500/20 border-orange-500/30 text-orange-700"
                : "bg-red-500/20 border-red-500/30 text-red-700"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                pct > 80
                  ? "bg-green-500"
                  : pct > 50
                  ? "bg-orange-500"
                  : "bg-red-500"
              }`}
            />
            {pct}% {locale === "en" ? "Match" : "মিল"}
          </div>
        </div>

        {/* Play Button Overlay */}
        {recipe.youtubeId && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl cursor-pointer"
              onClick={() => onOpenVideo(recipe.youtubeId!)}
            >
              <Play fill="currentColor" size={32} className="ml-1" />
            </motion.div>
          </div>
        )}
      </div>

      <div className="p-5 md:p-8 flex-1 flex flex-col">
        <h3 className="font-black text-xl md:text-2xl text-slate-900 leading-tight mb-4 group-hover:text-red-600 transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">
            <span>{locale === "en" ? "Ingredients" : "উপকরণ"}</span>
            <span className="text-slate-900">
              {have}/{total}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full ${
                pct > 80
                  ? "bg-green-500"
                  : pct > 50
                  ? "bg-orange-500"
                  : "bg-red-500"
              }`}
            />
          </div>
        </div>

        {/* Missing Ingredients */}
        {missing.length > 0 && (
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-3 md:mb-4">
              <AlertCircle size={14} />
              {locale === "en" ? "Missing Items" : "যা প্রয়োজন"}
            </div>
            <div className="flex flex-wrap gap-2">
              {missing.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 md:px-3.5 md:py-2 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl text-[10px] md:text-xs font-bold hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-white rounded-lg flex items-center justify-center p-0.5 md:p-1">
                    <img
                      src={getIngredientIcon(
                        recipe.ingredients.en[
                          recipe.ingredients[locale].indexOf(ing)
                        ]
                      )}
                      alt=""
                      className="w-full h-full object-contain"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                  {ing}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 md:pt-6 flex items-center gap-3 md:gap-4">
          <button
            onClick={() => onOpenVideo(recipe.youtubeId!)}
            className="flex-1 flex items-center justify-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 bg-slate-900 hover:bg-red-600 text-white rounded-xl md:rounded-[1.5rem] font-black text-xs md:text-sm transition-all duration-500 shadow-xl shadow-slate-900/10 hover:shadow-red-600/20 active:scale-95"
          >
            <Play
              size={16}
              className="md:w-[18px] md:h-[18px]"
              fill="currentColor"
            />
            {locale === "en" ? "Watch Recipe" : "রেসিপি দেখুন"}
          </button>

          {recipe.youtubeUrl && (
            <a
              href={recipe.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3 md:p-4 border-2 border-slate-100 hover:border-red-100 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl md:rounded-[1.5rem] transition-all duration-500"
            >
              <ExternalLink size={20} className="md:w-[22px] md:h-[22px]" />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
