"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, ArrowRight, Sparkles, ChefHat } from "lucide-react";
import {
  useFuzzyIngredientSearch,
  highlightMatch,
  type Ingredient,
} from "../hooks/useFuzzySearch";
import { useGlobalScrollCapture } from "./ScrollCaptureProvider";
import { API_PATHS } from "../lib/api-paths";

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
    "top"
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Fetch all ingredients from the database for fuzzy searching
  useEffect(() => {
    async function fetchIngredients() {
      try {
        const response = await fetch(`${API_PATHS.INGREDIENTS}?limit=5000`);
        const data = await response.json();
        if (data.ingredients) {
          setIngredients(data.ingredients);
        }
      } catch (error) {
        console.error("Failed to fetch ingredients from DB", error);
      }
    }
    fetchIngredients();
  }, []);

  // Calculate dropdown position based on available space
  useEffect(() => {
    if (open && inputRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const spaceAbove = inputRect.top;

      // Prioritize top position, only use bottom if there's not enough space above
      if (spaceAbove < 200) {
        setDropdownPosition("bottom");
      } else {
        setDropdownPosition("top");
      }
    }
  }, [open, input]);

  // Use fuzzy search instead of basic filtering
  const searchResults = useFuzzyIngredientSearch(ingredients, input, {
    limit: 50,
    threshold: 0.35,
  });

  const [visibleCount, setVisibleCount] = useState<number>(20);

  // Use global scroll capture for the dropdown
  const scrollCaptureRef = useGlobalScrollCapture(
    "ingredient-search-dropdown",
    5
  );

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
    <div className="w-full max-w-3xl mx-auto relative z-20">
      {/* Main Search Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative"
      >
        <div className="glass-effect rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-1.5 sm:p-2 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.15)] sm:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.15)] border border-white/60 backdrop-blur-xl">
          {/* Search Input Section */}
          <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2">
            <div className="flex-1 relative">
              <motion.div
                className="absolute inset-y-0 left-3 sm:left-4 lg:left-6 flex items-center pointer-events-none"
                animate={{
                  color: input ? "#dc2626" : "#94a3b8",
                }}
                transition={{ duration: 0.2 }}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 lg:w-[22px] lg:h-[22px]" />
              </motion.div>

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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // If user already selected ingredients, trigger search; otherwise add typed input
                    if (selected.length > 0) {
                      onFind();
                    } else {
                      addFromInput();
                    }
                  }
                }}
                className="w-full pl-10 sm:pl-12 lg:pl-16 pr-3 sm:pr-4 lg:pr-6 py-2.5 sm:py-3 lg:py-4 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-transparent focus:border-red-300 focus:bg-white focus:ring-2 sm:focus:ring-4 focus:ring-red-500/10 outline-none transition-all duration-300 text-sm sm:text-base font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal min-h-[44px]"
                placeholder={
                  locale === "en"
                    ? "Add ingredients you have..."
                    : "আপনার যে উপকরণ আছে যোগ করুন..."
                }
              />

              {/* Enhanced Suggestions Dropdown */}
              <AnimatePresence>
                {open && filtered.length > 0 && (
                  <motion.div
                    ref={dropdownRef}
                    initial={{
                      opacity: 0,
                      y: dropdownPosition === "bottom" ? 15 : -15,
                      scale: 0.95,
                    }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      y: dropdownPosition === "bottom" ? 15 : -15,
                      scale: 0.95,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`absolute left-0 right-0 sm:left-auto sm:right-auto sm:w-full bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200/80 max-h-[320px] sm:max-h-[400px] overflow-hidden z-[9999] backdrop-blur-sm ${
                      dropdownPosition === "bottom"
                        ? "top-full mt-3"
                        : "bottom-full mb-3"
                    }`}
                    style={{
                      boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                      filter:
                        "drop-shadow(0 4px 6px rgb(0 0 0 / 0.07)) drop-shadow(0 10px 15px rgb(0 0 0 / 0.1))",
                    }}
                  >
                    {/* Position indicator arrow */}
                    <div
                      className={`absolute left-8 w-0 h-0 border-l-4 border-r-4 border-transparent ${
                        dropdownPosition === "bottom"
                          ? "top-0 -mt-2 border-b-4 border-b-white"
                          : "bottom-0 -mb-2 border-t-4 border-t-white"
                      }`}
                      style={{
                        filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))",
                      }}
                    />
                    <div className="p-3 sm:p-4 border-b border-slate-100/80 bg-gradient-to-r from-slate-50/50 to-white/50">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                        </div>
                        <span>
                          {locale === "en"
                            ? "Smart Suggestions"
                            : "স্মার্ট পরামর্শ"}
                        </span>
                      </div>
                    </div>

                    <div
                      ref={scrollCaptureRef as React.RefObject<HTMLDivElement>}
                      className="max-h-[260px] sm:max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
                      onScroll={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        if (
                          el.scrollTop + el.clientHeight >=
                          el.scrollHeight - 80
                        ) {
                          setVisibleCount((v) =>
                            Math.min(filtered.length, v + 50)
                          );
                        }
                      }}
                    >
                      {filtered.slice(0, visibleCount).map((result, index) => {
                        const i = result.ingredient;
                        const isGuess = result.isClosestGuess;

                        return (
                          <motion.div
                            key={i.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.02 }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              onAdd(locale === "en" ? i.name_en : i.name_bn);
                              setInput("");
                              setOpen(false);
                            }}
                            className={`group px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 active:bg-red-100 transition-all duration-200 cursor-pointer border-b border-slate-50/50 last:border-0 relative ${
                              isGuess
                                ? "border-l-4 border-orange-400 bg-gradient-to-r from-orange-50/30 to-transparent"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
                              <div className="relative shrink-0">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-gradient-to-br from-white to-slate-50 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm border border-slate-100/50">
                                  <img
                                    src={i.img}
                                    alt=""
                                    className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 object-contain"
                                    onError={(e) => {
                                      const img = e.currentTarget;
                                      img.style.display = "none";
                                      const container = img.parentElement!;
                                      if (
                                        !container.querySelector(
                                          ".fallback-icon"
                                        )
                                      ) {
                                        const fallback =
                                          document.createElement("div");
                                        fallback.className =
                                          "fallback-icon absolute inset-0 bg-gradient-to-br from-red-400 to-orange-400 rounded-xl flex items-center justify-center text-white text-sm font-bold";
                                        fallback.textContent = i.name_en
                                          .charAt(0)
                                          .toUpperCase();
                                        container.appendChild(fallback);
                                      }
                                    }}
                                  />
                                </div>
                                {isGuess && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">
                                      ★
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-slate-900 font-semibold text-sm sm:text-base truncate">
                                  {locale === "en"
                                    ? highlightMatch(i.name_en, result.matches)
                                    : highlightMatch(i.name_bn, result.matches)}
                                </div>
                                <div className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                                  {locale === "en" ? i.name_bn : i.name_en}
                                </div>
                                {isGuess && (
                                  <div className="flex items-center gap-1.5 mt-1.5">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-orange-600 font-semibold">
                                      {locale === "en"
                                        ? "Closest match"
                                        : "সবচেয়ে কাছের মিল"}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-center shadow-md sm:shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 transition-all duration-200"
                              >
                                <Plus className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                              </motion.div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {filtered.length > visibleCount && (
                      <div className="px-5 py-3 text-center text-sm text-slate-500 bg-gradient-to-r from-slate-50 to-white border-t border-slate-100/50">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                          <span className="font-medium">
                            {locale === "en"
                              ? "Scroll for more..."
                              : "আরও দেখতে স্ক্রল করুন..."}
                          </span>
                          <div
                            className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Selected Ingredients Display */}
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 pb-4"
              >
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
                  {selected.map((s, i) => (
                    <motion.div
                      key={s}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="group flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl sm:rounded-2xl px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-200"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center shrink-0">
                        <img
                          src={getIconForName(s)}
                          alt=""
                          className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.style.display = "none";
                            const container = img.parentElement!;
                            if (!container.querySelector(".fallback-icon")) {
                              const fallback = document.createElement("div");
                              fallback.className =
                                "fallback-icon w-full h-full bg-gradient-to-br from-red-400 to-orange-400 rounded flex items-center justify-center text-white text-xs font-black";
                              fallback.textContent = s.charAt(0).toUpperCase();
                              container.appendChild(fallback);
                            }
                          }}
                        />
                      </div>
                      <span className="text-slate-700 font-medium text-sm sm:text-base truncate max-w-[180px] sm:max-w-none">
                        {s}
                      </span>
                      <motion.button
                        onClick={() => onRemove(i)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-slate-400 hover:text-red-500 transition-colors shrink-0 w-6 h-6 flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Find Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-4 sm:mt-6 px-2 sm:px-4"
      >
        <motion.button
          onClick={onFind}
          disabled={selected.length === 0}
          whileHover={{ scale: selected.length > 0 ? 1.02 : 1 }}
          whileTap={{ scale: selected.length > 0 ? 0.98 : 1 }}
          className={`w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-2.5 sm:gap-3 min-h-[48px] ${
            selected.length > 0
              ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-red-500/30"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <ChefHat className="w-5 h-5" />
          <span>
            {locale === "en" ? "Find My Recipes" : "আমার রেসিপি খুঁজুন"}
          </span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
