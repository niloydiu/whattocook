"use client";

import React from "react";
import { motion } from "framer-motion";
import { Settings, Youtube, Loader2, Plus } from "lucide-react";

type AppAdminPanelProps = {
  importId: string;
  setImportId: (id: string) => void;
  importing: boolean;
  handleImport: () => void;
  importMsg: string;
};

export default function AppAdminPanel({
  importId,
  setImportId,
  importing,
  handleImport,
  importMsg,
}: AppAdminPanelProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-500">
            <Settings size={18} />
          </div>
          <h2 className="font-black uppercase tracking-[0.2em] text-sm">
            Recipe Importer
          </h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
              <Youtube size={20} />
            </div>
            <input
              value={importId}
              onChange={(e) => setImportId(e.target.value)}
              placeholder="Paste YouTube Video ID or URL"
              className="w-full bg-slate-200/50"
            />
          </div>
          <button
            onClick={handleImport}
            disabled={importing || !importId}
            className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300"
          >
            {importing ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Plus size={20} />
            )}
            {importing ? "IMPORTING..." : "IMPORT RECIPE"}
          </button>
        </div>
        {importMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-xl border ${
              importMsg.includes("Error")
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-green-500/10 border-green-500/20 text-green-400"
            } text-sm font-bold flex items-center gap-2`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                importMsg.includes("Error") ? "bg-red-500" : "bg-green-500"
              }`}
            />
            {importMsg}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
