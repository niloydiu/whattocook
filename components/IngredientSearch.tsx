"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, ArrowRight, Sparkles } from "lucide-react";
import ingredientsData from "../lib/ingredients.json";
import {
  useFuzzyIngredientSearch,
  highlightMatch,
  type Ingredient,
} from "../hooks/useFuzzySearch";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const ingredients = ingredientsData as Ingredient[];

  // Use fuzzy search instead of basic filtering
  const searchResults = useFuzzyIngredientSearch(ingredients, input, {
    limit: 50,
    threshold: 0.35,
  });

  // Visible count for lazy-loading the suggestion list
  const [visibleCount, setVisibleCount] = useState<number>(20);

  // Filter out already selected ingredients
  const filtered = searchResults.filter((result) => {
    // Safety check: ensure result has ingredient data
    if (!result || !result.ingredient || !result.ingredient.name_en) {
      return false;
    }

    const ingredientName = result.ingredient.name_en.toLowerCase();
    const ingredientNameBn = result.ingredient.name_bn.toLowerCase();
    const selectedNormalized = selected.map((s) => s.toLowerCase().trim());

    return (
      !selectedNormalized.includes(ingredientName) &&
      !selectedNormalized.includes(ingredientNameBn)
    );
  });

  function addFromInput() {
    const v = input.trim();
    if (!v) return;

    // Try to find the ingredient in our list to get the canonical name
    const found = ingredients.find(
      (i) =>
        i.name_en.toLowerCase() === v.toLowerCase() ||
        i.name_bn.toLowerCase() === v.toLowerCase() ||
        i.name_en.toLowerCase().includes(v.toLowerCase()) ||
        i.name_bn.toLowerCase().includes(v.toLowerCase())
    );

    const nameToAdd = found
      ? locale === "en"
        ? found.name_en
        : found.name_bn
      : v;

    if (selected.some((s) => s.toLowerCase() === nameToAdd.toLowerCase())) {
      setInput("");
      return;
    }
    onAdd(nameToAdd);
    setInput("");
    setOpen(false);
  }

  function getIconForName(name: string) {
    const found = ingredients.find(
      (i) =>
        i.name_en.toLowerCase() === name.toLowerCase() ||
        i.name_bn.toLowerCase() === name.toLowerCase() ||
        i.name_en.toLowerCase().includes(name.toLowerCase()) ||
        i.name_bn.toLowerCase().includes(name.toLowerCase())
    );
    if (found) return found.img;
    // Fallback - use the same format as the ingredient data
    const formatted =
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    return `https://www.themealdb.com/images/ingredients/${formatted}.png`;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-2 md:px-0">
      <div className="glass-effect rounded-[2rem] md:rounded-[3rem] p-2 md:p-3 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] border border-white/60">
        <div className="flex items-center gap-2 md:gap-3 p-1">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 md:left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-red-500 transition-colors">
              <Search size={20} className="md:w-6 md:h-6" />
            </div>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onClick={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              onKeyDown={(e) => e.key === "Enter" && addFromInput()}
              className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-6 bg-white/50 rounded-[1.5rem] md:rounded-[2.5rem] outline-none text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-red-500/5 transition-all text-lg md:text-xl font-bold"
              placeholder={
                locale === "en"
                  ? "What's in your kitchen?"
                  : "আপনার রান্নাঘরে কী আছে?"
              }
            />

            <AnimatePresence>
              {open && filtered.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute left-0 right-0 bottom-full mb-2 bg-white/98 backdrop-blur-3xl rounded-2xl md:rounded-[2.5rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] border border-white/60 max-h-[250px] md:max-h-[300px] overflow-auto z-[100] py-3 md:py-4 px-2 md:px-3 scrollbar-hidden"
                  onScroll={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
                      setVisibleCount((v) => Math.min(filtered.length, v + 50));
                    }
                  }}
                >
                  <div className="px-4 py-2 mb-1 md:mb-2 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 flex items-center justify-between">
                    <span>
                      {locale === "en"
                        ? "Suggested Ingredients"
                        : "প্রস্তাবিত উপকরণ"}
                    </span>
                    {input && (
                      <span className="flex items-center gap-1 text-red-500">
                        <Sparkles size={10} /> Fuzzy Match
                      </span>
                    )}
                  </div>
                  {filtered.slice(0, visibleCount).map((result) => {
                    const i = result.ingredient;
                    const isGuess = result.isClosestGuess;

                    return (
                      <li
                        key={i.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          onAdd(locale === "en" ? i.name_en : i.name_bn);
                          setInput("");
                          setOpen(false);
                        }}
                        className={`px-3 md:px-5 py-3 md:py-4 hover:bg-red-50/80 hover:text-red-600 cursor-pointer text-sm md:text-base font-semibold transition-all flex items-center justify-between group rounded-xl md:rounded-2xl mb-1 ${
                          isGuess
                            ? "border border-orange-200/50 bg-orange-50/30"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-lg md:rounded-xl flex items-center justify-center p-1.5 md:p-2 group-hover:bg-white transition-colors shadow-sm shrink-0">
                            <img
                              src={i.img}
                              alt=""
                              className="w-full h-full object-contain"
                              onError={(e) =>
                                (e.currentTarget.style.display = "none")
                              }
                            />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-slate-900 group-hover:text-red-600 transition-colors truncate">
                              {locale === "en"
                                ? highlightMatch(i.name_en, result.matches)
                                : highlightMatch(i.name_bn, result.matches)}
                            </span>
                            <span className="text-[10px] md:text-xs text-slate-400 font-medium truncate">
                              {locale === "en" ? i.name_bn : i.name_en}
                            </span>
                            {isGuess && (
                              <span className="text-[8px] md:text-[9px] text-orange-500 font-black uppercase tracking-wider">
                                Closest Match
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shrink-0">
                          <Plus size={14} className="md:w-4 md:h-4" />
                        </div>
                      </li>
                    );
                  })}
                  {filtered.length > visibleCount && (
                    <li className="px-3 md:px-5 py-3 md:py-4 text-center text-sm text-slate-500">
                      Scrolling loads more ingredients...
                    </li>
                  )}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onFind}
            disabled={selected.length === 0}
            className="hidden md:flex items-center gap-3 px-8 lg:px-12 py-4 lg:py-6 bg-red-600 hover:bg-red-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-[1.5rem] lg:rounded-[2.5rem] font-black text-lg lg:text-xl transition-all shadow-2xl shadow-red-600/20 active:scale-95 hover:-translate-y-1"
          >
            <span>{locale === "en" ? "Find" : "খুঁজুন"}</span>
            <ArrowRight size={24} />
          </button>
        </div>

        <div className="px-4 md:px-6 pb-3">
          <AnimatePresence mode="popLayout">
            {selected.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 md:mt-5 flex flex-wrap gap-2 md:gap-2.5 pb-2"
              >
                {selected.map((s, i) => (
                  <motion.span
                    key={s}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 md:gap-2.5 bg-white/80 backdrop-blur-sm border border-white/60 px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-slate-700 shadow-sm hover:shadow-md hover:border-red-200 transition-all group"
                  >
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-slate-50 rounded-lg flex items-center justify-center p-1 group-hover:bg-white transition-colors">
                      <img
                        src={getIconForName(s)}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.style.display = "none";
                          const container = img.parentElement!;
                          // Check if fallback already exists
                          if (!container.querySelector(".fallback-icon")) {
                            const fallback = document.createElement("div");
                            fallback.className =
                              "fallback-icon w-full h-full bg-gradient-to-br from-red-400 to-orange-400 rounded flex items-center justify-center text-white text-[8px] md:text-[10px] font-black";
                            fallback.textContent = s.charAt(0).toUpperCase();
                            container.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                    <span>{s}</span>
                    <button
                      onClick={() => onRemove(i)}
                      className="text-slate-300 hover:text-red-500 transition-colors ml-1"
                    >
                      <X size={14} className="md:w-4 md:h-4" />
                    </button>
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6 md:hidden flex justify-center px-2">
        <button
          onClick={onFind}
          disabled={selected.length === 0}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-red-600/20"
        >
          <span>{locale === "en" ? "Find Recipes" : "রেসিপি খুঁজুন"}</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
