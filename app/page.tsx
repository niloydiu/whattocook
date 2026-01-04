"use client";

import React, { useEffect, useMemo, useState } from "react";
import RecipeCard from "../components/RecipeCard";
import useLanguage from "../hooks/useLanguage";
import recipeDataRaw from "../lib/recipeData.json";

type Locale = "en" | "bn";

type Recipe = {
  id: string;
  youtubeId?: string;
  title: { en: string; bn: string };
  ingredients: { en: string[]; bn: string[] };
  instructions?: { en?: string; bn?: string } | string;
};

function normalizeStr(s?: string) {
  if (!s) return "";
  const banglaDigits = "০১২৩৪৫৬৭৮৯";
  const latinDigits = "0123456789";
  let out = s
    .toLowerCase()
    .trim()
    .replace(/[.,()\[\]"']/g, "")
    .replace(/–|—/g, "-")
    .replace(/\s+/g, " ");
  out = out
    .split("")
    .map((c) => {
      const idx = banglaDigits.indexOf(c);
      return idx >= 0 ? latinDigits[idx] : c;
    })
    .join("");
  return out;
}

function itemMatches(a: string, b: string) {
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

export default function Page() {
  const { locale, setLocale, t } = useLanguage();

  const recipeData = recipeDataRaw as Recipe[];

  const indexed = useMemo(() => {
    return recipeData.map((r) => {
      const en = (r.ingredients?.en || []).map((s) => normalizeStr(s));
      const bn = (r.ingredients?.bn || []).map((s) => normalizeStr(s));
      const combined = Array.from(new Set([...en, ...bn]));
      return {
        recipe: r,
        normIngredients: combined,
        total: combined.length || 1,
      };
    });
  }, [recipeData]);

  const [query, setQuery] = useState("");
  const [pantry, setPantry] = useState<string[]>([]);
  const [debouncedPantry, setDebouncedPantry] = useState<string[]>(pantry);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedPantry(pantry.slice()), 200);
    return () => clearTimeout(id);
  }, [pantry]);

  function addPantryItem(raw: string) {
    const v = normalizeStr(raw);
    if (!v) return;
    if (pantry.map(normalizeStr).includes(v)) return;
    setPantry((p) => [...p, raw.trim()]);
    setQuery("");
  }

  function removePantryItem(idx: number) {
    setPantry((p) => p.filter((_, i) => i !== idx));
  }

  const results = useMemo(() => {
    const pantryNorm = debouncedPantry.map(normalizeStr).filter(Boolean);
    if (pantryNorm.length === 0) {
      return indexed
        .map(({ recipe }) => ({ recipe, matchPercent: 0, have: 0, missing: recipe.ingredients.en.length }))
        .slice()
        .sort((a, b) => a.recipe.title.en.localeCompare(b.recipe.title.en));
    }

    const out = indexed.map(({ recipe, normIngredients, total }) => {
      let have = 0;
      for (const p of pantryNorm) {
        for (const rIng of normIngredients) {
          if (itemMatches(rIng, p)) {
            have += 1;
            break;
          }
        }
      }
      const matchedUnique = Math.min(have, total);
      const matchPercent = matchedUnique / total;
      const missing = total - matchedUnique;
      return { recipe, matchPercent, have: matchedUnique, missing, total };
    });

    out.sort((a, b) => {
      if ((a.matchPercent === 1) !== (b.matchPercent === 1)) return a.matchPercent === 1 ? -1 : 1;
      if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
      if (a.missing !== b.missing) return a.missing - b.missing;
      return a.recipe.title.en.localeCompare(b.recipe.title.en);
    });
    return out;
  }, [indexed, debouncedPantry]);

  return (
    <main className="min-h-screen p-4 bg-gradient-to-b from-slate-50 to-white font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold">whattoCook?</h1>
          <div className="flex items-center gap-3">
            <button
              className={`px-3 py-1 rounded-md ${locale === "en" ? "bg-white/60" : "bg-transparent"}`}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
            <button
              className={`px-3 py-1 rounded-md ${locale === "bn" ? "bg-white/60" : "bg-transparent"}`}
              onClick={() => setLocale("bn")}
            >
              BN
            </button>
          </div>
        </header>

        <section className="mb-6">
          <div className="bg-white/30 backdrop-blur-md rounded-xl p-4 shadow-sm">
            <label className="block text-xs text-slate-700 mb-2">{t("Add ingredient","উপকরণ যোগ করুন")}</label>
            <div className="flex gap-2">
              <input
                aria-label="ingredient"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addPantryItem(query);
                  }
                }}
                className="flex-1 bg-white/40 rounded-md px-3 py-2 outline-none"
                placeholder={t("Type ingredient and press Enter","এন্টার করে উপকরণ যোগ করুন")}
              />
              <button
                onClick={() => addPantryItem(query)}
                className="bg-indigo-600 text-white px-4 rounded-md"
              >
                {t("Add","যোগ করুন")}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {pantry.map((p, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-white/60 text-sm flex items-center gap-2">
                  <span>{p}</span>
                  <button onClick={() => removePantryItem(i)} aria-label="remove" className="text-slate-600">✕</button>
                </span>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.map((r) => (
              <RecipeCard
                key={r.recipe.id}
                recipe={r.recipe}
                matchPercent={r.matchPercent}
                have={r.have}
                total={r.total}
                locale={locale}
                onOpenVideo={(id) => setSelectedVideo(id)}
              />
            ))}
          </div>
        </section>

        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedVideo(null)}>
            <div className="w-full max-w-3xl aspect-video bg-black rounded-md">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                className="w-full h-full rounded-md"
                allow="autoplay; encrypted-media; picture-in-picture"
                title="YouTube player"
              />
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        :root { font-family: 'Hind Siliguri', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
      `}</style>
    </main>
  );
}
"use client";
import React, { useState } from "react";
import RecipeCard from "../components/RecipeCard";
import LanguageSwitcher from "../components/languageSwitcher";
import { useLanguage } from "../components/LanguageProvider";
import { matchRecipesClient, allRecipes } from "../lib/matchingLogic";

export default function Page() {
  const { lang } = useLanguage();
  const [input, setInput] = useState("");
  const [pantry, setPantry] = useState<string[]>([]);

  const addIngredient = () => {
    const val = input.trim();
    if (!val) return;
    if (!pantry.map((p) => p.toLowerCase()).includes(val.toLowerCase())) {
      setPantry((s) => [...s, val]);
    }
    setInput("");
  };

  const removeIngredient = (i: number) =>
    setPantry((s) => s.filter((_, idx) => idx !== i));

  const results = matchRecipesClient(pantry, lang);

  return (
    <main className="max-w-6xl mx-auto p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {lang === "en" ? "whattocook?" : "কি রান্না করব?"}
        </h1>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Sticky pantry bar on small screens */}
      <div className="md:static fixed top-0 left-0 right-0 z-40 bg-white p-3 shadow md:shadow-none">
        <div className="max-w-6xl mx-auto flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addIngredient()}
            className="flex-1 px-3 py-2 rounded border"
            placeholder={lang === "en" ? "Add ingredient (e.g. Onion)" : "উপকরণ লিখুন (যেমন: পেঁয়াজ)"}
          />
          <button onClick={addIngredient} className="px-4 py-2 bg-black text-white rounded">
            {lang === "en" ? "Add" : "যোগ করুন"}
          </button>
        </div>
      </div>

      {/* spacer so content doesn't go under the fixed bar on mobile */}
      <div className="h-20 md:hidden" />

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-3">{lang === "en" ? "Results" : "ফলাফল"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.map((res) => (
            <RecipeCard key={res.recipe.id} result={res} locale={lang} />
          ))}
        </div>
      </section>
    </main>
  );
}
