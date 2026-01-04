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
