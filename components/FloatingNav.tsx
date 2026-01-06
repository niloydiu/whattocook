"use client";

import React from "react";
import Link from "next/link";

export default function FloatingNav() {
  return (
    <div className="fixed left-4 bottom-6 z-[140]">
      <Link href="/" aria-label="Home" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/95 shadow-md hover:shadow-lg text-slate-900">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 10.5L12 4l9 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 10.5v7a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}
