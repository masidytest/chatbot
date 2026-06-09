"use client";

import { useEffect, useState } from "react";
import { type Language, getTranslation, languages } from "@/lib/translations";

export function useTranslation() {
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("masidy_language") as Language;
    if (saved && languages.includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  const setLang = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("masidy_language", lang);
  };

  return {
    language,
    setLanguage: setLang,
    t: getTranslation(language),
    mounted,
  };
}
