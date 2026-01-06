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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-[1.5rem] overflow-hidden flex flex-col h-full group transition-all duration-300 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden bg-slate-50">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ChefHat size={48} strokeWidth={1} />
          </div>
        )}

        {/* Match Badge Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <div
            className={`px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider shadow-lg transition-all duration-500 ${
              pct > 80
                ? "bg-emerald-500 text-white"
                : pct > 50
                ? "bg-amber-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {pct}% {locale === "en" ? "Match" : "মিল"}
          </div>
        </div>

        {/* Play Button Overlay */}
        {recipe.youtubeId && (
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 bg-white text-red-600 rounded-full flex items-center justify-center shadow-xl cursor-pointer backdrop-blur-sm bg-white/90"
              onClick={() => onOpenVideo(recipe.youtubeId!)}
            >
              <Play fill="currentColor" size={24} className="ml-1" />
            </motion.div>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1" onClick={() => recipe.youtubeId && onOpenVideo(recipe.youtubeId)}>
        <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
          {title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
           <div className="flex items-center gap-1.5" title={locale === "en" ? "Match Count" : "মিলের সংখ্যা"}>
              <CheckCircle2 size={12} className={pct > 80 ? "text-emerald-500" : "text-amber-500"} />
              <span>
                <span className="text-[8px] text-slate-400 mr-0.5">{locale === "en" ? "HAVE:" : "মিল:"}</span>
                {have}/{total}
              </span>
           </div>
           <div className="flex items-center gap-1">
             <ChefHat size={12} className="text-red-500" />
             <span>Youtube</span>
           </div>
        </div>

        {/* Missing Ingredients Snippet */}
        {missing.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
            {missing.map((ing, idx) => (
              <span key={idx} className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md">
                +{ing}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
            {locale === "en" ? "Watch Video" : "ভিডিও দেখুন"}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </span>
          {recipe.youtubeUrl && (
             <a 
               href={recipe.youtubeUrl} 
               target="_blank" 
               className="text-slate-300 hover:text-red-500 transition-colors"
               onClick={(e) => e.stopPropagation()}
             >
               <ExternalLink size={14} />
             </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
