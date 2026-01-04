"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, ExternalLink, CheckCircle2, AlertCircle, ChefHat } from "lucide-react";

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
  return String(n).split("").map((d) => map[+d] ?? d).join("");
}

function getYoutubeThumbnail(id?: string) {
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

function getIngredientIcon(name: string) {
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
  const thumbnail = recipe.youtubeId ? getYoutubeThumbnail(recipe.youtubeId) : recipe.thumbnail;
  const pct = Math.round(matchPercent * 100);

  const recipeIngredients = recipe.ingredients[locale];
  const missing = recipeIngredients.filter(ing => {
    const normalizedIng = ing.toLowerCase().trim();
    return !pantry.some(p => normalizedIng.includes(p.toLowerCase().trim()) || p.toLowerCase().trim().includes(normalizedIng));
  }).slice(0, 4);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      className="glass-card rounded-[2rem] overflow-hidden flex flex-col h-full group transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 border border-white/40"
    >
      <div className="relative h-56 overflow-hidden">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ChefHat size={48} strokeWidth={1} />
          </div>
        )}
        
        {/* Match Badge Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <div className={`px-4 py-2 rounded-2xl backdrop-blur-xl border text-xs font-bold flex items-center gap-2 shadow-lg ${
            pct > 80 ? 'bg-green-500/20 border-green-500/30 text-green-700' : 
            pct > 50 ? 'bg-orange-500/20 border-orange-500/30 text-orange-700' : 
            'bg-slate-500/20 border-slate-500/30 text-slate-700'
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              pct > 80 ? 'bg-green-500' : pct > 50 ? 'bg-orange-500' : 'bg-slate-500'
            }`} />
            {pct}% {locale === "en" ? "Match" : "মিল"}
          </div>
        </div>

        {/* Play Button Overlay */}
        {recipe.youtubeId && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-red-600 shadow-2xl cursor-pointer"
              onClick={() => onOpenVideo(recipe.youtubeId!)}
            >
              <Play fill="currentColor" size={28} className="ml-1" />
            </motion.div>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-black text-xl text-slate-900 leading-tight mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
          {title}
        </h3>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            <span>{locale === "en" ? "Ingredients" : "উপকরণ"}</span>
            <span>{have}/{total}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                pct > 80 ? 'bg-green-500' : pct > 50 ? 'bg-orange-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>

        {/* Missing Ingredients - Red Pill Style */}
        {missing.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase tracking-widest mb-3">
              <AlertCircle size={12} />
              {locale === "en" ? "Missing Items" : "যা প্রয়োজন"}
            </div>
            <div className="flex flex-wrap gap-2">
              {missing.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium">
                  <img 
                    src={getIngredientIcon(recipe.ingredients.en[recipe.ingredients[locale].indexOf(ing)])} 
                    alt="" 
                    className="w-4 h-4 object-contain"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  {ing}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 flex items-center gap-3">
          <button
            onClick={() => onOpenVideo(recipe.youtubeId!)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-red-600 text-white rounded-2xl font-bold text-sm transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-red-600/20 active:scale-95"
          >
            <Play size={16} fill="currentColor" />
            {locale === "en" ? "Watch Now" : "এখনই দেখুন"}
          </button>
          
          {recipe.youtubeUrl && (
            <a
              href={recipe.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 border-2 border-slate-100 hover:border-red-100 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-2xl transition-all duration-300"
            >
              <ExternalLink size={20} />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
