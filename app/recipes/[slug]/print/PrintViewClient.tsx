"use client";

import React, { useEffect } from "react";

type Props = {
  recipe: any;
};

export default function PrintViewClient({ recipe }: Props) {
  useEffect(() => {
    // Trigger print once the page loads
    const t = setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        // ignore
      }
    }, 250);
    return () => clearTimeout(t);
  }, []);

  if (!recipe) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 text-slate-900 bg-white">
      <header className="mb-6">
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
