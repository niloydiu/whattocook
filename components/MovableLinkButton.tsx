"use client";

import React, { useEffect, useRef, useState } from "react";

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
  const dragRef = useRef<{ dragging: boolean; offsetX: number; offsetY: number }>({ dragging: false, offsetX: 0, offsetY: 0 });
  const posRef = useRef<{ x: number; y: number } | null>(null);

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
      posRef.current = next;
      setPos(next);
    };
    const onUp = () => {
      if (dragRef.current.dragging) {
        dragRef.current.dragging = false;
        try {
          if (posRef.current) localStorage.setItem(key, JSON.stringify(posRef.current));
        } catch (e) {}
      }
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
    const rect = el.getBoundingClientRect();
    dragRef.current.dragging = true;
    dragRef.current.offsetX = e.clientX - rect.left;
    dragRef.current.offsetY = e.clientY - rect.top;
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const onClick = () => {
    try {
      if (typeof window !== "undefined") {
        const w = window.open(href, "_blank");
        if (w) try { w.opener = null; } catch (e) {}
      }
    } catch (_) {}
  };

  if (!pos) return null;

  return (
    <button
      ref={ref}
      onPointerDown={onPointerDown}
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 60, width: 48, height: 48 }}
      className="bg-black text-white rounded-full shadow-md hover:opacity-95 touch-none flex items-center justify-center p-0"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.089-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.468-2.381 1.236-3.221-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.98-.399 3-.405 1.02.006 2.043.139 3 .405 2.29-1.552 3.296-1.23 3.296-1.23.655 1.653.243 2.873.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.803 5.624-5.475 5.921.43.372.824 1.102.824 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    </button>
  );
}
