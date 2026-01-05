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
    success: "text-green-600 bg-green-50 border-green-100",
    error: "text-red-600 bg-red-50 border-red-100",
    info: "text-blue-600 bg-blue-50 border-blue-100",
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
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className={`mb-6 p-4 rounded-2xl ${colors[type].split(" ")[1]} ${colors[type].split(" ")[0]}`}>
                {icons[type]}
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 leading-relaxed">{message}</p>

              <button
                onClick={onClose}
                className={`mt-8 w-full py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg ${
                  type === "success"
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-green-600/20"
                    : type === "error"
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
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
