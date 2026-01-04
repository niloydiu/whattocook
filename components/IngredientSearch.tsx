"use client";

import React, { useMemo, useState } from "react";
import recipeData from "../lib/recipeData.json";

type Locale = "en" | "bn";

export default function IngredientSearch({
  selected,
  onAdd,
  onRemove,
  onFind,
  locale = "en",
}: {
  selected: string[];
  onAdd: (s: string) => void;
  onRemove: (idx: number) => void;
  onFind: () => void;
  locale?: Locale;
}) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const pool = new Set<string>();
    (recipeData as any[]).forEach((r) => {
      (r.ingredients?.en || []).forEach((i: string) => pool.add(i));
      (r.ingredients?.bn || []).forEach((i: string) => pool.add(i));
    });
    return Array.from(pool).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 8);
    return suggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
  }, [input, suggestions]);

  function addFromInput() {
    const v = input.trim();
    if (!v) return;
    onAdd(v);
    setInput("");
    setOpen(false);
  }

  return (
    <div className="w-full">
      <div className="bg-white/30 backdrop-blur-md rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 21l-4.35-4.35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="11" r="6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              onKeyDown={(e) => e.key === "Enter" && addFromInput()}
              className="w-full pl-10 pr-3 py-2 bg-white/60 rounded-md outline-none"
              placeholder={locale === "en" ? "Search ingredients (eg. onion)" : "উপকরণ খুঁজুন (যেমন: পেঁয়াজ)"}
            />

            {open && filtered.length > 0 && (
              <ul className="absolute left-0 right-0 mt-2 bg-white/90 rounded-md shadow-lg max-h-52 overflow-auto z-20">
                {filtered.map((s) => (
                  <li
                    key={s}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onAdd(s);
                      setInput("");
                      setOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={addFromInput}
            className="px-4 py-2 bg-amber-500 text-white rounded-md"
            aria-label="Add ingredient"
          >
            {locale === "en" ? "Add" : "যোগ"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((s, i) => (
            <span key={s + i} className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full text-sm">
              <span className="max-w-[10rem] truncate">{s}</span>
              <button onClick={() => onRemove(i)} className="text-slate-600">✕</button>
            </span>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onFind} className="px-5 py-2 bg-emerald-600 text-white rounded-md shadow-md hover:scale-[1.02] transition">
            {locale === "en" ? "Find Recipes" : "রেসিপি খুঁজুন"}
          </button>
        </div>
      </div>
    </div>
  );
}
