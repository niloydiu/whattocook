"use client";

import { useEffect, useState } from "react";

type Locale = "en" | "bn";

export default function useLanguage() {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("wtc_locale") as Locale) || "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem("wtc_locale", locale);
    } catch (e) {
      // ignore
    }
  }, [locale]);

  function t(en: string, bn: string) {
    return locale === "bn" ? bn : en;
  }

  return { locale, setLocale: (l: Locale) => setLocale(l), t } as const;
}
