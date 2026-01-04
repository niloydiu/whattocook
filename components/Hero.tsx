"use client";

import React from "react";
import IngredientSearch from "./IngredientSearch";

type Locale = "en" | "bn";

export default function Hero({
  pantry,
  onAdd,
  onRemove,
  onFind,
  locale = "en",
}: {
  pantry: string[];
  onAdd: (s: string) => void;
  onRemove: (i: number) => void;
  onFind: () => void;
  locale?: Locale;
}) {
  return (
    <section className="py-10">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight" style={{ fontFamily: locale === "bn" ? "Hind Siliguri, sans-serif" : undefined }}>
          {locale === "en" ? "whattoCook?" : "কি রান্না করব?"}
        </h1>
        <p className="mt-3 text-slate-600">{locale === "en" ? "Type ingredients to find matching recipes" : "উপকরণ লিখে মিল রেখে রেসিপি খুঁজুন"}</p>

        <div className="mt-6">
          <IngredientSearch selected={pantry} onAdd={onAdd} onRemove={onRemove} onFind={onFind} locale={locale} />
        </div>
      </div>
    </section>
  );
}
