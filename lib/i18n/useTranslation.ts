import { useCallback, useEffect, useState } from 'react';
import translations from './translations.json';

export type Language = keyof typeof translations;

const SUPPORTED_LANGUAGES: Language[] = Object.keys(translations) as Language[];

export function useTranslation() {
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

  const setLanguage = useCallback((lang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const t = useCallback(
    (key: string, defaultValue?: string): string => {
      const keys = key.split('.');
      let value: any = translations[language];
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return typeof value === 'string' ? value : defaultValue || key;
    },
    [language]
  );

  return {
    language,
    setLanguage,
    t,
    isLoaded,
    languages: SUPPORTED_LANGUAGES,
  };
}
