"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, MessageSquare, Flag } from "lucide-react";

export default function FloatingNav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(24);
  const [rightOffset, setRightOffset] = useState(16);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Respect users' reduced-motion preference
  useEffect(() => {
    try {
      const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
      setReduceMotion(Boolean(mq && mq.matches));
      const handler = () => setReduceMotion(Boolean(mq && mq.matches));
      mq?.addEventListener?.("change", handler);
      return () => mq?.removeEventListener?.("change", handler);
    } catch (e) {
      // ignore
    }
  }, []);

  // Compute offset to avoid overlapping page footers / pagination
  const recomputeOffset = useCallback(() => {
    try {
      const winH = window.innerHeight || 800;
      const winW = window.innerWidth || 1200;
      // Try to detect common pagination/footer areas
      const candidates = [
        document.getElementById("pagination"),
        document.querySelector(".pagination"),
        document.querySelector("footer"),
      ];
      let extra = 0;
      for (const el of candidates) {
        if (el && el.getBoundingClientRect) {
          const r = el.getBoundingClientRect();
          // If element appears near the bottom, compute how much to lift the FAB
          if (r.top < winH && r.bottom >= winH - 120) {
            extra = Math.max(extra, Math.min(160, Math.ceil(winH - r.top) + 16));
          }
        }
      }
      setBottomOffset(24 + extra);

      // Detect other fixed elements near bottom-right (chat toggle, trackers)
      try {
        let extraRight = 0;

        const chatBtn = document.getElementById("wtc-chat-toggle");
        if (chatBtn && (chatBtn as HTMLElement).getBoundingClientRect) {
          const cr = (chatBtn as HTMLElement).getBoundingClientRect();
          if (cr.bottom >= winH - 120 && cr.right >= winW - 120) {
            extraRight = Math.max(extraRight, Math.ceil(cr.width + 12));
          }
        }

        // scan other fixed elements and consider small floating controls
        const fixedEls = Array.from(document.querySelectorAll(".fixed")) as HTMLElement[];
        for (const el of fixedEls) {
          if (!el || !el.getBoundingClientRect) continue;
          const r = el.getBoundingClientRect();
          if (r.width > 220) continue; // skip large overlays
          if (r.bottom >= winH - 120 && r.right >= winW - 120) {
            extraRight = Math.max(extraRight, Math.ceil(r.width + 12));
          }
        }

        setRightOffset(16 + extraRight);
      } catch (e) {
        setRightOffset(16);
      }
    } catch (e) {
      setBottomOffset(24);
      setRightOffset(16);
    }
  }, []);

  useEffect(() => {
    recomputeOffset();
    window.addEventListener("resize", recomputeOffset);
    window.addEventListener("scroll", recomputeOffset, { passive: true });
    return () => {
      window.removeEventListener("resize", recomputeOffset);
      window.removeEventListener("scroll", recomputeOffset);
    };
  }, [recomputeOffset]);

  const toggle = () => setOpen((s) => !s);

  // Actions
  const goHome = () => router.push("/");
  const goReport = () => router.push("/request-recipe/submit");
  const openChat = () => {
    // Programmatically click the ChatBot toggle if available
    try {
      const btn = document.getElementById("wtc-chat-toggle");
      if (btn) btn.click();
      else window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch (e) {}
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div
      style={{ right: rightOffset, bottom: bottomOffset, zIndex: 140 }}
      className="fixed pointer-events-none"
    >
      <div className="flex items-end flex-col gap-3 pointer-events-auto">
        {/* Expanded mini-menu */}
        {open && (
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col items-center gap-3 mr-2"
          >
            <button
              onClick={() => {
                setOpen(false);
                goHome();
              }}
              aria-label="Home"
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-slate-100"
            >
              <Home size={18} className="text-slate-700" />
            </button>

            <button
              onClick={() => {
                setOpen(false);
                goReport();
              }}
              aria-label="Request recipe"
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-slate-100"
            >
              <Flag size={18} className="text-rose-500" />
            </button>

            <button
              onClick={() => {
                setOpen(false);
                openChat();
              }}
              aria-label="Open chat"
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-slate-100"
            >
              <MessageSquare size={18} className="text-amber-500" />
            </button>
          </motion.div>
        )}

        {/* FAB */}
        <button
          onClick={toggle}
          onKeyDown={onKeyDown}
          aria-haspopup="true"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open quick actions"}
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white p-3 shadow-xl hover:scale-105 transition-transform"
        >
          <motion.div
            initial={reduceMotion ? undefined : { scale: 0.95, rotate: 0 }}
            animate={
              reduceMotion
                ? undefined
                : { scale: open ? 1.05 : 1, rotate: open ? 45 : 0 }
            }
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <MessageSquare className="w-5 h-5" />
          </motion.div>
        </button>
      </div>
    </div>
  );
}
