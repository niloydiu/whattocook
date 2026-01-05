"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChefHat, Sparkles } from "lucide-react";
import IngredientSearch from "./IngredientSearch";

type Locale = "en" | "bn";

export default function Hero({
  pantry,
  onAdd,
  onRemove,
  onFind,
  locale = "en",
}: {
  pantry: string[];
  onAdd: (s: string) => void;
  onRemove: (i: number) => void;
  onFind: () => void;
  locale?: Locale;
}) {
  return (
    <section className="relative py-16 md:py-24">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-100/50 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/50 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-50/40 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-medium mb-6 border border-red-100"
        >
          <Sparkles size={14} />
          <span>
            {locale === "en"
              ? "AI-Powered Recipe Matching"
              : "এআই-চালিত রেসিপি ম্যাচিং"}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
          style={{
            fontFamily:
              locale === "bn" ? "Hind Siliguri, sans-serif" : undefined,
          }}
        >
          <span className="text-slate-900 block md:inline">
            {locale === "en" ? "whatto" : "কি"}
          </span>
          <span className="text-gradient block md:inline">
            {locale === "en" ? "Cook?" : "রান্না করব?"}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed px-4"
        >
          {locale === "en"
            ? "Turn your pantry ingredients into delicious meals. Just type what you have and let our AI find the perfect recipe for you."
            : "আপনার রান্নাঘরের উপকরণ দিয়ে তৈরি করুন সুস্বাদু খাবার। আপনার যা আছে তা লিখুন এবং আমাদের এআই আপনার জন্য সেরা রেসিপি খুঁজে দেবে।"}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
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
      </div>
    </section>
  );
}
