"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Flag,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  X,
  Plus,
} from "lucide-react";

export default function MovableLinkButton({
  href = "https://niloykm.vercel.app",
  label = "Portfolio",
}: {
  href?: string;
  label?: string;
}) {
  const key = "wtc_movable_github_v1";
  const ref = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [zIndexState, setZIndexState] = useState<number>(9999);
  const dragRef = useRef<{
    dragging: boolean;
    moved: boolean;
    offsetX: number;
    offsetY: number;
  }>({ dragging: false, moved: false, offsetX: 0, offsetY: 0 });
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [anchorSide, setAnchorSide] = useState<"left" | "right">("right");
  const rafRef = useRef<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // run only on client
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPos(parsed);
        posRef.current = parsed;
      } else {
        // default to top-right corner with some margin
        const defaultX = Math.max(16, (window.innerWidth || 800) - 72);
        const defaultY = 20;
        const initial = { x: defaultX, y: defaultY };
        setPos(initial);
        posRef.current = initial;
      }
    } catch (e) {
      const fallback = { x: 16, y: 20 };
      setPos(fallback);
      posRef.current = fallback;
    }
  }, []);

  // apply transform when pos state changes (non-dragging)
  useEffect(() => {
    if (!pos || !ref.current) return;
    // use transform for smoothness
    ref.current.style.left = "0px";
    ref.current.style.top = "0px";
    ref.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
  }, [pos]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.dragging) return;
      const rawX = e.clientX - dragRef.current.offsetX;
      const rawY = e.clientY - dragRef.current.offsetY;
      // clamp to viewport so the button stays visible while dragging
      const winW = window.innerWidth || 800;
      const winH = window.innerHeight || 600;
      const btnW = 52;
      const margin = 8;
      const x = Math.min(Math.max(margin, rawX), winW - btnW - margin);
      const y = Math.min(Math.max(margin, rawY), winH - btnW - margin);
      const next = { x, y };
      // mark as moved when user drags more than a few pixels
      if (!dragRef.current.moved) {
        const dx = Math.abs((posRef.current?.x || 0) - x);
        const dy = Math.abs((posRef.current?.y || 0) - y);
        if (dx > 4 || dy > 4) dragRef.current.moved = true;
      }
      posRef.current = next;

      // apply transform directly for smooth updates (no rerender)
      if (ref.current) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          ref.current!.style.transform = `translate3d(${next.x}px, ${next.y}px, 0)`;
        });
      }
    };
    const onUp = () => {
      if (dragRef.current.dragging) {
        dragRef.current.dragging = false;
        try {
          if (posRef.current) {
            // snap to left or right edge when released
            const btnW = 52; // match actual button size
            const margin = 12;
            const winW = window.innerWidth || 800;
            const cur = { ...posRef.current };
            const centerX = cur.x + btnW / 2;
            if (centerX < winW / 2) {
              cur.x = margin;
              setAnchorSide("left");
            } else {
              cur.x = Math.max(margin, winW - btnW - margin);
              setAnchorSide("right");
            }
            // clamp vertical position
            const winH = window.innerHeight || 600;
            cur.y = Math.min(Math.max(12, cur.y), winH - btnW - 12);
            posRef.current = cur;
            // update state once on release for reactivity
            setPos(cur);
            // ensure final transform applied
            if (ref.current)
              ref.current.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
            localStorage.setItem(key, JSON.stringify(cur));
          }
        } catch (e) {}
      }
      // restore z-index after interaction
      setZIndexState(9999);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    e.stopPropagation();
    setZIndexState(99999);
    const rect = el.getBoundingClientRect();
    dragRef.current.dragging = true;
    dragRef.current.moved = false;
    dragRef.current.offsetX = e.clientX - rect.left;
    dragRef.current.offsetY = e.clientY - rect.top;
    try {
      // capture pointer on the actual button element
      el.setPointerCapture?.(e.pointerId);
    } catch (_) {}
  };

  const onClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      // ignore click if the user dragged the button
      if (dragRef.current.moved) {
        dragRef.current.moved = false;
        return;
      }

      // toggle menu instead of redirecting
      setShowMenu((s) => !s);
    } catch (_) {}
  };

  if (!pos) return null;

  return (
    <>
      <button
        ref={ref}
        onPointerDown={onPointerDown}
        onClick={onClick}
        title={label}
        aria-label={label}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: zIndexState,
          width: 52,
          height: 52,
          pointerEvents: "auto",
          touchAction: "none",
          willChange: "transform",
        }}
        className="bg-white/80 backdrop-blur-xl text-slate-800 rounded-full shadow-xl hover:shadow-2xl hover:bg-white active:scale-95 transition-all flex items-center justify-center p-0 overflow-hidden group border border-white/50"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <img
          src="/favicon.png"
          alt="menu"
          draggable={false}
          className="w-7 h-7 object-contain relative z-10 transition-transform group-hover:scale-110"
        />
      </button>

      <AnimatePresence>
        {showMenu && (
          <div className="fixed inset-0 z-[99998]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-md"
              onMouseDown={() => setShowMenu(false)}
            />

            {/* Anchored menu positioned near the button */}
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onMouseDown={(e) => e.stopPropagation()}
              style={(function () {
                const size = 320;
                const btnW = 52;
                const gap = 20;
                if (!pos)
                  return {
                    position: "fixed",
                    left: 16,
                    top: 16,
                  } as React.CSSProperties;
                const winW =
                  typeof window !== "undefined" ? window.innerWidth : 800;
                const winH =
                  typeof window !== "undefined" ? window.innerHeight : 600;

                // Position logic to stay within viewport
                let top = pos.y - size / 2 + btnW / 2;
                let left =
                  anchorSide === "left"
                    ? pos.x + btnW + gap
                    : pos.x - size - gap;

                top = Math.max(16, Math.min(top, winH - size - 16));
                left = Math.max(16, Math.min(left, winW - size - 16));

                return {
                  position: "fixed",
                  left,
                  top,
                  width: size,
                  height: size,
                } as React.CSSProperties;
              })()}
              className="relative z-[99999] bg-white/40 backdrop-blur-[32px] backdrop-saturate-[180%] rounded-full shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-white/40 flex items-center justify-center p-0 overflow-visible"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* 1. HOME - Top */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push("/");
                  }}
                  className="absolute transition-all duration-300 hover:scale-110 active:scale-90 shadow-[0_10px_25px_rgba(79,70,229,0.15)] rounded-full group"
                  style={{ transform: "translate(0px, -100px)" }}
                >
                  <div className="w-16 h-16 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center border border-indigo-100/50">
                    <Home size={28} strokeWidth={2.5} />
                  </div>
                </button>

                {/* 2. REPORT - Top Right */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push("/request-recipe/submit");
                  }}
                  className="absolute transition-all duration-300 hover:scale-110 active:scale-90 shadow-[0_10px_25px_rgba(225,29,72,0.15)] rounded-full"
                  style={{ transform: "translate(86.6px, -50px)" }}
                >
                  <div className="w-16 h-16 rounded-full bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center border border-rose-100/50">
                    <Flag size={28} strokeWidth={2.5} />
                  </div>
                </button>

                {/* 3. GITHUB - Bottom Right */}
                <a
                  href="https://github.com/niloydiu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute transition-all duration-300 hover:scale-110 active:scale-90 shadow-[0_10px_25px_rgba(15,23,42,0.2)] rounded-full"
                  style={{ transform: "translate(86.6px, 50px)" }}
                >
                  <div className="w-16 h-16 rounded-full bg-[#0F172A] text-white flex items-center justify-center border border-slate-700">
                    <Github size={28} strokeWidth={2} />
                  </div>
                </a>

                {/* 4. PORTFOLIO - Bottom */}
                <a
                  href="https://niloykm.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute transition-all duration-300 hover:scale-110 active:scale-90 shadow-[0_10px_25px_rgba(0,0,0,0.06)] rounded-full"
                  style={{ transform: "translate(0px, 100px)" }}
                >
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-slate-100 overflow-hidden p-3 bg-slate-50">
                    <img
                      src="/favicon.png"
                      alt="portfolio"
                      className="w-full h-full object-contain filter "
                    />
                  </div>
                </a>

                {/* 5. LINKEDIN - Bottom Left */}
                <a
                  href="https://www.linkedin.com/in/niloykumarmohonta000/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute transition-all duration-300 hover:scale-110 active:scale-90 shadow-[0_10px_25px_rgba(10,102,194,0.2)] rounded-full"
                  style={{ transform: "translate(-86.6px, 50px)" }}
                >
                  <div className="w-16 h-16 rounded-full bg-[#0A66C2] text-white flex items-center justify-center border border-white/20">
                    <Linkedin size={26} fill="currentColor" strokeWidth={0} />
                  </div>
                </a>

                {/* 6. X - Top Left */}
                <a
                  href="https://x.com/niloykmohonta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute transition-all duration-300 hover:scale-110 active:scale-90 shadow-[0_20px_40px_rgba(0,0,0,0.15)] rounded-full"
                  style={{ transform: "translate(-86.6px, -50px)" }}
                >
                  <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center border border-white/10">
                    <Twitter size={26} fill="currentColor" strokeWidth={0} />
                  </div>
                </a>

                {/* CENTRAL CLOSE BUTTON */}
                <button
                  onClick={() => setShowMenu(false)}
                  className="absolute transition-all duration-300 hover:scale-110 active:scale-95 group z-50 shadow-[0_5px_15px_rgba(0,0,0,0.08)]"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-red-500 border border-slate-100 transition-colors">
                    <X size={24} strokeWidth={3} />
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
