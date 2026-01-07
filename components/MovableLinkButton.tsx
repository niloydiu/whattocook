"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  const dragRef = useRef<{ dragging: boolean; moved: boolean; offsetX: number; offsetY: number }>({ dragging: false, moved: false, offsetX: 0, offsetY: 0 });
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [anchorSide, setAnchorSide] = useState<"left" | "right">("right");
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

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.dragging) return;
      const x = e.clientX - dragRef.current.offsetX;
      const y = e.clientY - dragRef.current.offsetY;
      const next = { x, y };
      // mark as moved when user drags more than a few pixels
      if (!dragRef.current.moved) {
        const dx = Math.abs((posRef.current?.x || 0) - x);
        const dy = Math.abs((posRef.current?.y || 0) - y);
        if (dx > 4 || dy > 4) dragRef.current.moved = true;
      }
      posRef.current = next;
      setPos(next);
    };
    const onUp = () => {
      if (dragRef.current.dragging) {
        dragRef.current.dragging = false;
        try {
          if (posRef.current) {
            // snap to left or right edge when released
            const btnW = 48;
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
            setPos(cur);
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

  const onClick = () => {
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
        style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: zIndexState, width: 48, height: 48, pointerEvents: 'auto', touchAction: 'none' }}
        className="bg-black text-white rounded-full shadow-md hover:opacity-95 flex items-center justify-center p-0 overflow-hidden"
      >
        <img src="/favicon.png" alt="menu" className="w-6 h-6 object-contain" />
      </button>

      {showMenu && (
        <div className="fixed inset-0 z-[99998]" onMouseDown={() => setShowMenu(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Anchored menu positioned near the button */}
          <div
            ref={menuRef}
            onMouseDown={(e) => e.stopPropagation()}
            style={(function () {
              const menuW = 320;
              const btnW = 48;
              const gap = 8;
              if (!pos) return { position: "fixed", left: 16, top: 16 } as React.CSSProperties;
              const winW = typeof window !== "undefined" ? window.innerWidth : 800;
              const winH = typeof window !== "undefined" ? window.innerHeight : 600;
              const top = Math.min(Math.max(8, pos.y), winH - 120);
              if (anchorSide === "left") {
                const left = Math.min(winW - 16 - menuW, pos.x + btnW + gap);
                return { position: "fixed", left, top, width: Math.min(menuW, winW - 32) } as React.CSSProperties;
              } else {
                const left = Math.max(16, pos.x - menuW - gap);
                // if too far left, fallback to right anchored
                return { position: "fixed", left, top, width: Math.min(menuW, winW - 32) } as React.CSSProperties;
              }
            })()}
            className="relative z-[99999] max-w-[90%] bg-white rounded-3xl shadow-2xl border border-slate-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src="/favicon.png" alt="logo" className="w-10 h-10 rounded-lg" />
                <div>
                  <div className="text-lg font-bold">whattoCook?</div>
                  <div className="text-sm text-slate-500">Quick actions</div>
                </div>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setShowMenu(false); router.push('/'); }}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition font-semibold"
              >
                Home
              </button>

              <button
                onClick={() => { setShowMenu(false); router.push('/request-recipe/submit'); }}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition font-semibold"
              >
                Report
              </button>

              <div className="pt-2 border-t border-slate-100 mt-2" />

              <div className="flex flex-col gap-2">
                <a
                  href="https://github.com/niloydiu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 rounded-xl hover:bg-slate-50 transition"
                >
                  GitHub
                </a>
                <a
                  href="https://x.com/niloykmohonta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 rounded-xl hover:bg-slate-50 transition"
                >
                  X (Twitter)
                </a>
                <a
                  href="https://www.linkedin.com/in/niloykumarmohonta000/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 rounded-xl hover:bg-slate-50 transition"
                >
                  LinkedIn
                </a>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setShowMenu(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
