"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function FloatingNav() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.5,
      }}
      className="fixed left-4 bottom-6 z-[130]"
    >
      <Link
        href="/"
        aria-label="Home"
        className="group relative w-12 h-12 flex items-center justify-center rounded-2xl bg-white/95 backdrop-blur-xl shadow-lg hover:shadow-xl text-slate-900 border border-slate-200/60 hover:border-red-300 transition-all duration-300 overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        />
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Home
            size={20}
            className="relative z-10 text-slate-700 group-hover:text-red-600 transition-colors duration-300"
          />
        </motion.div>

        {/* Subtle pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-red-200/50"
          initial={{ scale: 1, opacity: 0 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </Link>
    </motion.div>
  );
}
