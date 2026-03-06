"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

type CategoryStats = {
  name: string;
  count: number;
  type: "category" | "foodCategory";
};

type CategoryFiltersProps = {
  locale: "en" | "bn";
  categoryStats: CategoryStats[];
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  showChipCounts?: boolean;
  redirectToAllRecipes?: boolean;
  clearFilters?: () => void;
};

function toBengaliNumber(n: number) {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n)
    .split("")
    .map((d) => map[+d] ?? d)
    .join("");
}

export default function CategoryFilters({
  locale,
  categoryStats,
  selectedCategory,
  setSelectedCategory,
  showChipCounts = true,
  redirectToAllRecipes = false,
  clearFilters,
}: CategoryFiltersProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const isDown = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  // Scroll selected category into view
  useEffect(() => {
    const buttonKey = selectedCategory || "all";
    if (buttonRefs.current[buttonKey]) {
      buttonRefs.current[buttonKey]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedCategory]);

  // Pointer drag + wheel-to-scroll handlers for desktop chip scrolling
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      isDown.current = true;
      startX.current = e.pageX - el.offsetLeft;
      startScrollLeft.current = el.scrollLeft;
      (e.target as Element).setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown.current) return;
      const x = e.pageX - el.offsetLeft;
      const walk = x - startX.current;
      el.scrollLeft = startScrollLeft.current - walk;
    };

    const onPointerUp = (e: PointerEvent) => {
      isDown.current = false;
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch (err) {}
    };

    const onWheel = (e: WheelEvent) => {
      // map vertical wheel to horizontal scrolling when over the container
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("pointerdown", onPointerDown as any, { passive: true });
    window.addEventListener("pointermove", onPointerMove as any);
    window.addEventListener("pointerup", onPointerUp as any);
    el.addEventListener("wheel", onWheel as any, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown as any);
      window.removeEventListener("pointermove", onPointerMove as any);
      window.removeEventListener("pointerup", onPointerUp as any);
      el.removeEventListener("wheel", onWheel as any);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900">
          {locale === "en" ? "Featured Recipes" : "নির্বাচিত রেসিপি"}
        </h2>
        <p className="text-slate-600">
          {locale === "en"
            ? "Discover delicious recipes from around the world"
            : "বিশ্বের বিভিন্ন প্রান্ত থেকে সুস্বাদু রেসিপি আবিষ্কার করুন"}
        </p>
      </div>

      <div className="flex items-center gap-3 max-w-2xl w-full">
        <div
          ref={scrollContainerRef}
          className="hidden md:flex gap-2 overflow-x-auto py-1 scrollbar-hidden"
        >
          <button
            ref={(el) => {
              buttonRefs.current["all"] = el;
            }}
            onClick={() => {
              if (redirectToAllRecipes) {
                window.location.href = "/recipes";
              } else {
                if (clearFilters) {
                  clearFilters();
                } else {
                  setSelectedCategory(null);
                }
              }
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border-2 hover:shadow-md active:scale-95 ${
              selectedCategory === null
                ? "bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-600 shadow-md"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-red-300"
            }`}
          >
            {locale === "en" ? "All" : "সব"}
          </button>
          {categoryStats.map((cat) => (
            <button
              key={cat.name}
              ref={(el) => {
                buttonRefs.current[cat.name] = el;
              }}
              onClick={() => {
                if (redirectToAllRecipes) {
                  // If this category is already selected, redirect to show all recipes
                  if (selectedCategory === cat.name) {
                    window.location.href = "/recipes";
                  } else {
                    const paramName =
                      cat.type === "foodCategory" ? "foodCategory" : "category";
                    window.location.href = `/recipes?${paramName}=${encodeURIComponent(
                      cat.name
                    )}`;
                  }
                } else {
                  // Toggle selection: if already selected, deselect it
                  if (selectedCategory === cat.name) {
                    setSelectedCategory(null);
                  } else {
                    setSelectedCategory(cat.name);
                  }
                }
              }}
              className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-sm border-2 hover:shadow-md active:scale-95 ${
                selectedCategory === cat.name
                  ? "bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-600 shadow-md scale-105"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-red-300 hover:scale-105"
              }`}
            >
              <span className="capitalize">{cat.name}</span>
              {showChipCounts && (
                <span
                  className={`ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] ${
                    selectedCategory === cat.name
                      ? "bg-white/20"
                      : "bg-slate-100"
                  }`}
                >
                  {locale === "en" ? cat.count : toBengaliNumber(cat.count)}
                </span>
              )}
            </button>
          ))}
          {clearFilters && (
            <button
              ref={(el) => {
                buttonRefs.current["clear"] = el;
              }}
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-800 whitespace-nowrap"
            >
              <X size={14} />
              <span className="hidden lg:inline">
                {locale === "en" ? "Clear" : "পরিষ্কার"}
              </span>
            </button>
          )}
        </div>

        <div className="md:hidden w-full">
          <select
            value={selectedCategory ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (redirectToAllRecipes) {
                if (value) {
                  window.location.href = `/recipes?category=${encodeURIComponent(
                    value
                  )}`;
                } else {
                  window.location.href = "/recipes";
                }
              } else {
                if (!value && clearFilters) {
                  clearFilters();
                } else {
                  setSelectedCategory(value || null);
                }
              }
            }}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all"
          >
            <option value="">{locale === "en" ? "All" : "সব"}</option>
            {categoryStats.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}{" "}
                {showChipCounts
                  ? `(${
                      locale === "en" ? cat.count : toBengaliNumber(cat.count)
                    })`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
