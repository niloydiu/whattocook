"use client";

import React, { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { API_PATHS } from "@/lib/api-paths";

const PRESET_REASONS = [
  "Image is missing",
  "Ingredients are incorrect",
  "Steps are incorrect or confusing",
  "YouTube URL is broken",
  "Allergens/food safety issue",
  "Duplicate recipe",
  "Other",
];

export default function ReportModal({
  recipeId,
  onClose,
}: {
  recipeId: number;
  onClose: () => void;
}) {
  const [reason, setReason] = useState(PRESET_REASONS[0]);
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch(API_PATHS.REPORTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId,
          reporterName: name,
          reporterEmail: email,
          reason,
          details,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => onClose(), 1200);
      } else {
        alert("Failed to submit report");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100/80 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 flex items-center justify-between">
          <h3 className="text-xl font-black text-white">
            Report Recipe
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-600 mb-2">
                Report submitted successfully!
              </p>
              <p className="text-sm text-slate-600">
                Thank you for helping us improve.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all"
                >
                  {PRESET_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Details (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all resize-none"
                  placeholder="Please provide more details about the issue..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email (optional)"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {loading ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
