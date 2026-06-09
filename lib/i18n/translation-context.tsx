'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import translations from './translations.json';

export type Language = keyof typeof translations;

const SUPPORTED_LANGUAGES: Language[] = Object.keys(translations) as Language[];

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
  languages: Language[];
  isLoaded?: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Get language from localStorage or browser
    const savedLanguage = localStorage.getItem('language') as Language | null;
    const browserLanguage = navigator.language.split('-')[0] as Language;
    const lang = (savedLanguage || browserLanguage || 'en') as Language;

    const validLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
    setLanguageState(validLang);
    document.documentElement.lang = validLang;
    document.documentElement.dir = validLang === 'ar' ? 'rtl' : 'ltr';
    setIsLoaded(true);
  }, []);

  const setLanguage = (lang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;

    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    // Note: No reload needed - React will re-render automatically
  };

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return typeof value === 'string' ? value : defaultValue || key;
  };

  if (!isLoaded) {
    return <>{children}</>;
  }

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    // Return a default implementation for pages rendered without provider
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: (key: string, defaultValue?: string) => defaultValue || key,
      languages: SUPPORTED_LANGUAGES,
      isLoaded: true,
    };
  }
  return context;
}
