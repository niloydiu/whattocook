"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, ChefHat, ArrowRight } from "lucide-react";
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
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (selected.includes(v)) {
      setInput("");
      return;
    }
    onAdd(v);
    setInput("");
    setOpen(false);
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="glass-effect rounded-3xl p-2 shadow-2xl shadow-red-500/5 border border-white/50">
        <div className="flex items-center gap-2 p-1">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-red-500 transition-colors">
              <Search size={20} />
            </div>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              onKeyDown={(e) => e.key === "Enter" && addFromInput()}
              className="w-full pl-12 pr-4 py-4 bg-white/40 rounded-2xl outline-none text-slate-800 placeholder:text-slate-400 focus:bg-white/80 transition-all text-lg"
              placeholder={locale === "en" ? "What's in your kitchen? (e.g. Chicken, Garlic)" : "আপনার রান্নাঘরে কী আছে? (যেমন: মুরগি, রসুন)"}
            />

            <AnimatePresence>
              {open && filtered.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 max-h-64 overflow-auto z-50 py-2"
                >
                  {filtered.map((s) => (
                    <li
                      key={s}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onAdd(s);
                        setInput("");
                        setOpen(false);
                      }}
                      className="px-5 py-3 hover:bg-red-50 hover:text-red-600 cursor-pointer text-base transition-colors flex items-center justify-between group"
                    >
                      <span>{s}</span>
                      <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onFind}
            disabled={selected.length === 0}
            className="hidden md:flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-red-600/20 active:scale-95"
          >
            <span>{locale === "en" ? "Find" : "খুঁজুন"}</span>
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="px-4 pb-2">
          <AnimatePresence mode="popLayout">
            {selected.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-wrap gap-2 pb-2"
              >
                {selected.map((s, i) => (
                  <motion.span
                    key={s}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:border-red-200 transition-colors group"
                  >
                    <span>{s}</span>
                    <button 
                      onClick={() => onRemove(i)} 
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="mt-6 flex md:hidden justify-center">
        <button 
          onClick={onFind}
          disabled={selected.length === 0}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-red-600/20"
        >
          <span>{locale === "en" ? "Find Recipes" : "রেসিপি খুঁজুন"}</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
