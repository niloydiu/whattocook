"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChefHat,
  Search,
  ArrowRight,
  ClipboardList,
  Plus,
  Menu,
  X,
} from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Main Navbar */}
        <div className="h-14 sm:h-16 md:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 md:gap-3 cursor-pointer"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-red-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-600 group-hover:rotate-12 transition-transform duration-300">
                <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex items-center leading-tight">
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-tight text-slate-900">
                  whatto<span className="text-red-600">Cook?</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop Only */}
          <div className="hidden md:flex relative items-center bg-white border border-slate-200 rounded-2xl px-3 lg:px-4 py-2 lg:py-2.5 w-full max-w-48 lg:max-w-xs group focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-300 transition-all shadow-sm hover:shadow-md">
            <Search
              size={16}
              className="text-slate-400 group-focus-within:text-red-500 transition-colors mr-2 lg:mr-3 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchEnter();
                  setShowSuggestions(false);
                }
              }}
              className="flex-1 bg-transparent outline-none text-xs lg:text-sm font-semibold text-slate-700 placeholder-slate-400 min-w-0"
            />
            <button
              onClick={handleSearchEnter}
              className="ml-1 lg:ml-2 p-1 lg:p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-all shadow-sm hover:shadow-md flex-shrink-0"
            >
              <ArrowRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
            </button>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-80 overflow-y-auto"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => onSelectSuggestion(s)}
                      className="w-full px-3 lg:px-4 py-2.5 lg:py-3 text-left hover:bg-red-50 active:bg-red-50 flex items-center gap-2 lg:gap-3 transition-all duration-200 border-b border-slate-50 last:border-0"
                    >
                      {s.type === "category" ? (
                        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                          <Plus size={14} className="lg:w-4 lg:h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                          <ChefHat size={14} className="lg:w-4 lg:h-4" />
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs lg:text-sm font-bold text-slate-900 truncate">
                          {locale === "en" ? s.label : s.label_bn || s.label}
                        </span>
                        <span className="text-[9px] lg:text-[10px] text-slate-400 font-medium uppercase tracking-wider">
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
            className="hidden lg:flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-linear-to-r from-red-600 to-orange-600 text-white rounded-xl lg:rounded-2xl font-bold text-xs lg:text-sm hover:from-red-700 hover:to-orange-700 active:scale-95 transition-all shadow-lg shadow-red-600 hover:shadow-xl hover:shadow-red-600 whitespace-nowrap"
          >
            <ClipboardList className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Request</span>
          </Link>

          {/* Language Toggle - Desktop Only */}
          <div className="hidden md:flex items-center bg-slate-100 p-0.5 lg:p-1 rounded-xl lg:rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setLocale("en")}
              className={`px-2.5 py-1.5 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl text-[9px] lg:text-xs font-black transition-all duration-200 ${
                locale === "en"
                  ? "bg-white text-red-600 shadow-md"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("bn")}
              className={`px-2.5 py-1.5 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl text-[9px] lg:text-xs font-black transition-all duration-200 ${
                locale === "bn"
                  ? "bg-white text-red-600 shadow-md"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white"
              }`}
            >
              BN
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                setMobileMenuOpen(false);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5 text-slate-600" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setMobileSearchOpen(false);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-600" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-200 overflow-hidden"
            >
              <div className="px-3 py-3 relative">
                <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-300 transition-all shadow-sm">
                  <Search
                    size={18}
                    className="text-slate-400 mr-3 flex-shrink-0"
                  />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchEnter();
                        setShowSuggestions(false);
                        setMobileSearchOpen(false);
                      }
                    }}
                    className="flex-1 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder-slate-400 min-w-0"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      handleSearchEnter();
                      setMobileSearchOpen(false);
                    }}
                    className="ml-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-all shadow-sm flex-shrink-0"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>

                {/* Mobile Suggestions */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-3 right-3 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-64 overflow-y-auto"
                    >
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            onSelectSuggestion(s);
                            setMobileSearchOpen(false);
                          }}
                          className="w-full px-3 py-2.5 text-left hover:bg-red-50 active:bg-red-50 flex items-center gap-2 transition-all duration-200 border-b border-slate-50 last:border-0"
                        >
                          {s.type === "category" ? (
                            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                              <Plus size={14} />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                              <ChefHat size={14} />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {locale === "en"
                                ? s.label
                                : s.label_bn || s.label}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">
                              {s.type}
                            </span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-200 overflow-hidden"
            >
              <div className="px-3 py-3 space-y-2">
                {/* Request Recipe Link */}
                <Link
                  href="/request-recipe"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-sm hover:from-red-700 hover:to-orange-700 active:scale-95 transition-all shadow-lg"
                >
                  <ClipboardList size={18} />
                  <span>Request Recipe</span>
                </Link>

                {/* Language Selection */}
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                  <span className="text-xs font-semibold text-slate-600 flex-1">
                    Language:
                  </span>
                  <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm">
                    <button
                      onClick={() => setLocale("en")}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all duration-200 ${
                        locale === "en"
                          ? "bg-red-600 text-white shadow-md"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setLocale("bn")}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all duration-200 ${
                        locale === "bn"
                          ? "bg-red-600 text-white shadow-md"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      BN
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
