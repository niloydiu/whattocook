"use client";

import React, { useEffect } from "react";

type Props = {
  recipe: any;
};

export default function PrintViewClient({ recipe }: Props) {
  useEffect(() => {
    // Wait for images to potentially load before auto-printing
    const t = setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.error("Auto print failed:", e);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  if (!recipe) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 text-slate-900 bg-white min-h-screen">
      <div className="no-print flex justify-between items-center mb-8 bg-slate-100 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
            W
          </div>
          <span className="font-bold text-slate-700">WhatToCook Print View</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-white text-slate-600 rounded-lg font-bold border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-md"
          >
            Print Now
          </button>
        </div>
      </div>

      <header className="mb-8 border-b-2 border-slate-100 pb-6">
        <h1 className="text-3xl font-black mb-2">
          {recipe.title_en || recipe.title_bn}
        </h1>
        <p className="text-sm text-slate-600">
          {recipe.cuisine} — {recipe.category}
        </p>
        <div className="mt-3 text-sm text-slate-700">
          <span className="font-bold">Prep:</span> {recipe.prep_time} mins •{" "}
          <span className="font-bold">Cook:</span> {recipe.cook_time} mins •{" "}
          <span className="font-bold">Servings:</span> {recipe.servings}
        </div>
      </header>

      {recipe.image && (
        <div className="mb-6">
          <img
            src={recipe.image}
            alt={recipe.title_en}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}

      <section className="mb-6">
        <h2 className="font-bold text-lg mb-2">Ingredients</h2>
        <ul className="list-disc pl-5">
          {recipe.ingredients?.map((it: any, idx: number) => (
            <li key={idx} className="mb-1">
              {it.quantity ? `${it.quantity} ` : ""}
              {it.unit_en ? `${it.unit_en} ` : ""}
              {it.ingredient?.name_en || it.ingredient?.name_bn}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-bold text-lg mb-2">Instructions</h2>
        <ol className="list-decimal pl-5">
          {recipe.steps?.map((s: any, i: number) => (
            <li key={s.id || i} className="mb-3">
              {s.instruction_en || s.instruction_bn}
            </li>
          ))}
        </ol>
      </section>

      <style>{`@media print { body { -webkit-print-color-adjust: exact; } .no-print { display: none; } }`}</style>
    </div>
  );
}
