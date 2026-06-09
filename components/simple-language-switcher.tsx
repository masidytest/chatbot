"use client";

import { useTranslation } from "@/hooks/use-translation";
import { languages } from "@/lib/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languageNames: Record<string, string> = {
  en: "English",
  ar: "العربية",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  pt: "Português",
  ko: "한국어",
  ru: "Русский",
  zh: "中文",
  it: "Italiano",
};

export function SimpleLanguageSwitcher() {
  const { language, setLanguage, mounted } = useTranslation();

  if (!mounted) return null;

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-[120px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {languageNames[lang]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
