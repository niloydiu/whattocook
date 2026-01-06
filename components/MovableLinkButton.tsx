"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, ExternalLink, Linkedin, Home, ChefHat, X } from "lucide-react";
import Link from "next/link";

const XIcon = ({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

export default function MovableLinkButton({
  href = "https://niloykm.vercel.app",
  label = "Developer Menu",
}: {
  href?: string;
  label?: string;
}) {
  const key = "wtc_movable_menu_v2";
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragThreshold = 5; // pixels moved before considering it a drag

  const calculateMenuPosition = (buttonX: number, buttonY: number) => {
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const buttonSize = 56;
    const menuWidth = 280;
    const menuHeight = 240;
    const gap = 12;

    let menuX = buttonX;
    let menuY = buttonY;
    let side: "top" | "bottom" | "left" | "right" = "bottom";

    // Check if there's space below
    if (buttonY + buttonSize + gap + menuHeight < winH) {
      side = "bottom";
      menuY = buttonY + buttonSize + gap;
    }
    // Check if there's space above
    else if (buttonY - gap - menuHeight > 0) {
      side = "top";
      menuY = buttonY - gap - menuHeight;
    }
    // Check if there's space on the right
    else if (buttonX + buttonSize + gap + menuWidth < winW) {
      side = "right";
      menuX = buttonX + buttonSize + gap;
      menuY = Math.max(gap, Math.min(buttonY, winH - menuHeight - gap));
    }
    // Default to left
    else {
      side = "left";
      menuX = buttonX - gap - menuWidth;
      menuY = Math.max(gap, Math.min(buttonY, winH - menuHeight - gap));
    }

    // Adjust horizontal position if menu goes off screen
    if (side === "top" || side === "bottom") {
      menuX = Math.max(gap, Math.min(buttonX, winW - menuWidth - gap));
    }

    return { x: menuX, y: menuY, side };
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      let initialPos;
      if (raw) {
        initialPos = JSON.parse(raw);
      } else {
        const defaultX = Math.max(16, (window.innerWidth || 800) - 72);
        const defaultY = 100;
        initialPos = { x: defaultX, y: defaultY };
      }
      setPos(initialPos);
    } catch (e) {
      const fallback = { x: 16, y: 100 };
      setPos(fallback);
    }
  }, []);

  const handleClick = () => {
    if (!isDragging) {
      setIsOpen(!isOpen);
    }
  };

  if (!pos) return null;

  const menuItems = [
    {
      icon: Home,
      label: "Home",
      href: "/",
      color: "from-slate-500 to-slate-600",
      internal: true,
    },
    {
      icon: ChefHat,
      label: "Request",
      href: "/request-recipe",
      color: "from-red-500 to-orange-500",
      internal: true,
    },
    {
      icon: ExternalLink,
      label: "Portfolio",
      href: "https://niloykm.vercel.app",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Github,
      label: "GitHub",
      href: "https://github.com/niloykm",
      color: "from-slate-700 to-slate-800",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: "https://linkedin.com/in/niloykm",
      color: "from-blue-600 to-blue-700",
    },
    {
      icon: XIcon,
      label: "X (Twitter)",
      href: "https://x.com/niloykmohonta",
      color: "from-slate-800 to-slate-900",
    },
  ];

  const menuPos = calculateMenuPosition(pos.x, pos.y);

  return (
    <>
      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              x: menuPos.x,
              y: menuPos.y,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: menuPos.x,
              y: menuPos.y,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              x: menuPos.x,
              y: menuPos.y,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
            className="fixed z-[9999] w-[280px] bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <span className="text-sm font-bold text-slate-800">
                Quick Links
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={14} className="text-slate-500" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-3 grid grid-cols-2 gap-2">
              {menuItems.map((item, idx) => {
                const content = (
                  <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 group">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200`}
                    >
                      <item.icon size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">
                      {item.label}
                    </span>
                  </div>
                );

                if ((item as any).internal) {
                  return (
                    <Link
                      key={idx}
                      href={(item as any).href!}
                      onClick={() => setIsOpen(false)}
                      className="focus:outline-none"
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <a
                    key={idx}
                    href={(item as any).href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="focus:outline-none"
                  >
                    {content}
                  </a>
                );
              })}
            </div>

            {/* Close Button */}
            <div className="px-4 pb-4 flex justify-center">
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl transition-colors duration-200 font-medium text-sm"
              >
                <X size={16} />
                Close Menu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draggable Button */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        initial={false}
        animate={{ x: pos.x, y: pos.y }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(_, info) => {
          const moved = Math.abs(info.offset.x) + Math.abs(info.offset.y);
          if (moved > dragThreshold) {
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            const buttonSize = 56;
            const margin = 16;

            const newX = pos.x + info.offset.x;
            const newY = pos.y + info.offset.y;

            // Smart edge snapping
            const snapToLeft = newX < winW / 2;
            const snappedX = snapToLeft ? margin : winW - buttonSize - margin;

            const finalPos = {
              x: snappedX,
              y: Math.max(margin, Math.min(newY, winH - buttonSize - margin)),
            };

            setPos(finalPos);
            try {
              localStorage.setItem(key, JSON.stringify(finalPos));
            } catch (e) {}
          }

          setTimeout(() => setIsDragging(false), 100);
        }}
        className="fixed z-[9999] select-none"
        style={{
          width: 56,
          height: 56,
          touchAction: "none",
        }}
      >
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: isDragging ? 1 : 1.05 }}
          whileTap={{ scale: isDragging ? 1 : 0.95 }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-white to-slate-50 backdrop-blur-xl shadow-xl hover:shadow-2xl border-2 border-white/60 flex items-center justify-center transition-all duration-200 cursor-grab active:cursor-grabbing relative overflow-hidden group"
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 via-orange-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Content */}
          <div className="relative z-10">
            <img
              src="/favicon.png"
              alt="Menu"
              draggable={false}
              className="w-7 h-7 object-contain drop-shadow-md pointer-events-none select-none"
              style={{ userSelect: "none" }}
            />
          </div>
        </motion.button>
      </motion.div>
    </>
  );
}
