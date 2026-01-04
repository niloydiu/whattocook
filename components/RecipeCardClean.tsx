"use client";

import React from "react";

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
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export default function RecipeCardClean({
  recipe,
  matchPercent,
  have,
  total,
  locale = "en",
  onOpenVideo,
}: {
  recipe: Recipe;
  matchPercent: number;
  have: number;
  total: number;
  locale?: Locale;
  onOpenVideo: (id: string) => void;
}) {
  const title = recipe.title[locale] || recipe.title.en;
  const thumbnail = recipe.youtubeId ? getYoutubeThumbnail(recipe.youtubeId) : recipe.thumbnail;

  const haveText =
    locale === "en"
      ? `You have ${have}/${total} ingredients`
      : `আপনার কাছে ${toBengaliNumber(have)}টির মধ্যে ${toBengaliNumber(total)}টি উপকরণ আছে`;

  const pct = Math.round(matchPercent * 100);

  return (
    <article className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-sm flex flex-col h-full">
      <div className="relative rounded-lg overflow-hidden h-44 bg-gray-100">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
        )}
        <div className="absolute top-3 left-3 bg-white/80 text-sm px-2 py-1 rounded-full font-semibold">{pct}%</div>
      </div>

      <div className="mt-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg leading-snug">{title}</h3>
        <div className="text-sm text-slate-700 mt-1">{haveText}</div>

        <div className="mt-3 text-sm text-slate-700">
          <strong>{locale === "en" ? "Ingredients" : "উপকরণ"}:</strong>
          <ul className="mt-2 space-y-1">
            {recipe.ingredients[locale].slice(0, 6).map((ing) => (
              <li key={ing} className="text-sm text-slate-800">
                • {ing}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {recipe.youtubeId ? (
            <button
              onClick={() => onOpenVideo(recipe.youtubeId!)}
              className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
            >
              {locale === "en" ? "Watch" : "দেখুন"}
            </button>
          ) : null}
          {recipe.youtubeUrl ? (
            <a
              href={recipe.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 border rounded-md text-sm"
            >
              {locale === "en" ? "Open YouTube" : "ইউটিউবে খুলুন"}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
