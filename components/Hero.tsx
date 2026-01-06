"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import IngredientSearch from "./IngredientSearch";

type Locale = "en" | "bn";

export default function Hero({
  pantry,
  onAdd,
  onRemove,
  onFind,
  locale = "en",
  totalRecipes,
}: {
  pantry: string[];
  onAdd: (s: string) => void;
  onRemove: (i: number) => void;
  onFind: () => void;
  locale?: Locale;
  totalRecipes: number;
}) {
  return (
    <section className="relative py-8 sm:py-10 md:py-12 lg:py-16">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-red-50/20 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-orange-50/20 rounded-full blur-2xl"
        />
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Compact Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-4 sm:mb-5 lg:mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Smart AI-Powered Recipes
            </span>
          </div>
        </motion.div>

        {/* Balanced Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-4 sm:mb-5 lg:mb-6"
        >
          {/* Chef Hat Above Title */}
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-block mb-3 sm:mb-4"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-tight">
            <span className="text-slate-800">
              {locale === "en" ? "whatto" : "কি"}
            </span>
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              {locale === "en" ? "Cook?" : "রান্না করব?"}
            </span>
          </h1>
        </motion.div>

        {/* Concise Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed text-center mb-6 sm:mb-7 lg:mb-8 px-2"
        >
          {locale === "en"
            ? "Transform your ingredients into delicious meals instantly with AI-powered recipe discovery."
            : "আপনার উপকরণগুলোকে এআই-চালিত রেসিপি আবিষ্কারের মাধ্যমে তৎক্ষণাৎ সুস্বাদু খাবারে পরিণত করুন।"}
        </motion.p>

        {/* Search Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-10"
        >
          <IngredientSearch
            selected={pantry}
            onAdd={onAdd}
            onRemove={onRemove}
            onFind={onFind}
            locale={locale}
          />
        </motion.div>

        {/* Minimal Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-7 lg:mt-8 text-xs sm:text-sm text-slate-500 px-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="font-medium">{totalRecipes}+ Recipes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span className="font-medium">Smart Matching</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            <span className="font-medium">AI Powered</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
