"use client";

import { useLanguage } from "@/hooks/use-language";
import type { Language } from "@/lib/translations";
import { getLanguageName, languages } from "@/lib/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSelector() {
  const { language, changeLanguage, isLoaded } = useLanguage();

  if (!isLoaded) {
    return null;
  }

  return (
    <Select value={language} onValueChange={(value) => changeLanguage(value as Language)}>
      <SelectTrigger className="w-[140px] h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {getLanguageName(lang)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
