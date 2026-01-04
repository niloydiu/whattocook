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

  // Simple logic to find missing ingredients
  // In a real app, we'd use the normalized matching logic here too
  const recipeIngredients = recipe.ingredients[locale];
  const missing = recipeIngredients.filter(ing => {
    const normalizedIng = ing.toLowerCase().trim();
    return !pantry.some(p => normalizedIng.includes(p.toLowerCase().trim()) || p.toLowerCase().trim().includes(normalizedIng));
  }).slice(0, 3);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="glass-card rounded-3xl overflow-hidden flex flex-col h-full group transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10"
    >
      <div className="relative h-52 overflow-hidden">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ChefHat size={48} strokeWidth={1} />
          </div>
        )}
        
        {/* Match Badge */}
        <div className="absolute top-4 left-4">
          <div className={`px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-bold flex items-center gap-1.5 ${
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

        {/* Play Overlay */}
        {recipe.youtubeId && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center text-red-600 shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
              <Play fill="currentColor" size={24} />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-bold text-xl text-slate-900 leading-tight mb-2 group-hover:text-red-600 transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <CheckCircle2 size={16} className="text-green-500" />
          <span>
            {locale === "en" 
              ? `You have ${have} of ${total} ingredients` 
              : `আপনার কাছে ${toBengaliNumber(total)}টির মধ্যে ${toBengaliNumber(have)}টি উপকরণ আছে`}
          </span>
        </div>

        {missing.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <AlertCircle size={12} />
              {locale === "en" ? "Missing" : "যা নেই"}
            </div>
            <div className="flex flex-wrap gap-2">
              {missing.map((ing, idx) => (
                <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">
                  {ing}
                </span>
              ))}
              {recipe.ingredients[locale].length > 3 + have && (
                <span className="text-xs text-slate-400 self-center">
                  +{recipe.ingredients[locale].length - 3 - have} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center gap-3">
          {recipe.youtubeId ? (
            <button
              onClick={() => onOpenVideo(recipe.youtubeId!)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-red-600/20"
            >
              <Play size={16} fill="currentColor" />
              {locale === "en" ? "Watch Recipe" : "রেসিপি দেখুন"}
            </button>
          ) : null}
          
          {recipe.youtubeUrl && (
            <a
              href={recipe.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
              title={locale === "en" ? "Open in YouTube" : "ইউটিউবে খুলুন"}
            >
              <ExternalLink size={20} />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
