"use client";

import React from "react";
import Link from "next/link";
import { ChefHat, Search, ArrowRight, ClipboardList, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NavbarProps = {
  locale: "en" | "bn";
  setLocale: (l: "en" | "bn") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  suggestions: any[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  handleSearchEnter: () => void;
  onSelectSuggestion: (s: any) => void;
};

export default function Navbar({
  locale,
  setLocale,
  searchQuery,
  setSearchQuery,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  handleSearchEnter,
  onSelectSuggestion,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-[110] glass-effect border-b border-white/30 shadow-sm backdrop-blur-xl bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 group">
          <Link
            href="/"
            className="flex items-center gap-2 md:gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover:rotate-12 transition-transform duration-300">
              <ChefHat size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="flex items-center leading-tight">
              <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                whatto<span className="text-red-600">Cook?</span>
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {/* Search Bar */}
          <div className="hidden md:flex relative items-center bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl px-4 py-2.5 max-w-xs group focus-within:ring-2 focus-within:ring-red-500/30 focus-within:border-red-300/50 transition-all shadow-sm hover:shadow-md">
            <Search
              size={18}
              className="text-slate-400 group-focus-within:text-red-500 transition-colors mr-3"
            />
            <input
              type="text"
              placeholder={
                locale === "en" ? "Search recipes..." : "রেসিপি খুঁজুন..."
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchEnter();
                  setShowSuggestions(false);
                }
              }}
              className="flex-1 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder-slate-400"
            />
            <button
              onClick={handleSearchEnter}
              className="ml-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-all shadow-sm hover:shadow-md"
            >
              <ArrowRight size={14} />
            </button>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100/80 overflow-hidden z-[120] backdrop-blur-xl"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => onSelectSuggestion(s)}
                      className="w-full px-4 py-3 text-left hover:bg-red-50/50 active:bg-red-50 flex items-center gap-3 transition-all duration-200 border-b border-slate-50 last:border-0"
                    >
                      {s.type === "category" ? (
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                          <Plus size={16} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                          <ChefHat size={16} />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">
                          {locale === "en" ? s.label : s.label_bn || s.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                          {s.type}
                        </span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Request Recipe Button */}
          <Link
            href="/request-recipe"
            className="hidden sm:flex items-center gap-2 px-4 md:px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm hover:from-red-700 hover:to-orange-700 active:scale-95 transition-all shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40"
          >
            <ClipboardList size={16} className="md:w-5 md:h-5" />
            <span className="hidden md:inline">
              {locale === "en" ? "Request Recipe" : "রেসিপি অনুরোধ"}
            </span>
          </Link>

          <div className="flex items-center bg-slate-100/60 p-1 rounded-xl md:rounded-2xl backdrop-blur-sm border border-slate-200/60 shadow-sm">
            <button
              onClick={() => setLocale("en")}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all duration-200 ${
                locale === "en"
                  ? "bg-white text-red-600 shadow-md"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("bn")}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all duration-200 ${
                locale === "bn"
                  ? "bg-white text-red-600 shadow-md"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
