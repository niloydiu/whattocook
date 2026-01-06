"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle2, Info } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
}: AlertModalProps) {
  const colors = {
    success: "text-green-600",
    error: "text-red-600",
    info: "text-blue-600",
  };

  const icons = {
    success: <CheckCircle2 size={48} />,
    error: <AlertCircle size={48} />,
    info: <Info size={48} />,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-100/80 p-8 max-w-md w-full"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div
                className={`mb-6 p-5 rounded-2xl shadow-sm ${
                  type === "success"
                    ? "bg-gradient-to-br from-green-100 to-emerald-100 text-green-600"
                    : type === "error"
                    ? "bg-gradient-to-br from-red-100 to-orange-100 text-red-600"
                    : "bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600"
                }`}
              >
                {icons[type]}
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2">
                {title}
              </h3>
              <p className="text-slate-600 font-medium mb-6">
                {message}
              </p>

              <button
                onClick={onClose}
                className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg hover:shadow-xl ${
                  type === "success"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    : type === "error"
                    ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                }`}
              >
                OKAY
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
