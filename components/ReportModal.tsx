"use client";

import React, { useState } from "react";

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
      const res = await fetch("/api/reports", {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black">Report Recipe</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">Close</button>
        </div>

        {success ? (
          <div className="py-10 text-center text-green-600 font-bold">Report submitted. Thank you!</div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600">Reason</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full mt-2 p-3 border rounded-lg">
                {PRESET_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600">Details (optional)</label>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} className="w-full mt-2 p-3 border rounded-lg h-24" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" className="p-3 border rounded-lg" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email (optional)" className="p-3 border rounded-lg" />
            </div>

            <div className="flex justify-end">
              <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold disabled:opacity-50">
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
