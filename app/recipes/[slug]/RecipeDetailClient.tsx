"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Users,
  ChefHat,
  Play,
  ArrowLeft,
  Eye,
  Youtube as YouTubeIcon,
  Printer,
  Flag,
  X,
  Heart,
  ShoppingCart,
  CheckCircle2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import ReportModal from "@/components/ReportModal";
import AlertModal from "@/components/AlertModal";
import { useActiveUser } from "@/hooks/useActiveUser";
import {
  toggleFavorite,
  getUserFavorites,
  toggleWishlistIngredient,
  getUserWishlist,
  startCooking,
} from "@/app/actions/user";

type Props = {
  recipe: any;
  videoStats: any;
};

export default function RecipeDetailClient({ recipe, videoStats }: Props) {
  const [locale, setLocale] = useState<"en" | "bn">("en");
  const [videoMode, setVideoMode] = useState<"hidden" | "modal" | "pip">(
    "hidden"
  );
  const [showReport, setShowReport] = useState(false);
  const { user } = useActiveUser();

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const setButtonLoading = (key: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: isLoading }));
  };

  const videoRef = useRef<HTMLIFrameElement | null>(null);
  const [pendingStart, setPendingStart] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlistNames, setWishlistNames] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const userId = user.id || user.email;
      getUserFavorites(userId).then((favs) => {
        setIsFavorite(favs.includes(recipe.id));
      });
      getUserWishlist(userId).then((list) => {
        setWishlistIds(
          list
            .filter((i) => i.ingredientId)
            .map((i) => i.ingredientId!) as number[]
        );
        setWishlistNames(list.map((i) => i.name_en));
      });
    }
  }, [user, recipe.id]);

  async function handleToggleFavorite() {
    if (!user) {
      setAlert({
        isOpen: true,
        title: t ? "Sign in required" : "সাইন ইন করুন",
        message: t
          ? "Please login to save favorites"
          : "পছন্দে যোগ করতে সাইন ইন করুন",
        type: "info",
      });
      return;
    }
    setButtonLoading("favorite", true);
    try {
      const userId = user.id || user.email;
      const res = await toggleFavorite(userId, recipe.id);
      if (res.success) {
        setIsFavorite(res.action === "added");
      }
    } finally {
      setButtonLoading("favorite", false);
    }
  }

  async function handleToggleWishlist(item: any) {
    if (!user) {
      setAlert({
        isOpen: true,
        title: t ? "Sign in required" : "সাইন ইন করুন",
        message: t
          ? "Please login to use wishlist"
          : "উইশলিস্ট ব্যবহার করতে সাইন ইন করুন",
        type: "info",
      });
      return;
    }
    const userId = user.id || user.email;
    setButtonLoading(`wishlist-${item.ingredient.id}`, true);
    try {
      const res = await toggleWishlistIngredient({
        userId,
        ingredientId: item.ingredient.id,
        name_en: item.ingredient.name_en,
        name_bn: item.ingredient.name_bn,
      });

      if (res.success) {
        if (res.action === "added") {
          setWishlistIds((prev) => [...prev, item.ingredient.id]);
          setWishlistNames((prev) => [...prev, item.ingredient.name_en]);
        } else {
          setWishlistIds((prev) =>
            prev.filter((id) => id !== item.ingredient.id)
          );
          setWishlistNames((prev) =>
            prev.filter((name) => name !== item.ingredient.name_en)
          );
        }
      }
    } finally {
      setButtonLoading(`wishlist-${item.ingredient.id}`, false);
    }
  }

  async function handleStartCooking() {
    if (!user) {
      setAlert({
        isOpen: true,
        title: t ? "Sign in required" : "সাইন ইন করুন",
        message: t
          ? "Please login to track cooking progress"
          : "রান্নার অগ্রগতি ট্র্যাক করতে সাইন ইন করুন",
        type: "info",
      });
      return;
    }
    setButtonLoading("cooking", true);
    try {
      const userId = user.id || user.email;
      const res = await startCooking(userId, recipe.id);
      if (res) {
        // Dispatch a custom event to notify the CookingTracker component
        window.dispatchEvent(new CustomEvent("refreshCookingProgress"));
        setAlert({
          isOpen: true,
          title: t ? "Cooking started" : "রান্না শুরু হয়েছে",
          message: t
            ? "Check the progress bubble at the bottom right."
            : "ডান নিচের বুদ্বুদে অগ্রগতি দেখুন।",
          type: "success",
        });
      }
    } finally {
      setButtonLoading("cooking", false);
    }
  }

  const [alert, setAlert] = React.useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "info" | "success" | "error",
  });

  function toBengaliNumber(n: number) {
    const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return String(n)
      .split("")
      .map((d) => map[+d] ?? d)
      .join("");
  }

  function parseTimestamp(timestamp: string | null): number | null {
    if (!timestamp) return null;
    const parts = timestamp.split(":");
    if (parts.length === 2) {
      const [min, sec] = parts;
      return parseInt(min) * 60 + parseInt(sec);
    } else if (parts.length === 3) {
      const [hr, min, sec] = parts;
      return parseInt(hr) * 3600 + parseInt(min) * 60 + parseInt(sec);
    }
    return null;
  }

  const t = locale === "en";

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Premium Header */}
      <nav className="sticky top-0 z-[60] bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 sm:h-16 lg:h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 flex-1 min-w-0">
            <Link
              href="/recipes"
              className="flex items-center gap-1.5 sm:gap-2 text-slate-600 hover:text-red-600 transition-colors px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl hover:bg-slate-50 flex-shrink-0"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              <span className="hidden sm:inline text-xs sm:text-sm font-bold">
                {t ? "Back" : "ফিরুন"}
              </span>
            </Link>

            <div className="h-5 sm:h-6 w-px bg-slate-200 hidden sm:block" />

            <h1 className="text-xs sm:text-sm lg:text-lg font-bold text-slate-800 truncate">
              {t ? recipe.title_en : recipe.title_bn}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 flex-shrink-0">
            <div className="flex items-center bg-slate-100/50 p-0.5 sm:p-1 rounded-lg sm:rounded-xl backdrop-blur-sm border border-slate-200/50">
              <button
                onClick={() => setLocale("en")}
                className={`px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-black transition-all ${
                  t
                    ? "bg-white text-red-600 shadow-md"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale("bn")}
                className={`px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-black transition-all ${
                  !t
                    ? "bg-white text-red-600 shadow-md"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                BN
              </button>
            </div>

            <button
              onClick={handleToggleFavorite}
              disabled={loadingStates["favorite"]}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-95 border-2 shadow-sm hover:shadow-md ${
                isFavorite
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200"
              } ${loadingStates["favorite"] ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loadingStates["favorite"] ? (
                <Loader2 size={18} className="animate-spin sm:w-5 sm:h-5" />
              ) : (
                <Heart
                  size={18}
                  className="sm:w-5 sm:h-5"
                  fill={isFavorite ? "currentColor" : "none"}
                />
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-10">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8 lg:space-y-12">
            {/* Hero Section */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-sm">
                  {recipe.cuisine}
                </span>
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-sm">
                  {recipe.category}
                </span>
                <span
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-sm ${
                    recipe.difficulty === "Easy"
                      ? "bg-emerald-50 text-emerald-700"
                      : recipe.difficulty === "Medium"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {recipe.difficulty}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 leading-tight">
                {t ? recipe.title_en : recipe.title_bn}
              </h1>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {[
                  {
                    icon: Clock,
                    label: t ? "Prep Time" : "প্রস্তুত সময়",
                    value: t
                      ? `${recipe.prep_time} mins`
                      : `${toBengaliNumber(recipe.prep_time)} মিনিট`,
                  },
                  {
                    icon: ChefHat,
                    label: t ? "Cook Time" : "রান্নার সময়",
                    value: t
                      ? `${recipe.cook_time} mins`
                      : `${toBengaliNumber(recipe.cook_time)} মিনিট`,
                  },
                  {
                    icon: Users,
                    label: t ? "Servings" : "পরিবেশন",
                    value: t
                      ? `${recipe.servings} People`
                      : `${toBengaliNumber(recipe.servings)} জন`,
                  },
                  {
                    icon: Eye,
                    label: t ? "Views" : "দেখা হয়েছে",
                    value: videoStats?.viewCount?.toLocaleString() || "---",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-2"
                  >
                    <stat.icon size={20} className="text-red-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <span className="font-black text-lg text-slate-900">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Media Section */}
            <div className="relative group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative aspect-[16/9] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200"
              >
                <img
                  src={recipe.image || "/recipe-placeholder.jpg"}
                  alt={t ? recipe.title_en : recipe.title_bn}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Floating Overlay Controls */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6 md:p-8 lg:p-10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {recipe.youtube_id && (
                      <button
                        onClick={() => {
                          setVideoMode("modal");
                          setButtonLoading("watch", true);
                          setTimeout(() => setButtonLoading("watch", false), 1000);
                        }}
                        disabled={loadingStates["watch"]}
                        className="h-10 sm:h-14 px-3 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm text-slate-900 flex items-center gap-1.5 sm:gap-3 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-xl border-2 border-white/50"
                      >
                        {loadingStates["watch"] ? (
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white flex items-center justify-center transition-all group-hover:scale-110">
                            <Play
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              fill="currentColor"
                            />
                          </div>
                        )}
                        <span className="hidden sm:inline">
                          {t ? "WATCH RECIPE VIDEO" : "রেসিপি ভিডিও দেখুন"}
                        </span>
                        <span className="sm:hidden">
                          {t ? "WATCH" : "দেখুন"}
                        </span>
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleStartCooking}
                        disabled={loadingStates["cooking"]}
                        className="h-10 sm:h-14 px-3 sm:px-6 lg:px-8 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm flex items-center gap-1.5 sm:gap-3 transition-all shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-70"
                      >
                        {loadingStates["cooking"] ? (
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <ChefHat className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                        )}
                        <span className="hidden sm:inline">
                          {t ? "COOK MODE" : "কুকিং মোড"}
                        </span>
                        <span className="sm:hidden">{t ? "COOK" : "কুক"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setButtonLoading("print", true);
                          window.open(`/recipes/${recipe.slug}/print`, "_blank");
                          setTimeout(() => setButtonLoading("print", false), 2000);
                        }}
                        disabled={loadingStates["print"]}
                        className="h-10 sm:h-14 px-3 sm:px-4 lg:px-6 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm text-slate-900 flex items-center gap-1.5 sm:gap-2 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-xl border-2 border-white/50"
                      >
                        {loadingStates["print"] ? (
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <Printer className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                        )}
                        <span className="hidden md:inline">
                          {t ? "PRINT" : "প্রিন্ট"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowReport(true)}
                    className="w-10 h-10 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md text-white rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-red-600/20 hover:text-red-500 transition-all border border-white/20"
                    title={t ? "Report Problem" : "রিপোর্ট করুন"}
                  >
                    <Flag className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Instructions Section */}
            <div className="space-y-6 sm:space-y-8 lg:space-y-10 pt-2 sm:pt-4">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
                      {t ? "Preparation Steps" : "প্রস্তুত প্রণালী"}
                    </h2>
                    <p className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                      {t
                        ? `${recipe.steps.length} Steps Total`
                        : `মোট ${toBengaliNumber(recipe.steps.length)}টি ধাপ`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:gap-5 lg:gap-6">
                {recipe.steps.map((step: any, idx: number) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3 sm:gap-4 lg:gap-6">
                      <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-lg">
                        {t ? idx + 1 : toBengaliNumber(idx + 1)}
                      </div>
                      <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] sm:text-[10px] font-black text-red-600 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                            {t ? "Phase" : "পর্যায়"}{" "}
                            {t
                              ? step.step_number
                              : toBengaliNumber(step.step_number)}
                          </span>
                          {step.timestamp && recipe.youtube_id && (
                            <button
                              onClick={() => {
                                const seconds = parseTimestamp(step.timestamp);
                                if (seconds !== null) setPendingStart(seconds);
                                setVideoMode("pip");
                              }}
                              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] sm:text-xs font-bold text-slate-700 transition-all active:scale-95"
                            >
                              <YouTubeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span className="tabular-nums">
                                {step.timestamp}
                              </span>
                            </button>
                          )}
                        </div>
                        <p className="text-slate-700 font-medium leading-relaxed text-sm sm:text-base">
                          {t ? step.instruction_en : step.instruction_bn}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Content Notes */}
            {recipe.blogContent && (
              <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-700/50">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-red-400">
                    <Eye size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                      {t ? "Chef's Pro Tips" : "শেফের প্রোটিন টিপস"}
                    </h3>
                    <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
                      {t ? "Making it perfect" : "নিখুঁত করার উপায়"}
                    </p>
                  </div>
                </div>

                <div className="space-y-8 text-slate-300 font-medium leading-relaxed">
                  <p className="text-lg italic text-white/90">
                    "
                    {t
                      ? recipe.blogContent.intro_en
                      : recipe.blogContent.intro_bn}
                    "
                  </p>

                  <div className="grid md:grid-cols-2 gap-8 border-t border-white/10 pt-8">
                    <div>
                      <h4 className="font-black text-white mb-3 text-sm uppercase tracking-wider">
                        {t ? "Key Success Factor" : "সফলতার মূল সূত্র"}
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {t
                          ? recipe.blogContent.what_makes_it_special_en
                          : recipe.blogContent.what_makes_it_special_bn}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-black text-white mb-3 text-sm uppercase tracking-wider">
                        {t ? "Note to Cook" : "রান্নার প্রয়োজনীয় নোট"}
                      </h4>
                      <p className="text-slate-400 text-sm">
                        Keep an eye on the heat consistency for the best
                        results.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar: Ingredients */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-slate-100 shadow-lg">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center shadow-sm">
                    <ShoppingCart size={24} className="text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      {t ? "Ingredients" : "উপকরণ"}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400">
                      {t ? "Everything you need" : "যা যা প্রয়োজন"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                {recipe.ingredients.map((item: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50/80 transition-all border-2 border-transparent hover:border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {item.ingredient.img ? (
                            <img
                              src={item.ingredient.img}
                              alt={
                                t
                                  ? item.ingredient.name_en
                                  : item.ingredient.name_bn
                              }
                              loading="lazy"
                              decoding="async"
                              className="w-12 h-12 rounded-xl object-cover bg-slate-100 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-sm">
                              <ShoppingCart
                                size={18}
                                className="text-slate-400"
                              />
                            </div>
                          )}
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-md">
                            {idx + 1}
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {t
                              ? item.ingredient.name_en
                              : item.ingredient.name_bn}
                          </p>
                          <p className="text-[10px] font-black text-red-500">
                            {t
                              ? item.quantity
                              : toBengaliNumber(
                                  parseInt(item.quantity) || 0
                                )}{" "}
                            {t ? item.unit_en : item.unit_bn}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleWishlist(item)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 shadow-sm hover:shadow-md active:scale-95 ${
                          wishlistIds.includes(item.ingredient.id) ||
                          wishlistNames.includes(item.ingredient.name_en)
                            ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-600 shadow-lg"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-200"
                        }`}
                      >
                        <ShoppingCart
                          size={18}
                          fill={
                            wishlistIds.includes(item.ingredient.id) ||
                            wishlistNames.includes(item.ingredient.name_en)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 pt-10 border-t-2 border-slate-200">
                <button
                  onClick={handleStartCooking}
                  className="w-full h-16 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all active:scale-95"
                >
                  <ChefHat
                    size={20}
                    className="group-hover:rotate-12 transition-transform"
                  />
                  {t ? "GET STARTED COOKING" : "রান্না শুরু করুন"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Persistent & Floating Video Experience */}
      <AnimatePresence>
        {videoMode !== "hidden" && (
          <>
            {/* Modal Overlay: Only shown in modal mode */}
            {videoMode === "modal" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md"
                onClick={() => setVideoMode("hidden")}
              >
                <motion.div
                  layoutId="video-player"
                  className="relative w-full max-w-5xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <VideoControls
                    onClose={() => setVideoMode("hidden")}
                    onMinimize={() => setVideoMode("pip")}
                    isPip={false}
                  />
                  {recipe.youtube_id && (
                    <iframe
                      ref={videoRef}
                      src={`https://www.youtube.com/embed/${recipe.youtube_id}`}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      title="YouTube player"
                    />
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* PiP Mode: Draggable corner window */}
            {videoMode === "pip" && (
              <motion.div
                layoutId="video-player"
                drag
                dragConstraints={{
                  left: -1000,
                  right: 0,
                  top: -1000,
                  bottom: 0,
                }} // Simple constraints
                className="fixed bottom-6 right-6 z-[100] w-[320px] md:w-[480px] aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white cursor-move"
                initial={{ opacity: 0, scale: 0.8, y: 100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 100 }}
              >
                <VideoControls
                  onClose={() => setVideoMode("hidden")}
                  onMaximize={() => setVideoMode("modal")}
                  isPip={true}
                />
                {recipe.youtube_id && (
                  <iframe
                    ref={videoRef}
                    src={`https://www.youtube.com/embed/${recipe.youtube_id}`}
                    className="w-full h-full" // allow interaction
                    allow="autoplay; encrypted-media; picture-in-picture"
                    title="YouTube player"
                  />
                )}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert((s) => ({ ...s, isOpen: false }))}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      {showReport && (
        <ReportModal
          onClose={() => setShowReport(false)}
          recipeId={recipe.id}
        />
      )}
    </div>
  );
}

// Sub-component for video controls to avoid repetition
function VideoControls({ onClose, onMinimize, onMaximize, isPip }: any) {
  return (
    <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-black text-white uppercase tracking-widest">
          Live Recipe
        </span>
      </div>
      <div className="flex items-center gap-2">
        {isPip ? (
          <button
            onClick={onMaximize}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            title="Full View"
          >
            <Eye size={16} />
          </button>
        ) : (
          <button
            onClick={onMinimize}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            title="Minimize to PiP"
          >
            <ChevronDown size={16} />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
