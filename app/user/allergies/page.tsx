"use client";

import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { AlertTriangle, Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function MyAllergiesPage() {
  const [user, setUser] = useState<any>(null);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [newAllergy, setNewAllergy] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser((data as any)?.session?.user ?? null);
      setLoading(false);
    })();
    const sub = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => { mounted = false; try { sub.subscription.unsubscribe(); } catch (e) {} };
  }, []);

  useEffect(() => {
    (async () => {
      // allergies management is server-only and requires login
      if (!user) {
        setAllergies([]);
        return;
      }

      try {
        const { data: sessionResp } = await supabase.auth.getSession();
        const token = (sessionResp as any)?.session?.access_token;
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/user/allergies`, { headers });
        const json = await res.json();
        if (!json.error && Array.isArray(json.allergies)) setAllergies(json.allergies);
      } catch (e) { setAllergies([]); }
    })();
  }, [user]);

  const add = async () => {
    if (!newAllergy.trim()) return;
    // require login for server-side allergy creation/linking
    if (!user) {
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
      return;
    }

    setAdding(true);
    try {
      const { data: sessionResp } = await supabase.auth.getSession();
      const token = (sessionResp as any)?.session?.access_token;
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/user/allergies`, { method: "POST", headers, body: JSON.stringify({ name_en: newAllergy.trim() }) });
      const json = await res.json();
      if (!json.error) setAllergies((prev) => [...prev, json.allergy]);
      setNewAllergy("");
    } catch (e) {
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: any) => {
    // require login for server-side allergy removal
    if (!user) {
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
      return;
    }
    try {
      const { data: sessionResp } = await supabase.auth.getSession();
      const token = (sessionResp as any)?.session?.access_token;
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch(`/api/user/allergies`, { method: "DELETE", headers, body: JSON.stringify({ id }) });
      setAllergies((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
          <AlertTriangle size={48} className="text-amber-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3 text-center">
          Sign in to manage allergies
        </h1>
        <p className="text-slate-600 font-medium mb-8 text-center max-w-md">
          Track ingredients you're allergic to and get warnings when browsing recipes.
        </p>
        <Link
          href="/"
          className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-amber-600 font-semibold mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Recipes
        </Link>

        <div className="flex items-center gap-4 mb-8 sm:mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center shadow-md">
            <AlertTriangle size={32} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-1">
              My Allergies
            </h1>
            <p className="text-slate-600 font-medium text-sm sm:text-base">
              Manage ingredients you're allergic to
            </p>
          </div>
        </div>

        {/* Add New Allergy */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-slate-100/80 p-4 sm:p-6 shadow-sm mb-6">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-4">
            Add New Allergy
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && add()}
              placeholder="e.g., Peanut, Dairy, Shellfish"
              className="flex-1 px-4 py-3 sm:py-3.5 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all text-sm sm:text-base bg-slate-50 text-slate-700 font-medium"
            />
            <button
              onClick={add}
              disabled={!newAllergy.trim() || adding}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-6 py-3 sm:py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {adding ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span className="hidden sm:inline">Adding...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Allergies List */}
        {allergies.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-slate-100/80 p-8 sm:p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              No allergies set
            </h3>
            <p className="text-slate-600 font-medium text-sm sm:text-base">
              Add ingredients you're allergic to so we can warn you when a recipe contains them.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-4">
              Your Allergies ({allergies.length})
            </h2>
            <AnimatePresence mode="popLayout">
              {allergies.map((allergy, index) => (
                <motion.div
                  key={allergy.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-lg border border-slate-100/80 transition-all duration-300 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center shadow-sm flex-shrink-0">
                      <AlertTriangle size={24} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">
                        {allergy.name_en || allergy.name_bn}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Ingredient allergy
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(allergy.id)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 text-sm"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 sm:mt-8 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-100/50 shadow-sm"
        >
          <h3 className="font-bold text-sm sm:text-base text-amber-900 mb-2 sm:mb-3">
            How it works
          </h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-amber-800">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">1.</span>
              <span>Add ingredients you're allergic to your list</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">2.</span>
              <span>We'll scan recipes and warn you about allergens</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">3.</span>
              <span>Cook safely knowing what's in your food</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
